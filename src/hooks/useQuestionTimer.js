import { useState, useRef, useCallback, useEffect } from 'react';

export default function useQuestionTimer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef(null);
  const onExpireRef = useRef(null);
  const totalRef = useRef(0);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback((seconds, onExpire) => {
    clear();
    onExpireRef.current = onExpire;
    totalRef.current = seconds;
    setTimeLeft(seconds);
    setIsExpired(false);
    setIsRunning(true);
  }, [clear]);

  const stop = useCallback(() => {
    clear();
    setIsRunning(false);
  }, [clear]);

  const reset = useCallback(() => {
    clear();
    setTimeLeft(totalRef.current);
    setIsExpired(false);
    setIsRunning(false);
  }, [clear]);

  useEffect(() => {
    if (!isRunning) {
      clear();
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clear();
          setIsRunning(false);
          setIsExpired(true);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clear;
  }, [isRunning, clear]);

  useEffect(() => {
    return clear;
  }, [clear]);

  const formatted = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`;
  const progress = totalRef.current > 0 ? timeLeft / totalRef.current : 0;
  const isWarning = !isExpired && timeLeft <= 10;
  const isDanger = !isExpired && timeLeft <= 5;

  return { timeLeft, formatted, progress, isRunning, isExpired, isWarning, isDanger, start, stop, reset };
}
