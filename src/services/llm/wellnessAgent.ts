import { callOpenRouter } from './openrouter';
import { AI_MODELS, AI_CONFIG } from '../../utils/constants';
import type { EmotionData } from '../../types/emotion';
import type { PersonalContext, UserProfile } from '../../types/user';
import type { WellnessResponse } from '../../types/ai';
import { wellnessCache, cacheKey } from './responseCache';

// ── Exam-specific context maps ─────────────────────────────────────────────
const EXAM_CONTEXT: Record<string, string> = {
  JEE: 'JEE Main/Advanced — covers Physics, Chemistry, Maths. Common stressors: mock test ranks, comparison, late-night numericals.',
  NEET: 'NEET UG — covers Biology, Physics, Chemistry. Common stressors: vast syllabus, NCERT mastery pressure, single-attempt anxiety.',
  CUET: 'CUET — domain subjects + general test. Common stressors: multiple subject switches, college-cut-off anxiety.',
  CAT: 'CAT — Quant, VARC, DILR. Common stressors: sectional cut-offs, time management under pressure, MBA seat competition.',
  GATE: 'GATE — technical core subjects. Common stressors: deep conceptual gaps, PSU vs M.Tech decision anxiety.',
  UPSC: 'UPSC CSE — Prelims, Mains, Interview. Common stressors: years-long preparation, daily news overload, uncertainty.',
  Board:
    'Board Exams — school finals. Common stressors: family expectations, marks vs percentile confusion, first major exam.',
  Other: 'Competitive entrance exam preparation.',
};

// ── Fallbacks keyed by emotion category ───────────────────────────────────
type EmotionKey = 'anxiety' | 'burnout' | 'comparison' | 'frustration' | 'avoidance' | 'default';

const TARGETED_FALLBACKS: Record<EmotionKey, WellnessResponse> = {
  anxiety: {
    explanation:
      'What you are feeling is not weakness — it is your brain over-estimating threat and under-estimating your capacity. Anxiety before high-stakes exams is a signal your preparation matters to you, not that you are failing.',
    copingStrategies: [
      'Narrow your focus: write down the single most important concept to revise today and ignore everything else for the next 45 minutes',
      'Replace the question "Am I ready?" with "What do I know confidently?" — list five topics right now',
      'Set a specific stop time for today. Studying past mental exhaustion encodes errors, not knowledge',
    ],
    mindfulnessExercise:
      'Physiological sigh: double-inhale through the nose (short then long), then a full extended exhale through the mouth. Two rounds of this reduces physiological arousal faster than box breathing.',
    encouragement:
      'The fact that this matters to you is already evidence of the seriousness you bring to it.',
  },
  burnout: {
    explanation:
      'Your mind is not broken — it is depleted. Burnout in exam preparation is a depletion of cognitive and motivational resources, not a character flaw. Pushing harder into burnout compounds the damage.',
    copingStrategies: [
      'Take a deliberate 90-minute break with no study content — walk, eat, do something completely different',
      "Reduce tomorrow's study target by 40% intentionally. Recovery is productive preparation",
      'Sleep before midnight tonight — one night of proper sleep recovers more than six hours of exhausted revision',
    ],
    mindfulnessExercise:
      'NSDR (Non-Sleep Deep Rest): lie flat, close your eyes, focus only on the physical sensations of your body weight pressing into the surface. If a thought arises, acknowledge it and return to body sensation. 10 minutes.',
    encouragement:
      'Rest is not giving up. It is the foundation that makes the next study session actually work.',
  },
  comparison: {
    explanation:
      "Comparison is the most common psychological trap in competitive exam preparation. Your peers' visible progress is their highlight reel — you are comparing their summary to your full experience, which is always an unfair contest.",
    copingStrategies: [
      'Track your own baseline: what did you score on your first mock vs your most recent one? That gap is your real metric',
      'Mute or distance yourself from study group chats for 48 hours and notice what happens to your focus',
      'Write down one thing you understand today that you did not a week ago — growth is real even when invisible',
    ],
    mindfulnessExercise:
      'Grounding reset: put both feet flat on the floor, feel the contact, take three slow breaths, and say aloud: "My exam is between me and the paper, not me and anyone else."',
    encouragement:
      'Every high-scorer you admire went through exactly this doubt. The ones who made it kept going anyway.',
  },
  frustration: {
    explanation:
      'Frustration after repeated attempts at a concept signals a mismatch between your current approach and the material — not a ceiling on your ability. It is diagnostic information, not a verdict.',
    copingStrategies: [
      'Switch the medium: if you have been reading, switch to watching a concept video; if watching, try teaching it aloud to no one',
      'Work one difficulty level below for 20 minutes to rebuild fluency, then return to the hard problem',
      'Identify the exact step in the solution where you lose the thread — narrow the problem to that one step',
    ],
    mindfulnessExercise:
      'Release frustration physically: press your palms firmly together in front of your chest for 10 seconds, then release and shake hands out. The physical release interrupts the frustration loop.',
    encouragement:
      'The feeling of frustration exists at the edge of your current understanding — that is exactly where growth happens.',
  },
  avoidance: {
    explanation:
      'Avoidance is your mind protecting you from anticipated failure or discomfort — it is not laziness. The discomfort of opening the book feels larger than the discomfort of not opening it, until it suddenly does not.',
    copingStrategies: [
      'Use the 2-minute rule: open the book, do just 2 minutes. You do not have to continue. This dismantles the mental barrier',
      'Do the task you are avoiding first tomorrow morning, before checking your phone',
      'Write down specifically what you are afraid of finding when you open that chapter — naming it reduces its power',
    ],
    mindfulnessExercise:
      'Body check before studying: notice where in your body you feel the resistance. Breathe into that spot for three breaths. It is just sensation — it cannot stop you.',
    encouragement:
      'The hardest part is opening the page. Everything after that is easier than the dread of not doing it.',
  },
  default: {
    explanation:
      'Processing your emotional state is an underrated part of exam preparation. Students who check in with how they feel and respond deliberately consistently outperform those who only track study hours.',
    copingStrategies: [
      'Plan tomorrow\'s sessions tonight with specific topics, not time blocks — "revise electrostatics numericals" beats "study 3 hours"',
      "Identify one thing that went well in today's preparation, however small",
      'Hydrate and eat something substantial before your next session — cognitive performance drops significantly on low nutrition',
    ],
    mindfulnessExercise:
      'Awareness breath: sit upright, close eyes, breathe normally. Simply count each exhale from 1 to 10. When you lose count, start from 1. Do this for 3 minutes. No judgment on how many times you restart.',
    encouragement:
      'Consistent effort, even imperfect, compounds into results that feel sudden to everyone watching from outside.',
  },
};

function pickFallback(emotions: string[]): WellnessResponse {
  const keys: EmotionKey[] = ['burnout', 'anxiety', 'comparison', 'frustration', 'avoidance'];
  for (const key of keys) {
    if (emotions.some((e) => e.toLowerCase().includes(key) || key.includes(e.toLowerCase()))) {
      return TARGETED_FALLBACKS[key];
    }
  }
  return TARGETED_FALLBACKS['default'];
}

function buildDetailedContext(
  ctx: PersonalContext | null,
  profile: UserProfile,
  emotionData: EmotionData,
  journalText: string,
): string {
  const examInfo = EXAM_CONTEXT[profile.examType] ?? EXAM_CONTEXT['Other'];
  const historyLines: string[] = [];

  if (ctx?.dominantEmotions.length) {
    historyLines.push(
      `Historical pattern: ${profile.name} most frequently experiences ${ctx.dominantEmotions.slice(0, 4).join(', ')}`,
    );
  }
  if (ctx?.commonTriggers.length) {
    historyLines.push(`Recurring triggers: ${ctx.commonTriggers.slice(0, 4).join(', ')}`);
  }
  if (ctx?.successfulStrategies.length) {
    historyLines.push(
      `Strategies that have helped ${profile.name} before: ${ctx.successfulStrategies.slice(0, 3).join(', ')}`,
    );
  }
  if (ctx?.stressTimes.length) {
    historyLines.push(`Stress peaks at: ${ctx.stressTimes.slice(0, 3).join(', ')}`);
  }

  return `
STUDENT PROFILE
Name: ${profile.name}
Exam: ${examInfo}

TODAY'S EMOTIONAL STATE
Emotions detected: ${emotionData.emotions.join(', ')}
Triggers identified: ${emotionData.triggers.length ? emotionData.triggers.join(', ') : 'none specified'}
Stress severity: ${emotionData.severity}/10
Burnout risk: ${emotionData.burnoutRisk}
Confidence in analysis: ${Math.round(emotionData.confidence * 100)}%

STUDENT'S OWN WORDS
"${journalText.slice(0, 600)}"

${historyLines.length ? `HISTORICAL CONTEXT\n${historyLines.join('\n')}` : ''}
`.trim();
}

const SYSTEM_PROMPT = `You are an expert cognitive-behavioral wellness coach specializing in high-pressure competitive exam students in India.

Your response must be:
1. SPECIFIC — reference the student's exact emotions, triggers, and exam type. Never write something that could apply to anyone.
2. ACTIONABLE — each coping strategy must have one concrete next step, not a vague directive.
3. HONEST — do not minimize real difficulty. Acknowledge what is hard before reframing.
4. EXAM-AWARE — reference the specific pressures of their exam (JEE syllabus breadth, NEET single-attempt nature, UPSC uncertainty, etc.)

BANNED PHRASES (never use these):
- "Take breaks"
- "You've got this"
- "Believe in yourself"
- "Stay positive"
- "Everything will be fine"
- "You are not alone"

GOOD RESPONSE EXAMPLE:
explanation: "Your stress after mock tests is not about the score itself — it is about what you interpret the score to mean about your chances. Students preparing for JEE often treat each mock as a verdict rather than a diagnostic tool. That interpretation is what generates the anxiety spiral, not the number."
copingStrategies: ["Tomorrow morning, before opening any study material, write the exact question that feels impossible right now. Not the chapter — the specific concept or problem type. Then spend 30 minutes only on that.", ...]

Return ONLY valid JSON. No markdown, no commentary.`;

export async function generateWellnessResponse(
  emotionData: EmotionData,
  journalText: string,
  profile: UserProfile,
  context: PersonalContext | null,
  apiKey: string | null,
): Promise<WellnessResponse> {
  if (!apiKey) {
    return pickFallback(emotionData.emotions);
  }

  const key = cacheKey([
    [...emotionData.emotions].sort(),
    emotionData.severity,
    profile.examType,
    journalText.slice(0, 120),
  ]);
  const cached = wellnessCache.get(key);
  if (cached) return cached;

  const contextBlock = buildDetailedContext(context, profile, emotionData, journalText);

  const userPrompt = `${contextBlock}

Generate a personalized wellness response. Return JSON exactly:
{
  "explanation": "2-3 sentences — specific to this student's exact situation, their exam, their stated triggers. No platitudes.",
  "copingStrategies": [
    "Concrete action #1 with a specific next step",
    "Concrete action #2 with a specific next step",
    "Concrete action #3 with a specific next step"
  ],
  "mindfulnessExercise": "Named technique with step-by-step instructions (2-4 sentences). Reference the student's current stress level in the instruction.",
  "encouragement": "One sentence that acknowledges the specific difficulty before offering perspective. Not a generic motivational line."
}`;

  try {
    const raw = await callOpenRouter(
      {
        model: AI_MODELS.WELLNESS_AGENT,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.65,
        max_tokens: AI_CONFIG.MAX_TOKENS_RESPONSE,
        response_format: { type: 'json_object' },
      },
      apiKey,
    );

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as WellnessResponse;
      if (
        parsed.explanation &&
        Array.isArray(parsed.copingStrategies) &&
        parsed.copingStrategies.length > 0
      ) {
        wellnessCache.set(key, parsed);
        return parsed;
      }
    }
  } catch {
    // fall through to targeted fallback
  }

  return pickFallback(emotionData.emotions);
}
