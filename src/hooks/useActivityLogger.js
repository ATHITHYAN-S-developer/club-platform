import { useRef, useCallback } from 'react';

export default function useActivityLogger() {
  const logRef = useRef([]);

  const createSession = useCallback((challengeId, userId) => {
    logRef.current = [];
    recordEvent('assessment_started', { challengeId, userId });
  }, []);

  const recordEvent = useCallback((event, details) => {
    logRef.current.push({
      event,
      timestamp: new Date().toISOString(),
      details: details || null,
    });
  }, []);

  const getLog = useCallback(() => [...logRef.current], []);

  const getSecurityReport = useCallback(() => {
    const log = logRef.current;
    const countByEvent = (evt) => log.filter(e => e.event === evt).length;
    const startEvent = log.find(e => e.event === 'assessment_started');
    const submitEvent = log.find(e => e.event === 'submission' || e.event === 'auto_submission');
    const totalTime = startEvent && submitEvent
      ? Math.round((new Date(submitEvent.timestamp) - new Date(startEvent.timestamp)) / 1000)
      : 0;
    return {
      violations: countByEvent('violation'),
      tabSwitches: countByEvent('tab_switch'),
      fullscreenExits: countByEvent('fullscreen_exit'),
      copyAttempts: countByEvent('copy_paste'),
      pasteAttempts: countByEvent('paste'),
      devtoolsOpened: countByEvent('devtools'),
      mouseLeaves: countByEvent('mouse_leave'),
      autoSubmitted: log.some(e => e.event === 'auto_submission'),
      refreshes: countByEvent('refresh'),
      totalTime,
      totalEvents: log.length,
    };
  }, []);

  const clearLog = useCallback(() => {
    logRef.current = [];
  }, []);

  return { createSession, recordEvent, getLog, getSecurityReport, clearLog };
}
