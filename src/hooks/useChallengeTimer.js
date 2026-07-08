import { useState, useEffect, useRef, useCallback } from 'react';

export default function useChallengeTimer({ timeLimitMinutes, onExpire, enabled = true }) {
  const [remaining, setRemaining] = useState(timeLimitMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setRemaining(timeLimitMinutes * 60);
  }, [timeLimitMinutes, stop]);

  useEffect(() => {
    if (!enabled || !isRunning) return;

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsRunning(false);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, isRunning]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} Remaining`;

  let color = '#111827';
  let isBlinking = false;
  if (remaining <= 60) { color = '#dc2626'; isBlinking = true; }
  else if (remaining <= 300) color = '#dc2626';
  else if (remaining <= 600) color = '#f59e0b';

  return {
    remaining,
    display,
    color,
    isBlinking,
    isExpired: remaining <= 0,
    isRunning,
    start,
    stop,
    reset,
    minutes,
    seconds,
  };
}
