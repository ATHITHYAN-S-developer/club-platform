import React, { useState, useEffect } from 'react';
import { subscribeEntries, deleteEntry, clearQuiz, clearAll, exportCSV } from '../../services/leaderboardService';

export default function LeaderboardAdmin() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [filterQuiz, setFilterQuiz] = useState('all');

  useEffect(() => {
    const unsub = subscribeEntries((data) => {
      setEntries(data);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const handleDeleteEntry = async (id, userName) => {
    if (!window.confirm(`Delete entry for ${userName}?`)) return;
    setDeleting(id);
    const ok = await deleteEntry(id);
    setDeleting(null);
    if (ok) {
      window.showToast('Deleted', `Entry for ${userName} removed.`, 'success');
    } else {
      window.showToast('Error', 'Failed to delete entry.', 'error');
    }
  };

  const handleClearQuiz = async (quizId) => {
    const quizTitle = entries.find(e => e.quizId === quizId)?.quizTitle || quizId;
    if (!window.confirm(`Clear ALL entries for "${quizTitle}"? This cannot be undone.`)) return;
    setDeleting('quiz');
    const count = await clearQuiz(quizId);
    setDeleting(null);
    window.showToast('Cleared', `Removed ${count} entries for "${quizTitle}".`, 'success');
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear the ENTIRE leaderboard? This cannot be undone.')) return;
    setDeleting('all');
    const count = await clearAll();
    setDeleting(null);
    window.showToast('Cleared', `Removed all ${count} entries.`, 'success');
  };

  const filtered = entries.filter(r => filterQuiz === 'all' || r.quizId === filterQuiz);

  const quizTitles = [...new Set(entries.map(r => r.quizId))].map(id => {
    const r = entries.find(ri => ri.quizId === id);
    return { id, title: r?.quizTitle || id };
  });

  if (loading) return <div className="loading-dots"><span></span><span></span><span></span></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <span className="page-tag"><i className="fas fa-ranking-star"></i> Leaderboard</span>
          <h1 className="page-title">Manage Results</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="form-select" style={{ width: 'auto' }} value={filterQuiz} onChange={e => setFilterQuiz(e.target.value)}>
            <option value="all">All Quizzes</option>
            {quizTitles.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
          </select>
          {filterQuiz !== 'all' && (
            <button className="btn btn-sm btn-outline" style={{ color: '#e67e22' }} disabled={deleting === 'quiz'} onClick={() => handleClearQuiz(filterQuiz)}>
              <i className="fas fa-eraser"></i> Clear Quiz
            </button>
          )}
          <button className="btn btn-sm btn-outline" style={{ color: '#22c55e' }} onClick={() => exportCSV(filtered, `leaderboard-${filterQuiz === 'all' ? 'all' : filterQuiz}.csv`)}>
            <i className="fas fa-download"></i> Export CSV
          </button>
          <button className="btn btn-sm btn-outline" style={{ color: '#ef4444' }} disabled={deleting === 'all'} onClick={handleClearAll}>
            <i className="fas fa-trash"></i> Clear All
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Name</th><th>Quiz</th><th>Score</th>
              <th>Time</th><th>Date</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td>{r.rank || '-'}</td>
                <td style={{ fontWeight: 600 }}>{r.userName}</td>
                <td>{r.quizTitle}</td>
                <td>{r.score}/{r.total} ({r.percentage || Math.round((r.score || 0) / (r.total || 1) * 100)}%)</td>
                <td>{r.timeTaken || r.timeSpent || '-'}s</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '-'}</td>
                <td>
                  <button className="btn btn-sm btn-outline" style={{ color: '#ef4444' }} disabled={deleting === r.id} onClick={() => handleDeleteEntry(r.id, r.userName)}>
                    {deleting === r.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash"></i>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><i className="fas fa-ranking-star"></i></div>
            <h3>No Results</h3>
            <p>No leaderboard entries match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
