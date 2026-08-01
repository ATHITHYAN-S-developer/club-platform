import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db';
import { normalizeDepartment } from '../utils/normalizeDepartment';
import Footer from '../components/Footer';

const MARQUEE_ITEMS = [
  '🤖 Large Language Models', '👁️ Computer Vision', '🔊 NLP & Speech AI',
  '📊 Data Science', '⚙️ MLOps', '🧠 Neural Networks',
  '🔬 Research Projects', '🏆 Weekly Sprints',
];

const ROTATING_WORDS = [
  'DEVELOPERS HUB',
  'AI INNOVATION',
  'CODING ARENA',
  'ALGORITHM LABS',
  'DATA ALCHEMY'
];

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const heroTextRef = useRef(null);
  const [heroTextVisible, setHeroTextVisible] = useState(false);
  const [winners, setWinners] = useState([]);
  const [modal, setModal] = useState({ active: false, name: '', achievement: '' });
  const [wordIndex, setWordIndex] = useState(0);
  const [terminalLines, setTerminalLines] = useState([]);

  useEffect(() => {
    const lines = [
      { text: '> Initializing AiDots...', delay: 300, type: 'cmd' },
      { text: '✔ AI Community Loaded', delay: 900, type: 'success' },
      { text: '✔ Coding Arena Ready', delay: 1500, type: 'success' },
      { text: '✔ Events Available', delay: 2100, type: 'success' },
      { text: '✔ Challenges Loaded', delay: 2700, type: 'success' },
      { text: 'Welcome Developer...', delay: 3400, type: 'welcome' }
    ];

    const timeouts = lines.map((line) => {
      return setTimeout(() => {
        setTerminalLines((prev) => [...prev, line]);
      }, line.delay);
    });

    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2500);

    return () => {
      timeouts.forEach(t => clearTimeout(t));
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHeroTextVisible(true);
        obs.disconnect();
      }
    }, { threshold: 0.05 });
    if (heroTextRef.current) obs.observe(heroTextRef.current);

    const session = db.getCurrentUser();
    setCurrentUser(session);

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

  const reveal = (vis) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'none' : 'translateY(40px)',
    transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)`,
  });

  return (
    <div className="home-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Montserrat:ital,wght@0,700;0,900;1,700;1,900&family=Muli:wght@400;600&family=Lato:wght@400;700&display=swap');
        
        .home-container {
          background-color: #ffffff;
          color: #1e293b;
          height: 100vh;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          scroll-behavior: smooth;
          font-family: 'Muli', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        
        .snap-section {
          scroll-snap-align: start;
          scroll-snap-stop: always;
          height: 100vh;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          padding-top: var(--header-height);
          background-color: #ffffff;
        }

        /* Hero styles matching screenshot */
        .hero-section {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #ffffff;
        }
        
        .shard-tl {
          position: absolute; top: 0; left: 0; width: 320px; height: 320px;
          background: linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%);
          clip-path: polygon(0 0, 100% 0, 0 100%); z-index: 0; pointer-events: none;
        }
        .shard-br {
          position: absolute; bottom: 0; right: 0; width: 450px; height: 450px;
          background: linear-gradient(315deg, var(--orange) 0%, var(--orange-light) 100%);
          clip-path: polygon(100% 100%, 100% 0, 0 100%); z-index: 0; pointer-events: none;
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
        
        .hero-split {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1200px;
          padding: 0 40px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          align-items: center;
          justify-items: center;
        }
        
        @media (min-width: 768px) {
          .hero-split {
            grid-template-columns: 1fr 1.2fr;
          }
        }
        
        .hero-left {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          z-index: 2;
        }
        
        .hero-right {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          width: 100%;
          z-index: 2;
        }
        
        .hero-welcome {
          font-family: 'Dancing Script', cursive;
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          color: var(--orange);
          font-weight: 700;
          margin-bottom: 0px;
          text-shadow: 0 0 15px rgba(255,85,0,0.15);
        }
        
        .hero-title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(2.4rem, 5vw, 4.4rem);
          font-weight: 900;
          font-style: italic;
          color: #111827;
          text-transform: uppercase;
          margin-bottom: 20px;
          line-height: 1.1;
          letter-spacing: -1px;
        }
        
        .hero-subtitle {
          font-size: clamp(0.95rem, 1.5vw, 1.1rem);
          color: #4b5563;
          line-height: 1.7;
          margin-bottom: 30px;
          max-width: 550px;
          font-weight: 400;
        }
        
        .hero-buttons {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        
        .btn-join {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: var(--orange);
          color: #ffffff !important;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 700;
          text-decoration: none !important;
          box-shadow: 0 4px 15px rgba(255, 85, 0, 0.3);
          transition: all 0.3s ease;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
        }
        
        .btn-join:hover {
          background-color: #e64d00;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 85, 0, 0.4);
        }
        
        .btn-explore {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: #f1f5f9;
          color: #334155 !important;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 700;
          text-decoration: none !important;
          border: 1px solid #cbd5e1;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          cursor: pointer;
        }
        
        .btn-explore:hover {
          background-color: #e2e8f0;
          transform: translateY(-2px);
        }

        /* About section styles */
        .about-section {
          width: 100%;
          max-width: 1100px;
          padding: 0 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .section-title {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .section-title h2 {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(1.8rem, 3.5vw, 2.5rem);
          font-weight: 700;
          color: #0f1117;
          letter-spacing: 2px;
          margin-bottom: 15px;
          text-transform: uppercase;
        }
        
        .title-underline {
          width: 80px;
          height: 4px;
          background: linear-gradient(90deg, var(--orange), #cbd5e1);
          margin: 0 auto;
          border-radius: 2px;
        }
        
        .about-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 30px;
          align-items: center;
        }
        
        @media (min-width: 768px) {
          .about-grid {
            grid-template-columns: 1.2fr 2fr;
            gap: 50px;
          }
        }
        
        .profile-wrapper {
          text-align: center;
        }
        
        .profile-image-circle {
          border: 4px solid var(--orange);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          max-width: 200px;
          width: 100%;
          height: auto;
          margin: 0 auto;
          border-radius: 50%;
          transition: transform 0.5s ease;
          background: #f8fafc;
          padding: 15px;
        }
        
        .profile-image-circle:hover {
          transform: scale(1.05) rotate(2deg);
        }
        
        .about-text {
          font-size: 1rem;
          line-height: 1.8;
          color: #475569;
          margin-bottom: 15px;
        }
        

        /* Core modules matching portfolio project style */
        .modules-section {
          width: 100%;
          max-width: 1100px;
          padding: 0 20px;
        }
        
        .project-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 12px;
          padding: 25px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
          text-decoration: none !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }
        
        .project-card:hover {
          transform: translateY(-5px);
          border-color: var(--orange);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
        }
        
        .project-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 3px;
          width: 0;
          background: var(--orange);
          transition: width 0.3s ease;
        }
        
        .project-card:hover::before {
          width: 100%;
        }
        
        .project-icon {
          font-size: 2rem;
          color: var(--orange);
          margin-bottom: 15px;
        }
        
        .project-card h3 {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f1117;
          margin-bottom: 10px;
        }
        
        .project-card p {
          color: #475569;
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 15px;
          flex-grow: 1;
        }
        
        .project-link {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--orange);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        
        /* Contact form style matching portfolio */
        .contact-section-inner {
          width: 100%;
          max-width: 600px;
          padding: 0 20px;
          margin: 0 auto;
        }
        
        .contact-form-container {
          background: #ffffff;
          padding: 30px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
        }
        
        .form-control-custom {
          width: 100%;
          background: rgba(0, 0, 0, 0.01);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 6px;
          padding: 12px 18px;
          color: #1a1a1a;
          font-family: 'Muli', sans-serif;
          transition: all 0.3s ease;
        }
        
        .form-control-custom:focus {
          outline: none;
          border-color: var(--orange);
          background: rgba(255, 85, 0, 0.01);
          box-shadow: 0 0 8px rgba(255, 85, 0, 0.1);
        }

        /* Footer snap custom styles */
        .footer-snap {
          height: auto !important;
          min-height: auto !important;
          padding: 0 !important;
          scroll-snap-align: end;
          width: 100%;
        }
      `}</style>

      {/* ── HERO SECTION ── */}
      <section className="snap-section" id="Home">
        <div className="shard-tl" />
        <div className="shard-br" />
        <div className="sphere sphere-tr" />
        <div className="sphere sphere-bl" />
        <div className="sphere sphere-br" />

        <div className="hero-split" ref={heroTextRef} style={reveal(heroTextVisible)}>
          <div className="hero-left">
            <img 
              src="/logo.png" 
              style={{ 
                width: 'clamp(240px, 35vw, 420px)', 
                height: 'auto', 
                objectFit: 'contain'
              }} 
              alt="AiDots Logo" 
            />
          </div>

          <div className="hero-right">
            <div className="hero-welcome">Welcome to</div>
            <h1 className="hero-title">
              AiDots <br /> Club
            </h1>
            <p className="hero-subtitle">
              AiDots is the premier CSE student community. From Large Language Models to Full-Stack Web Development, we build real-world systems, host bootcamps, and launch products.
            </p>
            <div className="hero-buttons">
              <a className="btn-join" href="#Contact" onClick={(e) => {
                e.preventDefault();
                document.getElementById('Contact')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Join the Club <i className="fa-solid fa-arrow-right" />
              </a>
              <a className="btn-explore" href="#Modules" onClick={(e) => {
                e.preventDefault();
                document.getElementById('Modules')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Explore Resources
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ── */}
      <section className="snap-section" id="About">
        <div className="about-section">
          <div className="section-title">
            <h2>About AiDots</h2>
            <div className="title-underline" />
          </div>
          
          <div className="about-grid">
            <div className="profile-wrapper">
              <img src="/logo.png" className="profile-image-circle" alt="AiDots Logo" />
            </div>
            
            <div>
              <p className="about-text">
                AiDots is the premier CSE student community. From Large Language Models to Full-Stack Web Development, we build real-world systems, host bootcamps, and launch products.
              </p>
              <p className="about-text">
                Always learning, always growing, and always pushing our limits to foster student technical excellence and creative innovation. Join us to collaborate, compete, and master the future of technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLUB ARENA FEATURES ── */}
      <section className="snap-section" id="Modules">
        <div className="modules-section">
          <div className="section-title">
            <h2>Explore the Arena</h2>
            <div className="title-underline" />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '24px' }}>
            {/* Coding Arena */}
            <Link to="/challenges" className="project-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', height: '170px', overflow: 'hidden' }}>
                <img
                  src="/website-html-code-browser-view-printed-white-paper-closeup-view.jpg"
                  alt="Coding Arena"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
              </div>
              <div style={{ padding: '20px 22px 22px' }}>
                <div className="project-icon"><i className="fa-solid fa-code" /></div>
                <h3>Coding Arena</h3>
                <p>Solve coding problems directly in the browser with our built-in sandboxed compiler.</p>
                <span className="project-link">Open Challenges <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
              </div>
            </Link>

            {/* Smart Quizzes */}
            <Link to="/quiz" className="project-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', height: '170px', overflow: 'hidden' }}>
                <img
                  src="/image.png"
                  alt="Smart Quizzes"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
              </div>
              <div style={{ padding: '20px 22px 22px' }}>
                <div className="project-icon"><i className="fa-solid fa-brain" /></div>
                <h3>Smart Quizzes</h3>
                <p>Test your knowledge under time constraints with full browser anti-cheat protection.</p>
                <span className="project-link">Take Quiz <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
              </div>
            </Link>

            {/* Live Rankings */}
            <Link to="/leaderboard" className="project-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', height: '170px', overflow: 'hidden' }}>
                <img
                  src="/image-copy.png"
                  alt="Live Rankings"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
              </div>
              <div style={{ padding: '20px 22px 22px' }}>
                <div className="project-icon"><i className="fa-solid fa-ranking-star" /></div>
                <h3>Live Rankings</h3>
                <p>Compete in weekly sprints, rank up on the leaderboard, and claim badges.</p>
                <span className="project-link">View Standings <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
              </div>
            </Link>

            {/* Resource Hub */}
            <Link to="/resources" className="project-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', height: '170px', overflow: 'hidden' }}>
                <img
                  src="/office-supplies-concept-with-icons-wooden-cubes-stationery-set-flat-lay.jpg"
                  alt="Resource Hub"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
              </div>
              <div style={{ padding: '20px 22px 22px' }}>
                <div className="project-icon"><i className="fa-solid fa-book" /></div>
                <h3>Resource Hub</h3>
                <p>Download workshop slides, project links, cheat sheets, and webinar recordings.</p>
                <span className="project-link">Browse Files <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
              </div>
            </Link>
          </div>
        </div>
      </section>


      {/* ── WEEKLY WINNERS ── */}
      {winners.length > 0 && (
        <section className="snap-section" id="Winners">
          <div className="modules-section">
            <div className="section-title">
              <h2>Hall of Fame</h2>
              <div className="title-underline" />
            </div>
            
            <div className="polaroid-grid">
              {winners.map((w) => (
                <div key={w.id} className="polaroid-card" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                  <div className="polaroid-photo-wrapper">
                    <img src={w.photo} alt={w.name} className="polaroid-photo" />
                  </div>
                  <h3 className="polaroid-name" style={{ fontFamily: 'var(--font-display)', color: '#0f1117' }}>{w.name}</h3>
                  <div className="polaroid-dept" style={{ color: 'var(--orange)' }}>@{normalizeDepartment(w.department)}</div>
                  <p className="polaroid-achievement" style={{ color: '#475569' }}>{w.achievement}</p>
                  {w.certificate && (
                    <button className="btn btn-outline btn-sm" onClick={() => setModal({ active: true, name: w.name, achievement: w.achievement })} style={{ borderRadius: 'var(--radius-sm)', marginTop: 'auto', fontSize: '0.78rem', padding: '0.4rem 0.9rem', borderColor: 'var(--orange)', color: 'var(--orange)' }}>
                      <i className="fa-solid fa-certificate" style={{ marginRight: '0.35rem' }} /> View Certificate
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CONTACT SECTION ── */}
      <section className="snap-section" id="Contact">
        <div className="contact-section-inner">
          <div className="section-title">
            <h2>Get In Touch</h2>
            <div className="title-underline" />
          </div>
          
          <div className="contact-form-container">
            <form onSubmit={(e) => {
              e.preventDefault();
              alert('Message sent successfully!');
              e.target.reset();
            }}>
              <div className="form-group">
                <input type="text" className="form-control-custom" placeholder="YOUR NAME" required />
              </div>
              <div className="form-group">
                <input type="email" className="form-control-custom" placeholder="YOUR EMAIL" required />
              </div>
              <div className="form-group">
                <textarea className="form-control-custom" rows="4" placeholder="YOUR MESSAGE" required style={{ resize: 'vertical' }} />
              </div>
              <button type="submit" className="scroll-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                Send Message <i className="fa-solid fa-paper-plane" style={{ marginLeft: '6px' }} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── CERTIFICATE MODAL ── */}
      {modal.active && (
        <div className="lightbox-overlay" onClick={() => setModal({ active: false, name: '', achievement: '' })} style={{ zIndex: 9999 }}>
          <div onClick={e => e.stopPropagation()} className="glass-modal" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f1117', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Certificate of Achievement</h3>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Presented to</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--orange)', fontFamily: 'var(--font-display)', marginBottom: '0.75rem' }}>{modal.name}</p>
            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5 }}>{modal.achievement}</p>
            <button className="btn btn-primary" onClick={() => setModal({ active: false, name: '', achievement: '' })} style={{ marginTop: '1.5rem', borderRadius: 'var(--radius-md)' }}>Close</button>
          </div>
        </div>
      )}

      {/* ── FOOTER SNAP SECTION ── */}
      <section className="snap-section footer-snap">
        <Footer />
      </section>
    </div>
  );
}
