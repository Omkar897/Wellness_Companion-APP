import type { EmotionData } from './emotion';

export type JournalMode = 'journal' | 'quiz' | 'pulse';

export interface JournalEntry {
  id: string;
  timestamp: string;
  input: string;
  mode: JournalMode;
  emotions: string[];
  triggers: string[];
  severity: number;
  burnoutRisk: 'low' | 'medium' | 'high';
  aiResponse: string;
  copingStrategies: string[];
  mindfulnessExercise?: string;
}

export interface WeeklyInsight {
  id: string;
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  patterns: string[];
  recurringTriggers: string[];
  recommendations: string[];
  progressNote: string;
  emotionData: EmotionData[];
}
