import React, { useState, useEffect } from 'react';
import db from '../../db.js';

export default function StudentManagement() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [results, users] = await Promise.all([
        db.find('QuizResults'),
        db.find('QuizAttempt'),
        db.find('Users'),
      ]);
      const all = [...results, ...results];
      setAttempts(results.reverse());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filtered = filter === 'all' ? attempts : attempts.filter(a => (a.status || 'completed') === filter);

  const exportCSV = () => {
    const headers = ['Name', 'Quiz', 'Score', 'Total', 'Percentage', 'Time', 'Violations', 'Status', 'Date'];
    const rows = filtered.map(a => [
      a.userName, a.quizTitle, a.score, a.total,
      a.total ? Math.round(a.score / a.total * 100) : 0,
      a.timeTaken || a.timeSpent || '-',
      a.violationCount || 0,
      a.status || 'completed',
      a.date || a.submittedAt || '-',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'student-attempts.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="loading-dots"><span></span><span></span><span></span></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="page-tag"><i className="fas fa-users"></i> Students</span>
          <h1 className="page-title">Student Management</h1>
        </div>
        <button className="btn btn-primary btn-sm" onClick={exportCSV}>
          <i className="fas fa-download"></i> Export CSV
        </button>
      </div>

      <div className="filter-bar">
        <div className="filter-buttons">
          {['all', 'completed', 'auto-submitted', 'expired', 'in-progress'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{filtered.length} attempt{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Quiz</th>
              <th>Score</th>
              <th>Accuracy</th>
              <th>Time</th>
              <th>Violations</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600 }}>{a.userName}</td>
                <td>{a.quizTitle}</td>
                <td>{a.score}/{a.total}</td>
                <td>
                  <span className={`badge ${(a.accuracy || Math.round((a.score || 0) / (a.total || 1) * 100)) >= 60 ? 'badge-green' : 'badge-red'}`}>
                    {a.accuracy || Math.round((a.score || 0) / (a.total || 1) * 100)}%
                  </span>
                </td>
                <td>{a.timeTaken || a.timeSpent || '-'}s</td>
                <td>{a.violationCount || 0}</td>
                <td><span className={`badge ${(a.status || 'completed') === 'completed' ? 'badge-green' : 'badge-red'}`}>{a.status || 'Completed'}</span></td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{a.date ? new Date(a.date).toLocaleDateString() : (a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : '-')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><i className="fas fa-users"></i></div>
            <h3>No Attempts Found</h3>
            <p>Students haven't taken any quizzes yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
