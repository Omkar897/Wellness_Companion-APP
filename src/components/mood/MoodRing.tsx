import { motion } from 'framer-motion';
import { severityToColor } from '../../utils/helpers';

interface MoodRingProps {
  severity: number; // 1-10
  size?: number;
  label?: string;
  animate?: boolean;
}

export function MoodRing({ severity, size = 120, label, animate = true }: MoodRingProps) {
  const color = severityToColor(severity);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  // Higher severity = more of the ring filled (inverted: calm = full green ring)
  const fillRatio = 1 - (severity - 1) / 9;
  const strokeDashoffset = circumference * (1 - fillRatio);

  return (
    <div className="flex flex-col items-center gap-2" aria-label={`Stress level: ${severity}/10`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />
        {/* Glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeOpacity="0.2"
          strokeLinecap="round"
        />
        {/* Active ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: animate ? strokeDashoffset : strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Center text */}
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white font-bold"
          fontSize={size * 0.22}
        >
          {severity}
        </text>
        <text
          x={size / 2}
          y={size / 2 + size * 0.15}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.5)"
          fontSize={size * 0.1}
        >
          /10
        </text>
      </svg>
      {label && <span className="text-xs text-white/50">{label}</span>}
    </div>
  );
}
