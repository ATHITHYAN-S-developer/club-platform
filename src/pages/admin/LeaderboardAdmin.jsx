import React, { useState, useEffect } from 'react';
import db from '../../db.js';

export default function LeaderboardAdmin() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [filterQuiz, setFilterQuiz] = useState('all');
  const [sortBy, setSortBy] = useState('score');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await db.find('QuizResults');
      setResults(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleDeleteResult = async (id, userName) => {
    if (!window.confirm(`Delete result for ${userName}?`)) return;
    try {
      await db.delete('QuizResults', id);
      setResults(prev => prev.filter(r => r.id !== id));
      window.showToast('Deleted', `Result for ${userName} removed.`, 'success');
    } catch {
      window.showToast('Error', 'Failed to delete.', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear ALL quiz results? This cannot be undone.')) return;
    setDeleting('all');
    await Promise.allSettled(results.map(r => db.delete('QuizResults', r.id)));
    setDeleting(null);
    setResults([]);
    window.showToast('Cleared', 'All results removed.', 'success');
  };

  const filtered = results.filter(r => filterQuiz === 'all' || r.quizId === filterQuiz);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'score') {
      const aPct = (a.score || 0) / (a.total || 1);
      const bPct = (b.score || 0) / (b.total || 1);
      return bPct - aPct;
    }
    return (a.timeTaken || a.timeSpent || 0) - (b.timeTaken || b.timeSpent || 0);
  }).map((r, i) => ({ ...r, rank: i + 1 }));

  const quizTitles = [...new Set(results.map(r => r.quizId))].map(id => {
    const r = results.find(ri => ri.quizId === id);
    return { id, title: r?.quizTitle || id };
  });

  if (loading) return <div className="loading-dots"><span></span><span></span><span></span></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="page-tag"><i className="fas fa-ranking-star"></i> Leaderboard</span>
          <h1 className="page-title">Results Overview</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select className="form-select" style={{ width: 'auto' }} value={filterQuiz} onChange={e => setFilterQuiz(e.target.value)}>
            <option value="all">All Quizzes</option>
            {quizTitles.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="score">Score %</option>
            <option value="fastest">Fastest</option>
          </select>
          <button className="btn btn-sm btn-outline" style={{ color: '#ef4444' }} onClick={handleClearAll}>
            <i className="fas fa-trash"></i> Clear All
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Quiz</th>
              <th>Score</th>
              <th>Time</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(r => (
              <tr key={r.id}>
                <td>{r.rank}</td>
                <td style={{ fontWeight: 600 }}>{r.userName}</td>
                <td>{r.quizTitle}</td>
                <td>{r.score}/{r.total} ({Math.round((r.score || 0) / (r.total || 1) * 100)}%)</td>
                <td>{r.timeTaken || r.timeSpent || '-'}s</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{r.date ? new Date(r.date).toLocaleDateString() : '-'}</td>
                <td>
                  <button className="btn btn-sm btn-outline" style={{ color: '#ef4444' }} disabled={deleting === r.id} onClick={() => handleDeleteResult(r.id, r.userName)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><i className="fas fa-ranking-star"></i></div>
            <h3>No Results</h3>
            <p>Students haven't taken any quizzes yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
