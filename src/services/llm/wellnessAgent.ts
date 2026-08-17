import { callOpenRouter } from './openrouter';
import { AI_MODELS, AI_CONFIG } from '../../utils/constants';
import type { EmotionData } from '../../types/emotion';
import type { PersonalContext, UserProfile } from '../../types/user';
import type { WellnessResponse } from '../../types/ai';
import { wellnessCache, cacheKey } from './responseCache';

function buildPersonalContext(ctx: PersonalContext | null, profile: UserProfile): string {
  if (!ctx) return '';
  const parts: string[] = [];
  if (ctx.dominantEmotions.length) parts.push(`Common emotions: ${ctx.dominantEmotions.join(', ')}`);
  if (ctx.commonTriggers.length) parts.push(`Known triggers: ${ctx.commonTriggers.join(', ')}`);
  if (ctx.successfulStrategies.length) parts.push(`Strategies that helped before: ${ctx.successfulStrategies.slice(0, 3).join(', ')}`);
  if (ctx.stressTimes.length) parts.push(`Stress peaks around: ${ctx.stressTimes.slice(0, 3).join(', ')}`);
  return `Student context for ${profile.name} (${profile.examType}): ${parts.join('. ')}`;
}

const FALLBACK_RESPONSES: WellnessResponse[] = [
  {
    explanation: "Your feelings are completely valid. Exam stress is real and acknowledging it is the first step.",
    copingStrategies: [
      "Break your study session into 25-minute Pomodoro blocks with 5-minute breaks",
      "Write down 3 things you understand well before focusing on weak areas",
      "Talk to a friend or family member about how you're feeling",
    ],
    mindfulnessExercise: "Box breathing: Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 5 times.",
    encouragement: "You've made it this far. One step at a time.",
  },
  {
    explanation: "Feeling overwhelmed is a sign you care deeply. Let's channel that energy constructively.",
    copingStrategies: [
      "Prioritize 3 most important topics for today — no more",
      "Step outside for 10 minutes — sunlight and movement reset your mind",
      "Review your past wins: what topics have you already mastered?",
    ],
    mindfulnessExercise: "Body scan: Close your eyes. Notice tension in your shoulders, jaw, and hands. Consciously release each area.",
    encouragement: "Progress is not always visible. Trust the process.",
  },
];

export async function generateWellnessResponse(
  emotionData: EmotionData,
  journalText: string,
  profile: UserProfile,
  context: PersonalContext | null,
  apiKey: string | null,
): Promise<WellnessResponse> {
  if (!apiKey) {
    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  }

  const key = cacheKey([emotionData.emotions, emotionData.severity, profile.examType, journalText.slice(0, 100)]);
  const cached = wellnessCache.get(key);
  if (cached) return cached;

  const contextStr = buildPersonalContext(context, profile);
  const prompt = `${contextStr}

Student's current emotions: ${emotionData.emotions.join(', ')}
Triggers identified: ${emotionData.triggers.join(', ')}
Stress severity: ${emotionData.severity}/10
Burnout risk: ${emotionData.burnoutRisk}
Journal excerpt: "${journalText.slice(0, 500)}"

Generate a personalized wellness response. Return JSON:
{
  "explanation": "empathetic 2-3 sentence analysis specific to their situation",
  "copingStrategies": ["strategy1", "strategy2", "strategy3"],
  "mindfulnessExercise": "specific technique with instructions",
  "encouragement": "motivational closing (1 sentence)"
}
Never give generic advice. Reference their specific exam (${profile.examType}) and triggers.`;

  try {
    const raw = await callOpenRouter(
      {
        model: AI_MODELS.WELLNESS_AGENT,
        messages: [
          { role: 'system', content: 'You are a compassionate AI wellness coach specializing in exam student mental health. Always personalize your responses.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: AI_CONFIG.MAX_TOKENS_RESPONSE,
        response_format: { type: 'json_object' },
      },
      apiKey,
    );

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as WellnessResponse;
      if (parsed.explanation && parsed.copingStrategies) {
        wellnessCache.set(key, parsed);
        return parsed;
      }
    }
  } catch {
    // Fall through to fallback
  }

  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}
