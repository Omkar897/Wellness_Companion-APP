import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { EmotionBadge } from '../mood/EmotionBadge';
import { MoodRing } from '../mood/MoodRing';
import type { WellnessResponse } from '../../types/ai';
import type { EmotionData } from '../../types/emotion';

interface AIResponseCardProps {
  emotionData: EmotionData;
  response: WellnessResponse;
  crisisMessage?: string;
}

export function AIResponseCard({ emotionData, response, crisisMessage }: AIResponseCardProps) {
  if (crisisMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-red-950/60 border border-red-500/40 p-5"
        role="alert"
      >
        <h3 className="text-red-400 font-semibold text-base mb-3">Crisis Support</h3>
        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{crisisMessage}</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
      {/* Emotion overview */}
      <Card className="flex items-center gap-5" glow>
        <MoodRing severity={emotionData.severity} size={88} label="Stress" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {emotionData.emotions.slice(0, 5).map((e) => (
              <EmotionBadge key={e} emotion={e} size="sm" />
            ))}
          </div>
          <p className="text-xs text-white/40">
            Burnout risk:{' '}
            <span
              className="font-medium"
              style={{
                color:
                  emotionData.burnoutRisk === 'high'
                    ? '#ef4444'
                    : emotionData.burnoutRisk === 'medium'
                      ? '#f97316'
                      : '#22c55e',
              }}
            >
              {emotionData.burnoutRisk}
            </span>
          </p>
        </div>
      </Card>

      {/* AI explanation */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <span
            className="w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center"
            aria-hidden
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="6" r="3" stroke="#a78bfa" strokeWidth="1.5" />
              <path
                d="M3 14c0-2.761 2.239-4 5-4s5 1.239 5 4"
                stroke="#a78bfa"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-sm font-medium text-violet-300">AI Analysis</span>
        </div>
        <p className="text-white/80 text-sm leading-relaxed">{response.explanation}</p>
      </Card>

      {/* Coping strategies */}
      <Card>
        <h4 className="text-sm font-semibold text-white mb-3">Coping Strategies</h4>
        <ul className="flex flex-col gap-2">
          {response.copingStrategies.map((s, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-3 text-sm text-white/70"
            >
              <span className="text-violet-400 mt-0.5 shrink-0">→</span>
              {s}
            </motion.li>
          ))}
        </ul>
      </Card>

      {/* Mindfulness exercise */}
      <Card className="bg-cyan-900/20 border-cyan-500/20">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center"
            aria-hidden
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#67e8f9" strokeWidth="1.5" />
              <path d="M8 5v3l2 2" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <h4 className="text-sm font-semibold text-cyan-300">Mindfulness Exercise</h4>
        </div>
        <p className="text-white/70 text-sm leading-relaxed">{response.mindfulnessExercise}</p>
      </Card>

      {/* Encouragement */}
      <div className="rounded-xl bg-violet-900/20 border border-violet-500/20 px-5 py-3">
        <p className="text-violet-200 text-sm italic">"{response.encouragement}"</p>
      </div>
    </motion.div>
  );
}
