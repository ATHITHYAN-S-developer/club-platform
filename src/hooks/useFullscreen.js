import { useState, useCallback, useEffect } from 'react';

export default function useFullscreen(options = {}) {
  const { onExit, onEnter } = options;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const request = useCallback(async () => {
    setIsLoading(true);
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();
      setIsFullscreen(true);
      onEnter?.();
    } catch { /* user gesture needed */ }
    setIsLoading(false);
  }, [onEnter]);

  const exit = useCallback(async () => {
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
      else if (document.msExitFullscreen) await document.msExitFullscreen();
      setIsFullscreen(false);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const handler = () => {
      const fs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
      setIsFullscreen(fs);
      if (!fs && isFullscreen) onExit?.();
    };
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    document.addEventListener('msfullscreenchange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
      document.removeEventListener('msfullscreenchange', handler);
    };
  }, [onExit, isFullscreen]);

  return { isFullscreen, isLoading, request, exit };
}
