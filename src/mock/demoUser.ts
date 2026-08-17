import type { UserProfile, PersonalContext } from '../types/user';

export const demoUser: UserProfile = {
  id: 'demo-user-001',
  name: 'Arjun',
  examType: 'JEE',
  examDate: (() => {
    const d = new Date();
    d.setDate(d.getDate() + 47);
    return d.toISOString().slice(0, 10);
  })(),
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  onboardingComplete: true,
};

export const demoContext: PersonalContext = {
  dominantEmotions: ['anxiety', 'self_doubt', 'frustration', 'hope', 'focus'],
  commonTriggers: [
    'mock test results',
    'comparison with peers',
    'late-night study sessions',
    'physics numericals',
  ],
  stressTimes: ['22:00', '23:00', '0:00', '14:00'],
  successfulStrategies: [
    'Pomodoro technique',
    'Morning revision over late-night cramming',
    'Box breathing before tests',
    'Topic-wise practice tests',
  ],
  lastUpdated: new Date().toISOString(),
};
