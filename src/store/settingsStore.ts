import { create } from 'zustand';
import type { AppSettings } from '../types/user';
import { saveSettings, loadSettings } from '../services/storage/database';

interface SettingsState extends AppSettings {
  initialized: boolean;
  loadSettings: () => Promise<void>;
  setDemoMode: (val: boolean) => Promise<void>;
  setReducedMotion: (val: boolean) => Promise<void>;
}

const defaults: AppSettings = {
  demoMode: false,
  apiKey: import.meta.env.VITE_OPENROUTER_KEY ?? null,
  theme: 'dark',
  reducedMotion: false,
  dataExportEnabled: true,
};

/** Extract only serializable AppSettings fields from store state */
function pickSettings(s: SettingsState): AppSettings {
  return {
    demoMode: s.demoMode,
    apiKey: s.apiKey,
    theme: s.theme,
    reducedMotion: s.reducedMotion,
    dataExportEnabled: s.dataExportEnabled,
  };
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...defaults,
  initialized: false,

  loadSettings: async () => {
    const stored = await loadSettings();
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // API key is read only from the environment variable, never user-settable
    const envKey = import.meta.env.VITE_OPENROUTER_KEY ?? null;
    set({
      ...(stored ?? defaults),
      apiKey: envKey,
      reducedMotion: prefersReduced,
      initialized: true,
    });
  },

  setDemoMode: async (val) => {
    set({ demoMode: val });
    await saveSettings(pickSettings({ ...get(), demoMode: val }));
  },

  setReducedMotion: async (val) => {
    set({ reducedMotion: val });
    await saveSettings(pickSettings({ ...get(), reducedMotion: val }));
  },
}));
