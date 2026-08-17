import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import type { JournalEntry } from '../types/journal';

function makeEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: 'test-' + Math.random(),
    timestamp: new Date().toISOString(),
    input: 'Test journal entry',
    mode: 'journal',
    emotions: ['anxiety', 'focus'],
    triggers: ['mock test'],
    severity: 6,
    burnoutRisk: 'medium',
    aiResponse: 'Test response',
    copingStrategies: ['Strategy 1'],
    ...overrides,
  };
}

describe('Mood Engine', () => {
  it('aggregateMoodTimeline returns sorted data', async () => {
    const { aggregateMoodTimeline } = await import('../services/analytics/moodEngine');
    const entries = [
      makeEntry({ severity: 8, timestamp: new Date(Date.now() - 86400000).toISOString() }),
      makeEntry({ severity: 4, timestamp: new Date().toISOString() }),
    ];
    const result = aggregateMoodTimeline(entries, 30);
    expect(result.length).toBeGreaterThan(0);
    // Should be sorted by date ascending
    for (let i = 1; i < result.length; i++) {
      expect(result[i].date >= result[i - 1].date).toBe(true);
    }
  });

  it('calculateMoodStats returns correct averages', async () => {
    const { calculateMoodStats } = await import('../services/analytics/moodEngine');
    const entries = [
      makeEntry({ severity: 4 }),
      makeEntry({ severity: 6 }),
      makeEntry({ severity: 8 }),
    ];
    const stats = calculateMoodStats(entries);
    expect(stats.averageSeverity).toBe(6);
    expect(stats.totalEntries).toBe(3);
  });

  it('calculateMoodStats handles empty entries', async () => {
    const { calculateMoodStats } = await import('../services/analytics/moodEngine');
    const stats = calculateMoodStats([]);
    expect(stats.averageSeverity).toBe(0);
    expect(stats.totalEntries).toBe(0);
    expect(stats.trend).toBe('stable');
  });

  it('getEmotionFrequency counts correctly', async () => {
    const { getEmotionFrequency } = await import('../services/analytics/moodEngine');
    const entries = [
      makeEntry({ emotions: ['anxiety', 'focus'] }),
      makeEntry({ emotions: ['anxiety', 'calm'] }),
      makeEntry({ emotions: ['focus'] }),
    ];
    const freq = getEmotionFrequency(entries);
    const anxietyEntry = freq.find((f) => f.emotion === 'anxiety');
    expect(anxietyEntry?.count).toBe(2);
    const focusEntry = freq.find((f) => f.emotion === 'focus');
    expect(focusEntry?.count).toBe(2);
    // Sorted by count desc
    expect(freq[0].count).toBeGreaterThanOrEqual(freq[1]?.count ?? 0);
  });

  it('pulseSeverity maps moods correctly', async () => {
    const { pulseSeverity } = await import('../services/analytics/moodEngine');
    expect(pulseSeverity('overwhelmed')).toBe(1);
    expect(pulseSeverity('confident')).toBe(9);
    expect(pulseSeverity('okay')).toBe(5);
  });
});
