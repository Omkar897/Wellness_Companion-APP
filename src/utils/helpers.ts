import { z } from 'zod/v4';
import type { ExamType } from '../types/user';

export const UserProfileSchema = z.object({
  name: z.string().min(1).max(60),
  examType: z.enum(['JEE', 'NEET', 'CUET', 'CAT', 'GATE', 'UPSC', 'Board', 'Other']),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
});

export const JournalEntryInputSchema = z.object({
  text: z.string().min(10, 'Entry must be at least 10 characters').max(5000),
});

export const ApiKeySchema = z.string().regex(/^sk-or-v1-/, 'Must be a valid OpenRouter API key').or(z.literal(''));

export function daysUntilExam(examDate: string): number {
  const exam = new Date(examDate);
  const now = new Date();
  const diff = exam.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function severityToLabel(severity: number): string {
  if (severity <= 3) return 'Low';
  if (severity <= 6) return 'Moderate';
  if (severity <= 8) return 'High';
  return 'Critical';
}

export function severityToColor(severity: number): string {
  if (severity <= 3) return '#22c55e';
  if (severity <= 6) return '#eab308';
  if (severity <= 8) return '#f97316';
  return '#ef4444';
}

export function examLabel(examType: ExamType): string {
  const labels: Record<ExamType, string> = {
    JEE: 'JEE Main/Advanced',
    NEET: 'NEET UG',
    CUET: 'CUET',
    CAT: 'CAT',
    GATE: 'GATE',
    UPSC: 'UPSC CSE',
    Board: 'Board Exams',
    Other: 'Entrance Exam',
  };
  return labels[examType] ?? examType;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
