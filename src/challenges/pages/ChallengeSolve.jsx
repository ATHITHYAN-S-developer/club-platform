import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import db from '../../db';
import { DIFFICULTY, LANGUAGES } from '../config/challengeConfig';
import { runCode, gradeSolution, saveSubmissionRecord, submitAndFinalize } from '../services/executionService';
import useActivityLogger from '../../hooks/useActivityLogger';
import useChallengeSecurity from '../../hooks/useChallengeSecurity';
import useChallengeTimer from '../../hooks/useChallengeTimer';
import useAutosave from '../../hooks/useAutoSave';
import SecurityWarningDialog from '../../components/security/SecurityWarningDialog';

const DEFAULT_SECURITY = {
  exam: {
    fullscreenRequired: false,
    windowBlurDetection: false,
    minimizeDetection: false
  },
  keyboard: {
    disableCopy: false,
    disablePaste: false,
    disableCut: false,
    disableSelectAll: false
  },
  violations: {
    maxViolations: 3
  }
};

function getSecurityLevel(config) {
  if (config?.exam?.fullscreenRequired && config?.exam?.windowBlurDetection) {
    return { label: 'Strict Assessment Mode', color: '#dc2626', icon: '🔒' };
  }
  return { label: 'Standard Mode', color: '#059669', icon: '🛡️' };
}

export default function ChallengeSolve({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [output, setOutput] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [monitoringStarted, setMonitoringStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);
  const [scrollPos, setScrollPos] = useState(0);
  const startTimeRef = useRef(Date.now());

  // Staged pending submission state
  const [pendingSubmission, setPendingSubmission] = useState(null);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [autoSubmitReason, setAutoSubmitReason] = useState(null); // 'timer_expired' or 'violation_limit'

  const secConfig = challenge?.security || DEFAULT_SECURITY;
  const timeLimit = challenge?.timeLimit || DIFFICULTY[challenge?.difficulty]?.timeLimit || 10;

  const logger = useActivityLogger();

  // Auto-Submit Handler
  const handleAutoSubmit = useCallback(async (finalViolationCount, reason = 'violation_limit') => {
    logger.recordEvent('auto_submission', { reason });
    if (submitted) return;
    setSubmitting(true);
    setAutoSubmitReason(reason);
    try {
      const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
      const res = await submitAndFinalize({
        challengeId: id,
        code,
        language,
        timeTaken,
        securityLog: logger.getLog(),
        violationCount: finalViolationCount || 0,
        autoSubmitted: true,
        startedAt: logger.getLog()[0]?.timestamp || new Date().toISOString()
      });
      setResult(res);
      setSubmitted(true);

      // End monitoring & timers immediately
      sec.stopMonitoring();
      timer.stop();

      // Exit fullscreen
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
      }
    } catch (e) {
      setResult({ status: 'failed', error: e.message });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }, [submitted, id, code, language, logger]);

  const handleViolation = useCallback((reason, count, limit) => {
    logger.recordEvent('violation', { reason, count, limit });
  }, [logger]);

  const sec = useChallengeSecurity({
    config: secConfig,
    onViolation: handleViolation,
    onAutoSubmit: handleAutoSubmit,
  });

  const timer = useChallengeTimer({
    timeLimitMinutes: timeLimit,
    enabled: monitoringStarted,
    onExpire: useCallback(() => {
      logger.recordEvent('timer_expired');
      const count = sec.violationCount;
      handleAutoSubmit(count, 'timer_expired');
    }, [logger, sec.violationCount, handleAutoSubmit]),
  });

  const autosave = useAutosave({
    userId: user?.id,
    challengeId: id,
    code,
    language,
    cursorPosition: cursorPos,
    scrollPosition: scrollPos,
    interval: secConfig?.submission?.autoSaveInterval || 10,
  });

  // 1. Initial Load
  useEffect(() => {
    async function load() {
      try {
        const ch = await db.findOne('Challenges', { id });
        if (!ch || ch.status !== 'published') {
          setError('Challenge not found.');
          setLoading(false);
          return;
        }

        // Check attempt limit
        if (ch.maxAttempts && ch.maxAttempts > 0 && user) {
          const subs = await db.find('ChallengeSubmissions');
          const userAttempts = subs.filter(s => s.userId === user.id && s.challengeId === id).length;
          if (userAttempts >= ch.maxAttempts) {
            setError(`You have used all ${ch.maxAttempts} attempt${ch.maxAttempts > 1 ? 's' : ''} for this challenge.`);
            setLoading(false);
            return;
          }
        }

        setChallenge(ch);
        const langMap = {};
        ch.starterCode && Object.keys(ch.starterCode).forEach(k => { langMap[k] = ch.starterCode[k]; });
        const firstLang = ch.supportedLanguages?.[0] || 'javascript';
        setLanguage(firstLang);
        if (langMap[firstLang] !== undefined) setCode(langMap[firstLang]);
        else if (langMap.javascript !== undefined) setCode(langMap.javascript);

        const draft = await autosave.restore();
        if (draft && draft.code) {
          const restoreConfirmed = window.confirm('A saved draft was found. Restore it?');
          if (restoreConfirmed) {
            setCode(draft.code);
            if (draft.language) setLanguage(draft.language);
          }
        }
      } catch (e) {
        setError('Failed to load challenge.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // 2. Draft AutoSave Trigger
  useEffect(() => {
    if (code && monitoringStarted) autosave.markDirty();
  }, [code, language, monitoringStarted]);

  // 3. Stop monitoring on submission completion
  useEffect(() => {
    if (submitted) {
      sec.stopMonitoring();
      timer.stop();
    }
  }, [submitted]);

  // 4. Intercept popstate Browser Back Button
  useEffect(() => {
    if (!monitoringStarted || submitted) return;

    window.history.pushState(null, null, window.location.href);

    const handlePopState = async () => {
      const confirmLeave = window.confirm(
        "Leaving this assessment will submit your current work. Click OK to submit and leave, or Cancel to stay."
      );
      if (confirmLeave) {
        setSubmitting(true);
        try {
          const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
          await submitAndFinalize({
            challengeId: id,
            code,
            language,
            timeTaken,
            securityLog: logger.getLog(),
            violationCount: sec.violationCount,
            autoSubmitted: false,
            startedAt: logger.getLog()[0]?.timestamp || new Date().toISOString()
          });
          
          sec.stopMonitoring();
          timer.stop();
          
          if (document.fullscreenElement || document.webkitFullscreenElement) {
            if (document.exitFullscreen) await document.exitFullscreen();
            else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
          }
          navigate('/challenges');
        } catch (err) {
          console.error(err);
          navigate('/challenges');
        } finally {
          setSubmitting(false);
        }
      } else {
        window.history.pushState(null, null, window.location.href);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [monitoringStarted, submitted, id, code, language, sec, timer, logger, navigate]);

  const handleStartChallenge = useCallback(async () => {
    logger.createSession(id, user?.id);
    logger.recordEvent('challenge_started');
    setMonitoringStarted(true);
    await sec.startMonitoring();
    timer.start();
  }, [id, user, logger, sec, timer]);

  // Run Code logic (sample test cases execution)
  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput(null);
    setResult(null);
    try {
      const sampleInput = challenge?.sampleTestCases?.[0]?.input || '';
      const sampleOutput = challenge?.sampleTestCases?.[0]?.output || challenge?.sampleTestCases?.[0]?.expectedOutput || '';
      const res = await runCode({ code, language, input: sampleInput });
      setOutput({
        ...res,
        testcaseInput: sampleInput,
        expectedOutput: sampleOutput
      });
      logger.recordEvent('code_run');
    } catch (e) {
      setOutput({ status: 'failed', stdout: '', stderr: e.message });
    } finally {
      setRunning(false);
    }
  }, [code, language, challenge, logger]);

  // Submit Logic: stages submission in memory
  const handleSubmit = useCallback(async () => {
    if (!user) { alert('You must be signed in to submit.'); return; }
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
      logger.recordEvent('submission_attempt');
      const gradeRes = await gradeSolution({ challengeId: id, code, language, timeTaken });
      
      setPendingSubmission({
        code,
        language,
        gradeResult: gradeRes,
        timeTaken,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      alert('Grading failed: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  }, [code, language, id, user, submitting, submitted, logger]);

  // Final Commit Logic: writes staged pendingSubmission to Firestore database
  const handleFinalizeSubmission = useCallback(async () => {
    if (!pendingSubmission) return;
    setSubmitting(true);
    try {
      const res = await saveSubmissionRecord({
        challengeId: id,
        code: pendingSubmission.code,
        language: pendingSubmission.language,
        timeTaken: pendingSubmission.timeTaken,
        gradeResult: pendingSubmission.gradeResult,
        securityLog: logger.getLog(),
        violationCount: sec.violationCount,
        autoSubmitted: false,
        startedAt: logger.getLog()[0]?.timestamp || new Date().toISOString()
      });
      
      setResult(res);
      setSubmitted(true);
      setPendingSubmission(null);
      setShowFinishConfirm(false);
      
      sec.stopMonitoring();
      timer.stop();
      
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
      }
    } catch (e) {
      alert('Failed to save submission: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  }, [pendingSubmission, id, sec, timer, logger]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin .65s linear infinite' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 1600, width: '96%', margin: '0 auto', padding: 64, textSlign: 'center' }}>
        <i className="fas fa-exclamation-triangle" style={{ fontSize: 32, color: '#f59e0b', marginBottom: 16 }}></i>
        <p style={{ fontSize: 16, color: '#6b7280' }}>{error}</p>
        <button onClick={() => navigate('/challenges')} style={{ marginTop: 16, padding: '10px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Back to Challenges</button>
      </div>
    );
  }

  const diff = DIFFICULTY[challenge.difficulty] || DIFFICULTY.easy;
  const secLevel = getSecurityLevel(secConfig);
  const hasSecurity = secConfig?.exam?.fullscreenRequired || secConfig?.exam?.windowBlurDetection || secConfig?.keyboard?.disableCopy;

  return (
    <>
      {/* Starting Modal */}
      <SecurityWarningDialog
        open={hasSecurity && !monitoringStarted && !submitted}
        variant="start"
        securityLevel={secLevel}
        limit={secConfig?.violations?.maxViolations}
        onResume={handleStartChallenge}
      />

      {/* Violation Warning Modal */}
      <SecurityWarningDialog
        open={sec.showDialog}
        variant={sec.dialogVariant}
        reason={sec.lastReason}
        count={sec.violationCount}
        limit={sec.limit}
        onResume={sec.handleResume}
      />

      {/* Security Terminated Modal */}
      {sec.isTerminated && submitted && (
        <SecurityWarningDialog
          open={true}
          variant="terminated"
          onResume={() => navigate('/challenges')}
        />
      )}

      {/* Auto Submitted Info Overlay */}
      {submitted && autoSubmitReason && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 20, maxWidth: 480, width: '90%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>
              <i className="fa-solid fa-clock-rotate-left"></i>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Assessment Submitted Automatically</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
              Your session has ended and your work has been saved. <br />
              <strong>Reason:</strong> {autoSubmitReason === 'timer_expired' ? 'Time expired.' : 'Maximum security violations reached.'}
            </p>
            <button
              onClick={() => navigate('/challenges')}
              style={{ width: '100%', padding: '12px 24px', background: '#ff5500', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Submit Summary Stage Dialog */}
      {pendingSubmission && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 20, maxWidth: 540, width: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Submission Summary</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Test Cases Passed:</span>
                <p style={{ fontSize: 20, fontWeight: 800, color: pendingSubmission.gradeResult.status === 'passed' ? '#10b981' : '#f59e0b', margin: '4px 0 0' }}>
                  {pendingSubmission.gradeResult.results.filter(r => r.passed).length} / {pendingSubmission.gradeResult.results.length}
                </p>
              </div>
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Submission Score:</span>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#4f46e5', margin: '4px 0 0' }}>
                  {pendingSubmission.gradeResult.score.finalScore} / 1000
                </p>
              </div>
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Language:</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '4px 0 0', textTransform: 'capitalize' }}>
                  {pendingSubmission.language}
                </p>
              </div>
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Execution Metrics:</span>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '4px 0 0' }}>
                  Time: {pendingSubmission.gradeResult.runtime}s | Mem: {pendingSubmission.gradeResult.memory}MB
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setPendingSubmission(null)}
                style={{ flex: 1, padding: '12px 24px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                Back to Editor
              </button>
              <button
                onClick={() => setShowFinishConfirm(true)}
                style={{ flex: 1, padding: '12px 24px', background: '#ff5500', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                Finish Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Assessment Confirmation Dialog */}
      {showFinishConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 20, maxWidth: 440, width: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Are you sure?</h3>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>After finishing the assessment:</p>
            <ul style={{ fontSize: 13, color: '#475569', paddingLeft: 20, margin: '0 0 24px', lineHeight: 1.7 }}>
              <li>You cannot edit your code.</li>
              <li>Your submission will be final.</li>
              <li>Fullscreen mode will end.</li>
              <li>Your assessment session will close.</li>
            </ul>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowFinishConfirm(false)}
                style={{ flex: 1, padding: '10px 20px', background: '#fff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleFinalizeSubmission}
                disabled={submitting}
                style={{ flex: 1, padding: '10px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                {submitting ? 'Submitting...' : 'Finish Assessment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finished Summary Results Screen */}
      {submitted && result && !autoSubmitReason && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', padding: 32 }}>
          <div style={{ background: '#fff', padding: 40, borderRadius: 24, maxWidth: 580, width: '100%', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 24px' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>Assessment Completed!</h2>
            <p style={{ fontSize: 15, color: '#64748b', marginBottom: 32 }}>Your solution has been evaluated and committed successfully.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
              <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>XP Earned:</span>
                <p style={{ fontSize: 24, fontWeight: 900, color: '#10b981', margin: '4px 0 0' }}>+{result.xpEarned || 0} XP</p>
              </div>
              <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status:</span>
                <p style={{ fontSize: 24, fontWeight: 900, color: result.status === 'passed' ? '#10b981' : '#ef4444', margin: '4px 0 0', textTransform: 'capitalize' }}>{result.status}</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/challenges')}
              style={{ padding: '14px 32px', background: '#ff5500', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}
            >
              Back to Challenges
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Frame */}
      {(!monitoringStarted && hasSecurity && !submitted) || (submitted && result) ? null : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', background: '#fff' }}>
          
          {/* Header Assessment bar */}
          {monitoringStarted && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', gap: 16, flexWrap: 'wrap', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, background: `${secLevel.color}15` }}>
                  <span style={{ fontSize: 11 }}>{secLevel.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: secLevel.color }}>{secLevel.label}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: timer.color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.02em', transition: 'color .3s', ...(timer.isBlinking ? { animation: 'blink 1s infinite' } : {}) }}>
                  {timer.display}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {sec.violationCount > 0 && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: sec.violationCount >= sec.limit ? '#dc2626' : '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <i className="fa-solid fa-flag"></i>
                    <span>Violations: {sec.violationCount}/{sec.limit}</span>
                  </div>
                )}
                {sec.isOffline && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: '#fee2e2', borderRadius: 6 }}>
                    <i className="fa-solid fa-wifi"></i>
                    <span>Connection Lost</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main workspace layout */}
          <div className="chl-solve" style={{ flex: 1, minHeight: 0, height: 'auto', position: 'relative' }}>
            
            {/* Left: Problem Details */}
            <div className="chl-solve-desc">
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span className={`chl-diff chl-diff-${challenge.difficulty}`}>{diff.label}</span>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>{challenge.xpReward || 100} XP</span>
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>{challenge.title}</h1>
              </div>

              <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.7, marginBottom: 24, whiteSpace: 'pre-wrap' }}>{challenge.description}</p>

              {challenge.constraints && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Constraints</h3>
                  <pre style={{ fontSize: 13, color: '#6b7280', background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb', whiteSpace: 'pre-wrap', fontFamily: "'JetBrains Mono', monospace" }}>{challenge.constraints}</pre>
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Sample Test Cases</h3>
                {challenge.sampleTestCases?.map((tc, i) => (
                  <div key={i} style={{ marginBottom: 12, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' }}>Input:</span>
                      <pre style={{ fontSize: 13, color: '#111827', margin: '4px 0 0', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap' }}>{tc.input}</pre>
                    </div>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' }}>Output:</span>
                      <pre style={{ fontSize: 13, color: '#111827', margin: '4px 0 0', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap' }}>{tc.output || tc.expectedOutput}</pre>
                    </div>
                    {tc.explanation && (
                      <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}><strong style={{ color: '#374151' }}>Explanation:</strong> {tc.explanation}</p>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {challenge.tags?.map(tag => (
                  <span key={tag} style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', padding: '4px 12px', borderRadius: 999 }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Right: Workspace Code Editor */}
            <div className="chl-solve-editor">
              <div className="chl-solve-topbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <select
                    value={language}
                    disabled={submitted}
                    onChange={e => {
                      setLanguage(e.target.value);
                      const starter = challenge.starterCode?.[e.target.value];
                      if (starter !== undefined) setCode(starter);
                    }}
                    style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, background: '#fff', color: '#111827' }}
                  >
                    {LANGUAGES.filter(l => challenge.supportedLanguages?.includes(l.id)).map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleRun}
                    disabled={running || submitted}
                    style={{ padding: '8px 20px', background: '#f3f4f6', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {running ? <span style={{ width: 14, height: 14, border: '2px solid #9ca3af', borderTopColor: '#111827', borderRadius: '50%', display: 'inline-block', animation: 'spin .65s linear infinite' }}></span> : <i className="fas fa-play"></i>}
                    Run
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || submitted}
                    style={{ padding: '8px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {submitting ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .65s linear infinite' }}></span> : <i className="fas fa-paper-plane"></i>}
                    Submit
                  </button>
                </div>
              </div>

              <textarea
                value={code}
                readOnly={submitted}
                onChange={e => { setCode(e.target.value); autosave.markDirty(); }}
                onContextMenu={e => { if (secConfig?.keyboard?.disableRightClick !== false) { e.preventDefault(); } }}
                onCopy={e => { if (secConfig?.keyboard?.disableCopy !== false) { e.preventDefault(); logger.recordEvent('copy_paste', { action: 'copy' }); } }}
                onPaste={e => { if (secConfig?.keyboard?.disablePaste !== false) { e.preventDefault(); logger.recordEvent('paste', { action: 'paste' }); } }}
                onCut={e => { if (secConfig?.keyboard?.disableCut !== false) { e.preventDefault(); } }}
                onDragStart={e => { if (secConfig?.keyboard?.disableDragDrop !== false) { e.preventDefault(); } }}
                onDrop={e => { if (secConfig?.keyboard?.disableDragDrop !== false) { e.preventDefault(); } }}
                onSelect={e => { if (secConfig?.keyboard?.disableSelectAll !== false) { const t = e.target; if (t.selectionEnd - t.selectionStart === t.value.length) { t.setSelectionRange(t.selectionEnd, t.selectionEnd); } } }}
                onScroll={e => setScrollPos(e.target.scrollTop)}
                onClick={e => setCursorPos(e.target.selectionStart)}
                onKeyUp={e => setCursorPos(e.target.selectionStart)}
                style={{
                  flex: 1, width: '100%', border: 'none', outline: 'none', resize: submitted ? 'none' : 'vertical',
                  padding: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: 14, lineHeight: 1.6,
                  color: submitted ? '#9ca3af' : '#111827', background: submitted ? '#f8fafc' : '#fff', tabSize: 2,
                  userSelect: secConfig?.keyboard?.disableTextSelection ? 'none' : 'text',
                }}
                spellCheck={false}
              />

              <div className="chl-solve-output">
                {output ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 750, fontSize: 14, color: output.status === 'passed' ? '#059669' : '#dc2626' }}>
                        <i className={`fas ${output.status === 'passed' ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ marginRight: 6 }}></i>
                        {output.status === 'passed' ? 'Run Successful' : 'Run Failed'}
                      </span>
                    </div>

                    {output.testcaseInput !== undefined && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                        <div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' }}>Input:</span>
                          <pre style={{ fontSize: 12, color: '#111827', margin: '4px 0 0', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap' }}>{output.testcaseInput}</pre>
                        </div>
                        <div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' }}>Expected Output:</span>
                          <pre style={{ fontSize: 12, color: '#111827', margin: '4px 0 0', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap' }}>{output.expectedOutput}</pre>
                        </div>
                      </div>
                    )}

                    <div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' }}>Your Output:</span>
                      {output.stdout ? (
                        <pre style={{ fontSize: 13, color: '#111827', background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', marginTop: 4, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap' }}>{output.stdout}</pre>
                      ) : (
                        <pre style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic', background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>No standard output returned.</pre>
                      )}
                    </div>

                    {output.stderr && (
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '.05em' }}>Error Message:</span>
                        <pre style={{ fontSize: 13, color: '#dc2626', background: '#fef2f2', padding: 12, borderRadius: 8, border: '1px solid #fee2e2', marginTop: 4, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap' }}>{output.stderr}</pre>
                      </div>
                    )}
                    
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Time: {output.time}s · Memory: {output.memory}MB</p>
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: '#9ca3af' }}>Run your code to see output here.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: 0.3 } }
      `}</style>
    </>
  );
}
