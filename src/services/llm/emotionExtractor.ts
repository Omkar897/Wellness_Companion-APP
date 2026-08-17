import { callOpenRouter } from './openrouter';
import { AI_MODELS, AI_CONFIG } from '../../utils/constants';
import { EmotionSchema } from '../../types/emotion';
import type { EmotionData } from '../../types/emotion';
import { emotionCache, cacheKey } from './responseCache';

const SYSTEM_PROMPT = `You are a precision emotion extraction engine for a student mental wellness app specializing in competitive exam students.

TASK: Extract structured emotional data from student journal text.

EMOTION TAXONOMY (use specific terms from this list when present):
- Academic pressure emotions: exam_anxiety, performance_fear, rank_obsession, comparison_distress, imposter_syndrome
- Effort emotions: study_fatigue, mental_exhaustion, burnout, overwhelm, cognitive_overload
- Relational emotions: peer_pressure, family_expectation_stress, isolation, loneliness
- Motivational emotions: demotivation, procrastination_guilt, avoidance, hopelessness
- Progress emotions: frustration, stagnation_feeling, self_doubt, confidence_crash
- Positive emotions: focus, determination, calm, relief, pride, hope, motivated

TRIGGER TAXONOMY (extract specific triggers, not vague categories):
- Specific: "mock test score", "rank drop", "peer comparison", "specific subject (e.g. Organic Chemistry)", "sleep deprivation", "family comment", "upcoming exam date"
- Avoid: "studies" (too vague), "exam" (too vague)

SEVERITY CALIBRATION:
1-2: Mild, transient, student self-reports feeling fine
3-4: Moderate stress, functional but noticeable
5-6: Significant distress, affecting study quality or sleep
7-8: High distress, daily functioning impaired
9-10: Crisis level, hopelessness or self-harm language

BURNOUT RISK:
- low: Isolated stress without exhaustion markers
- medium: Repeated stress, some fatigue, motivation dipping
- high: Exhaustion + demotivation + emotional numbness + withdrawal

Return ONLY valid JSON:
{
  "emotions": string[],
  "triggers": string[],
  "severity": number,
  "burnoutRisk": "low"|"medium"|"high",
  "confidence": number
}
No commentary. Only JSON.`;

// Fallback when AI is unavailable
function fallbackExtraction(text: string): EmotionData {
  const lower = text.toLowerCase();

  const emotions: string[] = [];
  const triggers: string[] = [];

  if (/burnout|exhaust|drain|numb|empty/.test(lower)) emotions.push('burnout');
  if (/anxi|panic|fear|nervous|scared/.test(lower)) emotions.push('exam_anxiety');
  if (/stress|overwhelm|too much|can't handle/.test(lower)) emotions.push('overwhelm');
  if (/tired|fatigue|sleep/.test(lower)) emotions.push('study_fatigue');
  if (/compare|topper|rank|others|friends/.test(lower)) emotions.push('comparison_distress');
  if (/frustrat|stuck|not getting|not understanding/.test(lower)) emotions.push('frustration');
  if (/motivat|not want to|can't study|avoiding/.test(lower)) emotions.push('demotivation');
  if (/confident|good|great|happy|calm|focus/.test(lower)) emotions.push('focus');
  if (/hope|optimist|better|progres/.test(lower)) emotions.push('hope');
  if (emotions.length === 0) emotions.push('neutral');

  if (/mock test|test score|result|marks/.test(lower)) triggers.push('mock test score');
  if (/compare|topper|rank/.test(lower)) triggers.push('peer comparison');
  if (/physics|chemistry|maths|biology|organic/.test(lower)) {
    const subjectMatch = lower.match(/(physics|chemistry|maths|biology|organic chemistry)/);
    if (subjectMatch) triggers.push(subjectMatch[0]);
  }
  if (/sleep|insomnia|late night/.test(lower)) triggers.push('sleep deprivation');
  if (/parent|family|mom|dad|expect/.test(lower)) triggers.push('family expectations');
  if (/exam date|days left|deadline/.test(lower)) triggers.push('upcoming exam date');

  const severityFactors = [
    /burnout|can't|hopeless|give up/.test(lower) ? 3 : 0,
    /anxi|panic|fear/.test(lower) ? 2 : 0,
    /stress|overwhelm/.test(lower) ? 2 : 0,
    /tired|exhaust/.test(lower) ? 1 : 0,
    /confident|good|great/.test(lower) ? -2 : 0,
  ];
  const rawSeverity = 4 + severityFactors.reduce((a, b) => a + b, 0);
  const severity = Math.max(1, Math.min(10, rawSeverity));

  const hasBurnout = /burnout|exhaust|drain|numb|empty/.test(lower);
  const hasStress = /stress|anxi|overwhelm/.test(lower);
  const burnoutRisk = hasBurnout ? 'high' : hasStress ? 'medium' : 'low';

  return {
    emotions,
    triggers,
    severity,
    burnoutRisk: burnoutRisk as EmotionData['burnoutRisk'],
    confidence: 0.45,
  };
}

export async function extractEmotions(text: string, apiKey: string | null): Promise<EmotionData> {
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
