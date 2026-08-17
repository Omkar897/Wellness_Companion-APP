import { z } from 'zod/v4';

export const EmotionSchema = z.object({
  emotions: z.array(z.string()),
  triggers: z.array(z.string()),
  severity: z.number().min(1).max(10),
  burnoutRisk: z.enum(['low', 'medium', 'high']),
  confidence: z.number().min(0).max(1),
});

export type EmotionData = z.infer<typeof EmotionSchema>;

export type MoodPulse = 'overwhelmed' | 'struggling' | 'okay' | 'focused' | 'confident';

export const MOOD_PULSE_CONFIG: Record<
  MoodPulse,
  { label: string; color: string; emoji: string; value: number }
> = {
  overwhelmed: { label: 'Overwhelmed', color: '#ef4444', emoji: '😰', value: 1 },
  struggling: { label: 'Struggling', color: '#f97316', emoji: '😟', value: 3 },
  okay: { label: 'Okay', color: '#eab308', emoji: '😐', value: 5 },
  focused: { label: 'Focused', color: '#22c55e', emoji: '🎯', value: 7 },
  confident: { label: 'Confident', color: '#7c3aed', emoji: '😊', value: 9 },
};

export interface QuizScenario {
  id: string;
  text: string;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  text: string;
  emotion: string;
}
