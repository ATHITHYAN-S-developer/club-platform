import { useState, useEffect, useRef, useCallback } from 'react';

export default function useQuizTimer(totalSeconds, options = {}) {
  const { onTick, onTimeUp, autoStart = false } = options;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const reset = useCallback((newTime) => {
    clearTimer();
    setTimeLeft(newTime ?? totalSeconds);
    setIsRunning(false);
    setIsPaused(false);
  }, [totalSeconds, clearTimer]);

  useEffect(() => {
    if (!isRunning || isPaused) {
      clearTimer();
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          onTimeUpRef.current?.();
          return 0;
        }
        const next = prev - 1;
        onTickRef.current?.(next);
        return next;
      });
    }, 1000);
    return clearTimer;
  }, [isRunning, isPaused, clearTimer]);

  useEffect(() => {
    setTimeLeft(totalSeconds);
  }, [totalSeconds]);

  const formatted = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`;
  const progress = totalSeconds > 0 ? timeLeft / totalSeconds : 0;
  const isWarning = timeLeft <= 60;
  const isDanger = timeLeft <= 30;

  return { timeLeft, formatted, progress, isRunning, isPaused, isWarning, isDanger, start, pause, resume, reset };
}
