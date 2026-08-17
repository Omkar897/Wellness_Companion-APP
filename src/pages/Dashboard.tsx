import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MoodRing } from '../components/mood/MoodRing';
import { EmotionBadge } from '../components/mood/EmotionBadge';
import { MotionWrapper } from '../components/animations/MotionWrapper';
import { useUserStore } from '../store/userStore';
import { useJournalStore } from '../store/journalStore';
import { useMood } from '../hooks/useMood';
import { daysUntilExam, examLabel, formatDate } from '../utils/helpers';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useUserStore();
  const { entries, loadEntries } = useJournalStore();
  const { stats, latestEntry } = useMood();

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  if (!profile) {
    navigate('/onboarding');
    return null;
  }

  const daysLeft = daysUntilExam(profile.examDate);
  const recentEntries = entries.slice(0, 3);

  const trendConfig = {
    improving: { label: 'Improving ↑', color: '#22c55e' },
    stable: { label: 'Stable →', color: '#eab308' },
    worsening: { label: 'Needs attention ↓', color: '#ef4444' },
  };
  const trend = trendConfig[stats.trend];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <MotionWrapper>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Hello, {profile.name}</h1>
            <p className="text-white/50 text-sm mt-0.5">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate('/journal')}>
            + Log Mood
          </Button>
        </div>
      </MotionWrapper>

      {/* Top row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Mood ring */}
        <MotionWrapper delay={0.05}>
          <Card glow className="flex flex-col items-center py-6">
            <MoodRing
              severity={latestEntry?.severity ?? 5}
              size={110}
              label="Latest stress level"
            />
            <div className="mt-3 flex flex-wrap gap-1 justify-center">
              {(latestEntry?.emotions ?? []).slice(0, 3).map((e) => (
                <EmotionBadge key={e} emotion={e} size="sm" />
              ))}
              {!latestEntry && <span className="text-xs text-white/30">No entries yet</span>}
            </div>
          </Card>
        </MotionWrapper>

        {/* Exam countdown */}
        <MotionWrapper delay={0.1}>
          <Card className="flex flex-col items-center justify-center py-6 gap-2">
            <div className="text-4xl font-bold text-white">{daysLeft}</div>
            <div className="text-sm text-white/50">days to {examLabel(profile.examType)}</div>
            <div className="text-xs text-white/30 mt-1">{formatDate(profile.examDate)}</div>
            <div
              className="mt-2 text-xs px-3 py-1 rounded-full font-medium"
              style={{
                color: daysLeft < 30 ? '#ef4444' : daysLeft < 60 ? '#f97316' : '#22c55e',
                backgroundColor:
                  daysLeft < 30 ? '#ef444415' : daysLeft < 60 ? '#f9731615' : '#22c55e15',
              }}
            >
              {daysLeft < 30 ? 'Sprint phase' : daysLeft < 60 ? 'Final stretch' : 'Build phase'}
            </div>
          </Card>
        </MotionWrapper>

        {/* Stats */}
        <MotionWrapper delay={0.15}>
          <Card className="flex flex-col gap-4 py-5">
            <div>
              <p className="text-xs text-white/40 mb-1">Mood Trend</p>
              <p className="font-semibold text-sm" style={{ color: trend.color }}>
                {trend.label}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Avg. Severity</p>
              <p className="font-semibold text-white">{stats.averageSeverity || '—'}/10</p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Journal Streak</p>
              <p className="font-semibold text-white">
                {stats.streakDays} day{stats.streakDays !== 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Total Entries</p>
              <p className="font-semibold text-white">{stats.totalEntries}</p>
            </div>
          </Card>
        </MotionWrapper>
      </div>

      {/* Quick actions */}
      <MotionWrapper delay={0.2}>
        <Card>
          <h2 className="text-sm font-semibold text-white/70 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Journal', path: '/journal', hint: 'Write freely' },
              { label: 'Mood Pulse', path: '/journal?mode=pulse', hint: 'Quick check-in' },
              {
                label: 'Scenario Quiz',
                path: '/journal?mode=quiz',
                hint: 'Situation-based analysis',
              },
              { label: 'Mindfulness', path: '/mindfulness', hint: 'Breathe and reset' },
            ].map((action) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-start gap-0.5 p-3 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15 transition-all text-left"
              >
                <span className="text-sm font-medium text-white">{action.label}</span>
                <span className="text-xs text-white/40">{action.hint}</span>
              </motion.button>
            ))}
          </div>
        </Card>
      </MotionWrapper>

      {/* Recent entries */}
      {recentEntries.length > 0 && (
        <MotionWrapper delay={0.25}>
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white/70">Recent Journal</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/insights')}>
                View all
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        entry.severity > 7 ? '#ef4444' : entry.severity > 5 ? '#f97316' : '#22c55e',
                    }}
                  />
                  <p className="text-white/60 text-sm line-clamp-1 flex-1">{entry.input}</p>
                  <div className="flex gap-1">
                    {entry.emotions.slice(0, 2).map((e) => (
                      <EmotionBadge key={e} emotion={e} size="sm" animate={false} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </MotionWrapper>
      )}

      {entries.length === 0 && (
        <MotionWrapper delay={0.25}>
          <Card className="text-center py-10">
            <div
              className="w-12 h-12 mx-auto mb-3 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center"
              aria-hidden
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3v18M5 8c2 0 4 1 7 4 3-3 5-4 7-4"
                  stroke="#a78bfa"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-white/60 text-sm mb-4">
              Start your first journal entry to unlock AI insights
            </p>
            <Button variant="primary" onClick={() => navigate('/journal')}>
              Write First Entry
            </Button>
          </Card>
        </MotionWrapper>
      )}
    </div>
  );
}
