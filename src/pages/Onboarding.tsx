import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod/v4';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useUserStore } from '../store/userStore';
import { useSettingsStore } from '../store/settingsStore';
import { useJournalStore } from '../store/journalStore';
import { generateId } from '../utils/helpers';
import { EXAM_TYPES } from '../utils/constants';
import { demoUser, demoContext } from '../mock/demoUser';
import { demoJournals, demoWeeklyInsight } from '../mock/demoJournals';
import { saveJournalEntry, saveWeeklyInsight } from '../services/storage/database';
import type { ExamType } from '../types/user';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  examType: z.enum(['JEE', 'NEET', 'CUET', 'CAT', 'GATE', 'UPSC', 'Board', 'Other']),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Select a valid date'),
});
type FormData = z.infer<typeof schema>;

const STEPS = ['Welcome', 'About You', 'Your Exam', 'Ready'] as const;

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setProfile, setContext } = useUserStore();
  const { setDemoMode } = useSettingsStore();
  const { loadEntries } = useJournalStore();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { examType: 'JEE' },
  });

  const name = watch('name');

  async function onSubmit(data: FormData) {
    setLoading(true);
    await setProfile({
      id: generateId(),
      name: data.name,
      examType: data.examType as ExamType,
      examDate: data.examDate,
      createdAt: new Date().toISOString(),
      onboardingComplete: true,
    });
    await loadEntries();
    navigate('/');
  }

  async function startDemo() {
    setLoading(true);
    await setProfile(demoUser);
    await setContext(demoContext);
    await setDemoMode(true);
    // Load demo journals
    for (const j of demoJournals) {
      await saveJournalEntry(j);
    }
    await saveWeeklyInsight(demoWeeklyInsight);
    await loadEntries();
    navigate('/');
  }

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.15)_0%,transparent_60%)]" aria-hidden />

      <div className="w-full max-w-md relative z-10">
        {/* Progress dots */}
        <div className="flex gap-2 justify-center mb-8" aria-label="Setup progress">
          {STEPS.map((s, i) => (
            <motion.div
              key={s}
              className="h-1.5 rounded-full transition-all duration-300"
              animate={{ width: i === step ? 32 : 8, backgroundColor: i <= step ? '#7c3aed' : 'rgba(255,255,255,0.15)' }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="glass-strong rounded-3xl p-8 text-center"
            >
              <div className="text-5xl mb-4" aria-hidden>✨</div>
              <h1 className="text-2xl font-bold text-white mb-3">Your AI Wellness Companion</h1>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                Understand your stress patterns, detect burnout before it hits, and get personalized coping strategies — all powered by AI trained for exam students.
              </p>
              <div className="flex flex-col gap-3">
                <Button variant="primary" size="lg" className="w-full" onClick={() => setStep(1)}>
                  Get Started
                </Button>
                <Button variant="secondary" size="lg" className="w-full" onClick={startDemo} loading={loading}>
                  Try Demo Mode
                </Button>
                <p className="text-xs text-white/30">No sign-up required. All data stays on your device.</p>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="glass-strong rounded-3xl p-8"
            >
              <h2 className="text-xl font-bold text-white mb-1">What should I call you?</h2>
              <p className="text-white/50 text-sm mb-6">Your companion will personalize everything for you.</p>
              <Input label="Your name" placeholder="e.g. Arjun, Priya..." {...register('name')} error={errors.name?.message} />
              <div className="flex gap-3 mt-6">
                <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
                <Button variant="primary" className="flex-1" onClick={() => name?.trim() && setStep(2)} disabled={!name?.trim()}>Continue</Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="glass-strong rounded-3xl p-8"
            >
              <h2 className="text-xl font-bold text-white mb-1">Which exam are you preparing for?</h2>
              <p className="text-white/50 text-sm mb-6">This helps me give you context-aware support.</p>

              <div className="grid grid-cols-4 gap-2 mb-6">
                {EXAM_TYPES.map((exam) => (
                  <label key={exam} className="cursor-pointer">
                    <input type="radio" value={exam} {...register('examType')} className="sr-only" />
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      className={`text-center py-2 px-1 rounded-xl text-xs font-medium border transition-all duration-200
                        ${watch('examType') === exam ? 'bg-violet-600/30 border-violet-500 text-violet-200' : 'border-white/10 text-white/50 hover:border-white/20'}
                      `}
                    >
                      {exam}
                    </motion.div>
                  </label>
                ))}
              </div>

              <Input
                label="Exam date"
                type="date"
                min={minDate.toISOString().slice(0, 10)}
                {...register('examDate')}
                error={errors.examDate?.message}
              />

              <div className="flex gap-3 mt-6">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button variant="primary" className="flex-1" onClick={() => setStep(3)}>Continue</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="glass-strong rounded-3xl p-8 text-center"
            >
              <div className="text-4xl mb-4" aria-hidden>🎯</div>
              <h2 className="text-xl font-bold text-white mb-2">You're all set, {name}!</h2>
              <p className="text-white/60 text-sm mb-8 leading-relaxed">
                Start by logging how you feel today. Your AI companion will analyze patterns and give you personalized support as you prepare.
              </p>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-3">
                  <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
                    Start My Journey
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setStep(2)}>← Go back</Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
