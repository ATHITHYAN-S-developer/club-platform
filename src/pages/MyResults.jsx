import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getUserResults } from '../services/resultService';

export default function MyResults({ user }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserResults(user.id)
      .then(setResults)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const stats = useMemo(() => {
    if (results.length === 0) return null;
    const total = results.length;
    const avgPct = results.reduce((s, r) => s + ((r.score || 0) / (r.total || 1) * 100), 0) / total;
    const passed = results.filter(r => r.pass === true).length;
    const best = results.reduce((a, b) => ((b.score || 0) / (b.total || 1)) > ((a.score || 0) / (a.total || 1)) ? b : a, results[0]);
    return { total, avgPct: Math.round(avgPct), passed, failed: total - passed, bestPct: Math.round((best.score || 0) / (best.total || 1) * 100), bestTitle: best.quizTitle };
  }, [results]);

  if (!user) {
    return (
      <div className="main-content">
        <div className="empty-state" style={{ marginTop: '3rem' }}>
          <div className="empty-state-icon"><i className="fas fa-sign-in-alt"></i></div>
          <h3>Sign in Required</h3>
          <p>Log in to see your quiz results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="page-header">
          <span className="page-tag"><i className="fas fa-chart-line"></i> My Results</span>
          <h1 className="page-title">Your Performance</h1>
          <p className="page-subtitle">Track your quiz history, scores, and progress over time.</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div className="loading-dots"><span></span><span></span><span></span></div>
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <div className="empty-state-icon"><i className="fas fa-clipboard-list"></i></div>
            <h3>No Results Yet</h3>
            <p>Complete a quiz to see your results here.</p>
          </div>
        ) : (
          <>
            {stats && (
              <div className="lb-stats" style={{ marginBottom: '1.5rem' }}>
                <div className="lb-stat-card">
                  <div className="lb-stat-value">{stats.total}</div>
                  <div className="lb-stat-label">Quizzes Taken</div>
                </div>
                <div className="lb-stat-card">
                  <div className="lb-stat-value">{stats.avgPct}%</div>
                  <div className="lb-stat-label">Avg Score</div>
                </div>
                <div className="lb-stat-card">
                  <div className="lb-stat-value">{stats.passed}</div>
                  <div className="lb-stat-label">Passed</div>
                </div>
                <div className="lb-stat-card">
                  <div className="lb-stat-value">{stats.failed}</div>
                  <div className="lb-stat-label">Failed</div>
                </div>
                <div className="lb-stat-card">
                  <div className="lb-stat-value" style={{ fontSize: '1rem' }}>{stats.bestTitle}</div>
                  <div className="lb-stat-label">Best: {stats.bestPct}%</div>
                </div>
              </div>
            )}

            <div style={{ overflowX: 'auto', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <table>
                <thead>
                  <tr>
                    <th>Quiz</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Time</th>
                    <th>Badges</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => {
                    const badge = r.badge;
                    return (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600 }}>{r.quizTitle}</td>
                        <td>{r.score}/{r.total}</td>
                        <td>
                          <span className={`badge ${((r.score || 0) / (r.total || 1) * 100) >= 60 ? 'badge-green' : 'badge-red'}`}>
                            {Math.round((r.score || 0) / (r.total || 1) * 100)}%
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {r.timeTaken || '-'}s
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {badge ? (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                padding: '0.2rem 0.55rem', borderRadius: 6,
                                background: `${badge.color || '#ff5500'}15`, fontSize: '0.75rem',
                                fontWeight: 600, color: badge.color || '#ff5500',
                              }}>
                                <i className={`fas ${badge.icon || 'fa-medal'}`} />
                                {badge.name}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${r.status === 'completed' ? 'badge-green' : r.status === 'auto-submitted' || r.status === 'expired' ? 'badge-red' : 'badge-orange'}`}>
                            {r.status || 'Completed'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                          {r.date ? new Date(r.date).toLocaleDateString() : r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
