import { useState } from 'react';

export default function LandingSplash({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  const handleClick = () => {
    setFadeOut(true);
    setTimeout(onComplete, 500);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#fff',
        cursor: 'pointer',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease',
      }}
    >
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'var(--orange)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2.5rem', marginBottom: '1.5rem',
        boxShadow: '0 0 40px rgba(var(--orange-rgb), 0.3)',
      }}>
        <span style={{ color: '#fff', fontWeight: 800 }}>AI</span>
      </div>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
        fontWeight: 900, color: 'var(--text)', marginBottom: '0.5rem',
      }}>
        AiDots
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Tap anywhere to continue
      </p>
    </div>
  );
}
