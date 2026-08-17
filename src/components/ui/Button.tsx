import { forwardRef } from 'react';
import { motion } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40',
  secondary: 'glass border border-violet-500/30 text-violet-200 hover:border-violet-400/60',
  ghost: 'text-violet-300 hover:bg-white/5 hover:text-white',
  danger: 'bg-red-600/80 hover:bg-red-500 text-white',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        className={`
          inline-flex items-center justify-center gap-2 font-medium
          transition-all duration-200 cursor-pointer select-none
          disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
          focus-visible:outline-2 focus-visible:outline-violet-400 focus-visible:outline-offset-2
          ${variantClasses[variant]} ${sizeClasses[size]} ${className}
        `}
        disabled={disabled || loading}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" />
          </svg>
        ) : icon}
        {children}
      </motion.button>
    );
  },
);
Button.displayName = 'Button';
