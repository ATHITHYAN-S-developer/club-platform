import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

function CountdownTimer({ dueDate, dueTime }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    if (!dueDate) { setRemaining(''); return; }
    const due = new Date(dueDate + 'T' + (dueTime || '23:59'));

    const tick = () => {
      const diff = due - Date.now();
      if (diff <= 0) { setRemaining('Overdue'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0) setRemaining(`${d}d ${h}h ${m}m`);
      else setRemaining(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dueDate, dueTime]);

  if (!remaining) return null;
  const isOverdue = remaining === 'Overdue';
  const isWarning = !isOverdue && remaining.includes(':') && parseInt(remaining.split(':')[0]) < 1;

  return (
    <span className={`tb-timer ${isOverdue ? 'tb-overdue' : isWarning ? 'tb-warning' : ''}`}>
      <i className="fa-regular fa-clock" />
      {isOverdue ? ' Overdue' : ` ${remaining}`}
    </span>
  );
}

export default function TaskTopBar({
  task, user, onSubmit, isSubmitting,
  leftOpen, rightOpen, onToggleLeft, onToggleRight,
  onDraftStatus,
}) {
  const { theme, toggleTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const submitBtnRef = useRef(null);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const handleSubmitClick = () => {
    if (isSubmitting) return;
    setShowSubmitModal(true);
  };

  const confirmSubmit = () => {
    setShowSubmitModal(false);
    if (onSubmit) onSubmit();
  };

  return (
    <header className="task-topbar">
      <div className="tb-left">
        <button className="tb-toggle-btn" onClick={onToggleLeft} title={leftOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
          <i className={`fa-solid ${leftOpen ? 'fa-bars-staggered' : 'fa-bars'}`} />
        </button>

        <div className="tb-brand">
          <span className="tb-logo">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="var(--orange)" />
              <path d="M10 20L16 10L22 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="tb-brand-text">MindCraft AI</span>
        </div>

        {task && (
          <>
            <span className="tb-divider" />
            <span className="tb-task-name">{task.title}</span>
            {task.category && <span className="tb-category-badge">{task.category}</span>}
          </>
        )}
      </div>

      <div className="tb-right">
        {user && (
          <div className="tb-user-info">
            <span className="tb-user-name">{user.name}</span>
            <span className="tb-user-dept">{user.department || ''}</span>
          </div>
        )}

        {task?.dueDate && <CountdownTimer dueDate={task.dueDate} dueTime={task.dueTime} />}

        <span className={`tb-online-dot ${isOnline ? 'tb-online' : 'tb-offline'}`} title={isOnline ? 'Online' : 'Offline'}>
          <span className="tb-dot" />
          <span className="tb-online-label">{isOnline ? 'Online' : 'Offline'}</span>
        </span>

        <div className="tb-draft-status" id="tb-draft-status">
          {onDraftStatus || ''}
        </div>

        <button className="tb-theme-btn" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`} />
        </button>

        {onSubmit && (
          <button
            ref={submitBtnRef}
            className="tb-submit-btn"
            onClick={handleSubmitClick}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><i className="fa-solid fa-spinner fa-spin" /> Submitting</>
            ) : (
              <><i className="fa-solid fa-paper-plane" /> Submit</>
            )}
          </button>
        )}

        <button className="tb-toggle-btn tb-toggle-right" onClick={onToggleRight} title={rightOpen ? 'Collapse panel' : 'Expand panel'}>
          <i className={`fa-solid ${rightOpen ? 'fa-chevron-right' : 'fa-chevron-left'}`} />
        </button>
      </div>

      {showSubmitModal && (
        <div className="tb-modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="tb-modal" onClick={e => e.stopPropagation()}>
            <h3>Submit Task</h3>
            <p>Are you sure you want to submit <strong>{task?.title}</strong>?</p>
            <p className="tb-modal-hint">Make sure all fields are filled correctly before submitting.</p>
            <div className="tb-modal-actions">
              <button className="tb-modal-cancel" onClick={() => setShowSubmitModal(false)}>Cancel</button>
              <button className="tb-modal-confirm" onClick={confirmSubmit}>
                <i className="fa-solid fa-paper-plane" /> Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .task-topbar {
          display: flex; align-items: center; justify-content: space-between;
          height: 56px; padding: 0 0.75rem;
          background: var(--glass-bg); backdrop-filter: blur(var(--glass-blur));
          border-bottom: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          position: sticky; top: 0; z-index: 100;
          gap: 0.5rem; user-select: none;
        }
        .tb-left, .tb-right { display: flex; align-items: center; gap: 0.5rem; }
        .tb-toggle-btn {
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          border: none; background: transparent; color: var(--text-secondary);
          border-radius: 8px; cursor: pointer; font-size: 0.9rem;
          transition: all var(--transition);
        }
        .tb-toggle-btn:hover { background: var(--surface); color: var(--text); }
        .tb-brand { display: flex; align-items: center; gap: 0.45rem; }
        .tb-logo { display: flex; align-items: center; }
        .tb-brand-text { font-weight: 800; font-size: 0.85rem; color: var(--text); }
        .tb-divider { width: 1px; height: 20px; background: var(--border); }
        .tb-task-name { font-weight: 600; font-size: 0.85rem; color: var(--text); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tb-category-badge {
          font-size: 0.65rem; font-weight: 600; padding: 0.15rem 0.5rem;
          border-radius: 6px; background: var(--orange-glow); color: var(--orange);
          white-space: nowrap;
        }
        .tb-user-info { display: flex; flex-direction: column; line-height: 1.2; text-align: right; }
        .tb-user-name { font-size: 0.75rem; font-weight: 700; color: var(--text); }
        .tb-user-dept { font-size: 0.6rem; font-weight: 500; color: var(--text-muted); }
        .tb-timer {
          display: flex; align-items: center; gap: 0.3rem;
          font-size: 0.78rem; font-weight: 700; color: var(--text-secondary);
          font-variant-numeric: tabular-nums; padding: 0.2rem 0.5rem;
          border-radius: 6px; background: var(--surface-2);
        }
        .tb-timer.tb-warning { color: #f59e0b; background: #fef3c7; }
        .tb-timer.tb-overdue { color: #ef4444; background: #fee2e2; }
        .tb-online-dot { display: flex; align-items: center; gap: 0.3rem; font-size: 0.7rem; font-weight: 600; }
        .tb-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
        .tb-online .tb-dot { background: #10b981; box-shadow: 0 0 4px rgba(16,185,129,0.5); }
        .tb-offline .tb-dot { background: #ef4444; }
        .tb-online-label { color: var(--text-muted); }
        .tb-draft-status { font-size: 0.7rem; color: var(--text-muted); white-space: nowrap; }
        .tb-theme-btn {
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          border: none; background: transparent; color: var(--text-secondary);
          border-radius: 8px; cursor: pointer; font-size: 0.9rem;
          transition: all var(--transition);
        }
        .tb-theme-btn:hover { background: var(--surface); color: var(--text); }
        .tb-submit-btn {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.4rem 0.85rem; border: none;
          background: var(--orange); color: white;
          border-radius: 8px; font-size: 0.78rem; font-weight: 700;
          cursor: pointer; transition: all var(--transition);
        }
        .tb-submit-btn:hover { background: var(--orange-dark); box-shadow: var(--shadow-brand); }
        .tb-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
        .tb-toggle-right { margin-left: 0.25rem; }
        .tb-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center;
          z-index: 200; backdrop-filter: blur(4px);
        }
        .tb-modal {
          background: var(--card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 1.75rem; max-width: 420px; width: 90%;
          box-shadow: var(--shadow-xl);
        }
        .tb-modal h3 { font-size: 1.1rem; font-weight: 800; margin: 0 0 0.75rem; color: var(--text); }
        .tb-modal p { font-size: 0.88rem; color: var(--text-secondary); margin: 0 0 0.5rem; line-height: 1.5; }
        .tb-modal-hint { font-size: 0.78rem !important; color: var(--text-muted) !important; }
        .tb-modal-actions { display: flex; gap: 0.75rem; margin-top: 1rem; justify-content: flex-end; }
        .tb-modal-cancel {
          padding: 0.5rem 1rem; border: 1px solid var(--border); background: var(--surface);
          color: var(--text-secondary); border-radius: 10px; font-weight: 600; font-size: 0.82rem;
          cursor: pointer; transition: all var(--transition);
        }
        .tb-modal-cancel:hover { background: var(--surface-2); }
        .tb-modal-confirm {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.5rem 1rem; border: none; background: var(--orange);
          color: white; border-radius: 10px; font-weight: 700; font-size: 0.82rem;
          cursor: pointer; transition: all var(--transition);
        }
        .tb-modal-confirm:hover { background: var(--orange-dark); }
        @media (max-width: 768px) {
          .tb-brand-text, .tb-user-info, .tb-online-label, .tb-draft-status, .tb-category-badge { display: none; }
          .tb-task-name { max-width: 120px; }
        }
      `}</style>
    </header>
  );
}
