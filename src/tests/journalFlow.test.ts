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

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

describe('Mood Engine — aggregateMoodTimeline', () => {
  it('returns sorted data ascending by date', async () => {
    const { aggregateMoodTimeline } = await import('../services/analytics/moodEngine');
    const entries = [
      makeEntry({ severity: 8, timestamp: daysAgo(5) }),
      makeEntry({ severity: 4, timestamp: daysAgo(1) }),
      makeEntry({ severity: 6, timestamp: daysAgo(3) }),
    ];
    const result = aggregateMoodTimeline(entries, 30);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].date >= result[i - 1].date).toBe(true);
    }
  });

  it('filters entries outside the day window', async () => {
    const { aggregateMoodTimeline } = await import('../services/analytics/moodEngine');
    const entries = [
      makeEntry({ severity: 9, timestamp: daysAgo(35) }), // outside 30d window
      makeEntry({ severity: 4, timestamp: daysAgo(1) }),
    ];
    const result = aggregateMoodTimeline(entries, 30);
    expect(result.every((r) => r.severity <= 8)).toBe(true); // 9-severity entry should be excluded
  });

  it('handles empty entries gracefully', async () => {
    const { aggregateMoodTimeline } = await import('../services/analytics/moodEngine');
    const result = aggregateMoodTimeline([], 30);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it('returns array with date and severity fields', async () => {
    const { aggregateMoodTimeline } = await import('../services/analytics/moodEngine');
    const entries = [makeEntry({ severity: 7, timestamp: daysAgo(2) })];
    const result = aggregateMoodTimeline(entries, 30);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('date');
    expect(result[0]).toHaveProperty('severity');
  });
});

describe('Mood Engine — calculateMoodStats', () => {
  it('calculates correct average severity', async () => {
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

  it('handles empty entries with zero defaults', async () => {
    const { calculateMoodStats } = await import('../services/analytics/moodEngine');
    const stats = calculateMoodStats([]);
    expect(stats.averageSeverity).toBe(0);
    expect(stats.totalEntries).toBe(0);
    expect(stats.trend).toBe('stable');
    expect(stats.streakDays).toBe(0);
  });

  it('calculates improving trend when recent entries are lower severity', async () => {
    const { calculateMoodStats } = await import('../services/analytics/moodEngine');
    // moodEngine slice(0,3) = "recent" so newest entries must come first
    const entries = [
      makeEntry({ severity: 3, timestamp: daysAgo(1) }),
      makeEntry({ severity: 4, timestamp: daysAgo(3) }),
      makeEntry({ severity: 8, timestamp: daysAgo(10) }),
      makeEntry({ severity: 9, timestamp: daysAgo(14) }),
    ];
    const stats = calculateMoodStats(entries);
    expect(stats.trend).toBe('improving');
  });

  it('calculates worsening trend when recent entries are higher severity', async () => {
    const { calculateMoodStats } = await import('../services/analytics/moodEngine');
    // moodEngine slice(0,3) = "recent" so newest entries must come first
    const entries = [
      makeEntry({ severity: 9, timestamp: daysAgo(1) }),
      makeEntry({ severity: 8, timestamp: daysAgo(3) }),
      makeEntry({ severity: 3, timestamp: daysAgo(10) }),
      makeEntry({ severity: 2, timestamp: daysAgo(14) }),
    ];
    const stats = calculateMoodStats(entries);
    expect(stats.trend).toBe('worsening');
  });

  it('mostFrequentEmotion returns the most common emotion', async () => {
    const { calculateMoodStats } = await import('../services/analytics/moodEngine');
    const entries = [
      makeEntry({ emotions: ['anxiety', 'focus'] }),
      makeEntry({ emotions: ['anxiety', 'calm'] }),
      makeEntry({ emotions: ['focus', 'calm'] }),
    ];
    const stats = calculateMoodStats(entries);
    expect(stats.mostFrequentEmotion).toBe('anxiety');
  });

  it('returns correct totalEntries count', async () => {
    const { calculateMoodStats } = await import('../services/analytics/moodEngine');
    const entries = Array.from({ length: 7 }, () => makeEntry());
    const stats = calculateMoodStats(entries);
    expect(stats.totalEntries).toBe(7);
  });
});

describe('Mood Engine — getEmotionFrequency', () => {
  it('counts emotion occurrences correctly', async () => {
    const { getEmotionFrequency } = await import('../services/analytics/moodEngine');
    const entries = [
      makeEntry({ emotions: ['anxiety', 'focus'] }),
      makeEntry({ emotions: ['anxiety', 'calm'] }),
      makeEntry({ emotions: ['focus'] }),
    ];
    const freq = getEmotionFrequency(entries);
    const anxiety = freq.find((f) => f.emotion === 'anxiety');
    const focus = freq.find((f) => f.emotion === 'focus');
    expect(anxiety?.count).toBe(2);
    expect(focus?.count).toBe(2);
  });

  it('returns sorted by count descending', async () => {
    const { getEmotionFrequency } = await import('../services/analytics/moodEngine');
    const entries = [
      makeEntry({ emotions: ['anxiety', 'focus', 'calm'] }),
      makeEntry({ emotions: ['anxiety', 'focus'] }),
      makeEntry({ emotions: ['anxiety'] }),
    ];
    const freq = getEmotionFrequency(entries);
    for (let i = 1; i < freq.length; i++) {
      expect(freq[i - 1].count).toBeGreaterThanOrEqual(freq[i].count);
    }
  });

  it('handles entries with no emotions', async () => {
    const { getEmotionFrequency } = await import('../services/analytics/moodEngine');
    const entries = [makeEntry({ emotions: [] }), makeEntry({ emotions: [] })];
    const freq = getEmotionFrequency(entries);
    expect(Array.isArray(freq)).toBe(true);
    expect(freq.length).toBe(0);
  });

  it('returns empty array for empty entries', async () => {
    const { getEmotionFrequency } = await import('../services/analytics/moodEngine');
    const freq = getEmotionFrequency([]);
    expect(freq).toEqual([]);
  });
});

describe('Mood Engine — pulseSeverity', () => {
  it('maps overwhelmed to severity 1', async () => {
    const { pulseSeverity } = await import('../services/analytics/moodEngine');
    expect(pulseSeverity('overwhelmed')).toBe(1);
  });

  it('maps struggling to severity 3', async () => {
    const { pulseSeverity } = await import('../services/analytics/moodEngine');
    expect(pulseSeverity('struggling')).toBe(3);
  });

  it('maps okay to severity 5', async () => {
    const { pulseSeverity } = await import('../services/analytics/moodEngine');
    expect(pulseSeverity('okay')).toBe(5);
  });

  it('maps focused to severity 7', async () => {
    const { pulseSeverity } = await import('../services/analytics/moodEngine');
    expect(pulseSeverity('focused')).toBe(7);
  });

  it('maps confident to severity 9', async () => {
    const { pulseSeverity } = await import('../services/analytics/moodEngine');
    expect(pulseSeverity('confident')).toBe(9);
  });
});
