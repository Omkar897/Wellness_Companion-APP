import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

describe('Emotion Extractor — fallback extraction', () => {
  it('detects exam_anxiety from anxiety keywords', async () => {
    const { extractEmotions } = await import('../services/llm/emotionExtractor');
    const result = await extractEmotions(
      'I am so anxious and nervous about my exam tomorrow',
      null,
    );
    expect(result.emotions.some((e) => e.includes('anxi') || e === 'exam_anxiety')).toBe(true);
    expect(result.severity).toBeGreaterThan(3);
  });

  it('detects burnout from burnout keywords', async () => {
    const { extractEmotions } = await import('../services/llm/emotionExtractor');
    const result = await extractEmotions(
      'I am completely exhausted and burnt out. Cannot study anymore.',
      null,
    );
    expect(result.burnoutRisk).toBe('high');
    expect(result.emotions.some((e) => e.includes('burnout') || e.includes('exhaust'))).toBe(true);
  });

  it('detects positive emotions for confident text', async () => {
    const { extractEmotions } = await import('../services/llm/emotionExtractor');
    const result = await extractEmotions(
      'I feel great and confident today. Had a very good study session.',
      null,
    );
    expect(result.severity).toBeLessThanOrEqual(5);
    expect(result.burnoutRisk).toBe('low');
  });

  it('detects overwhelm from stress keywords', async () => {
    const { extractEmotions } = await import('../services/llm/emotionExtractor');
    const result = await extractEmotions(
      'I am so stressed and overwhelmed, there is too much to cover',
      null,
    );
    expect(result.emotions.some((e) => e.includes('overwhelm') || e.includes('stress'))).toBe(true);
    expect(result.severity).toBeGreaterThan(4);
    expect(result.burnoutRisk).toBe('medium');
  });

  it('detects comparison distress from comparison keywords', async () => {
    const { extractEmotions } = await import('../services/llm/emotionExtractor');
    const result = await extractEmotions(
      'My rank is lower than my friends, I keep comparing myself to toppers',
      null,
    );
    expect(result.emotions.some((e) => e.includes('comparison') || e.includes('compare'))).toBe(
      true,
    );
  });

  it('detects frustration keywords correctly', async () => {
    const { extractEmotions } = await import('../services/llm/emotionExtractor');
    const result = await extractEmotions(
      'I am so frustrated, I keep getting stuck on these problems, not understanding anything',
      null,
    );
    expect(result.emotions.some((e) => e.includes('frustrat') || e.includes('stuck'))).toBe(true);
    expect(result.severity).toBeGreaterThan(3);
  });

  it('extracts subject-specific triggers', async () => {
    const { extractEmotions } = await import('../services/llm/emotionExtractor');
    const result = await extractEmotions(
      'Organic Chemistry is killing me, I cannot understand the mechanisms at all',
      null,
    );
    expect(result.triggers.some((t) => t.toLowerCase().includes('chemistry'))).toBe(true);
  });

  it('extracts mock test trigger', async () => {
    const { extractEmotions } = await import('../services/llm/emotionExtractor');
    const result = await extractEmotions(
      'My mock test score dropped again today and it crushed me',
      null,
    );
    expect(result.triggers.some((t) => t.toLowerCase().includes('mock'))).toBe(true);
  });

  it('extracts sleep deprivation trigger', async () => {
    const { extractEmotions } = await import('../services/llm/emotionExtractor');
    const result = await extractEmotions(
      'I could not sleep last night and now I cannot focus at all',
      null,
    );
    expect(result.triggers.some((t) => t.toLowerCase().includes('sleep'))).toBe(true);
  });

  it('handles very short text without throwing', async () => {
    const { extractEmotions } = await import('../services/llm/emotionExtractor');
    const result = await extractEmotions('ok', null);
    expect(result).toHaveProperty('emotions');
    expect(result.severity).toBeGreaterThanOrEqual(1);
    expect(result.severity).toBeLessThanOrEqual(10);
  });

  it('handles empty string without throwing', async () => {
    const { extractEmotions } = await import('../services/llm/emotionExtractor');
    const result = await extractEmotions('', null);
    expect(Array.isArray(result.emotions)).toBe(true);
    expect(result.emotions.length).toBeGreaterThan(0);
    expect(result.confidence).toBe(0.45);
  });

  it('severity stays within 1-10 range for extreme inputs', async () => {
    const { extractEmotions } = await import('../services/llm/emotionExtractor');
    const extremeStress = await extractEmotions(
      'I cannot do this anymore. Burnout. Exhausted. Panic. Anxiety. Overwhelmed. Cannot focus. Giving up. Drain. Numb.',
      null,
    );
    expect(extremeStress.severity).toBeGreaterThanOrEqual(1);
    expect(extremeStress.severity).toBeLessThanOrEqual(10);

    const positive = await extractEmotions(
      'Feeling confident great good happy calm focused hope optimistic excellent',
      null,
    );
    expect(positive.severity).toBeGreaterThanOrEqual(1);
    expect(positive.severity).toBeLessThanOrEqual(10);
  });

  it('returns valid EmotionData structure with all required fields', async () => {
    const { extractEmotions } = await import('../services/llm/emotionExtractor');
    const result = await extractEmotions('Test entry for structure validation', null);
    expect(result).toHaveProperty('emotions');
    expect(result).toHaveProperty('triggers');
    expect(result).toHaveProperty('severity');
    expect(result).toHaveProperty('burnoutRisk');
    expect(result).toHaveProperty('confidence');
    expect(Array.isArray(result.emotions)).toBe(true);
    expect(Array.isArray(result.triggers)).toBe(true);
    expect(typeof result.severity).toBe('number');
    expect(['low', 'medium', 'high']).toContain(result.burnoutRisk);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
});
