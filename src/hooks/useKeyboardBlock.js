import { useEffect, useRef } from 'react';

const BLOCKED_KEYS = {
  'F12': true,
  'Escape': true,
  'PrintScreen': true,
};

const BLOCKED_COMBO = {
  'c': { ctrl: true }, 'C': { ctrl: true },
  'v': { ctrl: true }, 'V': { ctrl: true },
  'x': { ctrl: true }, 'X': { ctrl: true },
  'a': { ctrl: true }, 'A': { ctrl: true },
  'u': { ctrl: true }, 'U': { ctrl: true },
  's': { ctrl: true }, 'S': { ctrl: true },
  'p': { ctrl: true }, 'P': { ctrl: true },
  'I': { ctrl: true, shift: true },
  'J': { ctrl: true, shift: true },
  'C': { ctrl: true, shift: true },
  'i': { ctrl: true, shift: true },
  'j': { ctrl: true, shift: true },
};

export default function useKeyboardBlock({ enabled = true, onEscape, onViolation } = {}) {
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      if (key === 'Escape' || key === 'Esc') {
        e.preventDefault();
        e.stopPropagation();
        onEscape?.();
        return;
      }

      if (key === 'F12') {
        e.preventDefault();
        onViolation?.('F12 / DevTools');
        return;
      }

      if (key === 'PrintScreen' || key === 'PrntScrn') {
        e.preventDefault();
        return;
      }

      if (ctrl) {
        const combo = BLOCKED_COMBO[key];
        if (combo && combo.ctrl && (!combo.shift || shift)) {
          e.preventDefault();
          onViolation?.(`Ctrl${shift ? '+Shift+' : '+'}${key.toUpperCase()}`);
          return;
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [enabled, onEscape, onViolation]);
}
