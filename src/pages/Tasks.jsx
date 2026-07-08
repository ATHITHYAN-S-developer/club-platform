import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVisibleTasks, getUserSubmissions } from '../services/taskService';
import TaskCard from '../components/task/TaskCard';
import { TASK_TYPES } from '../config/taskConfig';

export default function Tasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = async () => {
    try {
      const visible = await getVisibleTasks(user);
      setTasks(visible);
      if (user) {
        const subs = await getUserSubmissions(user.id);
        setMySubmissions(subs);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, [user]);

  const filtered = tasks.filter(t => {
    if (filterType !== 'all' && t.taskType !== filterType) return false;
    if (filterDifficulty !== 'all' && t.difficulty !== filterDifficulty) return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getSubmissionForTask = (taskId) => mySubmissions.find(s => s.taskId === taskId);

  const openTasks = filtered.filter(t => t.status === 'open');
  const otherTasks = filtered.filter(t => t.status !== 'open');

  return (
    <div className="ts-page">
      <div className="ts-hero">
        <div className="ts-hero-content">
          <p className="ts-hero-subtitle">Sharpen Your Skills</p>
          <h1 className="ts-hero-title">Tasks</h1>
          <p className="ts-hero-desc">Complete tasks, earn XP, climb the leaderboard, and unlock badges.</p>
          <div className="ts-hero-actions">
            <Link to="/tasks/dashboard" className="ts-btn ts-btn-primary">
              <i className="fa-solid fa-gauge-high" /> Dashboard
            </Link>
            <Link to="/task-leaderboard" className="ts-btn ts-btn-secondary">
              <i className="fa-solid fa-trophy" /> Leaderboard
            </Link>
            <Link to="/my-submissions" className="ts-btn ts-btn-secondary">
              <i className="fa-solid fa-clock-rotate-left" /> My Submissions
            </Link>
          </div>
        </div>
      </div>

      <div className="ts-filters">
        <div className="ts-search-bar">
          <i className="fa-solid fa-search" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="ts-filter-group">
          <label>Type</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            {Object.entries(TASK_TYPES).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
        <div className="ts-filter-group">
          <label>Difficulty</label>
          <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="ts-loading"><div className="loading-spinner" /></div>
      ) : (
        <div className="ts-section">
          {openTasks.length > 0 && (
            <div className="ts-task-section">
              <h3 className="ts-section-title">
                <span className="ts-section-dot" style={{ color: '#10b981' }}>●</span>
                Open Tasks ({openTasks.length})
              </h3>
              <div className="ts-grid">
                {openTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    userSubmission={getSubmissionForTask(task.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {otherTasks.length > 0 && (
            <div className="ts-task-section">
              <h3 className="ts-section-title">
                <span className="ts-section-dot" style={{ color: '#9ca3af' }}>●</span>
                Other Tasks ({otherTasks.length})
              </h3>
              <div className="ts-grid">
                {otherTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    userSubmission={getSubmissionForTask(task.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="ts-empty">
              <div className="ts-empty-icon">📝</div>
              <p>No tasks found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .ts-page { background: var(--bg); color: var(--text); min-height: 100vh; overflow-x: hidden; }
        .ts-hero {
          position: relative; padding: 6rem 2rem 3rem; text-align: center;
          background: linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%);
          overflow: hidden;
        }
        .ts-hero::before {
          content: ''; position: absolute; top: -120px; right: -120px;
          width: 360px; height: 360px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,85,0,0.06) 0%, transparent 70%);
        }
        .ts-hero-content { max-width: 700px; margin: 0 auto; position: relative; z-index: 1; }
        .ts-hero-subtitle { font-family: 'Dancing Script', cursive; font-size: 1.8rem; color: var(--orange); margin: 0 0 0.2rem; }
        .ts-hero-title { font-size: clamp(2rem,4vw,3.2rem); font-weight: 900; text-transform: uppercase; letter-spacing: 0.02em; margin: 0 0 0.6rem; color: var(--text); }
        .ts-hero-desc { font-size: 1rem; color: var(--text-muted); line-height: 1.7; margin: 0 0 1.5rem; }
        .ts-hero-actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
        .ts-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.2rem; border-radius: 10px; font-weight: 700; font-size: 0.85rem; text-decoration: none; transition: all 0.2s; }
        .ts-btn-primary { background: var(--orange); color: white; }
        .ts-btn-primary:hover { background: var(--orange-dark); transform: translateY(-1px); }
        .ts-btn-secondary { background: var(--surface-2); color: var(--text-secondary); }
        .ts-btn-secondary:hover { background: var(--surface-3); }
        .ts-filters { display: flex; gap: 1rem; max-width: 1200px; margin: 0 auto; padding: 0 2rem 1.5rem; flex-wrap: wrap; align-items: flex-end; }
        .ts-search-bar { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.75rem; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; flex: 1; min-width: 200px; }
        .ts-search-bar i { color: var(--text-muted); font-size: 0.85rem; }
        .ts-search-bar input { border: none; background: none; outline: none; font-size: 0.85rem; color: var(--text); width: 100%; }
        .ts-search-bar input::placeholder { color: var(--text-muted); }
        .ts-filter-group { display: flex; flex-direction: column; gap: 0.25rem; }
        .ts-filter-group label { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
        .ts-filter-group select { padding: 0.45rem 0.75rem; border: 1px solid var(--border); border-radius: 8px; font-size: 0.85rem; color: var(--text); background: var(--surface); cursor: pointer; }
        .ts-loading { display: flex; justify-content: center; padding: 3rem; }
        .ts-section { max-width: 1200px; margin: 0 auto; padding: 0 2rem 4rem; }
        .ts-task-section { margin-bottom: 2rem; }
        .ts-section-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: var(--text); display: flex; align-items: center; gap: 0.5rem; }
        .ts-section-dot { font-size: 0.8rem; }
        .ts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; }
        .ts-empty { text-align: center; padding: 3rem; color: var(--text-muted); }
        .ts-empty-icon { font-size: 3rem; margin-bottom: 0.5rem; }
        @media (max-width: 768px) {
          .ts-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
          .ts-hero { padding: 5rem 1.5rem 2.5rem; }
        }
        @media (max-width: 600px) {
          .ts-grid { grid-template-columns: 1fr; }
          .ts-filters { flex-direction: column; }
          .ts-search-bar { min-width: auto; }
        }
      `}</style>
    </div>
  );
}
