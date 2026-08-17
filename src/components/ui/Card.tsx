import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
  animate?: boolean;
}

export function Card({ children, className = '', glow = false, onClick, animate = true }: CardProps) {
  const base = `
    glass rounded-2xl p-5
    ${glow ? 'shadow-lg shadow-violet-900/30 border-violet-500/20' : ''}
    ${onClick ? 'cursor-pointer hover:border-violet-400/40 transition-all duration-200' : ''}
    ${className}
  `;

  if (!animate) return <div className={base} onClick={onClick}>{children}</div>;

  return (
    <motion.div
      className={base}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
