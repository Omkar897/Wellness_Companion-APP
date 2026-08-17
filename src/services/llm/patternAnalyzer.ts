import { callOpenRouter } from './openrouter';
import { AI_MODELS, AI_CONFIG } from '../../utils/constants';
import type { JournalEntry, WeeklyInsight } from '../../types/journal';
import type { UserProfile } from '../../types/user';
import { generateId } from '../../utils/helpers';

const FALLBACK_INSIGHT = (entries: JournalEntry[]): WeeklyInsight => {
  const allEmotions = entries.flatMap((e) => e.emotions);
  const freq: Record<string, number> = {};
  allEmotions.forEach((e) => {
    freq[e] = (freq[e] ?? 0) + 1;
  });
  const top = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([e]) => e);
  const allTriggers = [...new Set(entries.flatMap((e) => e.triggers))];
  const avgSeverity = entries.reduce((sum, e) => sum + e.severity, 0) / (entries.length || 1);

  return {
    id: generateId(),
    generatedAt: new Date().toISOString(),
    periodStart: entries[entries.length - 1]?.timestamp ?? new Date().toISOString(),
    periodEnd: entries[0]?.timestamp ?? new Date().toISOString(),
    patterns: [
      `Most frequent emotions: ${top.join(', ')}`,
      `Average stress severity: ${avgSeverity.toFixed(1)}/10`,
    ],
    recurringTriggers: allTriggers.slice(0, 5),
    recommendations: [
      'Maintain consistent sleep schedule — stress peaks late at night',
      'Use the Pomodoro technique to prevent focus fatigue',
      'Schedule regular check-ins with your support system',
    ],
    progressNote:
      avgSeverity < 5
        ? 'You are managing stress well this week. Keep up the healthy habits.'
        : 'This week was tough. Remember: acknowledging difficulty is itself progress.',
    emotionData: entries.map((e) => ({
      emotions: e.emotions,
      triggers: e.triggers,
      severity: e.severity,
      burnoutRisk: e.burnoutRisk,
      confidence: 0.7,
    })),
  };
};

export async function analyzePatterns(
  entries: JournalEntry[],
  profile: UserProfile,
  apiKey: string | null,
): Promise<WeeklyInsight> {
  if (!apiKey || entries.length === 0) return FALLBACK_INSIGHT(entries);

  const summary = entries.slice(0, 20).map((e) => ({
    date: e.timestamp.slice(0, 10),
    emotions: e.emotions,
    triggers: e.triggers,
    severity: e.severity,
    mode: e.mode,
  }));

  try {
    const raw = await callOpenRouter(
      {
        model: AI_MODELS.PATTERN_ANALYZER,
        messages: [
          {
            role: 'system',
            content: `You are a long-term mental wellness pattern analyst for exam students. Analyze journal data and find meaningful patterns.`,
          },
          {
            role: 'user',
            content: `Student: ${profile.name}, Exam: ${profile.examType}
Journal history (${entries.length} entries):
${JSON.stringify(summary, null, 2)}

Return JSON:
{
  "patterns": ["pattern1", "pattern2", "pattern3"],
  "recurringTriggers": ["trigger1", "trigger2"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "progressNote": "personalized weekly summary"
}`,
          },
        ],
        temperature: 0.4,
        max_tokens: AI_CONFIG.MAX_TOKENS_ANALYSIS,
        response_format: { type: 'json_object' },
      },
      apiKey,
    );

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        id: generateId(),
        generatedAt: new Date().toISOString(),
        periodStart: entries[entries.length - 1]?.timestamp ?? new Date().toISOString(),
        periodEnd: entries[0]?.timestamp ?? new Date().toISOString(),
        patterns: parsed.patterns ?? [],
        recurringTriggers: parsed.recurringTriggers ?? [],
        recommendations: parsed.recommendations ?? [],
        progressNote: parsed.progressNote ?? '',
        emotionData: entries.map((e) => ({
          emotions: e.emotions,
          triggers: e.triggers,
          severity: e.severity,
          burnoutRisk: e.burnoutRisk,
          confidence: 0.8,
        })),
      };
    }
  } catch {
    // Fall through
  }

  return FALLBACK_INSIGHT(entries);
}
