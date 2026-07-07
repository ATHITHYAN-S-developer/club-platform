import { useEffect, useRef, useCallback } from 'react';

export default function useSecurity({ onViolation } = {}) {
  const onViolationRef = useRef(onViolation);
  onViolationRef.current = onViolation;
  const wasFullscreenRef = useRef(false);
  const violationsRef = useRef(0);
  const debounceRef = useRef(null);

  const trigger = useCallback((reason) => {
    const now = Date.now();
    if (debounceRef.current && now - debounceRef.current < 1000) return;
    debounceRef.current = now;
    violationsRef.current++;
    onViolationRef.current?.(reason);
  }, []);

  const handleVisibility = useCallback(() => {
    if (document.hidden) {
      trigger('tab_switch');
    }
  }, [trigger]);

  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (wasFullscreenRef.current) {
        trigger('fullscreen_exit');
      }
    } else {
      wasFullscreenRef.current = true;
    }
  }, [trigger]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 'S') ||
        (e.ctrlKey && e.key === 'P') ||
        e.key === 'PrintScreen' ||
        e.code === 'PrintScreen') {
      e.preventDefault();
      e.stopPropagation();
      trigger('devtools');
      return;
    }
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      e.stopPropagation();
      trigger('escape_key');
      return;
    }
  }, [trigger]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    return false;
  }, []);

  const handleCopy = useCallback((e) => {
    e.preventDefault();
    trigger('copy_paste');
  }, [trigger]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleCut = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleSelectStart = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleBeforeUnload = useCallback((e) => {
    trigger('refresh');
    e.preventDefault();
    e.returnValue = '';
  }, [trigger]);

  const handleResize = useCallback(() => {
    const threshold = 160;
    const widthDev = window.outerWidth - window.innerWidth > threshold;
    const heightDev = window.outerHeight - window.innerHeight > threshold;
    if (widthDev || heightDev) {
      trigger('devtools');
    }
  }, [trigger]);

  const start = useCallback(() => {
    wasFullscreenRef.current = !!document.fullscreenElement;
    violationsRef.current = 0;
    debounceRef.current = null;

    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('copy', handleCopy, true);
    document.addEventListener('paste', handlePaste, true);
    document.addEventListener('cut', handleCut, true);
    document.addEventListener('selectstart', handleSelectStart, true);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('resize', handleResize);
  }, [handleVisibility, handleFullscreenChange, handleKeyDown, handleContextMenu, handleCopy, handlePaste, handleCut, handleSelectStart, handleBeforeUnload, handleResize]);

  const stop = useCallback(() => {
    document.removeEventListener('visibilitychange', handleVisibility);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('contextmenu', handleContextMenu, true);
    document.removeEventListener('copy', handleCopy, true);
    document.removeEventListener('paste', handlePaste, true);
    document.removeEventListener('cut', handleCut, true);
    document.removeEventListener('selectstart', handleSelectStart, true);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('resize', handleResize);
    wasFullscreenRef.current = false;
  }, [handleVisibility, handleFullscreenChange, handleKeyDown, handleContextMenu, handleCopy, handlePaste, handleCut, handleSelectStart, handleBeforeUnload, handleResize]);

  const requestFullscreen = useCallback(async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      }
      wasFullscreenRef.current = true;
    } catch {
      console.warn('Fullscreen request denied');
    }
  }, []);

  useEffect(() => {
    return stop;
  }, [stop]);

  return { start, stop, requestFullscreen, violations: violationsRef.current };
}
