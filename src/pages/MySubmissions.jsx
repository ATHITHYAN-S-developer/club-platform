import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserSubmissions } from '../services/taskService';
import { TASK_TYPES } from '../config/taskConfig';

const STATUS_STYLE = {
  submitted: { label: 'Submitted', color: '#f59e0b', bg: '#fef3c7' },
  under_review: { label: 'Under Review', color: '#8b5cf6', bg: '#ede9fe' },
  feedback_added: { label: 'Feedback', color: '#3b82f6', bg: '#dbeafe' },
  approved: { label: 'Approved', color: '#16a34a', bg: '#d1fae5' },
  rejected: { label: 'Rejected', color: '#dc2626', bg: '#fee2e2' },
};

export default function MySubmissions({ user }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('submittedAt');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUserSubmissions(user.id);
        setSubmissions(data);
      } catch (e) {
        console.error('Submissions load error', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filtered = submissions
    .filter(s => filter === 'all' || s.status === filter)
    .filter(s => !search || s.taskTitle?.toLowerCase().includes(search.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'submittedAt') cmp = new Date(a.submittedAt) - new Date(b.submittedAt);
    else if (sortKey === 'taskTitle') cmp = (a.taskTitle || '').localeCompare(b.taskTitle || '');
    else if (sortKey === 'status') cmp = (a.status || '').localeCompare(b.status || '');
    else if (sortKey === 'attemptNumber') cmp = (a.attemptNumber || 0) - (b.attemptNumber || 0);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ columnKey }) => {
    if (sortKey !== columnKey) return <i className="fa-solid fa-sort" style={{ opacity: 0.3, marginLeft: 4, fontSize: '0.65rem' }} />;
    return <i className={`fa-solid fa-sort-${sortDir === 'asc' ? 'up' : 'down'}`} style={{ marginLeft: 4, fontSize: '0.65rem' }} />;
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loading-spinner" /></div>;
  }

  return (
    <div className="ms-container">
      <div className="ms-header">
        <h1><i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--orange)' }} /> My Submissions</h1>
        <Link to="/tasks" className="ms-browse-btn">
          <i className="fa-solid fa-list" /> Browse Tasks
        </Link>
      </div>

      <div className="ms-toolbar">
        <div className="ms-filters">
          {['all', 'submitted', 'under_review', 'feedback_added', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              className={`ms-filter-btn ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status === 'all' ? 'All' : STATUS_STYLE[status]?.label || status}
              <span className="ms-filter-count">
                {status === 'all' ? submissions.length : submissions.filter(s => s.status === status).length}
              </span>
            </button>
          ))}
        </div>
        <div className="ms-search">
          <i className="fa-solid fa-search" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="ms-empty">
          <i className="fa-solid fa-inbox" />
          <p>No submissions found</p>
          <Link to="/tasks" className="ms-empty-btn">Browse Tasks</Link>
        </div>
      ) : (
        <div className="ms-table-wrap">
          <table className="ms-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('taskTitle')}>Task <SortIcon columnKey="taskTitle" /></th>
                <th>Type</th>
                <th onClick={() => handleSort('submittedAt')}>Date <SortIcon columnKey="submittedAt" /></th>
                <th onClick={() => handleSort('status')}>Status <SortIcon columnKey="status" /></th>
                <th>Score</th>
                <th>XP</th>
                <th>Feedback</th>
                <th>Reviewer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(sub => {
                const st = STATUS_STYLE[sub.status] || STATUS_STYLE.submitted;
                const typeConfig = TASK_TYPES[sub.taskType];
                return (
                  <tr key={sub.id}>
                    <td>
                      <Link to={`/tasks/${sub.taskId}`} className="ms-task-link">
                        {sub.taskTitle}
                      </Link>
                    </td>
                    <td>
                      {typeConfig && (
                        <span className="ms-type-badge" style={{ color: typeConfig.color }}>
                          <i className={`fa-solid ${typeConfig.icon}`} /> {typeConfig.label.split(' ')[0]}
                        </span>
                      )}
                    </td>
                    <td className="ms-date-cell">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                    <td>
                      <span className="ms-status-badge" style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td className="ms-score-cell">{sub.finalScore != null ? `${sub.finalScore}%` : '—'}</td>
                    <td className="ms-xp-cell">{sub.xpEarned ? `+${sub.xpEarned}` : '—'}</td>
                    <td className="ms-feedback-cell">
                      {sub.feedback?.overallComments ? (
                        <span title={sub.feedback.overallComments}>
                          {sub.feedback.overallComments.length > 35
                            ? sub.feedback.overallComments.slice(0, 35) + '...'
                            : sub.feedback.overallComments}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="ms-reviewer-cell">{sub.reviewerName || '—'}</td>
                    <td>
                      <Link to={`/tasks/${sub.taskId}`} className="ms-action-btn" title="View Task">
                        <i className="fa-solid fa-eye" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .ms-container { max-width: 1100px; margin: 0 auto; padding: 2rem; }
        .ms-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem; }
        .ms-header h1 { font-size: 1.4rem; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 0.5rem; color: var(--text); }
        .ms-browse-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.9rem; background: var(--orange); color: white; border-radius: 10px; font-weight: 600; font-size: 0.82rem; text-decoration: none; transition: all 0.2s; }
        .ms-browse-btn:hover { background: var(--orange-dark); }
        .ms-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
        .ms-filters { display: flex; gap: 0.35rem; flex-wrap: wrap; }
        .ms-filter-btn { display: flex; align-items: center; gap: 0.3rem; padding: 0.35rem 0.7rem; border: 1px solid var(--border); border-radius: 8px; background: var(--card); font-size: 0.75rem; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
        .ms-filter-btn.active { background: var(--orange); color: white; border-color: var(--orange); }
        .ms-filter-btn:hover:not(.active) { border-color: var(--orange); color: var(--text); }
        .ms-filter-count { font-size: 0.62rem; padding: 0.05rem 0.3rem; border-radius: 8px; background: rgba(0,0,0,0.06); }
        .ms-filter-btn.active .ms-filter-count { background: rgba(255,255,255,0.2); }
        .ms-search { display: flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.7rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; }
        .ms-search i { color: var(--text-muted); font-size: 0.75rem; }
        .ms-search input { border: none; background: none; font-size: 0.78rem; color: var(--text); outline: none; width: 160px; font-family: inherit; }
        .ms-search input::placeholder { color: var(--text-muted); }
        .ms-empty { text-align: center; padding: 4rem 2rem; color: var(--text-muted); }
        .ms-empty i { font-size: 3rem; color: var(--border); margin-bottom: 1rem; }
        .ms-empty p { font-size: 0.95rem; margin: 0.5rem 0; }
        .ms-empty-btn { display: inline-flex; padding: 0.45rem 1.1rem; background: var(--orange); color: white; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 0.85rem; }
        .ms-table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--card); }
        .ms-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
        .ms-table thead th {
          padding: 0.65rem 0.75rem; text-align: left; font-weight: 700; font-size: 0.72rem;
          color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em;
          background: var(--surface); border-bottom: 1px solid var(--border);
          cursor: pointer; user-select: none; white-space: nowrap;
        }
        .ms-table thead th:hover { color: var(--text); }
        .ms-table tbody td { padding: 0.6rem 0.75rem; border-bottom: 1px solid var(--border-light); color: var(--text); }
        .ms-table tbody tr:last-child td { border-bottom: none; }
        .ms-table tbody tr:hover { background: var(--surface); }
        .ms-task-link { color: var(--text); font-weight: 600; text-decoration: none; }
        .ms-task-link:hover { color: var(--orange); }
        .ms-type-badge { font-size: 0.72rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.25rem; white-space: nowrap; }
        .ms-status-badge { display: inline-flex; padding: 0.15rem 0.5rem; border-radius: 6px; font-size: 0.72rem; font-weight: 700; white-space: nowrap; }
        .ms-date-cell { color: var(--text-muted); font-size: 0.78rem; white-space: nowrap; }
        .ms-score-cell { font-weight: 700; }
        .ms-xp-cell { color: #f59e0b; font-weight: 700; }
        .ms-feedback-cell { color: var(--text-secondary); font-size: 0.78rem; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ms-reviewer-cell { color: var(--text-muted); font-size: 0.78rem; }
        .ms-action-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-muted); text-decoration: none; transition: all 0.15s; font-size: 0.75rem; }
        .ms-action-btn:hover { background: var(--surface-2); color: var(--orange); border-color: var(--orange); }
        @media (max-width: 768px) {
          .ms-container { padding: 1rem; }
          .ms-toolbar { flex-direction: column; align-items: stretch; }
          .ms-search input { width: 100%; }
        }
      `}</style>
    </div>
  );
}
