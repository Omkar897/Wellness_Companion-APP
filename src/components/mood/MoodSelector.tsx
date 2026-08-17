import { motion } from 'framer-motion';
import { MOOD_PULSE_CONFIG } from '../../types/emotion';
import type { MoodPulse } from '../../types/emotion';

interface MoodSelectorProps {
  value: MoodPulse | null;
  onChange: (mood: MoodPulse) => void;
  disabled?: boolean;
}

export function MoodSelector({ value, onChange, disabled }: MoodSelectorProps) {
  const moods = Object.entries(MOOD_PULSE_CONFIG) as [MoodPulse, typeof MOOD_PULSE_CONFIG[MoodPulse]][];

  return (
    <div className="flex gap-3 flex-wrap justify-center" role="radiogroup" aria-label="Select your mood">
      {moods.map(([mood, config], i) => {
        const selected = value === mood;
        return (
          <motion.button
            key={mood}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(mood)}
            className={`
              flex flex-col items-center gap-2 px-4 py-3 rounded-xl
              border transition-all duration-200 cursor-pointer min-w-[80px]
              ${selected
                ? 'border-opacity-100 bg-white/10'
                : 'border-white/10 bg-white/3 hover:border-white/20'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            style={selected ? { borderColor: config.color, boxShadow: `0 0 12px ${config.color}40` } : {}}
          >
            <span className="text-2xl" aria-hidden>{config.emoji}</span>
            <span
              className="text-xs font-medium"
              style={{ color: selected ? config.color : '#9ca3af' }}
            >
              {config.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
