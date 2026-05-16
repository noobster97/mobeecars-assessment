import { useEffect, useState } from 'react';

/**
 * Returns Date.now() that auto-refreshes every `intervalMs`, forcing
 * a re-render so relative-time labels ("2m ago") stay accurate without
 * the user navigating away and back.
 */
export function useNow(intervalMs: number = 30_000): number {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/**
 * Stable relative-time formatter. Pass `now` from useNow() so the label
 * auto-updates as time passes. Keeps the same wording mobile-wide and
 * mirrors Laravel's diffForHumans output on the admin side.
 */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const secs = Math.max(0, Math.round(diff / 1000));
  if (secs < 30) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.round(days / 365);
  return `${years}y ago`;
}
