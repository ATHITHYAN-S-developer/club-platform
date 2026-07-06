import { useState, useCallback, useEffect, useRef } from 'react';
import db from '../db.js';

export default function useAntiCheat(options = {}) {
  const {
    enabled = true,
    violationLimit = 3,
    onViolation,
    onAutoSubmit,
    quizId,
    userId,
    attemptId,
    tabSwitchDetection = true,
    copyPasteBlock = true,
    rightClickBlock = true,
    devToolsDetection = true,
  } = options;

  const [violations, setViolations] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const warningCountRef = useRef(0);
  const lastViolationRef = useRef(0);
  const submittedRef = useRef(false);
  const devToolsOpenRef = useRef(false);
  const checkIntervalRef = useRef(null);

  const addViolation = useCallback(async (type) => {
    const now = Date.now();
    if (now - lastViolationRef.current < 1000) return;
    lastViolationRef.current = now;

    if (submittedRef.current) return;

    const count = warningCountRef.current + 1;
    warningCountRef.current = count;
    const violation = { type, count, timestamp: new Date().toISOString() };
    setViolations(prev => [...prev, violation]);

    try {
      await db.insert('Violations', { userId, quizId, attemptId, type, count });
    } catch { /* silent */ }

    onViolation?.(violation);

    if (count >= violationLimit) {
      submittedRef.current = true;
      setIsBlocked(true);
      onAutoSubmit?.('Auto Submitted - Rule Violation');
    }
  }, [userId, quizId, attemptId, violationLimit, onViolation, onAutoSubmit]);

  useEffect(() => {
    if (!enabled || !tabSwitchDetection) return;
    const handleVisibility = () => {
      if (document.hidden) addViolation('tab-switch');
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [enabled, tabSwitchDetection, addViolation]);

  useEffect(() => {
    if (!enabled || !copyPasteBlock) return;
    const handleCopy = (e) => { e.preventDefault(); addViolation('copy'); };
    document.addEventListener('copy', handleCopy);
    return () => document.removeEventListener('copy', handleCopy);
  }, [enabled, copyPasteBlock, addViolation]);

  useEffect(() => {
    if (!enabled || !copyPasteBlock) return;
    const handlePaste = (e) => { e.preventDefault(); addViolation('paste'); };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [enabled, copyPasteBlock, addViolation]);

  useEffect(() => {
    if (!enabled || !rightClickBlock) return;
    const handleContext = (e) => { e.preventDefault(); addViolation('right-click'); };
    document.addEventListener('contextmenu', handleContext);
    return () => document.removeEventListener('contextmenu', handleContext);
  }, [enabled, rightClickBlock, addViolation]);

  useEffect(() => {
    if (!enabled || !devToolsDetection) return;
    const checkDevTools = () => {
      const start = performance.now();
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        devToolsOpenRef.current = true;
        addViolation('devtools');
      }
    };
    checkIntervalRef.current = setInterval(checkDevTools, 5000);
    return () => clearInterval(checkIntervalRef.current);
  }, [enabled, devToolsDetection, addViolation]);

  useEffect(() => {
    if (!enabled) return;
    const handleBeforeUnload = (e) => {
      addViolation('page-refresh');
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, addViolation]);

  const reset = useCallback(() => {
    warningCountRef.current = 0;
    lastViolationRef.current = 0;
    submittedRef.current = false;
    setViolations([]);
    setIsBlocked(false);
  }, []);

  return { violations, warningCount: warningCountRef.current, isBlocked, addViolation, reset };
}
