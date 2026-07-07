import { useState, useEffect } from 'react';
import db from '../../db';
import { getLeaderboardData, getFilterOptions, formatTime } from '../../services/leaderboardService';

export default function LeaderboardAdmin() {
  const [allResults, setAllResults] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterQuiz, setFilterQuiz] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'time' | 'date'
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [filterOptions, setFilterOptions] = useState({ quizzes: [] });

  const pct = (score, total) => total > 0 ? Math.round((score / total) * 100) : 0;

  const load = async () => {
    setLoading(true);
    try {
      const data = await db.find('QuizResults');
      setAllResults(data);
      setFilterOptions(getFilterOptions(data));
    } catch {
      window.showToast?.('Error', 'Could not load leaderboard results.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let results = [...allResults];
    if (filterQuiz !== 'all') results = results.filter(r => r.quizId === filterQuiz);
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(r => (r.userName || '').toLowerCase().includes(q) || (r.userEmail || '').toLowerCase().includes(q));
    }
    results.sort((a, b) => {
      if (sortBy === 'score') return pct(b.score, b.total) - pct(a.score, a.total);
      if (sortBy === 'time') return (a.timeTaken || 999) - (b.timeTaken || 999);
      return new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt);
    });
    setFiltered(results);
  }, [allResults, filterQuiz, search, sortBy]);

  const handleDelete = async (id, userName) => {
    if (!window.confirm(`Delete result for "${userName}"?`)) return;
    try {
      await db.delete('QuizResults', id);
      setAllResults(prev => prev.filter(r => r.id !== id));
      window.showToast?.('Deleted', `Result for ${userName} removed.`, 'success');
    } catch (err) {
      window.showToast?.('Error', err.message, 'error');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete ALL quiz results? This cannot be undone.')) return;
    setDeleting(true);
    try {
      for (const r of allResults) await db.delete('QuizResults', r.id);
      setAllResults([]);
      window.showToast?.('Cleared', 'All quiz results have been deleted.', 'success');
    } catch (err) {
      window.showToast?.('Error', err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    const rows = [['Name', 'Email', 'Quiz', 'Score', 'Total', '%', 'Time (s)', 'Pass', 'Badge', 'Points', 'Date']];
    filtered.forEach(r => rows.push([
      r.userName || '', r.userEmail || '', r.quizTitle || '',
      r.score, r.total, pct(r.score, r.total),
      r.timeTaken || '', r.pass ? 'Yes' : 'No',
      r.badge?.name || '', r.points || '',
      r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '',
    ]));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `quiz-results-${Date.now()}.csv`;
    a.click();
  };

  const sortBtn = (key, label) => (
    <button onClick={() => setSortBy(key)} style={{
      padding: '0.3rem 0.7rem', borderRadius: 7, fontSize: '0.78rem', fontWeight: 700,
      border: 'none', cursor: 'pointer',
      background: sortBy === key ? 'var(--orange,#ff5500)' : 'transparent',
      color: sortBy === key ? '#fff' : 'var(--text-secondary,#aaa)',
    }}>{label}</button>
  );

  if (loading) return <div className="loading-spinner" />;

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.35rem 0.75rem', flex: 1, minWidth: 180 }}>
          <i className="fa-solid fa-search" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            style={{ border: 'none', background: 'none', fontSize: '0.84rem', color: 'var(--text)', outline: 'none', width: '100%' }} />
        </div>

        {/* Quiz filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.35rem 0.75rem' }}>
          <i className="fa-solid fa-filter" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
          <select value={filterQuiz} onChange={e => setFilterQuiz(e.target.value)}
            style={{ border: 'none', background: 'none', fontSize: '0.84rem', color: 'var(--text)', padding: '0.25rem 0', outline: 'none', fontWeight: 600 }}>
            <option value="all">All Quizzes</option>
            {filterOptions.quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
          </select>
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.25rem' }}>
          {sortBtn('score', '% Score')}
          {sortBtn('time', '⚡ Fastest')}
          {sortBtn('date', '🕐 Latest')}
        </div>

        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{filtered.length} results</span>

        {/* Export */}
        <button onClick={handleExport} style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, padding: '0.4rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <i className="fa-solid fa-download" /> Export CSV
        </button>

        {/* Clear all */}
        {allResults.length > 0 && (
          <button onClick={handleClearAll} disabled={deleting} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '0.4rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {deleting ? <><i className="fa-solid fa-spinner fa-spin" /> Clearing…</> : <><i className="fa-solid fa-trash-can" /> Clear All</>}
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {['#', 'Name', 'Quiz', 'Score', 'Time', 'Pass', 'Badge', 'Points', 'Date', ''].map(h => (
                  <th key={h} style={{ padding: '0.75rem 0.9rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No results found</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.8rem 0.9rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>#{i + 1}</td>
                  <td style={{ padding: '0.8rem 0.9rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' }}>{r.userName || 'Anonymous'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.userEmail || ''}</div>
                  </td>
                  <td style={{ padding: '0.8rem 0.9rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.quizTitle || '—'}</td>
                  <td style={{ padding: '0.8rem 0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)' }}>{r.score}/{r.total}</span>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, borderRadius: 5, padding: '1px 6px',
                        background: pct(r.score, r.total) >= 75 ? '#16a34a22' : pct(r.score, r.total) >= 50 ? '#f59e0b22' : '#dc262622',
                        color: pct(r.score, r.total) >= 75 ? '#22c55e' : pct(r.score, r.total) >= 50 ? '#f59e0b' : '#ef4444',
                      }}>{pct(r.score, r.total)}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.8rem 0.9rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.timeTaken ? formatTime(r.timeTaken) : '—'}</td>
                  <td style={{ padding: '0.8rem 0.9rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, borderRadius: 5, padding: '2px 7px', background: r.pass ? '#16a34a22' : '#dc262622', color: r.pass ? '#22c55e' : '#ef4444' }}>
                      {r.pass ? 'Pass' : 'Fail'}
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem 0.9rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.badge?.name || '—'}</td>
                  <td style={{ padding: '0.8rem 0.9rem', fontWeight: 800, fontSize: '0.85rem', color: '#ffd700' }}>{r.points || 0}</td>
                  <td style={{ padding: '0.8rem 0.9rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '—'}</td>
                  <td style={{ padding: '0.8rem 0.9rem', textAlign: 'center' }}>
                    <button onClick={() => handleDelete(r.id, r.userName)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#dc2626', fontSize: '0.74rem' }} title="Delete result">
                      <i className="fa-solid fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
