import { motion } from 'framer-motion';

const EMOTION_COLORS: Record<string, string> = {
  anxiety: '#f97316',
  frustration: '#ef4444',
  panic: '#dc2626',
  sadness: '#3b82f6',
  self_doubt: '#8b5cf6',
  hope: '#22c55e',
  motivation: '#10b981',
  confidence: '#7c3aed',
  calm: '#06b6d4',
  focus: '#a78bfa',
  pressure: '#f59e0b',
  guilt: '#6b7280',
  avoidance: '#9ca3af',
  burnout: '#dc2626',
  comparison: '#f97316',
  irritability: '#ef4444',
  satisfaction: '#22c55e',
};

function getColor(emotion: string): string {
  return EMOTION_COLORS[emotion.toLowerCase()] ?? '#6b7280';
}

interface EmotionBadgeProps {
  emotion: string;
  size?: 'sm' | 'md';
  animate?: boolean;
}

export function EmotionBadge({ emotion, size = 'md', animate = true }: EmotionBadgeProps) {
  const color = getColor(emotion);
  const label = emotion.replace(/_/g, ' ');
  const Wrapper = animate ? motion.span : 'span';

  return (
    <Wrapper
      {...(animate ? { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.2 } } : {})}
      className={`inline-flex items-center rounded-full font-medium
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
      `}
      style={{
        backgroundColor: `${color}20`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </Wrapper>
  );
}
