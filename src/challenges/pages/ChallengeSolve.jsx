import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import db from '../../db';
import { DIFFICULTY, LANGUAGES, DEFAULT_SECURITY, getSecurityLevel } from '../config/challengeConfig';
import { runCode, submitSolution } from '../services/executionService';
import useChallengeSecurity from '../../hooks/useChallengeSecurity';
import useChallengeTimer from '../../hooks/useChallengeTimer';
import useAutosave from '../../hooks/useAutosave';
import useActivityLogger from '../../hooks/useActivityLogger';
import SecurityWarningDialog from '../../components/security/SecurityWarningDialog';

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

  const secConfig = challenge?.security || DEFAULT_SECURITY;
  const timeLimit = challenge?.timeLimit || DIFFICULTY[challenge?.difficulty]?.timeLimit || 10;

  const logger = useActivityLogger();

  const handleAutoSubmit = useCallback(async (finalViolationCount) => {
    logger.recordEvent('auto_submission', { reason: 'violation_limit' });
    if (submitted) return;
    setSubmitting(true);
    try {
      const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
      const res = await submitSolution({
        challengeId: id, code, language, timeTaken,
        securityLog: logger.getLog(),
        violationCount: finalViolationCount || 0,
        autoSubmitted: true,
        startedAt: logger.getLog()[0]?.timestamp || new Date().toISOString(),
      });
      setResult(res);
      setSubmitted(true);
    } catch (e) {
      setResult({ status: 'failed', error: e.message });
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
      handleAutoSubmit(count);
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

  useEffect(() => {
    async function load() {
      try {
        const ch = await db.findOne('Challenges', { id });
        if (!ch || ch.status !== 'published') {
          setError('Challenge not found.');
          setLoading(false);
          return;
        }
        setChallenge(ch);
        const langMap = {};
        ch.starterCode && Object.keys(ch.starterCode).forEach(k => { langMap[k] = ch.starterCode[k]; });
        const firstLang = ch.supportedLanguages?.[0] || 'javascript';
        setLanguage(firstLang);
        if (langMap[firstLang]) setCode(langMap[firstLang]);
        else if (langMap.javascript) setCode(langMap.javascript);

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

  useEffect(() => {
    if (code && monitoringStarted) autosave.markDirty();
  }, [code, language, monitoringStarted]);

  useEffect(() => {
    if (submitted) {
      sec.stopMonitoring();
      timer.stop();
    }
  }, [submitted]);

  const handleStartChallenge = useCallback(async () => {
    logger.createSession(id, user?.id);
    logger.recordEvent('challenge_started');
    setMonitoringStarted(true);
    await sec.startMonitoring();
    timer.start();
  }, [id, user, logger, sec, timer]);

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
        expectedOutput: sampleOutput,
      });
      logger.recordEvent('code_run');
    } catch (e) {
      setOutput({ status: 'failed', stdout: '', stderr: e.message });
    } finally {
      setRunning(false);
    }
  }, [code, language, challenge, logger]);

  const handleSubmit = useCallback(async () => {
    if (!user) { alert('You must be signed in to submit.'); return; }
    if (submitted) return;
    setSubmitting(true);
    setResult(null);
    try {
      const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
      logger.recordEvent('submission', { method: 'manual' });
      const res = await submitSolution({
        challengeId: id, code, language, timeTaken,
        securityLog: logger.getLog(),
        violationCount: sec.violationCount,
        autoSubmitted: false,
        startedAt: logger.getLog()[0]?.timestamp || new Date().toISOString(),
      });
      setResult(res);
      setSubmitted(true);
    } catch (e) {
      setResult({ status: 'failed', error: e.message });
    } finally {
      setSubmitting(false);
    }
  }, [code, language, id, user, logger, sec.violationCount, submitted]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 68px)' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin .65s linear infinite' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 1600, width: '96%', margin: '0 auto', padding: 64, textAlign: 'center' }}>
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
      <SecurityWarningDialog
        open={hasSecurity && !monitoringStarted && !submitted}
        variant="start"
        securityLevel={secLevel}
        limit={secConfig?.violations?.maxViolations}
        onResume={handleStartChallenge}
      />

      <SecurityWarningDialog
        open={sec.showDialog}
        variant={sec.dialogVariant}
        reason={sec.lastReason}
        count={sec.violationCount}
        limit={sec.limit}
        onResume={sec.handleResume}
      />

      {sec.isTerminated && submitted && (
        <SecurityWarningDialog
          open={true}
          variant="terminated"
          onResume={() => navigate('/challenges')}
        />
      )}

      {!monitoringStarted && hasSecurity && !submitted ? null : (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 68px)' }}>
          {monitoringStarted && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 24px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', gap: 16, flexWrap: 'wrap', flexShrink: 0 }}>
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
                {submitted && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: '#d1fae5', borderRadius: 6 }}>
                    <i className="fa-solid fa-check-circle"></i>
                    <span>Submitted</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="chl-solve" style={{ flex: 1, minHeight: 0, height: 'auto', position: 'relative' }}>
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

          <div className="chl-solve-editor">
            <div className="chl-solve-topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <select
                  value={language}
                  disabled={submitted}
                  onChange={e => {
                    setLanguage(e.target.value);
                    const starter = challenge.starterCode?.[e.target.value];
                    if (starter) setCode(starter);
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
                  style={{ padding: '8px 20px', background: submitted ? '#f3f4f6' : '#f3f4f6', color: submitted ? '#9ca3af' : '#111827', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: submitted ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {running ? <span style={{ width: 14, height: 14, border: '2px solid #9ca3af', borderTopColor: '#111827', borderRadius: '50%', display: 'inline-block', animation: 'spin .65s linear infinite' }}></span> : <i className="fas fa-play"></i>}
                  Run
                </button>
                {submitted ? (
                  <button
                    onClick={() => navigate('/challenges')}
                    style={{ padding: '8px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <i className="fas fa-arrow-left"></i> Back
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{ padding: '8px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {submitting ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .65s linear infinite' }}></span> : <i className="fas fa-paper-plane"></i>}
                    Submit
                  </button>
                )}
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
              {result ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: result.status === 'passed' ? '#059669' : '#dc2626' }}>
                      <i className={`fas ${result.status === 'passed' ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ marginRight: 6 }}></i>
                      {result.status === 'passed' ? 'Accepted' : 'Failed'}
                    </span>
                    {result.results && (
                      <span style={{ fontSize: 12, fontWeight: 700, background: result.status === 'passed' ? '#d1fae5' : '#fee2e2', color: result.status === 'passed' ? '#065f46' : '#991b1b', padding: '4px 10px', borderRadius: 6 }}>
                        {result.results.filter(r => r.passed).length} / {result.results.length} Test Cases Passed
                      </span>
                    )}
                    {result.xpEarned > 0 && (
                      <span style={{ fontSize: 13, color: '#4f46e5', fontWeight: 700 }}>+{result.xpEarned} XP</span>
                    )}
                  </div>
                  {result.results && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                      {result.results.slice(0, 6).map((tc, i) => (
                        <span key={i} style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: tc.passed ? '#d1fae5' : '#fee2e2', color: tc.passed ? '#059669' : '#dc2626' }}>
                          {tc.isHidden ? 'Hidden' : `Test ${i + 1}`}: {tc.passed ? 'Pass' : 'Fail'}
                        </span>
                      ))}
                    </div>
                  )}
                  {result.score && (
                    <p style={{ fontSize: 13, color: '#6b7280' }}>Score: {result.score.finalScore} (Accuracy: {result.score.details?.accuracyPercent}% | Speed: {result.score.details?.speedPercent}%)</p>
                  )}
                </div>
              ) : output ? (
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
