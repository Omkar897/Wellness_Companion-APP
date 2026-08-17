import { useState, useCallback } from 'react';
import { extractEmotions } from '../services/llm/emotionExtractor';
import { generateWellnessResponse } from '../services/llm/wellnessAgent';
import { analyzePatterns } from '../services/llm/patternAnalyzer';
import { checkInputSafety, checkResponseSafety } from '../services/llm/safetyGuard';
import { useSettingsStore } from '../store/settingsStore';
import { useUserStore } from '../store/userStore';
import { useJournalStore } from '../store/journalStore';
import type { EmotionData } from '../types/emotion';
import type { WellnessResponse } from '../types/ai';

interface AIResult {
  emotionData: EmotionData | null;
  wellnessResponse: WellnessResponse | null;
  crisisDetected: boolean;
  crisisMessage?: string;
  error: string | null;
}

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);

  const { apiKey, demoMode } = useSettingsStore();
  const { profile, context } = useUserStore();
  const { entries } = useJournalStore();

  const analyze = useCallback(
    async (text: string): Promise<AIResult | null> => {
      // Safety check on input
      const inputSafety = checkInputSafety(text);
      if (!inputSafety.safe) {
        const r: AIResult = {
          emotionData: null,
          wellnessResponse: null,
          crisisDetected: true,
          crisisMessage: inputSafety.crisisMessage,
          error: null,
        };
        setResult(r);
        return r;
      }

      setLoading(true);
      setResult(null);

      try {
        const key = demoMode ? null : apiKey;

        const emotionData = await extractEmotions(text, key);
        const wellnessResponse = profile
          ? await generateWellnessResponse(emotionData, text, profile, context, key)
          : null;

        // Safety check on AI output
        if (wellnessResponse) {
          const outputSafety = checkResponseSafety(wellnessResponse.explanation);
          if (!outputSafety.safe && outputSafety.crisisDetected) {
            const r: AIResult = {
              emotionData,
              wellnessResponse: null,
              crisisDetected: true,
              crisisMessage: outputSafety.crisisMessage,
              error: null,
            };
            setResult(r);
            return r;
          }
        }

        const r: AIResult = { emotionData, wellnessResponse, crisisDetected: false, error: null };
        setResult(r);
        return r;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed';
        const r: AIResult = {
          emotionData: null,
          wellnessResponse: null,
          crisisDetected: false,
          error: message,
        };
        setResult(r);
        return r;
      } finally {
        setLoading(false);
      }
    },
    [apiKey, demoMode, profile, context],
  );

  const generateWeeklyInsight = useCallback(async () => {
    if (!profile) return null;
    const key = demoMode ? null : apiKey;
    const recentEntries = entries.slice(0, 14);
    return analyzePatterns(recentEntries, profile, key);
  }, [apiKey, demoMode, profile, entries]);

  return { loading, result, analyze, generateWeeklyInsight };
}
