import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import db from '../../db.js';

export default function QuizDashboard({ user, onStartQuiz }) {
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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

  if (loading) {
    return (
      <div className="page-header">
        <div className="loading-dots"><span></span><span></span><span></span></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header">
        <span className="page-tag"><i className="fas fa-brain"></i> Assessments</span>
        <h1 className="page-title">Available Quizzes</h1>
        <p className="page-subtitle">Test your knowledge across various topics. Select a quiz to begin.</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><i className="fas fa-question-circle"></i></div>
          <h3>No Quizzes Available</h3>
          <p>Check back later for new quizzes.</p>
        </div>
      ) : (
        <div className="grid-auto">
          {quizzes.map((quiz, i) => {
            const status = getQuizStatus(quiz);
            const attemptsLeft = hasAttemptsLeft(quiz);
            return (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card quiz-card"
              >
                <div className="card-body">
                  <div className="quiz-card-header">
                    <span className={`badge ${status.cls}`}>{status.label}</span>
                    {quiz.difficulty && (
                      <span className={`badge ${quiz.difficulty === 'hard' ? 'badge-red' : quiz.difficulty === 'medium' ? 'badge-orange' : 'badge-green'}`}>
                        {quiz.difficulty}
                      </span>
                    )}
                  </div>
                  <h3 className="quiz-card-title">{quiz.title}</h3>
                  <p className="quiz-card-desc">{quiz.description}</p>
                  <div className="quiz-card-meta">
                    <span><i className="fas fa-list-ol"></i> {quiz.questions?.length || 0} questions</span>
                    <span><i className="fas fa-clock"></i> {quiz.timeLimit} min</span>
                    <span><i className="fas fa-star"></i> {quiz.totalMarks || quiz.questions?.length || 0} marks</span>
                    {quiz.passMarks > 0 && <span><i className="fas fa-check-circle"></i> Pass: {quiz.passMarks}</span>}
                  </div>
                  <div className="quiz-card-footer">
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
      )}

      {results.length > 0 && (
        <div style={{ marginTop: '2.5rem' }}>
          <h2 className="page-title" style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Your Results</h2>
          <div style={{ overflowX: 'auto' }}>
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
        </div>
      )}
    </motion.div>
  );
}
