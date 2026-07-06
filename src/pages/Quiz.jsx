import { useState, useEffect, useRef } from 'react';
import db from '../db';

export default function Quiz({ user }) {
  const [view, setView] = useState('dashboard');
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRankInfo, setMyRankInfo] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [lastScore, setLastScore] = useState({ score: 0, total: 0, timeSpent: 0 });
  const heroRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setHeroVisible(true); obs.disconnect(); }
    }, { threshold: 0.05 });
    if (heroRef.current) obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const allQuizzes = await db.find('Quiz');
      setQuizzes(allQuizzes.filter(q => q.published));
      const allResults = await db.find('QuizResults');
      setResults(allResults);
      if (user) setMyResults(allResults.filter(r => r.userId === user.id));
      const bestMap = {};
      allResults.forEach(r => {
        if (!bestMap[r.userId] || r.timeSpent < bestMap[r.userId].timeSpent) bestMap[r.userId] = r;
      });
      const ranked = Object.values(bestMap).sort((a, b) => a.timeSpent - b.timeSpent).map((r, i) => ({ ...r, rank: i + 1 }));
      setLeaderboard(ranked.slice(0, 10));
      if (user) setMyRankInfo(ranked.find(r => r.userId === user.id) || null);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchDashboardData(); }, [user]);

  const getQuestionTime = (quiz, idx) => {
    const q = quiz.questions[idx];
    return (q && q.timeLimit) ? q.timeLimit : 30;
  };

  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTimeRemaining(getQuestionTime(quiz, 0));
    setTimeSpent(0);
    setView('active');
  };

  useEffect(() => {
    if (view !== 'active' || !currentQuiz || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (currentQuestionIndex < currentQuiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            return getQuestionTime(currentQuiz, currentQuestionIndex + 1);
          } else {
            submitQuiz();
            return 0;
          }
        }
        return prev - 1;
      });
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [view, currentQuiz, currentQuestionIndex]);

  const selectAnswer = (answerIndex) => {
    const updated = [...userAnswers];
    updated[currentQuestionIndex] = answerIndex;
    setUserAnswers(updated);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      const next = currentQuestionIndex + 1;
      setCurrentQuestionIndex(next);
      setTimeRemaining(getQuestionTime(currentQuiz, next));
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prev = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prev);
      setTimeRemaining(getQuestionTime(currentQuiz, prev));
    }
  };

  const submitQuiz = async () => {
    const total = currentQuiz.questions.length;
    let score = 0;
    currentQuiz.questions.forEach((q, i) => { if (userAnswers[i] === q.answerIndex) score++; });
    setLastScore({ score, total, timeSpent });
    setView('result');
    if (user) {
      try {
        await db.insert('QuizResults', {
          userId: user.id, userName: user.name, quizId: currentQuiz.id,
          quizTitle: currentQuiz.title, score, total,
          timeSpent: Math.floor(timeSpent), date: new Date().toISOString(),
        });
        fetchDashboardData();
      } catch { /* ignore */ }
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const reveal = (vis) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'none' : 'translateY(40px)',
    transition: 'opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)',
  });

  if (view === 'dashboard') {
    return (
      <div style={{ background: '#ffffff', color: '#0f1117', minHeight: '100vh', overflowX: 'hidden', position: 'relative', margin: '-2.5rem -3.5rem', padding: 0 }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
          @keyframes marquee-ltr { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .sphere { position: absolute; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #ffaa66 0%, var(--orange) 60%, var(--orange-dark) 100%); box-shadow: inset -12px -12px 30px rgba(0,0,0,0.35), inset 8px 8px 20px rgba(255,255,255,0.25), 0 25px 50px rgba(204,68,0,0.2); z-index: 0; pointer-events: none; }
          .sphere-tr { top: -40px; right: -40px; width: clamp(120px,18vw,260px); height: clamp(120px,18vw,260px); animation: float-tr 12s ease-in-out infinite; }
          .sphere-br { bottom: 60px; right: 3%; width: clamp(80px,10vw,150px); height: clamp(80px,10vw,150px); animation: float-br 10s ease-in-out infinite; animation-delay: 1.5s; }
          .sphere-bl { bottom: -50px; left: -40px; width: clamp(100px,14vw,200px); height: clamp(100px,14vw,200px); animation: float-bl 11s ease-in-out infinite; animation-delay: 3s; }
          @keyframes float-tr { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-10px,15px) rotate(3deg); } }
          @keyframes float-br { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-15px,-10px) rotate(-3deg); } }
          @keyframes float-bl { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(15px,-15px) rotate(2deg); } }
          .rs-hero-section { position: relative; min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 7rem 3.5rem 4rem 3.5rem; overflow: hidden; background: #ffffff; }
          .shard-tl { position: absolute; top: 0; left: 0; width: 320px; height: 320px; background: linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%); clip-path: polygon(0 0, 100% 0, 0 100%); z-index: 0; }
          .shard-br { position: absolute; bottom: 0; right: 0; width: 450px; height: 450px; background: linear-gradient(315deg, var(--orange) 0%, var(--orange-light) 100%); clip-path: polygon(100% 100%, 100% 0, 0 100%); z-index: 0; }
          .rs-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 1.5rem; transition: all 0.35s cubic-bezier(0.16,1,0.3,1); box-shadow: 0 4px 16px rgba(0,0,0,0.04); height: 100%; position: relative; overflow: hidden; }
          .rs-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, var(--orange), var(--orange-light)); transform: scaleX(0); transform-origin: left; transition: transform 0.35s ease; }
          .rs-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(255,85,0,0.1); border-color: rgba(255,85,0,0.15); }
          .rs-card:hover::before { transform: scaleX(1); }
          .rs-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem; padding: 0.5rem 1.1rem; border-radius: 10px; font-size: 0.82rem; font-weight: 600; transition: all 0.2s ease; cursor: pointer; text-decoration: none; border: none; }
          .rs-btn-primary { background: var(--orange); color: #ffffff; box-shadow: 0 4px 12px rgba(255,85,0,0.3); }
          .rs-btn-primary:hover { background: var(--orange-dark); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,85,0,0.4); }
          .rs-btn-outline { background: transparent; color: #0f1117; border: 1px solid #e5e7eb; }
          .rs-btn-outline:hover { background: #f9fafb; border-color: var(--orange); color: var(--orange); }
          .rs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; margin-top: 1.25rem; }
          @media (max-width: 900px) { .rs-hero-section { padding: 6rem 1.5rem 3rem 1.5rem !important; } }
          @media (max-width: 600px) { .rs-hero-section { padding: 5rem 1.2rem 2.5rem 1.2rem !important; min-height: auto !important; } .shard-tl { width: 180px !important; height: 180px !important; } .shard-br { width: 220px !important; height: 220px !important; } .rs-grid { grid-template-columns: 1fr; } }
        `}</style>

        <section className="rs-hero-section">
          <div className="shard-tl" /><div className="shard-br" />
          <div className="sphere sphere-tr" /><div className="sphere sphere-br" /><div className="sphere sphere-bl" />
          <div ref={heroRef} style={{ maxWidth: '1000px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1, ...reveal(heroVisible) }}>
            <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.4rem', color: 'var(--orange)', margin: '0 0 0.2rem 0', lineHeight: 1.1, textShadow: '0 0 15px rgba(255,85,0,0.15)' }}>Test Your Knowledge</p>
            <h1 style={{ fontSize: 'clamp(2.2rem,5vw,4rem)', fontFamily: 'var(--font-display)', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.02em', margin: '0 0 0.8rem 0', lineHeight: 1.05, color: '#0f1117' }}>Weekly Quiz</h1>
            <p style={{ fontSize: '1.02rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '640px', margin: '0 auto 1.75rem' }}>Test your knowledge across JavaScript, CSS, Python, and AI concepts in timed weekly challenges.</p>
          </div>
        </section>

        <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem 4rem', position: 'relative', zIndex: 2 }}>
          {/* Available Quizzes */}
          {quizzes.length > 0 && (
            <div style={{ marginTop: '3rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f1117', fontFamily: 'var(--font-display)' }}>Available Quizzes</h3>
              <div className="rs-grid">
                {quizzes.map(q => (
                  <div key={q.id} className="rs-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,85,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fa-solid fa-question" style={{ color: 'var(--orange)', fontSize: '0.82rem' }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f1117' }}>{q.title}</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '0.75rem', lineHeight: 1.5 }}>{q.description || 'No description'}</p>
                    </div>
                    <div>
                      <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
                        <span><i className="fa-solid fa-list-ol" style={{ marginRight: '0.25rem' }} />{(q.questions || []).length} questions</span>
                        <span><i className="fa-solid fa-clock" style={{ marginRight: '0.25rem' }} />{(q.questions || [])[0]?.timeLimit || 30}s each</span>
                      </div>
                      <button className="rs-btn rs-btn-primary" onClick={() => startQuiz(q)} style={{ width: '100%', justifyContent: 'center' }}>
                        <i className="fa-solid fa-play" /> Start Quiz
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {myResults.length > 0 && (
            <div style={{ marginTop: '3rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f1117', fontFamily: 'var(--font-display)' }}>Your Results</h3>
              <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                {myResults.map(r => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', borderBottom: '1px solid #e5e7eb' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f1117' }}>{r.quizTitle}</span>
                      <span style={{ fontSize: '0.72rem', color: '#9ca3af', marginLeft: '0.5rem' }}>{new Date(r.date).toLocaleDateString()}</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: r.score === r.total ? '#16a34a' : 'var(--orange)' }}>{r.score}/{r.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div style={{ marginTop: '3rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f1117', fontFamily: 'var(--font-display)' }}>
                <i className="fa-solid fa-ranking-star" style={{ color: 'var(--orange)', marginRight: '0.4rem' }} />Leaderboard
              </h3>
              <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                        <th style={{ padding: '0.7rem 1rem', textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', width: 50 }}>#</th>
                        <th style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Name</th>
                        <th style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quiz</th>
                        <th style={{ padding: '0.7rem 1rem', textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Score</th>
                        <th style={{ padding: '0.7rem 1rem', textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map(r => {
                        const isMe = user && r.userId === user.id;
                        return (
                          <tr key={r.userId} style={{ borderBottom: '1px solid #f3f4f6', background: isMe ? 'rgba(255,85,0,0.04)' : 'transparent' }}>
                            <td style={{ padding: '0.7rem 1rem', textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: 30, height: 30, borderRadius: '50%',
                                background: r.rank <= 3 ? 'var(--orange)' : '#f3f4f6',
                                color: r.rank <= 3 ? '#fff' : '#6b7280',
                                fontWeight: 800, fontSize: '0.8rem'
                              }}>
                                {r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : r.rank}
                              </span>
                            </td>
                            <td style={{ padding: '0.7rem 1rem', fontWeight: 600, fontSize: '0.85rem', color: isMe ? 'var(--orange)' : '#0f1117' }}>
                              {r.userName} {isMe && <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--orange)', marginLeft: '0.3rem' }}>(You)</span>}
                            </td>
                            <td style={{ padding: '0.7rem 1rem', fontSize: '0.8rem', color: '#6b7280' }}>{r.quizTitle}</td>
                            <td style={{ padding: '0.7rem 1rem', textAlign: 'center' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: r.score === r.total ? '#16a34a' : '#0f1117' }}>
                                {r.score}/{r.total}
                              </span>
                            </td>
                            <td style={{ padding: '0.7rem 1rem', textAlign: 'center', fontSize: '0.82rem', color: '#6b7280', fontWeight: 600 }}>
                              {formatTime(r.timeSpent)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              {myRankInfo && myRankInfo.rank > 10 && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,85,0,0.04)', border: '1px solid rgba(255,85,0,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <i className="fa-solid fa-location-dot" style={{ color: 'var(--orange)' }} />
                  <span style={{ fontSize: '0.85rem', color: '#0f1117' }}>
                    Your rank: <strong style={{ color: 'var(--orange)' }}>#{myRankInfo.rank}</strong> — {myRankInfo.userName} · {myRankInfo.score}/{myRankInfo.total} · {formatTime(myRankInfo.timeSpent)}
                  </span>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    );
  }

  if (view === 'active' && currentQuiz) {
    const question = currentQuiz.questions[currentQuestionIndex];
    return (
      <div style={{ background: '#ffffff', color: '#0f1117', minHeight: '100vh', overflowX: 'hidden', position: 'relative', margin: '-2.5rem -3.5rem', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`
          .q-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 16px rgba(0,0,0,0.04); margin-bottom: 1.5rem; }
          .q-opt { text-align: left; padding: 0.85rem 1rem; border-radius: 10px; cursor: pointer; font-weight: 500; font-size: 0.9rem; transition: all 0.2s ease; border: 1px solid #e5e7eb; background: #f8f9fa; color: #0f1117; width: 100%; }
          .q-opt:hover { border-color: var(--orange); background: rgba(255,85,0,0.04); }
          .q-opt.selected { background: rgba(255,85,0,0.1); border-color: var(--orange); color: var(--orange); }
          .q-dot { width: 8px; height: 8px; border-radius: 50%; background: #e5e7eb; transition: background 0.2s ease; }
          .q-dot.active { background: var(--orange); }
          .q-dot.answered { background: rgba(255,85,0,0.3); }
          @media (max-width: 600px) { .q-inner { padding: 1rem !important; } }
        `}</style>
        <div style={{ width: '100%', maxWidth: 720, margin: '0 auto', padding: '2rem' }} className="q-inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--orange)' }}>{currentQuiz.title}</span>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '0.75rem' }}>Question {currentQuestionIndex + 1}/{currentQuiz.questions.length}</span>
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: timeRemaining < 60 ? '#dc2626' : 'var(--orange)', fontFamily: 'var(--font-display)' }}>
              ⏱ {formatTime(timeRemaining)}
            </div>
          </div>

          <div className="q-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f1117', marginBottom: '1.5rem', lineHeight: 1.5 }}>{question.question}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {question.options.map((opt, j) => (
                <button key={j} className={`q-opt ${userAnswers[currentQuestionIndex] === j ? 'selected' : ''}`} onClick={() => selectAnswer(j)}>
                  <span style={{ fontWeight: 700, marginRight: '0.75rem', color: userAnswers[currentQuestionIndex] === j ? 'var(--orange)' : '#9ca3af' }}>{String.fromCharCode(65 + j)}</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="rs-btn rs-btn-outline" onClick={prevQuestion} disabled={currentQuestionIndex === 0} style={{ opacity: currentQuestionIndex === 0 ? 0.4 : 1 }}>← Previous</button>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {currentQuiz.questions.map((_, j) => (
                <div key={j} className={`q-dot ${j === currentQuestionIndex ? 'active' : ''} ${userAnswers[j] !== undefined ? 'answered' : ''}`} />
              ))}
            </div>
            {currentQuestionIndex < currentQuiz.questions.length - 1 ? (
              <button className="rs-btn rs-btn-primary" onClick={nextQuestion}>Next →</button>
            ) : (
              <button className="rs-btn rs-btn-primary" onClick={submitQuiz} style={{ background: '#16a34a', borderColor: '#16a34a' }}>Submit Quiz</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'result') {
    const percentage = Math.round((lastScore.score / lastScore.total) * 100);
    return (
      <div style={{ background: '#ffffff', color: '#0f1117', minHeight: '100vh', overflowX: 'hidden', position: 'relative', margin: '-2.5rem -3.5rem', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`
          .r-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 3rem 2rem; box-shadow: 0 4px 16px rgba(0,0,0,0.04); text-align: center; max-width: 520px; width: 100%; }
        `}</style>
        <div className="r-card" style={{ margin: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{percentage >= 80 ? '🏆' : percentage >= 50 ? '👍' : '💪'}</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: '#0f1117', marginBottom: '0.5rem' }}>Quiz Complete!</h2>
          <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: percentage >= 80 ? '#16a34a' : 'var(--orange)', marginBottom: '0.5rem' }}>
            {lastScore.score}/{lastScore.total}
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.25rem' }}>You scored {percentage}%</p>
          <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Time taken: {formatTime(lastScore.timeSpent)}</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button className="rs-btn rs-btn-primary" onClick={() => setView('dashboard')}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
