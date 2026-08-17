import { callOpenRouter } from './openrouter';
import { AI_MODELS, AI_CONFIG } from '../../utils/constants';
import { EmotionSchema } from '../../types/emotion';
import type { EmotionData } from '../../types/emotion';
import { emotionCache, cacheKey } from './responseCache';

const SYSTEM_PROMPT = `You are an emotion extraction engine for a student mental wellness app.
Extract structured emotional data from student text.
Return ONLY valid JSON matching this schema:
{
  "emotions": string[],      // detected emotions (e.g. anxiety, frustration, hope)
  "triggers": string[],      // specific triggers mentioned (e.g. mock test, comparison with peers)
  "severity": number,        // stress severity 1-10
  "burnoutRisk": "low"|"medium"|"high",
  "confidence": number       // 0-1
}
Be precise. Do not add commentary. Return only JSON.`;

// Fallback when AI is unavailable
function fallbackExtraction(text: string): EmotionData {
  const lower = text.toLowerCase();
  const hasStress = /stress|anxi|worry|panic|fear/.test(lower);
  const hasBurnout = /exhaust|burnout|tired|drain/.test(lower);
  const hasPositive = /happy|confident|good|great|calm/.test(lower);

  return {
    emotions: hasPositive ? ['calm', 'hopeful'] : hasStress ? ['anxiety', 'worry'] : ['neutral'],
    triggers: hasBurnout ? ['overwork'] : [],
    severity: hasPositive ? 3 : hasStress ? 6 : 4,
    burnoutRisk: hasBurnout ? 'high' : hasStress ? 'medium' : 'low',
    confidence: 0.4,
  };
}

export async function extractEmotions(
  text: string,
  apiKey: string | null,
): Promise<EmotionData> {
  if (!apiKey) return fallbackExtraction(text);

  const key = cacheKey([text.slice(0, 200)]);
  const cached = emotionCache.get(key);
  if (cached) return cached;

  for (let attempt = 0; attempt <= AI_CONFIG.MAX_RETRIES; attempt++) {
    try {
      const raw = await callOpenRouter(
        {
          model: AI_MODELS.EMOTION_EXTRACTOR,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Student wrote: "${text.slice(0, 2000)}"` },
          ],
          temperature: 0.1,
          max_tokens: 300,
          response_format: { type: 'json_object' },
        },
        apiKey,
      );

      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      const parsed = JSON.parse(jsonMatch[0]);
      const validated = EmotionSchema.safeParse(parsed);
      if (validated.success) {
        emotionCache.set(key, validated.data);
        return validated.data;
      }
    } catch {
      if (attempt === AI_CONFIG.MAX_RETRIES) break;
    }
  }

  return fallbackExtraction(text);
}
