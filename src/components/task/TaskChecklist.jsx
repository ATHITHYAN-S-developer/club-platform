import { useState } from 'react';

export default function TaskChecklist({ items, title = 'Requirements' }) {
  const [checked, setChecked] = useState({});

  if (!items || !items.length) return null;

  const toggle = (idx) => {
    setChecked(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const allChecked = items.length > 0 && items.every((_, i) => checked[i]);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="tcl-container">
      <div className="tcl-header">
        <span className="tcl-title"><i className="fa-solid fa-list-check" /> {title}</span>
        <span className="tcl-progress">{checkedCount}/{items.length}</span>
      </div>
      <div className="tcl-items">
        {items.map((item, idx) => (
          <label key={idx} className={`tcl-item ${checked[idx] ? 'tcl-done' : ''}`}>
            <input
              type="checkbox"
              checked={!!checked[idx]}
              onChange={() => toggle(idx)}
              className="tcl-checkbox"
            />
            <span className="tcl-text">{item}</span>
            {checked[idx] && <i className="fa-solid fa-check tcl-check-icon" />}
          </label>
        ))}
      </div>
      {allChecked && (
        <div className="tcl-all-done">
          <i className="fa-solid fa-circle-check" /> All requirements met!
        </div>
      )}

      <style>{`
        .tcl-container {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-md); overflow: hidden;
        }
        .tcl-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.75rem 1rem; border-bottom: 1px solid var(--border);
        }
        .tcl-title { font-size: 0.85rem; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 0.4rem; }
        .tcl-progress { font-size: 0.72rem; font-weight: 600; color: var(--text-muted); }
        .tcl-items { display: flex; flex-direction: column; }
        .tcl-item {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.6rem 1rem; cursor: pointer;
          transition: background 0.15s; border-bottom: 1px solid var(--border-light);
        }
        .tcl-item:last-child { border-bottom: none; }
        .tcl-item:hover { background: var(--card-hover); }
        .tcl-item.tcl-done .tcl-text { text-decoration: line-through; color: var(--text-muted); }
        .tcl-checkbox { accent-color: var(--orange); width: 16px; height: 16px; cursor: pointer; flex-shrink: 0; }
        .tcl-text { flex: 1; font-size: 0.85rem; color: var(--text); }
        .tcl-check-icon { color: #10b981; font-size: 0.75rem; flex-shrink: 0; }
        .tcl-all-done {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.65rem 1rem; background: #d1fae5; color: #065f46;
          font-size: 0.82rem; font-weight: 600;
        }
        [data-theme="dark"] .tcl-all-done { background: #064e3b; color: #a7f3d0; }
      `}</style>
    </div>
  );
}
