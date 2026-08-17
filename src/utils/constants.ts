export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export const AI_MODELS = {
  EMOTION_EXTRACTOR: 'meta-llama/llama-3.3-70b-instruct',
  WELLNESS_AGENT: 'google/gemma-3-27b-it',
  PATTERN_ANALYZER: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
} as const;

export const AI_CONFIG = {
  TIMEOUT_MS: 30_000,
  MAX_RETRIES: 2,
  RETRY_DELAY_MS: 1_000,
  MAX_TOKENS_RESPONSE: 800,
  MAX_TOKENS_ANALYSIS: 1200,
} as const;

export const STORAGE_KEYS = {
  USER_PROFILE: 'wc_user_profile',
  JOURNALS: 'wc_journals',
  PERSONAL_CONTEXT: 'wc_context',
  WEEKLY_INSIGHTS: 'wc_insights',
  SETTINGS: 'wc_settings',
  ENCRYPTION_KEY: 'wc_ek',
} as const;

export const MAX_STORAGE_BYTES = 10 * 1024 * 1024; // 10MB

export const EXAM_TYPES = ['JEE', 'NEET', 'CUET', 'CAT', 'GATE', 'UPSC', 'Board', 'Other'] as const;

export const QUIZ_SCENARIOS = [
  {
    id: 'q1',
    text: 'You receive a lower mock test score than expected. How do you feel?',
    options: [
      { id: 'q1a', text: 'Panic — I need to study everything again tonight', emotion: 'panic' },
      { id: 'q1b', text: 'Frustrated — I worked hard and this is unfair', emotion: 'frustration' },
      { id: 'q1c', text: 'Curious — let me analyze what went wrong', emotion: 'curiosity' },
      { id: 'q1d', text: 'Avoid — I put the paper away and distract myself', emotion: 'avoidance' },
    ],
  },
  {
    id: 'q2',
    text: 'A friend shares that they completed two more chapters than you today.',
    options: [
      { id: 'q2a', text: 'Anxious — I am falling behind', emotion: 'anxiety' },
      { id: 'q2b', text: 'Motivated — I will study more too', emotion: 'motivation' },
      { id: 'q2c', text: 'Indifferent — everyone has their own pace', emotion: 'calm' },
      { id: 'q2d', text: 'Self-doubt — maybe I am not cut out for this', emotion: 'self_doubt' },
    ],
  },
  {
    id: 'q3',
    text: 'You cannot focus despite sitting at your desk for 2 hours.',
    options: [
      { id: 'q3a', text: 'Guilty — I am wasting time', emotion: 'guilt' },
      { id: 'q3b', text: 'Burnt out — I need a break', emotion: 'burnout' },
      { id: 'q3c', text: 'Change strategy — try a different subject', emotion: 'adaptability' },
      { id: 'q3d', text: 'Worried — exam is close and I cannot study', emotion: 'worry' },
    ],
  },
  {
    id: 'q4',
    text: 'Your parents ask about your preparation progress.',
    options: [
      { id: 'q4a', text: 'Pressure — I feel watched and judged', emotion: 'pressure' },
      { id: 'q4b', text: 'Supported — glad they care', emotion: 'gratitude' },
      { id: 'q4c', text: 'Irritated — I need space', emotion: 'irritability' },
      {
        id: 'q4d',
        text: 'Withdrawn — give vague answers to avoid the topic',
        emotion: 'withdrawal',
      },
    ],
  },
] as const;
