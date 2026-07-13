import { memo } from 'react';

const pillStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 20,
  padding: '0.2rem 0.6rem',
  fontSize: '0.7rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
};

function FilterSummary({ filters }) {
  const hasStatus = filters?.statusFilter && filters.statusFilter !== 'All';
  const hasSearch = !!filters?.search;
  const hasAny = hasStatus || hasSearch;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        Filters:
      </span>
      {hasAny ? (
        <>
          {hasStatus && (
            <span style={pillStyle}>
              <i className="fas fa-tag" style={{ fontSize: '0.6rem' }} />
              Status: {filters.statusFilter}
            </span>
          )}
          {hasSearch && (
            <span style={pillStyle}>
              <i className="fas fa-search" style={{ fontSize: '0.6rem' }} />
              Search: &ldquo;{filters.search}&rdquo;
            </span>
          )}
        </>
      ) : (
        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          No filters applied.
        </span>
      )}
    </div>
  );
}

export default memo(FilterSummary);
