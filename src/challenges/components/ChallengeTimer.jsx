import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function ChallengeTimer({ startTime, timeLimit, onExpire }) {
  const [remaining, setRemaining] = useState(timeLimit * 60);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (!startTime) return;
    const started = new Date(startTime).getTime();
    const limitMs = timeLimit * 60 * 1000;

    const tick = () => {
      const elapsed = Date.now() - started;
      const left = Math.max(0, limitMs - elapsed);
      setRemaining(Math.floor(left / 1000));
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startTime, timeLimit, onExpire]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isLow = remaining < 120;
  const isCritical = remaining < 30;
  const pct = ((timeLimit * 60 - remaining) / (timeLimit * 60)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold transition-all border ${
        isCritical
          ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
          : isLow
          ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'
          : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text)]'
      }`}
    >
      <div className="flex items-center gap-2">
        <i className={`fa-solid ${isCritical ? 'fa-clock animate-pulse' : isLow ? 'fa-clock' : 'fa-hourglass-half'} text-xs`} />
        <span className="tabular-nums">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
      </div>
      <div className="w-12 h-1.5 bg-[var(--border)] rounded-full overflow-hidden hidden sm:block">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${Math.min(pct, 100)}%`,
            backgroundColor: isCritical ? '#ef4444' : isLow ? '#f59e0b' : 'var(--orange)'
          }}
        />
      </div>
    </motion.div>
  );
}
