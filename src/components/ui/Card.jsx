import { memo } from 'react';

function Card({ children, header, className = '', style, hover, onClick, padding = '1.25rem' }) {
  const base = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    overflow: 'hidden',
    transition: 'all 0.28s cubic-bezier(0.16,1,0.3,1)',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  const hoverStyle = hover ? {
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    borderColor: 'rgba(255,85,0,0.2)',
  } : {};

  return (
    <div
      style={base}
      className={className}
      onClick={onClick}
      onMouseEnter={e => hover && Object.assign(e.currentTarget.style, hoverStyle)}
      onMouseLeave={e => hover && (e.currentTarget.style.boxShadow = '', e.currentTarget.style.borderColor = 'var(--border)')}
    >
      {header && (
        <div style={{
          padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)',
          fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {header}
        </div>
      )}
      <div style={{ padding }}>
        {children}
      </div>
    </div>
  );
}

export default memo(Card);
