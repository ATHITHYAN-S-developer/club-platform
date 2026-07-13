import { memo, useMemo } from 'react';

const chipBase = {
  border: '1px solid var(--border)',
  borderRadius: 20,
  padding: '0.35rem 0.75rem',
  fontSize: '0.74rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s',
  fontFamily: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  minHeight: 34,
};

function ColumnSelector({ columns, selected, search, onSearchChange, onToggle, onSelectAll, onDeselectAll }) {
  const groups = useMemo(() => {
    const map = {};
    columns.forEach(col => {
      if (search && !col.label.toLowerCase().includes(search.toLowerCase())) return;
      if (!map[col.group]) map[col.group] = [];
      map[col.group].push(col);
    });
    return map;
  }, [columns, search]);

  const filteredCount = useMemo(() => {
    return Object.values(groups).reduce((sum, g) => sum + g.length, 0);
  }, [groups]);

  return (
    <div role="group" aria-label="Select export columns" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Columns
        </span>
        <div style={{ position: 'relative', flex: 1, minWidth: 160, maxWidth: 260 }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.7rem' }} />
          <input
            className="form-input"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search columns..."
            aria-label="Search columns"
            style={{ paddingLeft: '1.8rem', paddingBlock: '0.35rem', fontSize: '0.78rem', width: '100%' }}
          />
        </div>
        <button onClick={onSelectAll} aria-label="Select all columns" style={{ background: 'none', border: 'none', color: 'var(--orange)', fontSize: '0.72rem', fontWeight: 650, cursor: 'pointer', fontFamily: 'inherit' }}>
          Select All
        </button>
        <span style={{ color: 'var(--border)' }}>|</span>
        <button onClick={onDeselectAll} aria-label="Deselect all columns" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 650, cursor: 'pointer', fontFamily: 'inherit' }}>
          Deselect All
        </button>
      </div>

      {filteredCount === 0 && (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
          No columns match your search.
        </span>
      )}

      {Object.entries(groups).map(([groupLabel, groupCols]) => (
        <div key={groupLabel} style={{ marginBottom: '0.25rem' }}>
          <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem', opacity: 0.7 }}>
            {groupLabel}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {groupCols.map(col => {
              const isActive = selected.has(col.key);
              return (
                <button
                  key={col.key}
                  onClick={() => onToggle(col.key)}
                  aria-pressed={isActive}
                  aria-label={col.label}
                  style={{
                    ...chipBase,
                    background: isActive ? 'rgba(255,85,0,0.1)' : 'var(--surface)',
                    color: isActive ? 'var(--orange)' : 'var(--text-secondary)',
                    borderColor: isActive ? 'var(--orange)' : 'var(--border)',
                  }}
                >
                  <i className={`fas ${isActive ? 'fa-check-square' : 'fa-square'}`} style={{ fontSize: '0.68rem' }} />
                  {col.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(ColumnSelector);
