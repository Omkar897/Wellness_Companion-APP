import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  daysUntilExam,
  formatRelativeTime,
  severityToLabel,
  severityToColor,
  generateId,
  clamp,
} from '../utils/helpers';

describe('daysUntilExam', () => {
  it('returns 0 for a past date', () => {
    expect(daysUntilExam('2020-01-01')).toBe(0);
  });

  it('returns a positive number for a future date', () => {
    const future = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
    const days = daysUntilExam(future);
    expect(days).toBeGreaterThan(0);
    expect(days).toBeLessThanOrEqual(31);
  });

  it('returns approximately correct days for 90 days ahead', () => {
    const future = new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10);
    const days = daysUntilExam(future);
    expect(days).toBeGreaterThanOrEqual(89);
    expect(days).toBeLessThanOrEqual(91);
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  it('returns "just now" for very recent timestamps', () => {
    const now = new Date('2024-06-15T11:59:30Z').toISOString();
    expect(formatRelativeTime(now)).toBe('just now');
  });

  it('returns minutes ago for sub-hour timestamps', () => {
    const thirtyMinsAgo = new Date('2024-06-15T11:30:00Z').toISOString();
    expect(formatRelativeTime(thirtyMinsAgo)).toBe('30m ago');
  });

  it('returns hours ago for sub-day timestamps', () => {
    const threeHoursAgo = new Date('2024-06-15T09:00:00Z').toISOString();
    expect(formatRelativeTime(threeHoursAgo)).toBe('3h ago');
  });

  it('returns days ago for older timestamps', () => {
    const twoDaysAgo = new Date('2024-06-13T12:00:00Z').toISOString();
    expect(formatRelativeTime(twoDaysAgo)).toBe('2d ago');
  });
});

describe('severityToLabel', () => {
  it('returns "Low" for severity <= 3', () => {
    expect(severityToLabel(1)).toBe('Low');
    expect(severityToLabel(3)).toBe('Low');
  });

  it('returns "Moderate" for severity 4-6', () => {
    expect(severityToLabel(4)).toBe('Moderate');
    expect(severityToLabel(6)).toBe('Moderate');
  });

  it('returns "High" for severity 7-8', () => {
    expect(severityToLabel(7)).toBe('High');
    expect(severityToLabel(8)).toBe('High');
  });

  it('returns "Critical" for severity > 8', () => {
    expect(severityToLabel(9)).toBe('Critical');
    expect(severityToLabel(10)).toBe('Critical');
  });
});

describe('severityToColor', () => {
  it('returns green (#22c55e) for low severity (1-3)', () => {
    expect(severityToColor(1)).toBe('#22c55e');
    expect(severityToColor(3)).toBe('#22c55e');
  });

  it('returns yellow (#eab308) for moderate severity (4-6)', () => {
    expect(severityToColor(4)).toBe('#eab308');
    expect(severityToColor(6)).toBe('#eab308');
  });

  it('returns orange (#f97316) for high severity (7-8)', () => {
    expect(severityToColor(7)).toBe('#f97316');
    expect(severityToColor(8)).toBe('#f97316');
  });

  it('returns red (#ef4444) for critical severity (9-10)', () => {
    expect(severityToColor(9)).toBe('#ef4444');
    expect(severityToColor(10)).toBe('#ef4444');
  });
});

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(5);
  });

  it('generates unique IDs across multiple calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it('IDs contain a timestamp portion', () => {
    const before = Date.now();
    const id = generateId();
    const after = Date.now();
    const [ts] = id.split('-');
    const timestamp = parseInt(ts, 10);
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });
});

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 1, 10)).toBe(5);
  });

  it('returns min when value is below min', () => {
    expect(clamp(-5, 1, 10)).toBe(1);
  });

  it('returns max when value exceeds max', () => {
    expect(clamp(15, 1, 10)).toBe(10);
  });

  it('handles edge case at boundary values', () => {
    expect(clamp(1, 1, 10)).toBe(1);
    expect(clamp(10, 1, 10)).toBe(10);
  });

  it('works with decimal values', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5);
    expect(clamp(1.5, 0, 1)).toBe(1);
  });
});
