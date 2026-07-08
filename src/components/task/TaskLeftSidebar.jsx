const DIFFICULTY_COLORS = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
};

const STATUS_ICONS = {
  completed: { icon: 'fa-circle-check', color: '#10b981', label: 'Completed' },
  approved: { icon: 'fa-circle-check', color: '#10b981', label: 'Approved' },
  in_progress: { icon: 'fa-circle-half-stroke', color: '#3b82f6', label: 'In Progress' },
  submitted: { icon: 'fa-circle', color: '#f59e0b', label: 'Submitted' },
  under_review: { icon: 'fa-circle', color: '#8b5cf6', label: 'Under Review' },
  rejected: { icon: 'fa-circle-xmark', color: '#ef4444', label: 'Rejected' },
  not_started: { icon: 'fa-circle', color: '#9ca3af', label: 'Not Started' },
  locked: { icon: 'fa-lock', color: '#d1d5db', label: 'Locked' },
};

function getTaskStatus(taskId, userSubmissions) {
  if (!userSubmissions || !userSubmissions.length) return 'not_started';
  const subs = userSubmissions.filter(s => s.taskId === taskId);
  if (!subs.length) return 'not_started';
  const latest = subs.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
  if (latest.status === 'approved') return 'approved';
  if (latest.status === 'rejected') return 'rejected';
  if (latest.status === 'under_review') return 'under_review';
  if (latest.status === 'submitted') return 'submitted';
  return 'in_progress';
}

function getCompletedCount(userSubmissions) {
  if (!userSubmissions) return 0;
  return userSubmissions.filter(s => s.status === 'approved').length;
}

function getSubmittedCount(userSubmissions) {
  if (!userSubmissions) return 0;
  return userSubmissions.filter(s =>
    s.status === 'submitted' || s.status === 'under_review'
  ).length;
}

function getTotalXPEarned(userSubmissions) {
  if (!userSubmissions) return 0;
  return userSubmissions
    .filter(s => s.status === 'approved')
    .reduce((sum, s) => sum + (s.xpEarned || 0), 0);
}

export default function TaskLeftSidebar({
  tasks, currentTaskId, userSubmissions, isOpen,
}) {
  if (!isOpen) return null;

  const totalTasks = tasks?.length || 0;
  const completed = getCompletedCount(userSubmissions);
  const submitted = getSubmittedCount(userSubmissions);
  const pending = totalTasks - completed - submitted;
  const totalXP = getTotalXPEarned(userSubmissions);
  const progress = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  return (
    <aside className="tl-sidebar">
      <div className="tl-header">
        <i className="fa-solid fa-list-check" />
        <span>Task Navigator</span>
      </div>

      <div className="tl-list">
        {tasks?.map((task, idx) => {
          const status = getTaskStatus(task.id, userSubmissions);
          const statusConfig = STATUS_ICONS[status] || STATUS_ICONS.not_started;
          const diffColor = DIFFICULTY_COLORS[task.difficulty] || '#6b7280';
          const isActive = task.id === currentTaskId;

          return (
            <a
              key={task.id}
              href={`/tasks/${task.id}`}
              className={`tl-item ${isActive ? 'tl-active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/tasks/${task.id}`;
              }}
            >
              <span className="tl-num">{idx + 1}</span>
              <span className="tl-dot" style={{ background: diffColor }} />
              <span className="tl-name">{task.title}</span>
              <span className="tl-status-icon" style={{ color: statusConfig.color }} title={statusConfig.label}>
                <i className={`fa-solid ${statusConfig.icon}`} />
              </span>
            </a>
          );
        })}
      </div>

      <div className="tl-stats">
        <div className="tl-stats-row">
          <div className="tl-stat">
            <span className="tl-stat-value" style={{ color: '#10b981' }}>{completed}</span>
            <span className="tl-stat-label">Completed</span>
          </div>
          <div className="tl-stat">
            <span className="tl-stat-value" style={{ color: '#f59e0b' }}>{submitted}</span>
            <span className="tl-stat-label">Submitted</span>
          </div>
          <div className="tl-stat">
            <span className="tl-stat-value" style={{ color: '#6b7280' }}>{pending}</span>
            <span className="tl-stat-label">Pending</span>
          </div>
        </div>

        <div className="tl-xp-row">
          <i className="fa-solid fa-bolt" style={{ color: '#f59e0b' }} />
          <span className="tl-xp-value">{totalXP} XP</span>
        </div>

        <div className="tl-progress">
          <div className="tl-progress-bar">
            <div className="tl-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="tl-progress-label">{progress}% Complete</span>
        </div>
      </div>

      <style>{`
        .tl-sidebar {
          display: flex; flex-direction: column;
          height: 100%; background: var(--bg-2);
          border-right: 1px solid var(--border);
          overflow: hidden;
        }
        .tl-header {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.85rem 1rem; font-size: 0.8rem; font-weight: 700;
          color: var(--text-secondary); text-transform: uppercase;
          letter-spacing: 0.04em; border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .tl-list {
          flex: 1; overflow-y: auto; padding: 0.5rem 0;
        }
        .tl-item {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.55rem 1rem; text-decoration: none;
          color: var(--text); font-size: 0.82rem;
          transition: background 0.15s; cursor: pointer;
        }
        .tl-item:hover { background: var(--surface); }
        .tl-item.tl-active {
          background: var(--surface-2);
          border-left: 2.5px solid var(--orange);
          font-weight: 600;
        }
        .tl-num {
          width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
          border-radius: 6px; background: var(--surface-2);
          font-size: 0.65rem; font-weight: 700; color: var(--text-muted);
          flex-shrink: 0;
        }
        .tl-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .tl-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tl-status-icon { font-size: 0.75rem; flex-shrink: 0; }
        .tl-stats {
          border-top: 1px solid var(--border);
          padding: 0.85rem 1rem; flex-shrink: 0;
          background: var(--bg);
          display: flex; flex-direction: column; gap: 0.6rem;
        }
        .tl-stats-row { display: flex; gap: 0.5rem; }
        .tl-stat { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.1rem; }
        .tl-stat-value { font-size: 1rem; font-weight: 800; }
        .tl-stat-label { font-size: 0.6rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
        .tl-xp-row { display: flex; align-items: center; justify-content: center; gap: 0.3rem; }
        .tl-xp-value { font-size: 0.85rem; font-weight: 800; color: var(--text-secondary); }
        .tl-progress { display: flex; flex-direction: column; gap: 0.3rem; }
        .tl-progress-bar { height: 5px; background: var(--surface-2); border-radius: 4px; overflow: hidden; }
        .tl-progress-fill { height: 100%; background: var(--orange); border-radius: 4px; transition: width 0.4s ease; }
        .tl-progress-label { font-size: 0.62rem; font-weight: 600; color: var(--text-muted); text-align: center; text-transform: uppercase; }
      `}</style>
    </aside>
  );
}
