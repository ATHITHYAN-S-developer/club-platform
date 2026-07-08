export function createSession(challengeId, userId) {
  const sessionId = `session_${challengeId}_${userId}_${Date.now()}`;
  return {
    sessionId,
    challengeId,
    userId,
    startedAt: new Date().toISOString(),
    log: [],
  };
}

export function recordEvent(session, event, details) {
  session.log.push({
    event,
    timestamp: new Date().toISOString(),
    details: details || null,
  });
  return session;
}

export function getSecurityReport(log) {
  if (!log || !log.length) {
    return {
      violations: 0, tabSwitches: 0, fullscreenExits: 0,
      copyAttempts: 0, pasteAttempts: 0, devtoolsOpened: 0,
      mouseLeaves: 0, autoSubmitted: false, refreshes: 0,
      totalTime: 0, totalEvents: 0,
    };
  }
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
}
