import { useMemo } from 'react';
import { useJournalStore } from '../store/journalStore';
import {
  aggregateMoodTimeline,
  getEmotionFrequency,
  calculateMoodStats,
  getStressHeatmap,
} from '../services/analytics/moodEngine';

export function useMood() {
  const { entries } = useJournalStore();

  const timeline = useMemo(() => aggregateMoodTimeline(entries, 30), [entries]);
  const emotionFrequency = useMemo(() => getEmotionFrequency(entries), [entries]);
  const stats = useMemo(() => calculateMoodStats(entries), [entries]);
  const heatmap = useMemo(() => getStressHeatmap(entries), [entries]);
  const latestEntry = entries[0] ?? null;

  return { timeline, emotionFrequency, stats, heatmap, latestEntry };
}
