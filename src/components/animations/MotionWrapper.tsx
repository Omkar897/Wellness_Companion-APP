import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface MotionWrapperProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export function MotionWrapper({ children, delay = 0, className = '', direction = 'up' }: MotionWrapperProps) {
  const reduced = useReducedMotion();

  const offsets = { up: { y: 16 }, down: { y: -16 }, left: { x: 16 }, right: { x: -16 }, none: {} };
  const initial = reduced ? { opacity: 0 } : { opacity: 0, ...offsets[direction] };
  const animate = { opacity: 1, x: 0, y: 0 };

  return (
    <motion.div
      className={className}
      initial={initial}
      animate={animate}
      transition={{ duration: reduced ? 0.1 : 0.35, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
