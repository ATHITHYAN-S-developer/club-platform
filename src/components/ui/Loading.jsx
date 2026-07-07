import { memo } from 'react';

function Loading({ text = 'Loading...', fullPage }) {
  const content = (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '1rem', padding: '3rem',
    }}>
      <div style={{ display: 'flex', gap: '0.35rem' }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--orange)',
            animation: `lds-ellipsis 1.4s ease-in-out infinite`,
            animationDelay: `${i * 0.16}s`,
          }} />
        ))}
      </div>
      {text && <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{text}</span>}
      <style>{`
        @keyframes lds-ellipsis {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );

  if (fullPage) {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{content}</div>;
  }
  return content;
}

export default memo(Loading);
