import { useState, useEffect, useRef } from 'react';
import db from '../db';

function starPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 5; i++) {
    const a1 = (i * 72 - 90) * Math.PI / 180;
    const a2 = a1 + 36 * Math.PI / 180;
    pts.push(`${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)}`);
    pts.push(`${cx + r * 0.38 * Math.cos(a2)},${cy + r * 0.38 * Math.sin(a2)}`);
  }
  return pts.join(' ');
}

function AwardEmblem({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: 'block', margin: '0 auto' }}>
      <defs>
        <clipPath id="emblemCircle">
          <circle cx="100" cy="100" r="100" />
        </clipPath>
      </defs>

      <g clipPath="url(#emblemCircle)">
        {Array.from({ length: 16 }).map((_, i) => (
          <polygon
            key={i}
            points="100,100 199,79 199,121"
            fill={i % 2 === 0 ? '#ff5500' : '#e5e7eb'}
            opacity="0.12"
            transform={`rotate(${i * 22.5}, 100, 100)`}
          />
        ))}
      </g>

      <circle cx="100" cy="100" r="100" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />

      <circle cx="100" cy="100" r="82" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.5" />

      <circle cx="100" cy="100" r="78" fill="none" stroke="#ff5500" strokeWidth="1.5" opacity="0.25" />

      <circle cx="100" cy="100" r="50" fill="none" stroke="#ff5500" strokeWidth="0.5" opacity="0.15" />

      {Array.from({ length: 20 }).map((_, i) => {
        const angle = i * 18;
        const rad = angle * Math.PI / 180;
        const lx = 100 + 72 * Math.cos(rad);
        const ly = 100 + 72 * Math.sin(rad);
        const dir = i % 2 === 0 ? angle : angle + 180;
        return (
          <ellipse
            key={i}
            cx={lx} cy={ly}
            rx="7" ry="2.5"
            fill="#ff5500"
            opacity="0.65"
            transform={`rotate(${dir}, ${lx}, ${ly})`}
          />
        );
      })}

      <rect x="60" y="62" width="80" height="32" rx="4" fill="none" stroke="#ff5500" strokeWidth="1.5" opacity="0.4" />
      <text x="100" y="84" textAnchor="middle" fontFamily="'Segoe UI', Arial, sans-serif" fontSize="16" fontWeight="800" fill="#ff5500" letterSpacing="4">MC</text>

      {Array.from({ length: 7 }).map((_, i) => {
        const angle = (i - 3) * 18;
        const rad = angle * Math.PI / 180;
        const sx = 100 + 42 * Math.sin(rad);
        const sy = 115 + 42 * (1 - Math.cos(rad));
        return (
          <polygon
            key={i}
            points={starPoints(sx, sy, 4)}
            fill="#ff5500"
          />
        );
      })}

      <text x="100" y="155" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontSize="11" fill="#6b7280" letterSpacing="1.5">
        Mindcraft AI
      </text>

      <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(255,85,0,0.15)" strokeWidth="2" />
    </svg>
  );
}

export default function Winners() {
  const [winners, setWinners] = useState([]);
  const [modal, setModal] = useState({ active: false, name: '', achievement: '' });
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setHeroVisible(true); obs.disconnect(); }
    }, { threshold: 0.05 });
    if (heroRef.current) obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const list = await db.find('WeeklyWinners');
        setWinners(list);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  const openCert = (name, achievement) => setModal({ active: true, name, achievement });
  const closeCert = () => setModal({ active: false, name: '', achievement: '' });

  const reveal = (vis) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'none' : 'translateY(40px)',
    transition: 'opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)',
  });

  return (
    <div style={{ background: '#ffffff', color: '#0f1117', minHeight: '100vh', overflowX: 'hidden', position: 'relative', margin: '-2.5rem -3.5rem', padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        @keyframes marquee-ltr {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .sphere { position: absolute; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #ffaa66 0%, var(--orange) 60%, var(--orange-dark) 100%); box-shadow: inset -12px -12px 30px rgba(0,0,0,0.35), inset 8px 8px 20px rgba(255,255,255,0.25), 0 25px 50px rgba(204,68,0,0.2); z-index: 0; pointer-events: none; }
        .sphere-tr { top: -40px; right: -40px; width: clamp(120px,18vw,260px); height: clamp(120px,18vw,260px); animation: float-tr 12s ease-in-out infinite; }
        .sphere-br { bottom: 60px; right: 3%; width: clamp(80px,10vw,150px); height: clamp(80px,10vw,150px); animation: float-br 10s ease-in-out infinite; animation-delay: 1.5s; }
        .sphere-bl { bottom: -50px; left: -40px; width: clamp(100px,14vw,200px); height: clamp(100px,14vw,200px); animation: float-bl 11s ease-in-out infinite; animation-delay: 3s; }
        @keyframes float-tr { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-10px,15px) rotate(3deg); } }
        @keyframes float-br { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-15px,-10px) rotate(-3deg); } }
        @keyframes float-bl { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(15px,-15px) rotate(2deg); } }
        .rs-hero-section { position: relative; min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 7rem 3.5rem 4rem 3.5rem; overflow: hidden; background: #ffffff; }
        .shard-tl { position: absolute; top: 0; left: 0; width: 320px; height: 320px; background: linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%); clip-path: polygon(0 0, 100% 0, 0 100%); z-index: 0; }
        .shard-br { position: absolute; bottom: 0; right: 0; width: 450px; height: 450px; background: linear-gradient(315deg, var(--orange) 0%, var(--orange-light) 100%); clip-path: polygon(100% 100%, 100% 0, 0 100%); z-index: 0; }
        .rs-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 1.5rem; transition: all 0.35s cubic-bezier(0.16,1,0.3,1); box-shadow: 0 4px 16px rgba(0,0,0,0.04); height: 100%; position: relative; overflow: hidden; text-align: center; }
        .rs-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, var(--orange), var(--orange-light)); transform: scaleX(0); transform-origin: left; transition: transform 0.35s ease; }
        .rs-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(255,85,0,0.1); border-color: rgba(255,85,0,0.15); }
        .rs-card:hover::before { transform: scaleX(1); }
        .rs-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem; padding: 0.5rem 1.1rem; border-radius: 10px; font-size: 0.82rem; font-weight: 600; transition: all 0.2s ease; cursor: pointer; text-decoration: none; border: none; }
        .rs-btn-primary { background: var(--orange); color: #ffffff; box-shadow: 0 4px 12px rgba(255,85,0,0.3); }
        .rs-btn-primary:hover { background: var(--orange-dark); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,85,0,0.4); }
        .rs-btn-outline { background: transparent; color: #0f1117; border: 1px solid #e5e7eb; }
        .rs-btn-outline:hover { background: #f9fafb; border-color: var(--orange); color: var(--orange); }
        .rs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; margin-top: 1.25rem; }
        .w-photo { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(255,85,0,0.2); margin-bottom: 0.75rem; box-shadow: 0 0 20px rgba(255,85,0,0.15); }
        .cert-overlay { position: fixed; inset: 0; z-index: 3000; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .cert-modal { background: #ffffff; border-radius: 16px; padding: 2.5rem; max-width: 420px; width: 90%; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.2); cursor: default; }
        @media (max-width: 900px) { .rs-hero-section { padding: 6rem 1.5rem 3rem 1.5rem !important; } }
        @media (max-width: 600px) { .rs-hero-section { padding: 5rem 1.2rem 2.5rem 1.2rem !important; min-height: auto !important; } .shard-tl { width: 180px !important; height: 180px !important; } .shard-br { width: 220px !important; height: 220px !important; } .rs-grid { grid-template-columns: 1fr; } }
      `}</style>

      <section className="rs-hero-section">
        <div className="shard-tl" /><div className="shard-br" />
        <div className="sphere sphere-tr" /><div className="sphere sphere-br" /><div className="sphere sphere-bl" />
        <div ref={heroRef} style={{ maxWidth: '1000px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1, ...reveal(heroVisible) }}>
          <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.4rem', color: 'var(--orange)', margin: '0 0 0.2rem 0', lineHeight: 1.1, textShadow: '0 0 15px rgba(255,85,0,0.15)' }}>Celebrating Excellence</p>
          <h1 style={{ fontSize: 'clamp(2.2rem,5vw,4rem)', fontFamily: 'var(--font-display)', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.02em', margin: '0 0 0.8rem 0', lineHeight: 1.05, color: '#0f1117' }}>Weekly Winners</h1>
          <p style={{ fontSize: '1.02rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '640px', margin: '0 auto 1.75rem' }}>Celebrating the top performers in our weekly coding challenges and sprint competitions.</p>
        </div>
      </section>

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 4rem', position: 'relative', zIndex: 2 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="loading-spinner" /></div>
        ) : winners.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <AwardEmblem size={80} />
            <p style={{ marginTop: '1rem' }}>No winners announced yet. Check back after the next sprint!</p>
          </div>
        ) : (
          <div className="rs-grid">
            {winners.map(w => (
              <div key={w.id} className="rs-card" style={{ padding: '2rem 1.5rem 1.5rem' }}>
                <AwardEmblem size={60} />
                <img src={w.photo} alt={w.name} className="w-photo" style={{ marginTop: '0.5rem' }} />
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f1117', marginBottom: '0.25rem' }}>{w.name}</h3>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.5, marginBottom: '1rem' }}>{w.achievement}</p>
                {w.certificate && (
                  <button className="rs-btn rs-btn-outline" onClick={() => openCert(w.name, w.achievement)}>
                    <i className="fa-solid fa-certificate"></i> View Certificate
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {modal.active && (
        <div className="cert-overlay" onClick={closeCert}>
          <div className="cert-modal" onClick={e => e.stopPropagation()}>
            <AwardEmblem size={80} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f1117', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', marginTop: '0.5rem' }}>Certificate of Achievement</h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Presented to</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--orange)', fontFamily: 'var(--font-display)', marginBottom: '0.75rem' }}>{modal.name}</p>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: 1.5 }}>{modal.achievement}</p>
            <button className="rs-btn rs-btn-primary" onClick={closeCert} style={{ marginTop: '1.5rem' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
