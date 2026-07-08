import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTaskLeaderboard, getUserRank } from '../services/taskService';
import { DEPARTMENTS } from '../config/taskConfig';
import TaskLeaderboardPodium from '../components/task/TaskLeaderboardPodium';
import TaskLeaderboardTable from '../components/task/TaskLeaderboardTable';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const CATEGORIES = ['All Categories', 'Coding', 'AI', 'Idea', 'UI/UX', 'Research', 'Innovation', 'Data Science'];

export default function TaskLeaderboard({ user }) {
  const [entries, setEntries] = useState([]);
  const [userRankEntry, setUserRankEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('full');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTaskLeaderboard();
        setEntries(data);
        if (user) {
          const rank = await getUserRank(user.id);
          setUserRankEntry(rank);
        }
      } catch (e) {
        console.error('Leaderboard load error', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const filtered = entries.filter(e => {
    if (search && !e.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (deptFilter && e.department !== deptFilter) return false;
    return true;
  });

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loading-spinner" /></div>;
  }

  return (
    <div className="tlb-container">
      <div className="tlb-header">
        <div>
          <h1><i className="fa-solid fa-trophy" style={{ color: '#f59e0b' }} /> Task Leaderboard</h1>
          <p className="tlb-subtitle">Top performers ranked by XP, scores, and tasks completed</p>
        </div>
        <Link to="/tasks" className="tlb-back-btn">
          <i className="fa-solid fa-arrow-left" /> Back to Tasks
        </Link>
      </div>

      {userRankEntry && (
        <div className="tlb-user-rank">
          <img
            src={user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ff5500&color=fff`}
            alt={user?.name}
            className="tlb-user-avatar"
          />
          <div className="tlb-user-info">
            <span className="tlb-user-name">{user?.name}</span>
            <span className="tlb-user-position">Rank #{userRankEntry.rank} of {entries.length}</span>
          </div>
          <div className="tlb-user-stats">
            <div className="tlb-user-stat">
              <span className="tlb-user-stat-value">{userRankEntry.overallScore.toLocaleString()}</span>
              <span className="tlb-user-stat-label">XP</span>
            </div>
            <div className="tlb-user-stat">
              <span className="tlb-user-stat-value">{userRankEntry.level}</span>
              <span className="tlb-user-stat-label">Level</span>
            </div>
            <div className="tlb-user-stat">
              <span className="tlb-user-stat-value">{userRankEntry.tasksCompleted}</span>
              <span className="tlb-user-stat-label">Tasks</span>
            </div>
          </div>
        </div>
      )}

      <div className="tlb-filters">
        <div className="tlb-search">
          <i className="fa-solid fa-search" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="tlb-select">
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="tlb-view-toggle">
        <button className={`tlb-view-btn ${view === 'full' ? 'active' : ''}`} onClick={() => setView('full')}>
          <i className="fa-solid fa-ranking-star" /> Full Leaderboard
        </button>
        <button className={`tlb-view-btn ${view === 'podium' ? 'active' : ''}`} onClick={() => setView('podium')}>
          <i className="fa-solid fa-crown" /> Podium Only
        </button>
      </div>

      {view === 'podium' ? (
        <TaskLeaderboardPodium entries={filtered} />
      ) : (
        <>
          <TaskLeaderboardPodium entries={filtered} />
          <TaskLeaderboardTable entries={filtered} />
        </>
      )}

      {entries.length === 0 && (
        <div className="tlb-empty">
          <i className="fa-solid fa-trophy" />
          <p>No leaderboard data yet. Complete tasks to get ranked!</p>
          <Link to="/tasks" className="tlb-empty-btn">Browse Tasks</Link>
        </div>
      )}

      <style>{`
        .tlb-container { max-width: 1100px; margin: 0 auto; padding: 2rem; }
        .tlb-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .tlb-header h1 { font-size: 1.4rem; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 0.5rem; color: var(--text); }
        .tlb-subtitle { font-size: 0.85rem; color: var(--text-secondary); margin: 0.2rem 0 0; }
        .tlb-back-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.9rem; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; font-weight: 600; font-size: 0.82rem; color: var(--text-secondary); text-decoration: none; transition: all 0.15s; white-space: nowrap; }
        .tlb-back-btn:hover { background: var(--surface-2); color: var(--text); }
        .tlb-user-rank { display: flex; align-items: center; gap: 1rem; padding: 0.9rem 1.25rem; background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 1px solid #fde68a; border-radius: var(--radius-md); margin-bottom: 1.25rem; }
        [data-theme="dark"] .tlb-user-rank { background: linear-gradient(135deg, #422006, #451a03); border-color: #78350f; }
        .tlb-user-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
        .tlb-user-info { flex: 1; }
        .tlb-user-name { font-weight: 700; font-size: 0.9rem; color: var(--text); display: block; }
        .tlb-user-position { font-size: 0.78rem; color: #92400e; font-weight: 600; }
        [data-theme="dark"] .tlb-user-position { color: #fde68a; }
        .tlb-user-stats { display: flex; gap: 1.25rem; }
        .tlb-user-stat { display: flex; flex-direction: column; align-items: center; }
        .tlb-user-stat-value { font-weight: 800; font-size: 1rem; color: var(--text); }
        .tlb-user-stat-label { font-size: 0.6rem; color: #92400e; text-transform: uppercase; font-weight: 600; }
        [data-theme="dark"] .tlb-user-stat-label { color: #fde68a; }
        .tlb-filters { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .tlb-search { display: flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.7rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; }
        .tlb-search i { color: var(--text-muted); font-size: 0.75rem; }
        .tlb-search input { border: none; background: none; font-size: 0.78rem; color: var(--text); outline: none; width: 170px; font-family: inherit; }
        .tlb-search input::placeholder { color: var(--text-muted); }
        .tlb-select { padding: 0.35rem 0.7rem; border: 1px solid var(--border); border-radius: 8px; background: var(--card); font-size: 0.78rem; color: var(--text); font-family: inherit; cursor: pointer; }
        .tlb-select:focus { outline: none; border-color: var(--orange); }
        .tlb-view-toggle { display: flex; gap: 0.4rem; margin-bottom: 1rem; }
        .tlb-view-btn { display: flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.85rem; border: 1px solid var(--border); border-radius: 8px; background: var(--card); font-size: 0.78rem; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
        .tlb-view-btn.active { background: var(--orange); color: white; border-color: var(--orange); }
        .tlb-view-btn:hover:not(.active) { border-color: var(--orange); color: var(--text); }
        .tlb-empty { text-align: center; padding: 4rem 2rem; color: var(--text-muted); }
        .tlb-empty i { font-size: 3rem; color: var(--border); margin-bottom: 1rem; }
        .tlb-empty p { font-size: 0.95rem; margin: 0.5rem 0; }
        .tlb-empty-btn { display: inline-flex; padding: 0.45rem 1.1rem; background: var(--orange); color: white; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 0.85rem; }
        @media (max-width: 768px) {
          .tlb-container { padding: 1rem; }
          .tlb-user-rank { flex-direction: column; text-align: center; }
          .tlb-filters { flex-direction: column; }
          .tlb-search input { width: 100%; }
        }
      `}</style>
    </div>
  );
}
