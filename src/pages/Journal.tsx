import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { JournalEditor } from '../components/journal/JournalEditor';
import { AIResponseCard } from '../components/journal/AIResponseCard';
import { MoodSelector } from '../components/mood/MoodSelector';
import { MotionWrapper } from '../components/animations/MotionWrapper';
import { useAI } from '../hooks/useAI';
import { useJournalStore } from '../store/journalStore';
import { useUserStore } from '../store/userStore';
import { QUIZ_SCENARIOS } from '../utils/constants';
import { pulseSeverity } from '../services/analytics/moodEngine';
import type { MoodPulse } from '../types/emotion';
import type { JournalMode } from '../types/journal';

type UIMode = 'journal' | 'pulse' | 'quiz';

const MODE_LABELS: Record<UIMode, string> = {
  journal: '📝 Journal',
  pulse: '⚡ Mood Pulse',
  quiz: '📊 Scenario Quiz',
};

export default function Journal() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<UIMode>((searchParams.get('mode') as UIMode) ?? 'journal');
  const [text, setText] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodPulse | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const { loading, result, analyze } = useAI();
  const { addEntry } = useJournalStore();
  const { profile } = useUserStore();

  useEffect(() => {
    const m = searchParams.get('mode') as UIMode | null;
    if (m && ['journal', 'pulse', 'quiz'].includes(m)) setMode(m);
  }, [searchParams]);

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

  async function handleQuizSubmit() {
    const answers = Object.values(quizAnswers);
    if (answers.length === 0) return;
    const quizText = QUIZ_SCENARIOS
      .filter((s) => quizAnswers[s.id])
      .map((s) => {
        const opt = s.options.find((o) => o.id === quizAnswers[s.id]);
        return `${s.text} → "${opt?.text}"`;
      })
      .join('\n');

    const aiResult = await analyze(quizText);
    if (!aiResult) return;

    await addEntry({
      timestamp: new Date().toISOString(),
      input: quizText,
      mode: 'quiz',
      emotions: aiResult.emotionData?.emotions ?? answers,
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
    setQuizAnswers({});
    setSubmitted(false);
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">
      <MotionWrapper>
        <h1 className="text-2xl font-bold text-white">How are you feeling?</h1>
        <p className="text-white/50 text-sm mt-1">
          {profile ? `Your AI companion is ready, ${profile.name}.` : 'Choose a mode to log your emotional state.'}
        </p>
      </MotionWrapper>

      {!submitted && (
        <>
          {/* Mode switcher */}
          <MotionWrapper delay={0.05}>
            <div className="flex gap-2 p-1 glass rounded-xl w-fit" role="tablist" aria-label="Journal mode">
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
              <motion.div key="journal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
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
              <motion.div key="pulse" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card>
                  <h2 className="text-white/70 text-sm mb-4">How are you feeling right now?</h2>
                  <MoodSelector value={selectedMood} onChange={setSelectedMood} disabled={loading} />
                  <div className="mt-5 flex justify-end">
                    <Button variant="primary" onClick={handlePulseSubmit} disabled={!selectedMood} loading={loading}>
                      Log Mood
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {mode === 'quiz' && (
              <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex flex-col gap-4"
              >
                {QUIZ_SCENARIOS.map((scenario, si) => (
                  <Card key={scenario.id}>
                    <p className="text-white/80 text-sm font-medium mb-3">{si + 1}. {scenario.text}</p>
                    <div className="flex flex-col gap-2">
                      {scenario.options.map((opt) => (
                        <label key={opt.id} className="cursor-pointer">
                          <input
                            type="radio"
                            name={scenario.id}
                            value={opt.id}
                            checked={quizAnswers[scenario.id] === opt.id}
                            onChange={() => setQuizAnswers((prev) => ({ ...prev, [scenario.id]: opt.id }))}
                            className="sr-only"
                          />
                          <motion.div
                            whileHover={{ x: 2 }}
                            className={`px-4 py-2.5 rounded-xl text-sm border transition-all duration-200
                              ${quizAnswers[scenario.id] === opt.id
                                ? 'border-violet-500 bg-violet-600/20 text-violet-200'
                                : 'border-white/10 bg-white/3 text-white/60 hover:border-white/20'
                              }`}
                          >
                            {opt.text}
                          </motion.div>
                        </label>
                      ))}
                    </div>
                  </Card>
                ))}
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length === 0}
                    loading={loading}
                  >
                    Analyze Quiz
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* AI Results */}
      <AnimatePresence>
        {submitted && result && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {result.crisisDetected ? (
              <AIResponseCard emotionData={result.emotionData!} response={result.wellnessResponse!} crisisMessage={result.crisisMessage} />
            ) : result.emotionData && result.wellnessResponse ? (
              <AIResponseCard emotionData={result.emotionData} response={result.wellnessResponse} />
            ) : result.error ? (
              <Card className="text-center py-8">
                <p className="text-red-400 text-sm">{result.error}</p>
              </Card>
            ) : null}

            <div className="flex gap-3 mt-4 justify-center">
              <Button variant="secondary" onClick={reset}>New Entry</Button>
              <Button variant="ghost" onClick={() => window.history.back()}>← Back</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && !submitted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 py-8">
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
