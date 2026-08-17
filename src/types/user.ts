export type ExamType = 'JEE' | 'NEET' | 'CUET' | 'CAT' | 'GATE' | 'UPSC' | 'Board' | 'Other';

export interface UserProfile {
  id: string;
  name: string;
  examType: ExamType;
  examDate: string; // ISO date string
  createdAt: string;
  onboardingComplete: boolean;
}

export interface PersonalContext {
  dominantEmotions: string[];
  commonTriggers: string[];
  stressTimes: string[];
  successfulStrategies: string[];
  lastUpdated: string;
}

export interface AppSettings {
  demoMode: boolean;
  apiKey: string | null;
  theme: 'dark';
  reducedMotion: boolean;
  dataExportEnabled: boolean;
}
