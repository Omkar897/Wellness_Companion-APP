import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MoodTimeline } from '../components/charts/MoodTimeline';
import { EmotionHeatmap } from '../components/charts/EmotionHeatmap';
import { InsightCard } from '../components/journal/InsightCard';
import { MotionWrapper } from '../components/animations/MotionWrapper';
import { useMood } from '../hooks/useMood';
import { useJournalStore } from '../store/journalStore';
import { useAI } from '../hooks/useAI';
import { exportAllData } from '../services/storage/database';

export default function Insights() {
  const { timeline, emotionFrequency, stats } = useMood();
  const { entries, weeklyInsights, loadEntries, addInsight } = useJournalStore();
  const { generateWeeklyInsight, loading } = useAI();

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  async function handleGenerateInsight() {
    const insight = await generateWeeklyInsight();
    if (insight) await addInsight(insight);
  }

  async function handleExport() {
    const data = await exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wellness-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const latestInsight = weeklyInsights[0];

  return (
    <div className="flex flex-col gap-5">
      <MotionWrapper>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Insights</h1>
            <p className="text-white/50 text-sm mt-1">{entries.length} entries analyzed</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleExport}>
              Export
            </Button>
            <Button variant="primary" size="sm" onClick={handleGenerateInsight} loading={loading}>
              Weekly AI Report
            </Button>
          </div>
        </div>
      </MotionWrapper>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Avg Severity', value: `${stats.averageSeverity}/10` },
          {
            label: 'Trend',
            value:
              stats.trend === 'improving'
                ? '↑ Improving'
                : stats.trend === 'worsening'
                  ? '↓ Worsening'
                  : '→ Stable',
          },
          { label: 'Streak', value: `${stats.streakDays}d` },
          { label: 'Top Emotion', value: stats.mostFrequentEmotion || '—' },
        ].map((stat, i) => (
          <MotionWrapper key={stat.label} delay={i * 0.05}>
            <Card className="py-4 text-center">
              <p className="text-xs text-white/40 mb-1">{stat.label}</p>
              <p className="font-semibold text-white text-base">{stat.value}</p>
            </Card>
          </MotionWrapper>
        ))}
      </div>

      {/* Mood timeline chart */}
      <MotionWrapper delay={0.1}>
        <Card>
          <h2 className="text-sm font-semibold text-white/70 mb-4">Mood Timeline (30 days)</h2>
          <MoodTimeline data={timeline} />
        </Card>
      </MotionWrapper>

      {/* Emotion frequency */}
      <MotionWrapper delay={0.15}>
        <Card>
          <h2 className="text-sm font-semibold text-white/70 mb-4">Top Emotions</h2>
          <EmotionHeatmap data={emotionFrequency} />
        </Card>
      </MotionWrapper>

      {/* Latest weekly insight */}
      {latestInsight && (
        <MotionWrapper delay={0.2}>
          <Card glow>
            <div className="flex items-center gap-2 mb-4">
              <span
                className="w-7 h-7 rounded-lg bg-violet-600/30 border border-violet-500/40 flex items-center justify-center"
                aria-hidden
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3v4l3 2"
                    stroke="#a78bfa"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <div>
                <h2 className="text-sm font-semibold text-white">Weekly AI Report</h2>
                <p className="text-xs text-white/40">
                  {new Date(latestInsight.generatedAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            <p className="text-white/80 text-sm leading-relaxed mb-4">
              {latestInsight.progressNote}
            </p>

            {latestInsight.patterns.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-violet-300 mb-2 uppercase tracking-wide">
                  Patterns Found
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {latestInsight.patterns.map((p, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-2 text-sm text-white/60"
                    >
                      <span className="text-violet-400 shrink-0">•</span>
                      {p}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {latestInsight.recommendations.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wide">
                  Recommendations
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {latestInsight.recommendations.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm text-white/60">
                      <span className="text-cyan-500 shrink-0">→</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </MotionWrapper>
      )}

      {/* Recent entries list */}
      {entries.length > 0 && (
        <MotionWrapper delay={0.25}>
          <div>
            <h2 className="text-sm font-semibold text-white/60 mb-3">All Entries</h2>
            <div className="flex flex-col gap-2">
              {entries.slice(0, 20).map((entry, i) => (
                <InsightCard key={entry.id} entry={entry} index={i} />
              ))}
            </div>
          </div>
        </MotionWrapper>
      )}

      {entries.length === 0 && (
        <MotionWrapper delay={0.1}>
          <Card className="text-center py-12">
            <div
              className="w-12 h-12 mx-auto mb-3 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center"
              aria-hidden
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 17l4-5 4 3 4-7 4 3"
                  stroke="#a78bfa"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-white/50 text-sm">Start journaling to unlock insights</p>
          </Card>
        </MotionWrapper>
      )}
    </div>
  );
}
