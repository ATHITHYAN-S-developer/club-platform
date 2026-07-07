import { useState, useCallback, useEffect, useRef } from 'react';

export default function useFullscreen(options = {}) {
  const { onExit, onEnter, onViolation, enabled = true } = options;
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [isLoading, setIsLoading] = useState(false);
  const wasFullscreenRef = useRef(false);

  const request = useCallback(async () => {
    setIsLoading(true);
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();
      setIsFullscreen(true);
      wasFullscreenRef.current = true;
      onEnter?.();
    } catch {
      /* user gesture needed */
    }
    setIsLoading(false);
  }, [onEnter]);

  const exit = useCallback(async () => {
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
      else if (document.msExitFullscreen) await document.msExitFullscreen();
      setIsFullscreen(false);
      wasFullscreenRef.current = false;
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const handler = () => {
      const fs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
      setIsFullscreen(fs);
      if (!fs && wasFullscreenRef.current) {
        wasFullscreenRef.current = false;
        onViolation?.('fullscreen-exit');
        onExit?.();
      }
      if (fs) wasFullscreenRef.current = true;
    };
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    document.addEventListener('msfullscreenchange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
      document.removeEventListener('msfullscreenchange', handler);
    };
  }, [enabled, onExit, onViolation]);

  return { isFullscreen, isLoading, request, exit };
}
