import { useState, useEffect, useRef } from 'react';
import db from '../db';

export default function Members() {
  const [coreMembers, setCoreMembers] = useState([]);
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
        const list = await db.find('CoreMembers');
        setCoreMembers(list);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    })();
  }, []);

  const reveal = (vis) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'none' : 'translateY(40px)',
    transition: 'opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)',
  });

  return (
    <div className="members-page-root" style={{ background: '#ffffff', color: '#0f1117', minHeight: '100vh', overflowX: 'hidden', position: 'relative', margin: '-2.5rem -3.5rem', padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        @keyframes marquee-ltr {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .sphere {
          position: absolute; border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #ffaa66 0%, var(--orange) 60%, var(--orange-dark) 100%);
          box-shadow: inset -12px -12px 30px rgba(0,0,0,0.35), inset 8px 8px 20px rgba(255,255,255,0.25), 0 25px 50px rgba(204,68,0,0.2);
          z-index: 0; pointer-events: none;
        }
        .sphere-tr { top: -40px; right: -40px; width: clamp(120px,18vw,260px); height: clamp(120px,18vw,260px); animation: float-tr 12s ease-in-out infinite; }
        .sphere-br { bottom: 60px; right: 3%; width: clamp(80px,10vw,150px); height: clamp(80px,10vw,150px); animation: float-br 10s ease-in-out infinite; animation-delay: 1.5s; }
        .sphere-bl { bottom: -50px; left: -40px; width: clamp(100px,14vw,200px); height: clamp(100px,14vw,200px); animation: float-bl 11s ease-in-out infinite; animation-delay: 3s; }
        @keyframes float-tr { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-10px,15px) rotate(3deg); } }
        @keyframes float-br { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-15px,-10px) rotate(-3deg); } }
        @keyframes float-bl { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(15px,-15px) rotate(2deg); } }
        .rs-hero-section {
          position: relative; min-height: 70vh; display: flex; align-items: center; justify-content: center;
          padding: 7rem 3.5rem 4rem 3.5rem; overflow: hidden; background: #ffffff;
        }
        .shard-tl {
          position: absolute; top: 0; left: 0; width: 320px; height: 320px;
          background: linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%);
          clip-path: polygon(0 0, 100% 0, 0 100%); z-index: 0;
        }
        .shard-br {
          position: absolute; bottom: 0; right: 0; width: 450px; height: 450px;
          background: linear-gradient(315deg, var(--orange) 0%, var(--orange-light) 100%);
          clip-path: polygon(100% 100%, 100% 0, 0 100%); z-index: 0;
        }
        @media (max-width: 900px) {
          .members-page-root { margin: 0 !important; }
          .rs-hero-section { padding: 6rem 1.5rem 3rem 1.5rem !important; }
          .team-row-container { flex-direction: column !important; text-align: center !important; }
          .team-info-container { align-items: center !important; text-align: center !important; }
        }
        @media (max-width: 600px) {
          .rs-hero-section { padding: 5rem 1.2rem 2.5rem 1.2rem !important; min-height: auto !important; }
          .shard-tl { width: 180px !important; height: 180px !important; }
          .shard-br { width: 220px !important; height: 220px !important; }
        }
      `}</style>

      <section className="rs-hero-section">
        <div className="shard-tl" /><div className="shard-br" />
        <div className="sphere sphere-tr" /><div className="sphere sphere-br" /><div className="sphere sphere-bl" />
        <div ref={heroRef} style={{ maxWidth: '1000px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1, ...reveal(heroVisible) }}>
          <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.4rem', color: 'var(--orange)', margin: '0 0 0.2rem 0', lineHeight: 1.1, textShadow: '0 0 15px rgba(255,85,0,0.15)' }}>Meet the Team</p>
          <h1 style={{ fontSize: 'clamp(2.2rem,5vw,4rem)', fontFamily: 'var(--font-display)', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.02em', margin: '0 0 0.8rem 0', lineHeight: 1.05, color: '#0f1117' }}>Team Awesome</h1>
          <p style={{ fontSize: '1.02rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '640px', margin: '0 auto 1.75rem' }}>Meet the visionaries, engineers, and designers directing Mindcraft AI.</p>
        </div>
      </section>

      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem 4rem', position: 'relative', zIndex: 2 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
            <div className="loading-spinner" />
          </div>
        ) : coreMembers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👥</div>
            <p>No core members registered yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
            {coreMembers.map((m, i) => {
              const isEven = i % 2 === 0;
              return (
                <div key={m.id} style={{
                  display: 'flex',
                  flexDirection: isEven ? 'row' : 'row-reverse',
                  alignItems: 'center',
                  gap: '3rem',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }} className="team-row-container">
                  
                  <div style={{ position: 'relative', width: '220px', height: '260px', flexShrink: 0 }}>
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      left: isEven ? '-15px' : '15px',
                      width: '100%',
                      height: '100%',
                      background: 'var(--orange)',
                      borderRadius: '8px',
                      zIndex: 0
                    }} />
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.18)',
                      zIndex: 1,
                      background: '#f3f4f6'
                    }}>
                      <img
                        src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=ff5500&color=fff`}
                        alt={m.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                      />
                    </div>
                  </div>

                  <div style={{
                    flex: 1,
                    minWidth: '280px',
                    textAlign: isEven ? 'left' : 'right',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isEven ? 'flex-start' : 'flex-end'
                  }} className="team-info-container">
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#0f1117',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: '0.25rem',
                      fontFamily: 'var(--font-display)'
                    }}>
                      {m.name}
                    </h3>

                    <span style={{
                      fontSize: '0.9rem',
                      color: 'var(--orange)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '1rem',
                      display: 'block'
                    }}>
                      {m.role}
                    </span>

                    <p style={{
                      fontSize: '0.92rem',
                      color: '#6b7280',
                      lineHeight: 1.7,
                      marginBottom: '1.25rem',
                      maxWidth: '520px'
                    }}>
                      {m.description || `${m.name} contributes to directing technology initiatives and organizing community workshops at Mindcraft AI.`}
                    </p>

                    <div style={{
                      width: '40px',
                      height: '2px',
                      background: 'var(--orange)',
                      marginBottom: '1.25rem'
                    }} />

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {m.linkedin && (
                        <a href={m.linkedin} target="_blank" rel="noreferrer" style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: '#f3f4f6', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          color: '#6b7280', fontSize: '0.92rem',
                          transition: 'all 0.22s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--orange)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}>
                          <i className="fa-brands fa-linkedin-in"></i>
                        </a>
                      )}
                      {m.instagram && (
                        <a href={m.instagram} target="_blank" rel="noreferrer" style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: '#f3f4f6', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          color: '#6b7280', fontSize: '0.92rem',
                          transition: 'all 0.22s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--orange)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}>
                          <i className="fa-brands fa-instagram"></i>
                        </a>
                      )}
                      {m.github && (
                        <a href={m.github} target="_blank" rel="noreferrer" style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: '#f3f4f6', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          color: '#6b7280', fontSize: '0.92rem',
                          transition: 'all 0.22s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--orange)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}>
                          <i className="fa-brands fa-github"></i>
                        </a>
                      )}
                      {m.portfolio && (
                        <a href={m.portfolio} target="_blank" rel="noreferrer" style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: '#f3f4f6', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          color: '#6b7280', fontSize: '0.92rem',
                          transition: 'all 0.22s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--orange)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}>
                          <i className="fa-solid fa-globe"></i>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
