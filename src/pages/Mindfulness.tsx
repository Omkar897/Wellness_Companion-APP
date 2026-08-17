import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MotionWrapper } from '../components/animations/MotionWrapper';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: string;
  icon: string;
  steps: string[];
  type: 'breathing' | 'grounding' | 'visualization';
}

const EXERCISES: Exercise[] = [
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    description: 'Regulate your nervous system with 4-4-4-4 breathing.',
    duration: '4 minutes',
    icon: '📦',
    type: 'breathing',
    steps: [
      'Inhale slowly for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale completely for 4 counts',
      'Hold empty for 4 counts',
    ],
  },
  {
    id: '478-breathing',
    name: '4-7-8 Breathing',
    description: 'A natural tranquilizer for the nervous system. Great before sleep.',
    duration: '3 minutes',
    icon: '🌬️',
    type: 'breathing',
    steps: [
      'Inhale through nose for 4 counts',
      'Hold breath for 7 counts',
      'Exhale through mouth for 8 counts',
      'Repeat 4 cycles',
    ],
  },
  {
    id: '5-4-3-2-1',
    name: '5-4-3-2-1 Grounding',
    description: 'Break an anxiety spiral with sensory grounding.',
    duration: '5 minutes',
    icon: '🌿',
    type: 'grounding',
    steps: [
      'Name 5 things you can see',
      'Name 4 things you can touch',
      'Name 3 things you can hear',
      'Name 2 things you can smell',
      'Name 1 thing you can taste',
    ],
  },
  {
    id: 'body-scan',
    name: 'Progressive Relaxation',
    description: 'Systematically release tension from head to toe.',
    duration: '7 minutes',
    icon: '🧘',
    type: 'grounding',
    steps: [
      'Start at your toes — tense for 5s, then release',
      'Move to calves and shins — tense and release',
      'Tighten your thighs and buttocks, then release',
      'Tense your stomach — breathe in, hold, release',
      'Shrug shoulders to ears — hold 5s, drop them',
      'Clench jaw gently — release and let face soften',
    ],
  },
  {
    id: 'visualization',
    name: 'Safe Place Visualization',
    description: 'Create a mental sanctuary to escape exam pressure.',
    duration: '6 minutes',
    icon: '🏔️',
    type: 'visualization',
    steps: [
      'Close your eyes and breathe naturally',
      'Picture a place where you feel completely safe',
      'Notice details — colors, sounds, temperature',
      'Feel the calm of this place in your body',
      'Stay here as long as you need',
      'Slowly return, carrying this calm with you',
    ],
  },
];

interface BreathingCircleProps {
  exercise: Exercise;
  onComplete: () => void;
}

function BreathingCircle({ exercise, onComplete }: BreathingCircleProps) {
  const [phase, setPhase] = useState(0);
  const [cycles, setCycles] = useState(0);
  const reduced = useReducedMotion();

  const isBox = exercise.id === 'box-breathing';
  const is478 = exercise.id === '478-breathing';

  const phases = isBox
    ? [
        { label: 'Inhale', duration: 4 },
        { label: 'Hold', duration: 4 },
        { label: 'Exhale', duration: 4 },
        { label: 'Hold', duration: 4 },
      ]
    : is478
      ? [
          { label: 'Inhale', duration: 4 },
          { label: 'Hold', duration: 7 },
          { label: 'Exhale', duration: 8 },
        ]
      : [
          { label: 'Inhale', duration: 4 },
          { label: 'Exhale', duration: 6 },
        ];

  const current = phases[phase];
  const isInhale = current.label === 'Inhale';
  const isHold = current.label === 'Hold';

  const targetCycles = 4;

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="relative flex items-center justify-center">
        {/* Outer glow */}
        <motion.div
          className="absolute rounded-full bg-violet-600/20"
          animate={
            reduced
              ? {}
              : {
                  scale: isInhale ? [1, 1.4] : isHold ? 1.4 : [1.4, 1],
                  opacity: isInhale ? [0.3, 0.6] : 0.4,
                }
          }
          transition={{ duration: current.duration, ease: 'easeInOut' }}
          style={{ width: 200, height: 200 }}
        />
        {/* Main circle */}
        <motion.div
          className="w-40 h-40 rounded-full border-2 border-violet-500/50 bg-violet-900/30 flex items-center justify-center"
          animate={
            reduced
              ? {}
              : {
                  scale: isInhale ? [0.85, 1.15] : isHold ? 1.15 : [1.15, 0.85],
                }
          }
          transition={{ duration: current.duration, ease: 'easeInOut' }}
          onAnimationComplete={() => {
            const nextPhase = (phase + 1) % phases.length;
            if (nextPhase === 0) {
              const nextCycle = cycles + 1;
              setCycles(nextCycle);
              if (nextCycle >= targetCycles) {
                onComplete();
                return;
              }
            }
            setPhase(nextPhase);
          }}
        >
          <div className="text-center">
            <div className="text-white font-semibold text-lg">{current.label}</div>
            <div className="text-white/50 text-sm">{current.duration}s</div>
          </div>
        </motion.div>
      </div>

      <div className="text-center">
        <p className="text-white/50 text-sm">
          Cycle {cycles + 1} of {targetCycles}
        </p>
        <div className="flex gap-1 justify-center mt-2">
          {Array.from({ length: targetCycles }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i < cycles ? 'bg-violet-400' : 'bg-white/15'}`}
            />
          ))}
        </div>
      </div>

      <Button variant="ghost" size="sm" onClick={onComplete}>
        Skip
      </Button>
    </div>
  );
}

export default function Mindfulness() {
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  function start(ex: Exercise) {
    setSelected(ex);
    setRunning(true);
    setCompleted(false);
    setStepIndex(0);
  }

  function finish() {
    setRunning(false);
    setCompleted(true);
  }

  function reset() {
    setSelected(null);
    setRunning(false);
    setCompleted(false);
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">
      <MotionWrapper>
        <h1 className="text-2xl font-bold text-white">Mindfulness</h1>
        <p className="text-white/50 text-sm mt-1">
          Breathing and grounding exercises for exam stress
        </p>
      </MotionWrapper>

      <AnimatePresence mode="wait">
        {!selected && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {EXERCISES.map((ex, i) => (
              <MotionWrapper key={ex.id} delay={i * 0.06}>
                <Card
                  className="cursor-pointer hover:border-violet-500/30"
                  onClick={() => start(ex)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden>
                      {ex.icon}
                    </span>
                    <div className="flex-1">
                      <h2 className="text-white font-medium text-sm">{ex.name}</h2>
                      <p className="text-white/50 text-xs mt-1 leading-relaxed">{ex.description}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs text-white/30">⏱ {ex.duration}</span>
                        <span className="text-xs text-violet-400 capitalize">{ex.type}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </MotionWrapper>
            ))}
          </motion.div>
        )}

        {selected && running && selected.type === 'breathing' && (
          <motion.div
            key="breathing"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card glow>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-white font-semibold">{selected.name}</h2>
                <Button variant="ghost" size="sm" onClick={reset}>
                  ✕
                </Button>
              </div>
              <BreathingCircle exercise={selected} onComplete={finish} />
            </Card>
          </motion.div>
        )}

        {selected && running && selected.type !== 'breathing' && (
          <motion.div
            key="grounding"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card glow>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">
                  {selected.icon} {selected.name}
                </h2>
                <Button variant="ghost" size="sm" onClick={reset}>
                  ✕
                </Button>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={stepIndex}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="min-h-[120px] flex flex-col items-center justify-center text-center px-4 py-8"
                >
                  <p className="text-4xl mb-4" aria-hidden>
                    {stepIndex + 1}
                  </p>
                  <p className="text-white/80 text-lg leading-relaxed">
                    {selected.steps[stepIndex]}
                  </p>
                </motion.div>
              </AnimatePresence>
              <div className="flex items-center gap-3 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                  disabled={stepIndex === 0}
                >
                  ←
                </Button>
                <div className="flex gap-1 flex-1 justify-center">
                  {selected.steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all ${i === stepIndex ? 'w-6 bg-violet-400' : 'w-2 bg-white/15'}`}
                    />
                  ))}
                </div>
                {stepIndex < selected.steps.length - 1 ? (
                  <Button variant="primary" size="sm" onClick={() => setStepIndex((i) => i + 1)}>
                    Next →
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" onClick={finish}>
                    Complete ✓
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {completed && selected && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="text-center py-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="text-5xl mb-4"
              >
                ✨
              </motion.div>
              <h2 className="text-white font-bold text-lg mb-2">Well done!</h2>
              <p className="text-white/60 text-sm mb-6">
                You completed {selected.name}. Take a moment to notice how you feel.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="primary"
                  onClick={() => {
                    setRunning(true);
                    setCompleted(false);
                    setStepIndex(0);
                  }}
                >
                  Repeat
                </Button>
                <Button variant="secondary" onClick={reset}>
                  Try Another
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
