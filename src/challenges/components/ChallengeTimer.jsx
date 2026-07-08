import { useState, useEffect, useRef } from 'react';

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

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-bold transition-all
        ${isCritical ? 'bg-red-100 text-red-600 animate-pulse' :
          isLow ? 'bg-amber-50 text-amber-600' :
          'bg-[var(--surface)] text-[var(--text)]'}`}
    >
      <i className={`fa-solid ${isLow ? 'fa-clock text-red-500' : 'fa-hourglass-half'}`} />
      <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
    </div>
  );
}
