import { Link } from 'react-router-dom';
import { TASK_TYPES, TASK_STATUSES } from '../../config/taskConfig';

const difficultyConfig = {
  easy: { label: 'Easy', color: '#10b981', bg: '#d1fae5' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fef3c7' },
  hard: { label: 'Hard', color: '#ef4444', bg: '#fee2e2' },
};

function getTimeRemaining(dueDate, dueTime) {
  const due = new Date(dueDate + 'T' + (dueTime || '23:59'));
  const now = new Date();
  const diff = due - now;
  if (diff <= 0) return 'Deadline passed';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
}

export default function TaskCard({ task, userSubmission }) {
  const typeConfig = TASK_TYPES[task.taskType];
  const statusConfig = TASK_STATUSES.find(s => s.value === task.status);
  const diff = difficultyConfig[task.difficulty] || difficultyConfig.easy;
  const timeRemaining = task.dueDate ? getTimeRemaining(task.dueDate, task.dueTime) : null;

  return (
    <Link to={`/tasks/${task.id}`} className="task-card" style={{ textDecoration: 'none' }}>
      <div className="task-card-header">
        <div className="task-type-badge" style={{ background: typeConfig ? `${typeConfig.color}15` : '#f3f4f6', color: typeConfig?.color || '#6b7280' }}>
          <i className={`fa-solid ${typeConfig?.icon || 'fa-tasks'}`} />
          <span>{typeConfig?.label || task.taskType}</span>
        </div>
        {statusConfig && (
          <span className="task-status-dot" style={{ background: statusConfig.color }} title={statusConfig.label} />
        )}
      </div>

      <h3 className="task-card-title">{task.title}</h3>

      <p className="task-card-desc">{task.description?.substring(0, 120)}{task.description?.length > 120 ? '...' : ''}</p>

      {task.tags?.length > 0 && (
        <div className="task-card-tags">
          {task.tags.slice(0, 3).map(tag => (
            <span key={tag} className="task-tag">{tag}</span>
          ))}
          {task.tags.length > 3 && <span className="task-tag">+{task.tags.length - 3}</span>}
        </div>
      )}

      <div className="task-card-meta">
        <div className="task-meta-item">
          <i className="fa-solid fa-bolt" style={{ color: diff.color }} />
          <span style={{ color: diff.color }}>{diff.label}</span>
        </div>
        <div className="task-meta-item">
          <i className="fa-solid fa-star" style={{ color: '#f59e0b' }} />
          <span>{task.xpReward} XP</span>
        </div>
        {task.estimatedTime && (
          <div className="task-meta-item">
            <i className="fa-solid fa-clock" style={{ color: '#6b7280' }} />
            <span>{task.estimatedTime}</span>
          </div>
        )}
      </div>

      {timeRemaining && (
        <div className={`task-card-deadline ${timeRemaining === 'Deadline passed' ? 'expired' : ''}`}>
          <i className="fa-solid fa-hourglass-half" />
          <span>{timeRemaining}</span>
        </div>
      )}

      <div className="task-card-footer">
        <span className="task-submissions-count">
          <i className="fa-solid fa-users" /> {task.totalSubmissions || 0} submissions
        </span>
        {userSubmission && (
          <span className={`task-user-status ${userSubmission.status}`}>
            {userSubmission.status === 'approved' ? '✅' : userSubmission.status === 'rejected' ? '❌' : '🕐'} {userSubmission.status}
          </span>
        )}
      </div>

      <style>{`
        .task-card {
          display: flex; flex-direction: column; gap: 0.75rem;
          background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;
          padding: 1.25rem; transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 4px 16px rgba(0,0,0,0.04); cursor: pointer;
          position: relative; overflow: hidden; height: 100%;
        }
        .task-card::before {
          content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px;
          background: linear-gradient(90deg, ${typeConfig?.color || '#ff5500'}, ${typeConfig?.color || 'var(--orange-light)'}dd);
          transform: scaleX(0); transform-origin: left; transition: transform 0.35s ease;
        }
        .task-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(255,85,0,0.1); border-color: rgba(255,85,0,0.15); }
        .task-card:hover::before { transform: scaleX(1); }
        .task-card-header { display: flex; align-items: center; justify-content: space-between; }
        .task-type-badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.6rem; border-radius: 8px; font-size: 0.72rem; font-weight: 600; }
        .task-status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .task-card-title { font-size: 1.05rem; font-weight: 700; color: #0f1117; margin: 0; line-height: 1.3; }
        .task-card-desc { font-size: 0.82rem; color: #6b7280; line-height: 1.6; margin: 0; }
        .task-card-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }
        .task-tag { font-size: 0.7rem; font-weight: 600; color: #6b7280; background: #f3f4f6; padding: 0.15rem 0.5rem; border-radius: 6px; }
        .task-card-meta { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: auto; }
        .task-meta-item { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.78rem; font-weight: 600; color: #374151; }
        .task-card-deadline { font-size: 0.78rem; font-weight: 600; color: #f59e0b; display: flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.6rem; background: #fefce8; border-radius: 8px; }
        .task-card-deadline.expired { color: #ef4444; background: #fef2f2; }
        .task-card-footer { display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #9ca3af; padding-top: 0.5rem; border-top: 1px solid #f3f4f6; }
        .task-user-status { font-weight: 600; text-transform: capitalize; }
        .task-user-status.approved { color: #16a34a; }
        .task-user-status.rejected { color: #dc2626; }
        .task-user-status.submitted { color: #f59e0b; }
        .task-submissions-count { display: flex; align-items: center; gap: 0.3rem; }
      `}</style>
    </Link>
  );
}
