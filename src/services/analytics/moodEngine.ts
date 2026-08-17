import type { JournalEntry } from '../../types/journal';
import type { MoodPulse } from '../../types/emotion';
import { MOOD_PULSE_CONFIG } from '../../types/emotion';

export interface MoodDataPoint {
  date: string;
  severity: number;
  emotions: string[];
  count: number;
}

export interface EmotionFrequency {
  emotion: string;
  count: number;
  percentage: number;
}

export interface MoodStats {
  averageSeverity: number;
  trend: 'improving' | 'stable' | 'worsening';
  mostFrequentEmotion: string;
  streakDays: number;
  totalEntries: number;
}

/** Aggregate entries into daily mood data points for charts */
export function aggregateMoodTimeline(entries: JournalEntry[], days = 30): MoodDataPoint[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const grouped: Record<string, { severities: number[]; emotions: string[] }> = {};

  entries
    .filter((e) => new Date(e.timestamp) >= cutoff)
    .forEach((e) => {
      const date = e.timestamp.slice(0, 10);
      if (!grouped[date]) grouped[date] = { severities: [], emotions: [] };
      grouped[date].severities.push(e.severity);
      grouped[date].emotions.push(...e.emotions);
    });

  return Object.entries(grouped)
    .map(([date, data]) => ({
      date,
      severity: Math.round(data.severities.reduce((a, b) => a + b, 0) / data.severities.length),
      emotions: [...new Set(data.emotions)],
      count: data.severities.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Count emotion frequency across entries */
export function getEmotionFrequency(entries: JournalEntry[]): EmotionFrequency[] {
  const freq: Record<string, number> = {};
  entries.forEach((e) =>
    e.emotions.forEach((em) => {
      freq[em] = (freq[em] ?? 0) + 1;
    }),
  );
  const total = Object.values(freq).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(freq)
    .map(([emotion, count]) => ({ emotion, count, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

/** Calculate mood statistics */
export function calculateMoodStats(entries: JournalEntry[]): MoodStats {
  if (entries.length === 0) {
    return {
      averageSeverity: 0,
      trend: 'stable',
      mostFrequentEmotion: 'none',
      streakDays: 0,
      totalEntries: 0,
    };
  }

  const avgSeverity = entries.reduce((sum, e) => sum + e.severity, 0) / entries.length;

  // Trend: compare last 3 vs previous 3
  const recent = entries.slice(0, 3).map((e) => e.severity);
  const older = entries.slice(3, 6).map((e) => e.severity);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / (recent.length || 1);
  const olderAvg = older.reduce((a, b) => a + b, 0) / (older.length || 1);
  const diff = recentAvg - olderAvg;
  const trend: MoodStats['trend'] = diff < -0.5 ? 'improving' : diff > 0.5 ? 'worsening' : 'stable';

  const mostFrequentEmotion = getEmotionFrequency(entries)[0]?.emotion ?? 'none';

  // Streak: consecutive days with entries
  const dates = new Set(entries.map((e) => e.timestamp.slice(0, 10)));
  let streak = 0;
  const today = new Date();
  while (dates.has(today.toISOString().slice(0, 10))) {
    streak++;
    today.setDate(today.getDate() - 1);
  }

  return {
    averageSeverity: Math.round(avgSeverity * 10) / 10,
    trend,
    mostFrequentEmotion,
    streakDays: streak,
    totalEntries: entries.length,
  };
}

/** Convert mood pulse to severity number */
export function pulseSeverity(pulse: MoodPulse): number {
  return MOOD_PULSE_CONFIG[pulse].value;
}

/** Get heatmap data (day of week × hour) */
export function getStressHeatmap(
  entries: JournalEntry[],
): { day: number; hour: number; value: number }[] {
  const matrix: Record<string, number[]> = {};
  entries.forEach((e) => {
    const d = new Date(e.timestamp);
    const key = `${d.getDay()}-${d.getHours()}`;
    if (!matrix[key]) matrix[key] = [];
    matrix[key].push(e.severity);
  });

  return Object.entries(matrix).map(([key, vals]) => {
    const [day, hour] = key.split('-').map(Number);
    return { day, hour, value: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) };
  });
}
