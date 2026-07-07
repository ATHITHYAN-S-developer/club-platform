import { useState, useCallback, useEffect, useRef } from 'react';

export default function useAntiCheat(options = {}) {
  const {
    enabled = true,
    violationLimit = 2,
    onAutoSubmit,
    quizId,
    userId,
    attemptId,
    tabSwitchDetection = true,
    copyPasteBlock = true,
    rightClickBlock = true,
    devToolsDetection = true,
    onWarning,
  } = options;

  const [violations, setViolations] = useState([]);
  const [warningCount, setWarningCount] = useState(0);
  const lastViolationRef = useRef(0);
  const submittedRef = useRef(false);
  const devToolsCheckRef = useRef(null);
  const warningCountRef = useRef(0);

  const addViolation = useCallback(async (type) => {
    const now = Date.now();
    if (now - lastViolationRef.current < 800) return;
    lastViolationRef.current = now;
    if (submittedRef.current) return;

    const count = warningCountRef.current + 1;
    warningCountRef.current = count;
    setWarningCount(count);

    const violation = { type, count, timestamp: new Date().toISOString() };
    setViolations(prev => [...prev, violation]);
    onWarning?.(violation);

    if (count >= violationLimit) {
      submittedRef.current = true;
      onAutoSubmit?.('Auto Submitted - Rule Violation');
    }
  }, [violationLimit, onAutoSubmit, onWarning]);

  const handleVisibility = useCallback(() => {
    if (document.hidden) addViolation('tab-switch');
  }, [addViolation]);

  const handleCopy = useCallback((e) => {
    e.preventDefault();
    addViolation('copy');
  }, [addViolation]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    addViolation('paste');
  }, [addViolation]);

  const handleCut = useCallback((e) => {
    e.preventDefault();
    addViolation('cut');
  }, [addViolation]);

  const handleContext = useCallback((e) => {
    e.preventDefault();
    addViolation('right-click');
  }, [addViolation]);

  const handleSelectStart = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDragStart = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleBeforeUnload = useCallback((e) => {
    addViolation('page-refresh');
    e.preventDefault();
    e.returnValue = '';
  }, [addViolation]);

  const handlePopState = useCallback(() => {
    addViolation('back-button');
  }, [addViolation]);

  const handleBlur = useCallback(() => {
    addViolation('window-blur');
  }, [addViolation]);

  const checkDevTools = useCallback(() => {
    const start = performance.now();
    debugger;
    const end = performance.now();
    if (end - start > 100) {
      addViolation('devtools');
    }
  }, [addViolation]);

  useEffect(() => {
    if (!enabled) return;
    warningCountRef.current = 0;
    setViolations([]);
    setWarningCount(0);
    submittedRef.current = false;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const events = [];

    if (tabSwitchDetection) {
      document.addEventListener('visibilitychange', handleVisibility);
      events.push(() => document.removeEventListener('visibilitychange', handleVisibility));
    }

    if (copyPasteBlock) {
      document.addEventListener('copy', handleCopy, true);
      document.addEventListener('paste', handlePaste, true);
      document.addEventListener('cut', handleCut, true);
      events.push(() => {
        document.removeEventListener('copy', handleCopy, true);
        document.removeEventListener('paste', handlePaste, true);
        document.removeEventListener('cut', handleCut, true);
      });
    }

    if (rightClickBlock) {
      document.addEventListener('contextmenu', handleContext, true);
      events.push(() => document.removeEventListener('contextmenu', handleContext, true));
    }

    document.addEventListener('selectstart', handleSelectStart, true);
    document.addEventListener('dragstart', handleDragStart, true);
    events.push(() => {
      document.removeEventListener('selectstart', handleSelectStart, true);
      document.removeEventListener('dragstart', handleDragStart, true);
    });

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('blur', handleBlur);
    events.push(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('blur', handleBlur);
    });

    if (devToolsDetection) {
      devToolsCheckRef.current = setInterval(checkDevTools, 4000);
      events.push(() => clearInterval(devToolsCheckRef.current));
    }

    return () => events.forEach(cleanup => cleanup());
  }, [
    enabled, tabSwitchDetection, copyPasteBlock, rightClickBlock,
    devToolsDetection, handleVisibility, handleCopy, handlePaste,
    handleCut, handleContext, handleSelectStart, handleDragStart,
    handleBeforeUnload, handlePopState, handleBlur, checkDevTools,
  ]);

  const reset = useCallback(() => {
    warningCountRef.current = 0;
    lastViolationRef.current = 0;
    submittedRef.current = false;
    setViolations([]);
    setWarningCount(0);
  }, []);

  return { violations, warningCount, isBlocked: submittedRef.current, addViolation, reset };
}
