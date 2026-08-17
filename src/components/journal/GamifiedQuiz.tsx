import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUIZ_SCENARIOS } from '../../utils/constants';
import { Button } from '../ui/Button';

export interface QuizResult {
  emotions: string[];
  quizText: string;
}

interface GamifiedQuizProps {
  onComplete: (result: QuizResult) => void;
  loading: boolean;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export function GamifiedQuiz({ onComplete, loading }: GamifiedQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedForCurrent, setSelectedForCurrent] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const totalQuestions = QUIZ_SCENARIOS.length;
  const scenario = QUIZ_SCENARIOS[currentIndex];
  const progress = (Object.keys(answers).length / totalQuestions) * 100;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const allAnswered = Object.keys(answers).length === totalQuestions;

  function handleOptionSelect(optionId: string) {
    if (loading || analyzing) return;
    setSelectedForCurrent(optionId);
  }

  function handleNext() {
    if (!selectedForCurrent) return;

    const updatedAnswers = { ...answers, [scenario.id]: selectedForCurrent };
    setAnswers(updatedAnswers);

    if (isLastQuestion) {
      // Submit
      setAnalyzing(true);
      const emotions: string[] = [];
      const lines: string[] = [];

      QUIZ_SCENARIOS.forEach((s) => {
        const answerId = s.id === scenario.id ? selectedForCurrent : updatedAnswers[s.id];
        if (!answerId) return;
        const opt = s.options.find((o) => o.id === answerId);
        if (opt) {
          emotions.push(opt.emotion);
          lines.push(`${s.text} → "${opt.text}"`);
        }
      });

      onComplete({ emotions, quizText: lines.join('\n') });
    } else {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
      setSelectedForCurrent(answers[QUIZ_SCENARIOS[currentIndex + 1]?.id] ?? null);
    }
  }

  function handleBack() {
    if (currentIndex === 0) return;
    setDirection(-1);
    setCurrentIndex((i) => i - 1);
    setSelectedForCurrent(answers[QUIZ_SCENARIOS[currentIndex - 1].id] ?? null);
  }

  if (analyzing || loading) {
    return <AnalyzingScreen />;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-white/40">
          <span>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
            initial={false}
            animate={{ width: `${(currentIndex / totalQuestions) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          />
        </div>
      </div>

      {/* Question card with slide animation */}
      <div className="relative overflow-hidden min-h-[380px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={scenario.id}
            initial={{ x: direction * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0"
          >
            <div className="glass rounded-2xl p-5 h-full flex flex-col gap-4">
              <div className="space-y-1">
                <span className="text-xs font-medium text-violet-400 tracking-wider uppercase">
                  Scenario {currentIndex + 1}
                </span>
                <p className="text-white font-medium text-base leading-relaxed">{scenario.text}</p>
              </div>

              <div className="flex flex-col gap-2.5 flex-1">
                {scenario.options.map((opt, idx) => {
                  const isSelected = selectedForCurrent === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      onClick={() => handleOptionSelect(opt.id)}
                      whileHover={{ scale: 1.01, x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      animate={isSelected ? { scale: [1, 1.02, 1] } : {}}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-colors duration-200 ${
                        isSelected
                          ? 'border-violet-500 bg-violet-600/25 text-white shadow-lg shadow-violet-900/30'
                          : 'border-white/10 bg-white/3 text-white/65 hover:border-white/25 hover:text-white/90'
                      }`}
                    >
                      <span
                        className={`flex-none w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center mt-0.5 transition-colors duration-200 ${
                          isSelected
                            ? 'border-violet-400 bg-violet-500 text-white'
                            : 'border-white/20 text-white/40'
                        }`}
                      >
                        {OPTION_LETTERS[idx]}
                      </span>
                      <span className="text-sm leading-relaxed">{opt.text}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="secondary" onClick={handleBack} disabled={currentIndex === 0}>
          Back
        </Button>

        <div className="flex gap-1.5">
          {QUIZ_SCENARIOS.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === currentIndex ? 20 : 6,
                backgroundColor:
                  answers[QUIZ_SCENARIOS[i].id] !== undefined
                    ? '#7c3aed'
                    : i === currentIndex
                      ? '#a78bfa'
                      : 'rgba(255,255,255,0.15)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>

        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!selectedForCurrent}
          loading={loading}
        >
          {isLastQuestion ? (allAnswered ? 'Analyze' : 'Analyze') : 'Next'}
        </Button>
      </div>
    </div>
  );
}

function AnalyzingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-2xl p-10 flex flex-col items-center justify-center gap-5 min-h-[300px]"
    >
      <div className="relative">
        <motion.div
          className="w-16 h-16 rounded-full border-2 border-violet-500/30"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-violet-400/50"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-4 rounded-full bg-violet-500/20"
          animate={{ scale: [1, 0.8, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 0.5 }}
        />
      </div>
      <div className="text-center space-y-1">
        <p className="text-white font-medium">Analyzing your responses</p>
        <AnimatedDots />
      </div>
      <p className="text-white/35 text-xs text-center max-w-xs">
        Your scenario choices are being processed to understand your emotional patterns
      </p>
    </motion.div>
  );
}

function AnimatedDots() {
  return (
    <div className="flex gap-1 justify-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-violet-400"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
