import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserDashboard } from '../services/taskService';

export default function TaskDashboard({ user }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUserDashboard(user.id);
        setDashboard(data);
      } catch (e) {
        console.error('Dashboard load error', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loading-spinner" /></div>;
  }

  if (!dashboard) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Could not load dashboard.</div>;
  }

  return (
    <div className="td-container">
      <div className="td-welcome">
        <div className="td-welcome-info">
          <div className="td-welcome-avatar">
            {user?.photo ? (
              <img src={user.photo} alt={user.name} />
            ) : (
              <div className="td-welcome-avatar-fallback">{user?.name?.[0] || '?'}</div>
            )}
          </div>
          <div>
            <h1 className="td-welcome-title">Welcome back, {user?.name?.split(' ')[0] || 'there'}!</h1>
            <p className="td-welcome-sub">
              {dashboard.activeTasks} active task{dashboard.activeTasks !== 1 ? 's' : ''} available
              {dashboard.rank ? ` · Rank #${dashboard.rank}` : ''} · Level {dashboard.level}
            </p>
          </div>
        </div>
        <Link to="/tasks" className="td-browse-btn">
          <i className="fa-solid fa-list" /> Browse Tasks
        </Link>
      </div>

      <div className="td-stats-grid">
        <div className="td-stat-card">
          <div className="td-stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
            <i className="fa-solid fa-bolt" />
          </div>
          <div className="td-stat-info">
            <span className="td-stat-value">{dashboard.xp.toLocaleString()}</span>
            <span className="td-stat-label">Total XP</span>
          </div>
        </div>

        <div className="td-stat-card">
          <div className="td-stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
            <i className="fa-solid fa-ranking-star" />
          </div>
          <div className="td-stat-info">
            <span className="td-stat-value">{dashboard.rank ? `#${dashboard.rank}` : '—'}</span>
            <span className="td-stat-label">Your Rank</span>
          </div>
        </div>

        <div className="td-stat-card">
          <div className="td-stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
            <i className="fa-solid fa-level-up-alt" />
          </div>
          <div className="td-stat-info">
            <span className="td-stat-value">{dashboard.level}</span>
            <span className="td-stat-label">Level</span>
          </div>
        </div>

        <div className="td-stat-card">
          <div className="td-stat-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
            <i className="fa-solid fa-fire" />
          </div>
          <div className="td-stat-info">
            <span className="td-stat-value">{dashboard.streak > 0 ? `🔥 ${dashboard.streak}w` : '—'}</span>
            <span className="td-stat-label">Streak</span>
          </div>
        </div>
      </div>

      <div className="td-quick-actions">
        <Link to="/tasks" className="td-qaction">
          <i className="fa-solid fa-list-check" />
          <span>Browse Tasks</span>
        </Link>
        <Link to="/my-submissions" className="td-qaction">
          <i className="fa-solid fa-clock-rotate-left" />
          <span>My Submissions</span>
        </Link>
        <Link to="/task-leaderboard" className="td-qaction">
          <i className="fa-solid fa-trophy" />
          <span>Leaderboard</span>
        </Link>
        <Link to="/my-badges" className="td-qaction">
          <i className="fa-solid fa-medal" />
          <span>Badges</span>
        </Link>
      </div>

      <div className="td-main-grid">
        <div className="td-section">
          <h3 className="td-section-title">
            <i className="fa-solid fa-hourglass-half" style={{ color: '#f59e0b' }} /> Upcoming Deadlines
          </h3>
          <div className="td-deadlines">
            {dashboard.upcomingDeadlines.length === 0 ? (
              <p className="td-empty">No upcoming deadlines</p>
            ) : dashboard.upcomingDeadlines.map((task) => (
              <Link key={task.id} to={`/tasks/${task.id}`} className="td-deadline-item">
                <div className="td-deadline-title">{task.title}</div>
                <div className="td-deadline-date">
                  {new Date(task.dueDate + 'T' + (task.dueTime || '23:59')).toLocaleDateString()}
                </div>
                <div className="td-deadline-xp">+{task.xpReward} XP</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="td-section">
          <h3 className="td-section-title">
            <i className="fa-solid fa-medal" style={{ color: '#f59e0b' }} /> Badges ({dashboard.badges.length})
          </h3>
          <div className="td-badges">
            {dashboard.badges.length === 0 ? (
              <p className="td-empty">No badges yet. Complete tasks to earn badges!</p>
            ) : dashboard.badges.slice(0, 6).map((badge, idx) => (
              <div key={idx} className="td-badge-item" title={`${badge.name}${badge.description ? `: ${badge.description}` : ''}`}>
                <span style={{ fontSize: '1.4rem' }}>{badge.icon}</span>
                <span className="td-badge-name">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="td-main-grid">
        <div className="td-section">
          <h3 className="td-section-title">
            <i className="fa-solid fa-comment" style={{ color: 'var(--orange)' }} /> Recent Feedback
          </h3>
          <div className="td-feedback">
            {dashboard.recentFeedback.length === 0 ? (
              <p className="td-empty">No feedback yet</p>
            ) : dashboard.recentFeedback.map((f, idx) => (
              <div key={idx} className="td-feedback-item">
                <div className="td-feedback-header">
                  <span className="td-feedback-task">{f.taskTitle}</span>
                  <span className="td-feedback-score" style={{ color: f.finalScore >= 90 ? '#10b981' : f.finalScore >= 70 ? '#f59e0b' : '#ef4444' }}>
                    {f.finalScore}%
                  </span>
                </div>
                {f.feedback?.overallComments && (
                  <p className="td-feedback-text">{f.feedback.overallComments}</p>
                )}
                <span className="td-feedback-date">{new Date(f.reviewedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="td-section">
          <h3 className="td-section-title">
            <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--text-muted)' }} /> Recent Submissions
          </h3>
          <div className="td-submissions">
            {dashboard.submissionHistory.length === 0 ? (
              <p className="td-empty">No submissions yet</p>
            ) : dashboard.submissionHistory.slice(0, 8).map((s) => (
              <Link key={s.id} to="/my-submissions" className="td-sub-item">
                <div className="td-sub-title">{s.taskTitle}</div>
                <span className={`td-sub-status ${s.status}`}>
                  {s.status === 'approved' ? '✅' : s.status === 'rejected' ? '❌' : '🕐'} {s.status.replace('_', ' ')}
                </span>
                <span className="td-sub-date">{new Date(s.submittedAt).toLocaleDateString()}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .td-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .td-welcome { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; padding: 1.25rem; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); }
        .td-welcome-info { display: flex; align-items: center; gap: 1rem; }
        .td-welcome-avatar img, .td-welcome-avatar-fallback { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; }
        .td-welcome-avatar-fallback { display: flex; align-items: center; justify-content: center; background: var(--orange); color: white; font-weight: 800; font-size: 1.2rem; }
        .td-welcome-title { font-size: 1.25rem; font-weight: 800; margin: 0; color: var(--text); }
        .td-welcome-sub { font-size: 0.82rem; color: var(--text-secondary); margin: 0.15rem 0 0; }
        .td-browse-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; background: var(--orange); color: white; border-radius: 10px; font-weight: 600; font-size: 0.85rem; text-decoration: none; transition: all 0.2s; white-space: nowrap; }
        .td-browse-btn:hover { background: var(--orange-dark); }
        .td-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.85rem; margin-bottom: 1.25rem; }
        .td-stat-card { display: flex; align-items: center; gap: 0.85rem; padding: 1rem 1.25rem; border-radius: var(--radius-md); background: var(--card); border: 1px solid var(--border); }
        .td-stat-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
        .td-stat-info { display: flex; flex-direction: column; }
        .td-stat-value { font-size: 1.2rem; font-weight: 800; color: var(--text); }
        .td-stat-label { font-size: 0.7rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
        .td-quick-actions { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .td-qaction { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; text-decoration: none; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); transition: all 0.2s; }
        .td-qaction:hover { background: var(--surface-2); border-color: var(--orange); color: var(--orange); }
        .td-main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
        .td-section { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.25rem; }
        .td-section-title { font-size: 0.92rem; font-weight: 700; margin: 0 0 0.85rem; display: flex; align-items: center; gap: 0.45rem; color: var(--text); }
        .td-empty { font-size: 0.82rem; color: var(--text-muted); text-align: center; padding: 1.25rem; }
        .td-deadlines { display: flex; flex-direction: column; gap: 0.4rem; }
        .td-deadline-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem; border-radius: 10px; text-decoration: none; background: var(--surface); transition: background 0.15s; }
        .td-deadline-item:hover { background: var(--surface-2); }
        .td-deadline-title { flex: 1; font-weight: 600; font-size: 0.82rem; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .td-deadline-date { font-size: 0.72rem; color: var(--text-muted); white-space: nowrap; }
        .td-deadline-xp { font-size: 0.75rem; font-weight: 700; color: #f59e0b; white-space: nowrap; }
        .td-badges { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .td-badge-item { display: flex; align-items: center; gap: 0.3rem; padding: 0.35rem 0.6rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; cursor: default; }
        .td-badge-name { font-size: 0.72rem; font-weight: 600; color: var(--text-secondary); }
        .td-feedback { display: flex; flex-direction: column; gap: 0.4rem; max-height: 280px; overflow-y: auto; }
        .td-feedback-item { padding: 0.65rem; border-radius: 10px; background: var(--surface); }
        .td-feedback-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
        .td-feedback-task { font-weight: 600; font-size: 0.82rem; color: var(--text); }
        .td-feedback-score { font-weight: 800; font-size: 0.82rem; }
        .td-feedback-text { font-size: 0.78rem; color: var(--text-secondary); margin: 0.2rem 0; }
        .td-feedback-date { font-size: 0.65rem; color: var(--text-muted); }
        .td-submissions { display: flex; flex-direction: column; gap: 0.4rem; max-height: 280px; overflow-y: auto; }
        .td-sub-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.65rem; border-radius: 8px; background: var(--surface); text-decoration: none; }
        .td-sub-item:hover { background: var(--surface-2); }
        .td-sub-title { flex: 1; font-weight: 600; font-size: 0.8rem; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .td-sub-status { font-size: 0.7rem; font-weight: 600; text-transform: capitalize; white-space: nowrap; }
        .td-sub-status.approved { color: #16a34a; }
        .td-sub-status.rejected { color: #dc2626; }
        .td-sub-status.submitted, .td-sub-status.under_review { color: #f59e0b; }
        .td-sub-date { font-size: 0.68rem; color: var(--text-muted); white-space: nowrap; }
        @media (max-width: 768px) {
          .td-main-grid { grid-template-columns: 1fr; }
          .td-welcome { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
