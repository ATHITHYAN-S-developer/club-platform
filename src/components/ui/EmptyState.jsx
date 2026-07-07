import { memo } from 'react';

function EmptyState({ icon = 'fa-inbox', title, message, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '3rem 1.5rem', textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'var(--surface)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: '1rem',
      }}>
        <i className={`fas ${icon}`} style={{ fontSize: '1.5rem', color: 'var(--text-muted)', opacity: 0.5 }} />
      </div>
      {title && <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>{title}</h3>}
      {message && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 360 }}>{message}</p>}
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  );
}

export default memo(EmptyState);
