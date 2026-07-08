import { useState, useRef, useCallback, useEffect } from 'react';
import useSecurity from './useSecurity';

export default function useChallengeSecurity({ config, onViolation, onAutoSubmit }) {
  const [monitoring, setMonitoring] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogVariant, setDialogVariant] = useState('start');
  const [lastReason, setLastReason] = useState(null);
  const [isTerminated, setIsTerminated] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef(null);
  const idleWarnRef = useRef(null);
  const onViolationRef = useRef(onViolation);
  const onAutoSubmitRef = useRef(onAutoSubmit);
  onViolationRef.current = onViolation;
  onAutoSubmitRef.current = onAutoSubmit;

  const limit = config?.violations?.maxViolations || 3;
  const autoSubmitEnabled = config?.submission?.autoSubmitAfterViolationLimit !== false;

  const handleViolation = useCallback((reason) => {
    if (isTerminated) return;
    setViolationCount(prev => {
      const next = prev + 1;
      setLastReason(reason);
      setShowDialog(true);
      setDialogVariant('warning');
      onViolationRef.current?.(reason, next, limit);
      if (next >= limit && autoSubmitEnabled) {
        setIsTerminated(true);
        onAutoSubmitRef.current?.(next);
      }
      return next;
    });
  }, [isTerminated, limit, autoSubmitEnabled]);

  const security = useSecurity({ onViolation: handleViolation });

  const handleResume = useCallback(() => {
    setShowDialog(false);
    if (dialogVariant === 'terminated' || isTerminated) {
      security.stop();
      return;
    }
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      security.requestFullscreen();
    }
  }, [security, dialogVariant, isTerminated]);

  const startMonitoring = useCallback(async () => {
    setMonitoring(true);
    setViolationCount(0);
    setIsTerminated(false);
    setShowDialog(false);
    security.start();
    if (config?.exam?.fullscreenRequired) {
      await security.requestFullscreen();
    }
  }, [security, config]);

  const stopMonitoring = useCallback(() => {
    setMonitoring(false);
    security.stop();
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (idleWarnRef.current) clearTimeout(idleWarnRef.current);
  }, [security]);

  const enterFullscreen = useCallback(async () => {
    await security.requestFullscreen();
    if (config?.exam?.fullscreenRequired) {
      setShowDialog(false);
    }
  }, [security, config]);

  useEffect(() => {
    if (!monitoring || !config?.exam?.windowBlurDetection) return;
    const handleBlur = () => handleViolation('window_blur');
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [monitoring, config, handleViolation]);

  useEffect(() => {
    if (!monitoring || !config?.exam?.minimizeDetection) return;
    const handleResize = () => {
      if (document.hidden) handleViolation('tab_switch');
    };
    document.addEventListener('visibilitychange', handleResize);
    return () => document.removeEventListener('visibilitychange', handleResize);
  }, [monitoring, config, handleViolation]);

  useEffect(() => {
    if (!monitoring) return;
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      onViolationRef.current?.('offline', 'connection_lost');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [monitoring]);

  useEffect(() => {
    if (!monitoring) return;
    const handleMouseLeave = () => {
      if (isTerminated) return;
      handleViolation('mouse_leave');
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [monitoring, handleViolation, isTerminated]);

  useEffect(() => {
    if (!monitoring || !config?.idleDetection?.enabled) return;
    const timeout = (config.idleDetection.timeoutMinutes || 5) * 60 * 1000;
    const autoSubmit = (config.idleDetection.autoSubmitAfterMinutes || 10) * 60 * 1000;

    const resetIdleTimer = () => {
      setIsIdle(false);
      if (idleWarnRef.current) clearTimeout(idleWarnRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleWarnRef.current = setTimeout(() => {
        setIsIdle(true);
        handleViolation('idle');
        idleTimerRef.current = setTimeout(() => {
          if (autoSubmitEnabled) {
            setIsTerminated(true);
            setDialogVariant('terminated');
            onAutoSubmitRef.current?.(limit);
          }
        }, autoSubmit - timeout);
      }, timeout);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    events.forEach(evt => window.addEventListener(evt, resetIdleTimer));
    resetIdleTimer();

    return () => {
      events.forEach(evt => window.removeEventListener(evt, resetIdleTimer));
      if (idleWarnRef.current) clearTimeout(idleWarnRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [monitoring, config, handleViolation, autoSubmitEnabled]);

  return {
    monitoring,
    violationCount,
    showDialog,
    dialogVariant,
    lastReason,
    isTerminated,
    isOffline,
    isIdle,
    limit,
    startMonitoring,
    stopMonitoring,
    handleResume,
    enterFullscreen,
    setDialogVariant,
    setShowDialog,
  };
}
