import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { useJournalStore } from '../store/journalStore';
import { useMood } from './useMood';
import { daysUntilExam, examLabel, formatDate } from '../utils/helpers';
import type { UserProfile } from '../types/user';
import type { MoodStats } from '../services/analytics/moodEngine';
import type { JournalEntry } from '../types/journal';

export interface TrendDisplay {
  label: string;
  color: string;
}

export interface DashboardQuickAction {
  label: string;
  path: string;
  hint: string;
}

export interface DashboardData {
  profile: UserProfile;
  daysLeft: number;
  examLabel: string;
  examDateFormatted: string;
  examPhase: string;
  examPhaseColor: string;
  stats: MoodStats;
  trend: TrendDisplay;
  latestEntry: JournalEntry | null;
  recentEntries: JournalEntry[];
  quickActions: DashboardQuickAction[];
}

const TREND_CONFIG: Record<string, TrendDisplay> = {
  improving: { label: 'Improving ↑', color: '#22c55e' },
  stable: { label: 'Stable →', color: '#eab308' },
  worsening: { label: 'Needs attention ↓', color: '#ef4444' },
};

const QUICK_ACTIONS: DashboardQuickAction[] = [
  { label: 'Journal', path: '/journal', hint: 'Write freely' },
  { label: 'Mood Pulse', path: '/journal?mode=pulse', hint: 'Quick check-in' },
  { label: 'Scenario Quiz', path: '/journal?mode=quiz', hint: 'Situation-based analysis' },
  { label: 'Mindfulness', path: '/mindfulness', hint: 'Breathe and reset' },
];

/**
 * Aggregates all data and derived values needed by the Dashboard page.
 * Returns null if no profile exists (caller should redirect to onboarding).
 */
export function useDashboard(): DashboardData | null {
  const { profile } = useUserStore();
  const { entries, loadEntries } = useJournalStore();
  const { stats, latestEntry } = useMood();

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  if (!profile) return null;

  const daysLeft = daysUntilExam(profile.examDate);

  return {
    profile,
    daysLeft,
    examLabel: examLabel(profile.examType),
    examDateFormatted: formatDate(profile.examDate),
    examPhase: daysLeft < 30 ? 'Sprint phase' : daysLeft < 60 ? 'Final stretch' : 'Build phase',
    examPhaseColor: daysLeft < 30 ? '#ef4444' : daysLeft < 60 ? '#f97316' : '#22c55e',
    stats,
    trend: TREND_CONFIG[stats.trend],
    latestEntry,
    recentEntries: entries.slice(0, 3),
    quickActions: QUICK_ACTIONS,
  };
}
