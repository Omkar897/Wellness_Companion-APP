import { motion } from 'framer-motion';
import { EmotionBadge } from '../mood/EmotionBadge';
import { formatRelativeTime, severityToColor } from '../../utils/helpers';
import type { JournalEntry } from '../../types/journal';

const MODE_LABELS = { journal: '📝 Journal', quiz: '📊 Quiz', pulse: '⚡ Pulse' } as const;

interface InsightCardProps {
  entry: JournalEntry;
  index?: number;
}

export function InsightCard({ entry, index = 0 }: InsightCardProps) {
  const color = severityToColor(entry.severity);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-xl p-4 border border-white/8 hover:border-white/15 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">{MODE_LABELS[entry.mode]}</span>
          <span className="text-xs text-white/25">·</span>
          <span className="text-xs text-white/40">{formatRelativeTime(entry.timestamp)}</span>
        </div>
        <span
          className="text-xs font-semibold shrink-0 px-2 py-0.5 rounded-full"
          style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
        >
          {entry.severity}/10
        </span>
      </div>

      <p className="text-white/60 text-sm line-clamp-2 mb-3 leading-relaxed">
        {entry.input}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {entry.emotions.slice(0, 4).map((e) => (
          <EmotionBadge key={e} emotion={e} size="sm" animate={false} />
        ))}
      </div>

      {entry.aiResponse && (
        <p className="text-violet-300/60 text-xs mt-3 line-clamp-2 italic leading-relaxed">
          "{entry.aiResponse.slice(0, 120)}..."
        </p>
      )}
    </motion.div>
  );
}
