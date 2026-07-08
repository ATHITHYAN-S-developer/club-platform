import { useState, useEffect } from 'react';

function getRelativeTime(isoString) {
  if (!isoString) return null;
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

const STATUS_LABELS = {
  draft: { label: 'Draft', color: '#6b7280' },
  submitted: { label: 'Submitted', color: '#f59e0b' },
  under_review: { label: 'Under Review', color: '#8b5cf6' },
  approved: { label: 'Approved ✓', color: '#10b981' },
  rejected: { label: 'Rejected ✗', color: '#ef4444' },
};

export default function TaskStatusBar({ lastSaved, isOnline, submissionStatus }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const relativeTime = getRelativeTime(lastSaved);
  const status = STATUS_LABELS[submissionStatus] || STATUS_LABELS.draft;

  return (
    <footer className="tsb-bar">
      <div className="tsb-left">
        <span className="tsb-autosave">
          <span className="tsb-pulse-dot" />
          Autosave: on
        </span>
        {relativeTime && (
          <span className="tsb-last-saved">
            Last saved: {relativeTime}
          </span>
        )}
      </div>

      <div className="tsb-right">
        <span className={`tsb-internet ${isOnline ? 'tsb-online' : 'tsb-offline'}`}>
          <span className="tsb-dot" />
          {isOnline ? 'Online' : 'Offline'}
        </span>

        {submissionStatus && (
          <span className="tsb-status" style={{ '--status-color': status.color }}>
            {status.label}
          </span>
        )}

        <span className="tsb-shortcuts">
          <kbd>Ctrl+S</kbd> Save Draft
          <kbd>Ctrl+Enter</kbd> Submit
        </span>
      </div>

      <style>{`
        .tsb-bar {
          display: flex; align-items: center; justify-content: space-between;
          height: 36px; padding: 0 0.85rem;
          background: var(--glass-bg-2); backdrop-filter: blur(10px);
          border-top: 1px solid var(--glass-border);
          font-size: 0.7rem; color: var(--text-muted);
          position: sticky; bottom: 0; z-index: 100;
          gap: 0.75rem; user-select: none;
        }
        .tsb-left, .tsb-right { display: flex; align-items: center; gap: 0.75rem; }
        .tsb-autosave { display: flex; align-items: center; gap: 0.35rem; font-weight: 600; }
        .tsb-pulse-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #10b981;
          animation: tsb-pulse 2s infinite;
        }
        @keyframes tsb-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .tsb-last-saved { color: var(--text-muted); }
        .tsb-internet { display: flex; align-items: center; gap: 0.3rem; font-weight: 600; }
        .tsb-dot { width: 5px; height: 5px; border-radius: 50%; display: inline-block; }
        .tsb-online .tsb-dot { background: #10b981; }
        .tsb-offline .tsb-dot { background: #ef4444; }
        .tsb-status {
          font-weight: 700; font-size: 0.7rem;
          color: var(--status-color, var(--text-muted));
          padding: 0.1rem 0.4rem; border-radius: 4px;
          background: color-mix(in srgb, var(--status-color, transparent) 12%, transparent);
        }
        .tsb-shortcuts { display: flex; align-items: center; gap: 0.4rem; }
        .tsb-shortcuts kbd {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 0.05rem 0.3rem; font-size: 0.6rem; font-family: inherit;
          background: var(--surface-2); border: 1px solid var(--border);
          border-radius: 4px; color: var(--text-secondary); font-weight: 600;
          min-width: 14px;
        }
        @media (max-width: 768px) {
          .tsb-last-saved, .tsb-shortcuts { display: none; }
        }
      `}</style>
    </footer>
  );
}
