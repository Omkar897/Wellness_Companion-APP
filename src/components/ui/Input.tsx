import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-violet-200">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2.5 rounded-xl
            bg-white/5 border border-white/10
            text-white placeholder-white/30 text-sm
            focus:outline-none focus:border-violet-500 focus:bg-white/8
            transition-all duration-200
            ${error ? 'border-red-500/60' : ''}
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && <p id={`${inputId}-error`} className="text-xs text-red-400" role="alert">{error}</p>}
        {hint && !error && <p id={`${inputId}-hint`} className="text-xs text-white/40">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
