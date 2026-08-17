import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

describe('Emotion Extractor', () => {
  it('fallback extraction detects anxiety keywords', async () => {
    const { extractEmotions } = await import('../services/llm/emotionExtractor');
    const result = await extractEmotions('I am so anxious and worried about my exam', null);
    expect(result.emotions).toContain('anxiety');
    expect(result.severity).toBeGreaterThan(3);
  });

  it('fallback extraction detects positive emotions', async () => {
    const { extractEmotions } = await import('../services/llm/emotionExtractor');
    const result = await extractEmotions('I feel great and confident today. Had a good study session.', null);
    expect(result.severity).toBeLessThanOrEqual(5);
    expect(result.burnoutRisk).toBe('low');
  });

  it('fallback extraction detects burnout keywords', async () => {
    const { extractEmotions } = await import('../services/llm/emotionExtractor');
    const result = await extractEmotions('I am completely exhausted and burnt out. Cannot study anymore.', null);
    expect(result.burnoutRisk).toBe('high');
  });

  it('returns valid EmotionData structure', async () => {
    const { extractEmotions } = await import('../services/llm/emotionExtractor');
    const result = await extractEmotions('Test entry', null);
    expect(result).toHaveProperty('emotions');
    expect(result).toHaveProperty('triggers');
    expect(result).toHaveProperty('severity');
    expect(result).toHaveProperty('burnoutRisk');
    expect(result).toHaveProperty('confidence');
    expect(Array.isArray(result.emotions)).toBe(true);
    expect(typeof result.severity).toBe('number');
    expect(result.severity).toBeGreaterThanOrEqual(1);
    expect(result.severity).toBeLessThanOrEqual(10);
  });
});
