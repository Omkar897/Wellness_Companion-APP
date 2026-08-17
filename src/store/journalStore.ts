import { create } from 'zustand';
import type { JournalEntry, WeeklyInsight } from '../types/journal';
import {
  saveJournalEntry,
  loadJournalEntries,
  deleteJournalEntry,
  saveWeeklyInsight,
  loadWeeklyInsights,
  updatePersonalContext,
} from '../services/storage/database';

interface JournalState {
  entries: JournalEntry[];
  weeklyInsights: WeeklyInsight[];
  isLoading: boolean;
  isAnalyzing: boolean;

  loadEntries: () => Promise<void>;
  addEntry: (entry: Omit<JournalEntry, 'id'>) => Promise<JournalEntry>;
  removeEntry: (id: string) => Promise<void>;
  loadInsights: () => Promise<void>;
  addInsight: (insight: WeeklyInsight) => Promise<void>;
  setAnalyzing: (val: boolean) => void;
}

export const useJournalStore = create<JournalState>((set, _get) => ({
  entries: [],
  weeklyInsights: [],
  isLoading: false,
  isAnalyzing: false,

  loadEntries: async () => {
    set({ isLoading: true });
    const [entries, weeklyInsights] = await Promise.all([loadJournalEntries(), loadWeeklyInsights()]);
    set({ entries, weeklyInsights, isLoading: false });
  },

  addEntry: async (entry) => {
    set({ isAnalyzing: true });
    const saved = await saveJournalEntry(entry);
    await updatePersonalContext(saved);
    set((s) => ({ entries: [saved, ...s.entries], isAnalyzing: false }));
    return saved;
  },

  removeEntry: async (id) => {
    await deleteJournalEntry(id);
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
  },

  loadInsights: async () => {
    const weeklyInsights = await loadWeeklyInsights();
    set({ weeklyInsights });
  },

  addInsight: async (insight) => {
    await saveWeeklyInsight(insight);
    set((s) => ({ weeklyInsights: [insight, ...s.weeklyInsights] }));
  },

  setAnalyzing: (val) => set({ isAnalyzing: val }),
}));
