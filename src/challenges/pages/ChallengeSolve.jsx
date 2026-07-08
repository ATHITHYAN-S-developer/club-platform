import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getChallenge, loadDraft, saveDraft } from '../services/challengeService';
import { runCode, submitSolution } from '../services/executionService';
import { DIFFICULTY } from '../config/challengeConfig';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import OutputPanel from '../components/OutputPanel';
import ChallengeTimer from '../components/ChallengeTimer';

export default function ChallengeSolve({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [results, setResults] = useState(null);
  const [runtime, setRuntime] = useState(null);
  const [memory, setMemory] = useState(null);
  const [compilationError, setCompilationError] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [startTime] = useState(new Date().toISOString());
  const [showSplash, setShowSplash] = useState(false);
  const [solveTab, setSolveTab] = useState('problem');
  const autosaveRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const c = await getChallenge(id);
        if (!c) return;
        setChallenge(c);
        const diff = DIFFICULTY[c.difficulty] || DIFFICULTY.easy;

        if (user) {
          const draft = await loadDraft(user.id, id);
          if (draft?.code) {
            setCode(draft.code);
            setLanguage(draft.language || 'python');
          } else if (c.starterCode?.['python']) {
            setCode(c.starterCode['python']);
          }
        } else if (c.starterCode?.['python']) {
          setCode(c.starterCode['python']);
        }
      } catch (e) {
        console.error('Load challenge error', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  useEffect(() => {
    if (autosaveRef.current) clearInterval(autosaveRef.current);
    if (!user || !id) return;
    autosaveRef.current = setInterval(() => {
      saveDraft(user.id, id, language, code);
    }, 20000);
    return () => { if (autosaveRef.current) clearInterval(autosaveRef.current); };
  }, [user, id, language, code]);

  const handleLanguageChange = useCallback((newLang) => {
    setLanguage(newLang);
    if (challenge?.starterCode?.[newLang] && !confirm('Switch language? Your current code will be replaced with the starter code for ' + newLang + '.')) return;
    setCode(challenge?.starterCode?.[newLang] || '');
  }, [challenge]);

  const handleRun = async () => {
    if (!code.trim()) return;
    setRunning(true);
    setResults(null);
    setCompilationError(null);
    try {
      const sampleInput = challenge?.sampleTestCases?.[0]?.input || '';
      const res = await runCode({ code, language, input: sampleInput });
      setResults([{ status: res.status === 'passed' ? 'passed' : 'failed', actual: res.stdout || res.stderr, expected: challenge?.sampleTestCases?.[0]?.output, isHidden: false, runtime: res.time }]);
      setRuntime(res.time);
      setMemory(res.memory);
      if (res.stderr) setCompilationError(res.stderr);
    } catch (e) {
      setResults([{ status: 'error', actual: e.message, expected: '', isHidden: false }]);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim() || submitting) return;
    setSubmitting(true);
    setResults(null);
    setCompilationError(null);
    try {
      const timeTaken = (new Date() - new Date(startTime)) / 1000;
      const res = await submitSolution({ challengeId: id, code, language, timeTaken });
      setSubmissionResult(res);
      setResults(res.results || []);
      setRuntime(res.runtime);
      setMemory(res.memory);
      setShowSplash(true);
      if (user) {
        saveDraft(user.id, id, language, code);
      }
    } catch (e) {
      setResults([{ status: 'error', actual: e.message, expected: '', isHidden: false }]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (submitting || running) return;
      if (results) handleSubmit(); else handleRun();
    }
  }, [code, language, submitting, running, results]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[var(--orange)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-[var(--text-muted)]">
        <i className="fa-solid fa-circle-exclamation text-4xl mb-3" />
        <p className="text-lg font-medium">Challenge not found</p>
        <Link to="/challenges" className="mt-3 text-[var(--orange)] hover:underline text-sm">Back to challenges</Link>
      </div>
    );
  }

  const diff = DIFFICULTY[challenge.difficulty] || DIFFICULTY.easy;

  return (
    <>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/challenges')} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer">
            <i className="fa-solid fa-arrow-left" />
          </button>
          <span className="text-sm font-semibold text-[var(--text)]">{challenge.title}</span>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold" style={{ background: `${diff.color}15`, color: diff.color }}>
            {diff.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ChallengeTimer startTime={startTime} timeLimit={challenge.timeLimit || diff.timeLimit} onExpire={handleSubmit} />
          <span className="text-xs text-[var(--text-muted)]">
            <i className="fa-solid fa-star text-yellow-500 mr-1" />{challenge.xpReward || diff.baseXp} XP
          </span>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden border-b border-[var(--border)] bg-[var(--surface-2)]">
        <button
          type="button"
          onClick={() => setSolveTab('problem')}
          className="flex-1 py-3 text-center text-xs font-bold transition-all border-b-2 cursor-pointer"
          style={{
            borderColor: solveTab === 'problem' ? 'var(--orange)' : 'transparent',
            color: solveTab === 'problem' ? 'var(--orange)' : 'var(--text-muted)'
          }}
        >
          <i className="fa-solid fa-book-open mr-1.5" />
          Problem Description
        </button>
        <button
          type="button"
          onClick={() => setSolveTab('code')}
          className="flex-1 py-3 text-center text-xs font-bold transition-all border-b-2 cursor-pointer"
          style={{
            borderColor: solveTab === 'code' ? 'var(--orange)' : 'transparent',
            color: solveTab === 'code' ? 'var(--orange)' : 'var(--text-muted)'
          }}
        >
          <i className="fa-solid fa-code mr-1.5" />
          Code Workspace
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-148px)] lg:h-[calc(100vh-112px)] overflow-hidden">
        {/* Problem Panel */}
        <div className={`w-full lg:w-1/2 overflow-y-auto border-r border-[var(--border)] bg-[var(--bg)] p-6 ${solveTab === 'problem' ? 'block' : 'hidden lg:block'}`}>
          <div className="max-w-[680px] mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text)] mb-1">{challenge.title}</h1>
              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <span style={{ color: diff.color, fontWeight: 600 }}>{diff.label}</span>
                <span>{challenge.category}</span>
                {challenge.tags?.map(t => <span key={t} className="px-2 py-0.5 bg-[var(--surface)] rounded-md">#{t}</span>)}
              </div>
            </div>

            {challenge.description && (
              <section>
                <h3 className="text-sm font-bold text-[var(--text)] mb-2">Description</h3>
                <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{challenge.description}</div>
              </section>
            )}

            {challenge.constraints && (
              <section>
                <h3 className="text-sm font-bold text-[var(--text)] mb-2">Constraints</h3>
                <pre className="text-sm text-[var(--text-secondary)] bg-[var(--surface)] p-3 rounded-xl font-mono whitespace-pre-wrap">{challenge.constraints}</pre>
              </section>
            )}

            {challenge.inputFormat && (
              <section>
                <h3 className="text-sm font-bold text-[var(--text)] mb-2">Input Format</h3>
                <p className="text-sm text-[var(--text-secondary)]">{challenge.inputFormat}</p>
              </section>
            )}

            {challenge.outputFormat && (
              <section>
                <h3 className="text-sm font-bold text-[var(--text)] mb-2">Output Format</h3>
                <p className="text-sm text-[var(--text-secondary)]">{challenge.outputFormat}</p>
              </section>
            )}

            {challenge.sampleTestCases?.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-[var(--text)] mb-2">Sample Test Cases</h3>
                <div className="space-y-3">
                  {challenge.sampleTestCases.map((tc, i) => (
                    <div key={i} className="rounded-xl border border-[var(--border)] overflow-hidden">
                      <div className="px-3 py-1.5 bg-[var(--surface)] text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--border)]">
                        Sample #{i + 1}
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-[var(--border)]">
                        <div className="p-3">
                          <p className="text-[11px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Input</p>
                          <pre className="text-sm font-mono text-[var(--text)] whitespace-pre-wrap">{tc.input}</pre>
                        </div>
                        <div className="p-3">
                          <p className="text-[11px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Output</p>
                          <pre className="text-sm font-mono text-[var(--text)] whitespace-pre-wrap">{tc.output}</pre>
                        </div>
                      </div>
                      {tc.explanation && (
                        <div className="px-3 py-2 border-t border-[var(--border)] text-xs text-[var(--text-muted)] italic">
                          {tc.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Code Panel */}
        <div className={`w-full lg:w-1/2 flex flex-col min-w-0 ${solveTab === 'code' ? 'flex' : 'hidden lg:flex'}`}>
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center gap-3">
              <LanguageSelector value={language} onChange={handleLanguageChange} />
              <span className="text-xs text-[var(--text-muted)]">
                <i className="fa-regular fa-floppy-disk mr-1" />
                Autosave
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRun}
                disabled={running || submitting}
                className="flex items-center gap-2 px-4 py-1.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface)] disabled:opacity-50 transition-all cursor-pointer"
              >
                {running ? <div className="w-3.5 h-3.5 border-2 border-[var(--text-muted)] border-t-transparent rounded-full animate-spin" />
                  : <i className="fa-solid fa-play" />}
                Run
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || running}
                className="flex items-center gap-2 px-4 py-1.5 bg-[var(--orange)] text-white rounded-lg text-sm font-bold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <i className="fa-solid fa-check" />}
                Submit
              </button>
              <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">Ctrl+Enter</span>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 min-h-0">
            <CodeEditor language={language} value={code} onChange={setCode} />
          </div>

          {/* Output Panel */}
          <div className="h-48 border-t border-[var(--border)] bg-[var(--bg)]">
            <OutputPanel
              results={results}
              runtime={runtime}
              memory={memory}
              compilationError={compilationError}
              loading={running || submitting}
            />
          </div>
        </div>
      </div>

      {/* Result Splash */}
      {showSplash && submissionResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowSplash(false)}>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className={`text-5xl mb-4 ${submissionResult.score?.finalScore >= 700 ? 'text-yellow-500' : 'text-[var(--text-muted)]'}`}>
              {submissionResult.score?.finalScore >= 700 ? '🏆' : submissionResult.score?.finalScore >= 400 ? '⭐' : '💪'}
            </div>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
              {submissionResult.score?.finalScore >= 700 ? 'Excellent!' : submissionResult.score?.finalScore >= 400 ? 'Good Job!' : 'Keep Trying!'}
            </h2>
            <div className="text-4xl font-extrabold text-[var(--orange)] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              {submissionResult.score?.finalScore?.toLocaleString() || 0}
            </div>
            <div className="space-y-2 text-sm text-[var(--text-secondary)] mb-6">
              <div className="flex justify-between"><span>Accuracy (70%)</span><span className="font-bold text-[var(--text)]">{submissionResult.score?.accuracyScore || 0} / 700</span></div>
              <div className="flex justify-between"><span>Speed (30%)</span><span className="font-bold text-[var(--text)]">{submissionResult.score?.speedScore || 0} / 300</span></div>
              {submissionResult.score?.bonusPoints > 0 && <div className="flex justify-between text-green-600"><span>Bonuses</span><span className="font-bold">+{submissionResult.score.bonusPoints}</span></div>}
              {submissionResult.score?.penaltyPoints > 0 && <div className="flex justify-between text-red-500"><span>Penalties</span><span className="font-bold">-{submissionResult.score.penaltyPoints}</span></div>}
              <div className="border-t border-[var(--border)] pt-2 flex justify-between text-base font-bold"><span>Total XP Earned</span><span className="text-[var(--orange)]">+{submissionResult.xpEarned || 0}</span></div>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowSplash(false)} className="px-5 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm font-semibold text-[var(--text)] cursor-pointer">Close</button>
              <Link to="/challenges" className="px-5 py-2 bg-[var(--orange)] text-white rounded-xl text-sm font-bold cursor-pointer inline-flex items-center gap-1">
                <i className="fa-solid fa-arrow-left" /> Back
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
