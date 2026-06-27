import { useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'distribo_session_timeout_minutes';
const DEFAULT_TIMEOUT_MINUTES = 30;

/** User-activity events that reset the inactivity timer. */
const ACTIVITY_EVENTS: (keyof DocumentEventMap)[] = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
];

/**
 * Returns the configured session timeout in minutes.
 * Falls back to DEFAULT_TIMEOUT_MINUTES if nothing is stored.
 * A value of 0 means "never" (disabled).
 */
export function getSessionTimeoutMinutes(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = Number(stored);
      if (!Number.isNaN(parsed) && parsed >= 0) return parsed;
    }
  } catch {
    // localStorage may be unavailable
  }
  return DEFAULT_TIMEOUT_MINUTES;
}

export function setSessionTimeoutMinutes(minutes: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(minutes));
  } catch {
    // noop
  }
}

/**
 * Hook that automatically calls `onTimeout` after the user has been
 * inactive for `timeoutMinutes` minutes.
 *
 * @param onTimeout  Callback invoked when the session times out (e.g. logout).
 * @param enabled    Pass `false` to disable the timer entirely (e.g. user
 *                   is not authenticated).
 */
export function useSessionTimeout(
  onTimeout: () => void,
  enabled: boolean = true,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const minutes = getSessionTimeoutMinutes();
    // 0 means disabled
    if (minutes <= 0) return;

    timerRef.current = setTimeout(() => {
      onTimeoutRef.current();
    }, minutes * 60 * 1000);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Start the first timer
    resetTimer();

    // Reset on user activity
    const handler = () => resetTimer();
    ACTIVITY_EVENTS.forEach((evt) => document.addEventListener(evt, handler, { passive: true }));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((evt) => document.removeEventListener(evt, handler));
    };
  }, [enabled, resetTimer]);

  return { resetTimer };
}
