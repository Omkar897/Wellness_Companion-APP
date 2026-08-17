import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AIErrorBoundary } from '../components/ui/AIErrorBoundary';
import { JournalEditor } from '../components/journal/JournalEditor';
import { AIResponseCard } from '../components/journal/AIResponseCard';
import { MoodSelector } from '../components/mood/MoodSelector';
import { GamifiedQuiz } from '../components/journal/GamifiedQuiz';
import { MotionWrapper } from '../components/animations/MotionWrapper';
import { useAI } from '../hooks/useAI';
import { useJournalStore } from '../store/journalStore';
import { useUserStore } from '../store/userStore';
import { pulseSeverity } from '../services/analytics/moodEngine';
import type { MoodPulse } from '../types/emotion';
import type { JournalMode } from '../types/journal';
import type { QuizResult } from '../components/journal/GamifiedQuiz';

type UIMode = 'journal' | 'pulse' | 'quiz';

const MODE_LABELS: Record<UIMode, string> = {
  journal: 'Journal',
  pulse: 'Mood Pulse',
  quiz: 'Scenario Quiz',
};

const VALID_MODES: UIMode[] = ['journal', 'pulse', 'quiz'];

export default function Journal() {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode') as UIMode | null;
  const [mode, setMode] = useState<UIMode>(
    modeParam && VALID_MODES.includes(modeParam) ? modeParam : 'journal',
  );
  const [text, setText] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodPulse | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { loading, result, analyze } = useAI();
  const { addEntry } = useJournalStore();
  const { profile } = useUserStore();

  async function handleJournalSubmit() {
    if (!text.trim()) return;
    const aiResult = await analyze(text);
    if (!aiResult) return;

    const journalMode: JournalMode = 'journal';
    await addEntry({
      timestamp: new Date().toISOString(),
      input: text,
      mode: journalMode,
      emotions: aiResult.emotionData?.emotions ?? [],
      triggers: aiResult.emotionData?.triggers ?? [],
      severity: aiResult.emotionData?.severity ?? 5,
      burnoutRisk: aiResult.emotionData?.burnoutRisk ?? 'medium',
      aiResponse: aiResult.wellnessResponse?.explanation ?? '',
      copingStrategies: aiResult.wellnessResponse?.copingStrategies ?? [],
      mindfulnessExercise: aiResult.wellnessResponse?.mindfulnessExercise,
    });
    setSubmitted(true);
  }

  async function handlePulseSubmit() {
    if (!selectedMood) return;
    const severity = pulseSeverity(selectedMood);
    const moodText = `Quick mood check: feeling ${selectedMood}`;
    const aiResult = await analyze(moodText);
    if (!aiResult) return;

    await addEntry({
      timestamp: new Date().toISOString(),
      input: moodText,
      mode: 'pulse',
      emotions: aiResult.emotionData?.emotions ?? [selectedMood],
      triggers: aiResult.emotionData?.triggers ?? [],
      severity,
      burnoutRisk: aiResult.emotionData?.burnoutRisk ?? 'low',
      aiResponse: aiResult.wellnessResponse?.explanation ?? '',
      copingStrategies: aiResult.wellnessResponse?.copingStrategies ?? [],
    });
    setSubmitted(true);
  }

  async function handleQuizComplete(quizResult: QuizResult) {
    const aiResult = await analyze(quizResult.quizText);
    if (!aiResult) return;

    await addEntry({
      timestamp: new Date().toISOString(),
      input: quizResult.quizText,
      mode: 'quiz',
      emotions: aiResult.emotionData?.emotions ?? quizResult.emotions,
      triggers: aiResult.emotionData?.triggers ?? [],
      severity: aiResult.emotionData?.severity ?? 5,
      burnoutRisk: aiResult.emotionData?.burnoutRisk ?? 'medium',
      aiResponse: aiResult.wellnessResponse?.explanation ?? '',
      copingStrategies: aiResult.wellnessResponse?.copingStrategies ?? [],
    });
    setSubmitted(true);
  }

  function reset() {
    setText('');
    setSelectedMood(null);
    setSubmitted(false);
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">
      <MotionWrapper>
        <h1 className="text-2xl font-bold text-white">How are you feeling?</h1>
        <p className="text-white/50 text-sm mt-1">
          {profile
            ? `Your AI companion is ready, ${profile.name}.`
            : 'Choose a mode to log your emotional state.'}
        </p>
      </MotionWrapper>

      {!submitted && (
        <>
          {/* Mode switcher */}
          <MotionWrapper delay={0.05}>
            <div
              className="flex gap-2 p-1 glass rounded-xl w-fit"
              role="tablist"
              aria-label="Journal mode"
            >
              {(Object.keys(MODE_LABELS) as UIMode[]).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${mode === m ? 'bg-violet-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}
                  `}
                >
                  {MODE_LABELS[m]}
                </button>
              ))}
            </div>
          </MotionWrapper>

          <AnimatePresence mode="wait">
            {mode === 'journal' && (
              <motion.div
                key="journal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <JournalEditor
                    value={text}
                    onChange={setText}
                    onSubmit={handleJournalSubmit}
                    loading={loading}
                  />
                </Card>
              </motion.div>
            )}

            {mode === 'pulse' && (
              <motion.div
                key="pulse"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <h2 className="text-white/70 text-sm mb-4">How are you feeling right now?</h2>
                  <MoodSelector
                    value={selectedMood}
                    onChange={setSelectedMood}
                    disabled={loading}
                  />
                  <div className="mt-5 flex justify-end">
                    <Button
                      variant="primary"
                      onClick={handlePulseSubmit}
                      disabled={!selectedMood}
                      loading={loading}
                    >
                      Log Mood
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {mode === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <GamifiedQuiz onComplete={handleQuizComplete} loading={loading} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* AI Results */}
      <AnimatePresence>
        {submitted && result && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AIErrorBoundary>
              {result.crisisDetected ? (
                <AIResponseCard
                  emotionData={result.emotionData!}
                  response={result.wellnessResponse!}
                  crisisMessage={result.crisisMessage}
                />
              ) : result.emotionData && result.wellnessResponse ? (
                <AIResponseCard
                  emotionData={result.emotionData}
                  response={result.wellnessResponse}
                />
              ) : result.error ? (
                <Card className="text-center py-8">
                  <p className="text-red-400 text-sm">{result.error}</p>
                </Card>
              ) : null}
            </AIErrorBoundary>

            <div className="flex gap-3 mt-4 justify-center">
              <Button variant="secondary" onClick={reset}>
                New Entry
              </Button>
              <Button variant="ghost" onClick={() => window.history.back()}>
                Back
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && !submitted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-8"
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-violet-500"
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </div>
          <p className="text-white/50 text-sm">Analyzing your entry...</p>
        </motion.div>
      )}
    </div>
  );
}
