import { secureGet, secureSet, secureRemove } from './encryptedStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import { generateId } from '../../utils/helpers';
import type { UserProfile, PersonalContext, AppSettings } from '../../types/user';
import type { JournalEntry, WeeklyInsight } from '../../types/journal';

// ── User Profile ───────────────────────────────────────────────────────────
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await secureSet(STORAGE_KEYS.USER_PROFILE, profile);
}

export async function loadUserProfile(): Promise<UserProfile | null> {
  return secureGet<UserProfile>(STORAGE_KEYS.USER_PROFILE);
}

// ── Journal Entries ────────────────────────────────────────────────────────
export async function saveJournalEntry(entry: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
  const entries = (await loadJournalEntries()) ?? [];
  const newEntry: JournalEntry = { ...entry, id: generateId() };
  entries.unshift(newEntry);
  await secureSet(STORAGE_KEYS.JOURNALS, entries);
  return newEntry;
}

export async function loadJournalEntries(): Promise<JournalEntry[]> {
  return (await secureGet<JournalEntry[]>(STORAGE_KEYS.JOURNALS)) ?? [];
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const entries = await loadJournalEntries();
  await secureSet(
    STORAGE_KEYS.JOURNALS,
    entries.filter((e) => e.id !== id),
  );
}

// ── Personal Context ───────────────────────────────────────────────────────
export async function savePersonalContext(ctx: PersonalContext): Promise<void> {
  await secureSet(STORAGE_KEYS.PERSONAL_CONTEXT, ctx);
}

export async function loadPersonalContext(): Promise<PersonalContext | null> {
  return secureGet<PersonalContext>(STORAGE_KEYS.PERSONAL_CONTEXT);
}

export async function updatePersonalContext(entry: JournalEntry): Promise<void> {
  const ctx: PersonalContext = (await loadPersonalContext()) ?? {
    dominantEmotions: [],
    commonTriggers: [],
    stressTimes: [],
    successfulStrategies: [],
    lastUpdated: new Date().toISOString(),
  };

  // Update dominant emotions (keep top 5 unique)
  entry.emotions.forEach((e) => {
    if (!ctx.dominantEmotions.includes(e)) ctx.dominantEmotions.push(e);
  });
  ctx.dominantEmotions = ctx.dominantEmotions.slice(-5);

  // Update triggers
  entry.triggers.forEach((t) => {
    if (!ctx.commonTriggers.includes(t)) ctx.commonTriggers.push(t);
  });
  ctx.commonTriggers = ctx.commonTriggers.slice(-10);

  // Add coping strategies that worked
  entry.copingStrategies.forEach((s) => {
    if (!ctx.successfulStrategies.includes(s)) ctx.successfulStrategies.push(s);
  });
  ctx.successfulStrategies = ctx.successfulStrategies.slice(-10);

  // Record stress time (hour of day)
  const hour = new Date(entry.timestamp).getHours();
  const timeLabel = `${hour}:00`;
  if (!ctx.stressTimes.includes(timeLabel)) ctx.stressTimes.push(timeLabel);

  ctx.lastUpdated = new Date().toISOString();
  await savePersonalContext(ctx);
}

// ── Weekly Insights ────────────────────────────────────────────────────────
export async function saveWeeklyInsight(insight: WeeklyInsight): Promise<void> {
  const insights = (await loadWeeklyInsights()) ?? [];
  insights.unshift(insight);
  await secureSet(STORAGE_KEYS.WEEKLY_INSIGHTS, insights.slice(0, 12)); // keep last 12 weeks
}

export async function loadWeeklyInsights(): Promise<WeeklyInsight[]> {
  return (await secureGet<WeeklyInsight[]>(STORAGE_KEYS.WEEKLY_INSIGHTS)) ?? [];
}

// ── Settings ───────────────────────────────────────────────────────────────
export async function saveSettings(settings: AppSettings): Promise<void> {
  await secureSet(STORAGE_KEYS.SETTINGS, settings);
}

export async function loadSettings(): Promise<AppSettings | null> {
  return secureGet<AppSettings>(STORAGE_KEYS.SETTINGS);
}

// ── Data Export ────────────────────────────────────────────────────────────
export async function exportAllData(): Promise<string> {
  const [profile, journals, context, insights] = await Promise.all([
    loadUserProfile(),
    loadJournalEntries(),
    loadPersonalContext(),
    loadWeeklyInsights(),
  ]);
  return JSON.stringify(
    { profile, journals, context, insights, exportedAt: new Date().toISOString() },
    null,
    2,
  );
}

// ── Clear All ──────────────────────────────────────────────────────────────
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(secureRemove);
}
