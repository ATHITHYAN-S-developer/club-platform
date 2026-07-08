import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import db from '../../db';
import { DIFFICULTY, LANGUAGES } from '../config/challengeConfig';
import { runCode, submitSolution } from '../services/executionService';

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
  const [startTime] = useState(Date.now());

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
      } catch (e) {
        setError('Failed to load challenge.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput(null);
    setResult(null);
    try {
      const res = await runCode({ code, language, input: challenge?.sampleTestCases?.[0]?.input || '' });
      setOutput(res);
    } catch (e) {
      setOutput({ status: 'failed', stdout: '', stderr: e.message });
    } finally {
      setRunning(false);
    }
  }, [code, language, challenge]);

  const handleSubmit = useCallback(async () => {
    if (!user) { alert('You must be signed in to submit.'); return; }
    setSubmitting(true);
    setResult(null);
    try {
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const res = await submitSolution({ challengeId: id, code, language, timeTaken });
      setResult(res);
    } catch (e) {
      setResult({ status: 'failed', error: e.message });
    } finally {
      setSubmitting(false);
    }
  }, [code, language, id, user, startTime]);

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

  return (
    <div className="chl-solve">
      {/* Left: Description */}
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

      {/* Right: Editor */}
      <div className="chl-solve-editor">
        <div className="chl-solve-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select
              value={language}
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
              disabled={running}
              style={{ padding: '8px 20px', background: '#f3f4f6', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {running ? <span style={{ width: 14, height: 14, border: '2px solid #9ca3af', borderTopColor: '#111827', borderRadius: '50%', display: 'inline-block', animation: 'spin .65s linear infinite' }}></span> : <i className="fas fa-play"></i>}
              Run
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ padding: '8px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {submitting ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .65s linear infinite' }}></span> : <i className="fas fa-paper-plane"></i>}
              Submit
            </button>
          </div>
        </div>

        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          style={{
            flex: 1, width: '100%', border: 'none', outline: 'none', resize: 'none',
            padding: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: 14, lineHeight: 1.6,
            color: '#111827', background: '#fff', tabSize: 2
          }}
          spellCheck={false}
        />

        {/* Output */}
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
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: output.status === 'passed' ? '#059669' : '#dc2626' }}>
                  <i className={`fas ${output.status === 'passed' ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ marginRight: 6 }}></i>
                  {output.status === 'passed' ? 'Run Successful' : 'Run Failed'}
                </span>
              </div>
              {output.stdout && <pre style={{ fontSize: 13, color: '#111827', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap' }}>{output.stdout}</pre>}
              {output.stderr && <pre style={{ fontSize: 13, color: '#dc2626', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap' }}>{output.stderr}</pre>}
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Time: {output.time}s · Memory: {output.memory}MB</p>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#9ca3af' }}>Run your code to see output here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
