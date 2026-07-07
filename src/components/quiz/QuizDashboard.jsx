import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import db from '../../db.js';
import { getUserBestRank } from '../../services/leaderboardService';

export default function QuizDashboard({ user, onStartQuiz }) {
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroVisible, setHeroVisible] = useState(false);
  const [userBestRank, setUserBestRank] = useState(null);
  const heroRef = useRef(null);

  useEffect(() => {
    loadData();
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setHeroVisible(true); obs.disconnect(); }
    }, { threshold: 0.05 });
    if (heroRef.current) obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    getUserBestRank(user.id).then(best => {
      if (best) setUserBestRank(best);
    }).catch(() => {});
  }, [user?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [qData, rData] = await Promise.all([
        db.find('Quiz'),
        db.find('QuizResults'),
      ]);
      const published = qData.filter(q => q.published && !q.archived);
      setQuizzes(published);
      setResults(rData.filter(r => r.userId === user?.id));
    } catch (e) {
      console.error('Failed to load quizzes:', e);
    }
    setLoading(false);
  };

  const getQuizStatus = (quiz) => {
    const userResults = results.filter(r => r.quizId === quiz.id);
    if (userResults.length === 0) return { label: 'Not Started', cls: 'badge-muted' };
    const latest = userResults.reduce((a, b) => new Date(a.date || a.submittedAt) > new Date(b.date || b.submittedAt) ? a : b);
    if (latest.status === 'auto-submitted' || latest.status === 'expired') return { label: latest.status === 'auto-submitted' ? 'Auto Submitted' : 'Expired', cls: 'badge-red' };
    if (latest.status === 'in-progress') return { label: 'In Progress', cls: 'badge-orange' };
    return { label: 'Completed', cls: 'badge-green' };
  };

  const hasAttemptsLeft = (quiz) => {
    if (!quiz.maxAttempts || quiz.maxAttempts <= 0) return true;
    const count = results.filter(r => r.quizId === quiz.id).length;
    return count < quiz.maxAttempts;
  };

  const scrollToCards = () => {
    const el = document.getElementById('quiz-cards-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const reveal = (vis) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'none' : 'translateY(40px)',
    transition: 'opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)',
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

        .quiz-hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          overflow: hidden;
          background: #ffffff;
        }
        .quiz-shard-tl {
          position: absolute; top: 0; left: 0;
          width: 320px; height: 320px;
          background: linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%);
          clip-path: polygon(0 0, 100% 0, 0 100%);
          z-index: 0;
        }
        .quiz-shard-br {
          position: absolute; bottom: 0; right: 0;
          width: 450px; height: 450px;
          background: linear-gradient(315deg, var(--orange) 0%, var(--orange-light) 100%);
          clip-path: polygon(100% 100%, 100% 0, 0 100%);
          z-index: 0;
        }
        .quiz-sphere {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #ffaa66 0%, var(--orange) 60%, var(--orange-dark) 100%);
          box-shadow: inset -12px -12px 30px rgba(0,0,0,0.35),
                      inset 8px 8px 20px rgba(255,255,255,0.25),
                      0 25px 50px rgba(204,68,0,0.2);
          z-index: 0;
          pointer-events: none;
        }
        .quiz-sphere-tr {
          top: -40px; right: -40px;
          width: clamp(120px, 18vw, 260px);
          height: clamp(120px, 18vw, 260px);
          animation: quiz-float-tr 12s ease-in-out infinite;
        }
        .quiz-sphere-br {
          bottom: 60px; right: 3%;
          width: clamp(80px, 10vw, 150px);
          height: clamp(80px, 10vw, 150px);
          animation: quiz-float-br 10s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        .quiz-sphere-bl {
          bottom: -50px; left: -40px;
          width: clamp(100px, 14vw, 200px);
          height: clamp(100px, 14vw, 200px);
          animation: quiz-float-bl 11s ease-in-out infinite;
          animation-delay: 3s;
        }
        @keyframes quiz-float-tr {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          50% { transform: translate(-10px,15px) rotate(3deg); }
        }
        @keyframes quiz-float-br {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          50% { transform: translate(-15px,-10px) rotate(-3deg); }
        }
        @keyframes quiz-float-bl {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          50% { transform: translate(15px,-15px) rotate(2deg); }
        }

        .quiz-split-container {
          max-width: 1200px; width: 100%;
          display: flex; flex-direction: row;
          align-items: center; justify-content: space-between;
          gap: 3rem; position: relative; z-index: 1;
        }
        .quiz-logo-col {
          flex: 1; display: flex;
          align-items: center; justify-content: center;
          position: relative;
        }
        .quiz-logo-circle {
          border-radius: 50%; width: 360px; height: 360px;
          display: flex; align-items: center; justify-content: center;
          padding-top: 20px; box-sizing: border-box;
          background: #000;
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
          position: relative; z-index: 1;
        }
        .quiz-logo-img {
          width: 280px; height: 280px; object-fit: contain;
        }
        .quiz-text-col {
          flex: 1.1; text-align: left;
          display: flex; flex-direction: column;
          align-items: flex-start;
        }
        .quiz-cursive-tag {
          font-family: 'Dancing Script', cursive;
          font-size: 2.8rem;
          color: var(--orange);
          margin: 0 0 0.2rem;
          line-height: 1.1;
          text-shadow: 0 0 15px rgba(255,85,0,0.15);
        }
        .quiz-hero-title {
          font-size: clamp(2.4rem, 5.2vw, 4.5rem);
          font-family: var(--font-display);
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          margin: 0 0 0.8rem;
          line-height: 1.05;
          color: #0f1117;
        }
        .quiz-hero-sub {
          font-size: 1.02rem;
          color: var(--text-secondary);
          line-height: 1.8;
          margin: 0 0 1.75rem;
          max-width: 540px;
        }
        .quiz-hero-buttons {
          display: flex; gap: 1rem; flex-wrap: wrap;
        }

        .quiz-cards-section {
          max-width: 1200px; margin: 0 auto;
          padding: 3rem 1.5rem 4rem;
        }
        .quiz-cards-section h2 {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          margin: 0 0 0.25rem;
          color: #0f1117;
        }
        .quiz-cards-section p {
          font-size: 0.94rem;
          color: var(--text-secondary);
          margin: 0 0 1.5rem;
          max-width: 540px;
        }
        .quiz-dash-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }
        .quiz-dash-card {
          background: #fff;
          border: 1px solid var(--border-light);
          border-radius: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
          position: relative;
        }
        .quiz-dash-card::before {
          content: '';
          position: absolute; top: -10px; left: 50%;
          transform: translateX(-50%);
          width: 60px; height: 20px;
          background: rgba(255,85,0,0.12);
          backdrop-filter: blur(2px);
          border: 1px dashed rgba(255,85,0,0.2);
          border-radius: 0 0 4px 4px;
          z-index: 1;
        }
        .quiz-dash-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.08);
          border-color: rgba(255,85,0,0.15);
        }
        .quiz-dash-card-body {
          padding: 1.5rem 1.25rem 1.25rem;
          display: flex; flex-direction: column; gap: 0.5rem;
        }
        .quiz-dash-card-header {
          display: flex; gap: 0.4rem; flex-wrap: wrap;
        }
        .quiz-dash-card-title {
          font-size: 1.05rem; font-weight: 700; margin: 0;
          line-height: 1.35; color: #0f1117;
        }
        .quiz-dash-card-desc {
          font-size: 0.82rem; color: var(--text-secondary);
          line-height: 1.5; margin: 0;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .quiz-dash-card-meta {
          display: flex; flex-wrap: wrap; gap: 0.5rem 1rem;
          margin-top: 0.25rem;
        }
        .quiz-dash-card-meta span {
          font-size: 0.78rem; color: var(--text-muted);
          display: flex; align-items: center; gap: 0.35rem;
        }
        .quiz-dash-card-footer {
          display: flex; justify-content: space-between;
          align-items: center; padding-top: 0.75rem;
          border-top: 1px solid var(--border-light); margin-top: auto;
        }

        .quiz-slider-dots {
          position: absolute; bottom: 2.5rem; left: 3.5rem;
          display: flex; gap: 0.6rem; z-index: 10;
        }
        .quiz-slider-dots span {
          width: 8px; height: 8px; border-radius: 50%;
        }
        .quiz-slider-dots .active { background: var(--orange); }
        .quiz-slider-dots .inactive { background: rgba(15,17,23,0.3); }

        .quiz-social-links {
          position: absolute; bottom: 2.5rem; right: 3.5rem;
          display: flex; gap: 1.25rem; z-index: 10; font-size: 0.95rem;
        }
        .quiz-social-links a {
          color: #fff; transition: color 0.2s;
        }
        .quiz-social-links a:hover { color: #0f1117; }

        .quiz-results-section {
          max-width: 1200px; margin: 0 auto;
          padding: 0 1.5rem 4rem;
        }

        @media (max-width: 900px) {
          .quiz-split-container { flex-direction: column !important; text-align: center !important; gap: 2.5rem !important; }
          .quiz-split-container > div { align-items: center !important; text-align: center !important; }
          .quiz-text-col { align-items: center !important; text-align: center !important; }
          .quiz-hero-buttons { justify-content: center !important; }
          .quiz-hero-sub { max-width: 100% !important; }
        }
        @media (max-width: 768px) {
          .quiz-hero-section { padding: 0 !important; }
          .quiz-shard-tl { width: 220px !important; height: 220px !important; }
          .quiz-shard-br { width: 300px !important; height: 300px !important; }
          .quiz-logo-circle { width: 300px !important; height: 300px !important; }
          .quiz-logo-img { width: 220px !important; height: 220px !important; }
          .quiz-cursive-tag { font-size: 2.4rem !important; }
          .quiz-dash-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)) !important; gap: 1rem !important; }
          .quiz-slider-dots { bottom: 1.5rem !important; left: 2rem !important; }
          .quiz-social-links { bottom: 1.5rem !important; right: 2rem !important; }
        }
        @media (max-width: 600px) {
          .quiz-hero-section { padding: 0 !important; min-height: auto !important; }
          .quiz-shard-tl { width: 180px !important; height: 180px !important; }
          .quiz-shard-br { width: 220px !important; height: 220px !important; }
          .quiz-logo-circle { width: 260px !important; height: 260px !important; }
          .quiz-logo-img { width: 190px !important; height: 190px !important; }
          .quiz-cursive-tag { font-size: 2rem !important; }
          .quiz-dash-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
          .quiz-cards-section { padding: 2rem 1rem 3rem !important; }
          .quiz-slider-dots { display: none !important; }
          .quiz-social-links { display: none !important; }
        }
        @media (max-width: 480px) {
          .quiz-hero-section { padding: 0 !important; }
          .quiz-shard-tl { width: 130px !important; height: 130px !important; }
          .quiz-shard-br { width: 160px !important; height: 160px !important; }
          .quiz-sphere-tr { display: none !important; }
          .quiz-sphere-br { display: none !important; }
          .quiz-sphere-bl { display: none !important; }
          .quiz-logo-circle { width: 200px !important; height: 200px !important; }
          .quiz-logo-img { width: 145px !important; height: 145px !important; }
          .quiz-cursive-tag { font-size: 1.6rem !important; }
          .quiz-hero-title { font-size: clamp(1.6rem, 6vw, 2.4rem) !important; }
          .quiz-hero-sub { font-size: 0.9rem !important; }
          .quiz-hero-buttons { gap: 0.6rem !important; flex-direction: column !important; }
          .quiz-cards-section h2 { font-size: 1.4rem !important; }
          .quiz-cards-section p { font-size: 0.85rem !important; }
          .quiz-dash-grid { grid-template-columns: 1fr !important; gap: 0.85rem !important; }
          .quiz-cards-section { padding: 1.5rem 0.75rem 2rem !important; }
          .quiz-results-section { padding: 0 0.75rem 2rem !important; }
          .quiz-results-section h2 { font-size: 1.1rem !important; }
        }
        @media (max-width: 360px) {
          .quiz-hero-section { padding: 0 !important; }
          .quiz-shard-tl { width: 100px !important; height: 100px !important; }
          .quiz-shard-br { width: 120px !important; height: 120px !important; }
          .quiz-logo-circle { width: 160px !important; height: 160px !important; }
          .quiz-logo-img { width: 115px !important; height: 115px !important; }
          .quiz-cursive-tag { font-size: 1.3rem !important; }
          .quiz-hero-title { font-size: clamp(1.2rem, 5vw, 1.6rem) !important; }
          .quiz-hero-sub { font-size: 0.8rem !important; }
          .quiz-cards-section h2 { font-size: 1.15rem !important; }
          .quiz-dash-card-body { padding: 1rem 0.85rem 0.85rem !important; gap: 0.35rem !important; }
          .quiz-dash-card-title { font-size: 0.9rem !important; }
          .quiz-dash-card-desc { font-size: 0.75rem !important; }
          .quiz-dash-card-meta span { font-size: 0.72rem !important; }
        }
      `}</style>

      {/* ── HERO SECTION (exact home page layout) ── */}
      <section className="quiz-hero-section">
        <div className="quiz-shard-tl" />
        <div className="quiz-shard-br" />
        <div className="quiz-sphere quiz-sphere-tr" />
        <div className="quiz-sphere quiz-sphere-br" />
        <div className="quiz-sphere quiz-sphere-bl" />

        <div ref={heroRef} className="quiz-split-container" style={reveal(heroVisible)}>
          {/* LEFT: Logo */}
          <div className="quiz-logo-col">
            <div className="quiz-logo-circle">
              <img src="/logo.png" alt="Mindcraft AI Logo" className="quiz-logo-img" />
            </div>
          </div>

          {/* RIGHT: Text */}
          <div className="quiz-text-col">
            <p className="quiz-cursive-tag">Challenge Yourself</p>
            <h1 className="quiz-hero-title">Available Quizzes</h1>
            <p className="quiz-hero-sub">
              Test your knowledge across AI, programming, and more. Each quiz challenges you with timed questions, multiple question types, and real-time performance tracking.
            </p>
            <div className="quiz-hero-buttons">
              <button className="btn btn-primary" style={{ borderRadius: 12, padding: '0.8rem 2.2rem', fontSize: '0.95rem' }} onClick={scrollToCards}>
                Browse Quizzes <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.45rem' }} />
              </button>
              <button className="btn btn-secondary" style={{ borderRadius: 12, padding: '0.8rem 2.2rem', fontSize: '0.95rem', color: 'var(--text)', border: '1px solid var(--border)' }} onClick={() => window.location.href = '/leaderboard'}>
                View Leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* Slider dots */}
        <div className="quiz-slider-dots">
          <span className="active" />
          <span className="inactive" />
          <span className="inactive" />
        </div>

        {/* Social links */}
        <div className="quiz-social-links">
          <a href="https://www.linkedin.com/company/mindcraft-ai-vcet" target="_blank" rel="noopener noreferrer" onMouseEnter={e => e.currentTarget.style.color = '#0f1117'} onMouseLeave={e => e.currentTarget.style.color = '#fff'}>
            <i className="fa-brands fa-linkedin" />
          </a>
          <a href="https://www.instagram.com/clubmindcraftai?igsh=cGl4ZTA4aXNnZXk2" target="_blank" rel="noopener noreferrer" onMouseEnter={e => e.currentTarget.style.color = '#0f1117'} onMouseLeave={e => e.currentTarget.style.color = '#fff'}>
            <i className="fa-brands fa-instagram" />
          </a>
        </div>
      </section>

      {/* ── QUIZ CARDS ── */}
      <section id="quiz-cards-section" className="quiz-cards-section">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div className="loading-dots"><span></span><span></span><span></span></div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '1rem' }}>
            <div className="empty-state-icon"><i className="fas fa-question-circle"></i></div>
            <h3>No Quizzes Available</h3>
            <p>Check back later for new quizzes.</p>
          </div>
        ) : (
          <>
            <h2>Quiz Library</h2>
            <p>Select a quiz below to put your skills to the test.</p>
            <div className="quiz-dash-grid">
              {quizzes.map((quiz, i) => {
                const status = getQuizStatus(quiz);
                const attemptsLeft = hasAttemptsLeft(quiz);
                return (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.35, ease: [0.16,1,0.3,1] }}
                    className="quiz-dash-card"
                  >
                    <div className="quiz-dash-card-body">
                      <div className="quiz-dash-card-header">
                        <span className={`badge ${status.cls}`}>{status.label}</span>
                        {quiz.difficulty && (
                          <span className={`badge ${quiz.difficulty === 'hard' ? 'badge-red' : quiz.difficulty === 'medium' ? 'badge-orange' : 'badge-green'}`}>
                            {quiz.difficulty}
                          </span>
                        )}
                      </div>
                      <h3 className="quiz-dash-card-title">{quiz.title}</h3>
                      <p className="quiz-dash-card-desc">{quiz.description}</p>
                      <div className="quiz-dash-card-meta">
                        <span><i className="fas fa-list-ol"></i> {quiz.questions?.length || 0} questions</span>
                        <span><i className="fas fa-clock"></i> {quiz.timeLimit} min</span>
                        <span><i className="fas fa-star"></i> {quiz.totalMarks || quiz.questions?.length || 0} marks</span>
                        {quiz.passMarks > 0 && <span><i className="fas fa-check-circle"></i> Pass: {quiz.passMarks}</span>}
                      </div>
                      <div className="quiz-dash-card-footer">
                        {quiz.category && <span className="badge badge-orange"><i className="fas fa-tag"></i> {quiz.category}</span>}
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onStartQuiz(quiz)}
                          disabled={!attemptsLeft}
                        >
                          {attemptsLeft ? <><i className="fas fa-play"></i> Start</> : 'Max Attempts Reached'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* ── RESULTS ── */}
      {results.length > 0 && (
        <section className="quiz-results-section">
          {userBestRank && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.7rem 1rem', marginBottom: '1rem',
              background: 'rgba(255,85,0,0.06)', borderRadius: 12,
              border: '1px solid rgba(255,85,0,0.2)',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(255,85,0,0.12)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="fas fa-trophy" style={{ color: 'var(--orange)', fontSize: '1.1rem' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>Your Best Rank</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--orange)' }}>
                  #{userBestRank.rank} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>in {userBestRank.quizTitle}</span>
                </div>
              </div>
              {userBestRank.badge && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.25rem 0.5rem', borderRadius: 8,
                  background: `${userBestRank.badge.color}15`,
                }}>
                  <i className={`fas ${userBestRank.badge.icon || 'fa-medal'}`} style={{ color: userBestRank.badge.color, fontSize: '0.8rem' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: userBestRank.badge.color }}>{userBestRank.badge.name}</span>
                </div>
              )}
            </div>
          )}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', marginBottom: '1rem', color: '#0f1117' }}>Your Results</h2>
          <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid var(--border-light)', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <table>
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.slice().reverse().map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.quizTitle}</td>
                    <td>{r.score}/{r.total}</td>
                    <td>
                      <span className={`badge ${(r.score / r.total * 100) >= 60 ? 'badge-green' : 'badge-red'}`}>
                        {Math.round(r.score / r.total * 100)}%
                      </span>
                    </td>
                    <td>{r.timeSpent || r.timeTaken || '-'}s</td>
                    <td><span className={`badge ${r.status === 'completed' ? 'badge-green' : r.status === 'auto-submitted' ? 'badge-red' : r.status === 'expired' ? 'badge-red' : 'badge-orange'}`}>{r.status || 'Completed'}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{r.date ? new Date(r.date).toLocaleDateString() : (r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '-')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </motion.div>
  );
}
