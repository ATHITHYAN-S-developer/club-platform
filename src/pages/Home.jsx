import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import db from '../db';

const MARQUEE_ITEMS = [
  '🤖 Large Language Models', '👁️ Computer Vision', '🔊 NLP & Speech AI',
  '📊 Data Science', '⚙️ MLOps', '🧠 Neural Networks',
  '🔬 Research Projects', '🏆 Weekly Sprints',
];

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const heroTextRef = useRef(null);
  const [heroTextVisible, setHeroTextVisible] = useState(false);
  const [winners, setWinners] = useState([]);
  const [modal, setModal] = useState({ active: false, name: '', achievement: '' });

  useEffect(() => {
    // Simple intersection observer for hero entry
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHeroTextVisible(true);
        obs.disconnect();
      }
    }, { threshold: 0.05 });
    if (heroTextRef.current) obs.observe(heroTextRef.current);

    // Fetch current user session
    const session = db.getCurrentUser();
    setCurrentUser(session);

    // Fetch weekly winners
    (async () => {
      try {
        const list = await db.find('WeeklyWinners');
        setWinners(list);
      } catch (err) {
        console.error('Error loading weekly winners:', err);
      }
    })();

    return () => obs.disconnect();
  }, []);

  const handleLogout = () => {
    db.logout();
    setCurrentUser(null);
    window.showToast('Logged Out', 'Successfully logged out.', 'info');
  };

  const reveal = (vis) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'none' : 'translateY(40px)',
    transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)`,
  });

  return (
    <div style={{ background: '#ffffff', color: '#0f1117', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        @keyframes marquee-ltr { 
          from { transform: translateX(0); } 
          to { transform: translateX(-50%); } 
        }
        .landing-header-link {
          color: rgba(15, 17, 23, 0.7);
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 600;
          transition: all 0.2s ease;
          position: relative;
          padding: 0.25rem 0;
        }
        .landing-header-link:hover {
          color: var(--orange);
        }
        .landing-header-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: var(--orange);
          transition: width 0.2s ease;
        }
        .landing-header-link:hover::after {
          width: 100%;
        }

        .sphere {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #ffaa66 0%, var(--orange) 60%, var(--orange-dark) 100%);
          box-shadow: inset -12px -12px 30px rgba(0, 0, 0, 0.35), 
                      inset 8px 8px 20px rgba(255, 255, 255, 0.25), 
                      0 25px 50px rgba(204, 68, 0, 0.2);
          z-index: 0;
          pointer-events: none;
        }

        .sphere-tr {
          top: -40px;
          right: -40px;
          width: clamp(120px, 18vw, 260px);
          height: clamp(120px, 18vw, 260px);
          animation: float-tr 12s ease-in-out infinite;
        }

        .sphere-br {
          bottom: 60px;
          right: 3%;
          width: clamp(80px, 10vw, 150px);
          height: clamp(80px, 10vw, 150px);
          animation: float-br 10s ease-in-out infinite;
          animation-delay: 1.5s;
        }

        .sphere-bl {
          bottom: -50px;
          left: -40px;
          width: clamp(100px, 14vw, 200px);
          height: clamp(100px, 14vw, 200px);
          animation: float-bl 11s ease-in-out infinite;
          animation-delay: 3s;
        }

        @keyframes float-tr {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-10px, 15px) rotate(3deg); }
        }
        @keyframes float-br {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-15px, -10px) rotate(-3deg); }
        }
        @keyframes float-bl {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(15px, -15px) rotate(2deg); }
        }

        /* ── RESPONSIVE CLASSES ── */
        .hero-section-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5rem 3.5rem 3.5rem 3.5rem;
          overflow: hidden;
          background: #ffffff;
        }
        .shard-tl {
          position: absolute; top: 0; left: 0;
          width: 320px; height: 320px;
          background: linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%);
          clip-path: polygon(0 0, 100% 0, 0 100%);
          z-index: 0;
        }
        .shard-br {
          position: absolute; bottom: 0; right: 0;
          width: 450px; height: 450px;
          background: linear-gradient(315deg, var(--orange) 0%, var(--orange-light) 100%);
          clip-path: polygon(100% 100%, 100% 0, 0 100%);
          z-index: 0;
        }
        .hero-logo-circle {
          border-radius: 50%;
          width: 360px;
          height: 360px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 20px;
          box-sizing: border-box;
          background: #000000;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
          position: relative;
          z-index: 1;
        }
        .hero-logo-img {
          width: 280px;
          height: 280px;
          object-fit: contain;
        }
        .hero-text-col {
          flex: 1.1;
          text-align: left;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .hero-cursive-tag {
          font-family: 'Dancing Script', cursive;
          font-size: 2.8rem;
          color: var(--orange);
          margin: 0 0 0.2rem 0;
          line-height: 1.1;
          text-shadow: 0 0 15px rgba(255, 85, 0, 0.15);
        }
        .hero-buttons-container {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        @media (max-width: 900px) {
          .hero-split-container {
            flex-direction: column !important;
            text-align: center !important;
            gap: 2.5rem !important;
            padding: 0 1rem !important;
          }
          .hero-split-container > div {
            align-items: center !important;
            text-align: center !important;
          }
          .hero-text-col {
            align-items: center !important;
            text-align: center !important;
          }
          .hero-buttons-container {
            justify-content: center !important;
          }
        }

        @media (max-width: 600px) {
          .hero-section-container {
            padding: 6.5rem 1.5rem 4rem 1.5rem !important;
            min-height: auto !important;
          }
          .shard-tl {
            width: 180px !important;
            height: 180px !important;
          }
          .shard-br {
            width: 220px !important;
            height: 220px !important;
          }
          .hero-logo-circle {
            width: 260px !important;
            height: 260px !important;
          }
          .hero-logo-img {
            width: 190px !important;
            height: 190px !important;
          }
          .hero-cursive-tag {
            font-size: 2rem !important;
          }
        }

        /* ── WEEKLY WINNERS SECTION ── */
        .celebration-section {
          background: radial-gradient(circle at center, rgba(255, 85, 0, 0.04) 0%, rgba(255, 255, 255, 1) 75%);
          padding: 6rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid var(--border-light);
        }

        .celebration-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.76rem;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--orange);
          background: rgba(255, 85, 0, 0.08);
          padding: 0.45rem 1.1rem;
          border-radius: 50px;
          margin-bottom: 1.25rem;
        }

        .polaroid-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 3rem;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
          justify-content: center;
        }

        .polaroid-card {
          background: #ffffff;
          border: 1px solid var(--border-light);
          padding: 1.25rem 1.25rem 2.2rem 1.25rem;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.06);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          width: 290px;
        }

        .polaroid-card:hover {
          transform: translateY(-12px) rotate(0deg) scale(1.03) !important;
          box-shadow: 0 25px 45px rgba(255, 85, 0, 0.12);
          border-color: rgba(255, 85, 0, 0.2);
          z-index: 5;
        }

        .polaroid-card:nth-child(even) {
          transform: rotate(2deg);
        }

        .polaroid-card:nth-child(odd) {
          transform: rotate(-2deg);
        }

        .polaroid-photo-wrapper {
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: var(--surface);
          border: 1px solid var(--border-light);
          margin-bottom: 1.25rem;
          position: relative;
        }

        .polaroid-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .polaroid-card:hover .polaroid-photo {
          transform: scale(1.05);
        }

        .polaroid-name {
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          font-size: 1.1rem;
          color: #0f1117;
          margin-bottom: 0.35rem;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .polaroid-dept {
          font-size: 0.74rem;
          color: var(--orange);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.6rem;
        }

        .polaroid-achievement {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1.25rem;
          min-height: 50px;
        }

        /* ── SYNERGIA FOOTER STYLES ── */

      `}</style>

      {/* ── HERO SECTION ── */}
      <section className="hero-section-container">
        {/* Geometric shards */}
        <div className="shard-tl" />
        <div className="shard-br" />

        {/* Floating 3D Spheres */}
        <div className="sphere sphere-tr" />
        <div className="sphere sphere-br" />
        <div className="sphere sphere-bl" />

        {/* 50/50 Split Screen Layout Container */}
        <div ref={heroTextRef} style={{
          maxWidth: '1200px', width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '3rem',
          position: 'relative', zIndex: 1, ...reveal(heroTextVisible)
        }} className="hero-split-container">
          
          {/* LEFT SIDE: Stable Brain Logo inside black circle */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            {/* Circle logo wrapper */}
            <div className="hero-logo-circle">
              {/* Logo Image */}
              <img src="/logo.png" alt="Mindcraft AI Logo" className="hero-logo-img" />
            </div>
          </div>

          {/* RIGHT SIDE: Wordings */}
          <div className="hero-text-col">
            {/* Tagline Cursive tag */}
            <p className="hero-cursive-tag">
              Welcome to
            </p>

            {/* Main Title (bold, uppercase, italicized) */}
            <h1 style={{
              fontSize: 'clamp(2.4rem, 5.2vw, 4.5rem)',
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              margin: '0 0 0.8rem 0',
              lineHeight: 1.05,
              color: '#0f1117',
            }}>
              Mindcraft AI Club
            </h1>

            <p style={{
              fontSize: '1.02rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
              marginBottom: '1.75rem',
              maxWidth: '540px',
              margin: '0 0 1.75rem 0'
            }}>
              Mindcraft AI is the premier CSE student community. From Large Language Models to Computer Vision, we build real-world systems, host bootcamps, and launch products.
            </p>

            {/* Buttons */}
            <div className="hero-buttons-container">
              <Link to="/signup" className="btn btn-primary" style={{ borderRadius: 12, padding: '0.8rem 2.2rem', fontSize: '0.95rem' }}>
                Join the Club <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.45rem' }} />
              </Link>
              <Link to="/resources" className="btn btn-secondary" style={{ borderRadius: 12, padding: '0.8rem 2.2rem', fontSize: '0.95rem', color: 'var(--text)', border: '1px solid var(--border)' }}>
                Explore Resources
              </Link>
            </div>
          </div>
        </div>

        {/* Slider dots indicator bottom left */}
        <div style={{
          position: 'absolute', bottom: '2.5rem', left: '3.5rem',
          display: 'flex', gap: '0.6rem', zIndex: 10
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--orange)' }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(15,17,23,0.3)' }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(15,17,23,0.3)' }} />
        </div>

        {/* Social media links bottom right (floating above the orange shard) */}
        <div style={{
          position: 'absolute', bottom: '2.5rem', right: '3.5rem',
          display: 'flex', gap: '1.25rem', zIndex: 10, fontSize: '0.95rem'
        }}>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#0f1117'} onMouseLeave={e => e.currentTarget.style.color = '#fff'}>
            <i className="fa-brands fa-github" />
          </a>
          <a href="https://www.linkedin.com/company/mindcraft-ai-vcet" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#0f1117'} onMouseLeave={e => e.currentTarget.style.color = '#fff'}>
            <i className="fa-brands fa-linkedin" />
          </a>
          <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#0f1117'} onMouseLeave={e => e.currentTarget.style.color = '#fff'}>
            <i className="fa-brands fa-whatsapp" />
          </a>
        </div>
      </section>

      {/* ── MARQUEE TRANSITION ── */}
      <div style={{
        overflow: 'hidden', padding: '1.25rem 0',
        borderTop: '1px solid var(--border-light)',
        borderBottom: '1px solid var(--border-light)',
        background: 'rgba(255, 85, 0, 0.02)',
      }}>
        <div style={{ display: 'flex', gap: '3.5rem', animation: 'marquee-ltr 30s linear infinite', width: 'max-content' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              {item} <span style={{ color: 'var(--orange)', opacity: 0.6 }}>•</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── WEEKLY WINNERS SECTION ── */}
      {winners.length > 0 && (
        <section className="celebration-section">
          {/* Confetti or decorative particles */}
          <div style={{ position: 'absolute', top: '10%', left: '5%', opacity: 0.15, fontSize: '2rem' }}>✨</div>
          <div style={{ position: 'absolute', top: '15%', right: '8%', opacity: 0.15, fontSize: '2.5rem' }}>🎉</div>
          <div style={{ position: 'absolute', bottom: '15%', left: '10%', opacity: 0.15, fontSize: '2.2rem' }}>🏆</div>
          <div style={{ position: 'absolute', bottom: '10%', right: '7%', opacity: 0.15, fontSize: '1.8rem' }}>💫</div>

          <div className="celebration-title-wrap">
            <span className="celebration-badge">
              <i className="fa-solid fa-trophy" /> Hall of Fame
            </span>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 900,
              fontFamily: 'var(--font-display)',
              color: 'var(--text)',
              marginBottom: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.01em',
            }}>
              Congratulations to All Winners!
            </h2>
            <p style={{
              fontSize: '0.94rem',
              color: 'var(--text-secondary)',
              maxWidth: '560px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}>
              Celebrating the brilliant minds who topped our weekly coding challenges and sprint competitions.
            </p>
          </div>

          <div className="polaroid-grid">
            {winners.map((w) => (
              <div key={w.id} className="polaroid-card">
                {/* Decorative Tape on Polaroid */}
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  width: '60px',
                  height: '20px',
                  background: 'rgba(255, 85, 0, 0.15)',
                  backdropFilter: 'blur(2px)',
                  transform: 'rotate(-3deg)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                  border: '1px dashed rgba(255, 85, 0, 0.2)'
                }} />

                <div className="polaroid-photo-wrapper">
                  <img src={w.photo} alt={w.name} className="polaroid-photo" />
                </div>
                <h3 className="polaroid-name">{w.name}</h3>
                <div className="polaroid-dept">@{w.department}</div>
                <p className="polaroid-achievement">{w.achievement}</p>
                
                {w.certificate && (
                  <button className="btn btn-outline btn-sm" onClick={() => setModal({ active: true, name: w.name, achievement: w.achievement })} style={{ borderRadius: 'var(--radius-sm)', marginTop: 'auto', fontSize: '0.78rem', padding: '0.4rem 0.9rem' }}>
                    <i className="fa-solid fa-certificate" style={{ marginRight: '0.35rem' }} /> View Certificate
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── LIGHTBOX OVERLAY FOR CERTIFICATE ── */}
      {modal.active && (
        <div className="lightbox-overlay" onClick={() => setModal({ active: false, name: '', achievement: '' })} style={{ zIndex: 9999 }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 'var(--radius-lg)',
            padding: '2.5rem', maxWidth: 420, width: '90%', textAlign: 'center',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Certificate of Achievement</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Presented to</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--orange)', fontFamily: 'var(--font-display)', marginBottom: '0.75rem' }}>{modal.name}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{modal.achievement}</p>
            <button className="btn btn-primary" onClick={() => setModal({ active: false, name: '', achievement: '' })} style={{ marginTop: '1.5rem', borderRadius: 'var(--radius-md)' }}>Close</button>
          </div>
        </div>
      )}


    </div>
  );
}
