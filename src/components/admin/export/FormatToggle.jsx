import { memo } from 'react';

const btnBase = {
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '0.4rem 0.85rem',
  fontSize: '0.78rem',
  fontWeight: 650,
  cursor: 'pointer',
  transition: 'all 0.15s',
  fontFamily: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
};

function FormatToggle({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Export format" style={{ display: 'flex', gap: '0.4rem' }}>
      {[
        { key: 'csv', label: 'CSV', icon: 'fa-file-csv' },
        { key: 'xlsx', label: 'Excel (.xlsx)', icon: 'fa-file-excel' },
      ].map(opt => (
        <button
          key={opt.key}
          role="radio"
          aria-checked={value === opt.key}
          aria-label={opt.label}
          onClick={() => onChange(opt.key)}
          style={{
            ...btnBase,
            background: value === opt.key ? 'var(--orange)' : 'var(--surface)',
            color: value === opt.key ? '#fff' : 'var(--text-secondary)',
            borderColor: value === opt.key ? 'var(--orange)' : 'var(--border)',
          }}
        >
          <i className={`fas ${opt.icon}`} />
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default memo(FormatToggle);
