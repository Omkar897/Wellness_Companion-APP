import { create } from 'zustand';
import type { UserProfile, PersonalContext } from '../types/user';
import {
  saveUserProfile,
  loadUserProfile,
  savePersonalContext,
  loadPersonalContext,
} from '../services/storage/database';

interface UserState {
  profile: UserProfile | null;
  context: PersonalContext | null;
  isLoading: boolean;
  setProfile: (profile: UserProfile) => Promise<void>;
  setContext: (ctx: PersonalContext) => Promise<void>;
  loadFromStorage: () => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  context: null,
  isLoading: false,

  setProfile: async (profile) => {
    await saveUserProfile(profile);
    set({ profile });
  },

  setContext: async (ctx) => {
    await savePersonalContext(ctx);
    set({ context: ctx });
  },

  loadFromStorage: async () => {
    set({ isLoading: true });
    const [profile, context] = await Promise.all([loadUserProfile(), loadPersonalContext()]);
    set({ profile, context, isLoading: false });
  },

  clearUser: () => set({ profile: null, context: null }),
}));
