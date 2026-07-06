import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db';

function EventCountdown({ targetStr }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const targetDate = new Date(targetStr).getTime();
    const calculateTime = () => {
      const now = Date.now();
      const diff = targetDate - now;
      if (diff <= 0) { setTimeLeft(null); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds, isCritical: diff < (1000 * 60 * 60 * 24) });
    };
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetStr]);

  if (!timeLeft) return <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.82rem' }}>Started ✓</span>;

  return (
    <div style={{ display: 'flex', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 700 }}>
      {timeLeft.days > 0 && <span style={{ background: '#f3f4f6', padding: '0.15rem 0.4rem', borderRadius: 4, color: '#0f1117' }}>{timeLeft.days}d</span>}
      <span style={{ background: timeLeft.isCritical ? '#fef2f2' : '#f3f4f6', padding: '0.15rem 0.4rem', borderRadius: 4, color: timeLeft.isCritical ? '#dc2626' : '#0f1117' }}>{timeLeft.hours}h</span>
      <span style={{ background: '#f3f4f6', padding: '0.15rem 0.4rem', borderRadius: 4, color: '#0f1117' }}>{timeLeft.minutes}m</span>
      <span style={{ background: '#f3f4f6', padding: '0.15rem 0.4rem', borderRadius: 4, color: '#0f1117' }}>{timeLeft.seconds}s</span>
    </div>
  );
}

const CATEGORY_MAP = {
  'evt_1': 'Seminars', 'evt_2': 'Seminars', 'evt_3': 'Workshops',
  'evt_4': 'Events', 'evt_5': 'Coding Sprints', 'evt_6': 'Workshops', 'evt_7': 'Seminars'
};

const CATEGORIES = ['All', 'Seminars', 'Workshops', 'Events', 'Coding Sprints'];

export default function Events({ user }) {
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
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
        const list = await db.find('Events');
        const listWithCategories = list.map(evt => ({
          ...evt,
          category: CATEGORY_MAP[evt.id] || 'Events'
        }));
        setAllEvents(listWithCategories);
      } catch (err) {
        console.error("Error loading events:", err);
      } finally { setLoading(false); }
    })();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const sortedEvents = [...allEvents].sort((a, b) => new Date(b.date) - new Date(a.date));
  const filteredEvents = activeCategory === 'All'
    ? sortedEvents
    : sortedEvents.filter(evt => evt.category === activeCategory);

  const handleRegister = async (e, eventId) => {
    e.stopPropagation();
    if (!user) return navigate(`/auth?redirect=/events`);
    try {
      const evt = allEvents.find(e => e.id === eventId);
      if (evt.registeredUsers?.includes(user.id)) {
        window.showToast('Already Registered', 'You are already on the list for this event.', 'info');
        return;
      }
      const updated = [...(evt.registeredUsers || []), user.id];
      await db.update('Events', eventId, { registeredUsers: updated });
      setAllEvents(prev => prev.map(e => e.id === eventId ? { ...e, registeredUsers: updated } : e));
      window.showToast('Registered!', 'You have been registered for this event.', 'success');
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

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
        .rs-pill {
          padding: 0.4rem 0.85rem; border-radius: 50px; font-size: 0.78rem; font-weight: 600;
          cursor: pointer; background: #f3f4f6; border: 1px solid #e5e7eb; color: #6b7280;
          transition: all 0.2s ease; white-space: nowrap;
        }
        .rs-pill:hover { background: rgba(255,85,0,0.08); border-color: rgba(255,85,0,0.2); color: var(--orange); }
        .rs-pill.active { background: var(--orange); border-color: var(--orange); color: #ffffff; box-shadow: 0 4px 12px rgba(255,85,0,0.3); }
        .rs-card {
          background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1); box-shadow: 0 4px 16px rgba(0,0,0,0.04);
          position: relative; cursor: pointer; aspect-ratio: 3/4;
        }
        .rs-card:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 12px 32px rgba(255,85,0,0.1); border-color: rgba(255,85,0,0.15); }
        .rs-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .rs-card:hover .rs-card-img { transform: scale(1.05); }
        .rs-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0) 100%);
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 2.5rem 1.5rem 1.5rem; opacity: 0; transform: translateY(20px);
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1); pointer-events: none;
        }
        .rs-card:hover .rs-card-overlay { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .rs-badge {
          display: inline-flex; align-items: center; padding: 0.25rem 0.6rem; border-radius: 50px;
          font-size: 0.65rem; font-weight: 600;
          background: rgba(255,85,0,0.06); border: 1px solid rgba(255,85,0,0.12); color: var(--orange);
          align-self: flex-start; margin-bottom: 0.75rem;
        }
        .rs-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem;
          padding: 0.5rem 1.1rem; border-radius: 10px; font-size: 0.82rem; font-weight: 600;
          transition: all 0.2s ease; cursor: pointer; text-decoration: none; border: none;
        }
        .rs-btn-primary { background: var(--orange); color: #ffffff; box-shadow: 0 4px 12px rgba(255,85,0,0.3); }
        .rs-btn-primary:hover { background: var(--orange-dark); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,85,0,0.4); }
        .rs-btn-outline { background: transparent; color: #0f1117; border: 1px solid #e5e7eb; }
        .rs-btn-outline:hover { background: #f9fafb; border-color: var(--orange); color: var(--orange); }
        .rs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 2rem; margin-top: 2.5rem; }
        .rs-pills { display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap; margin: 3rem auto 1rem; max-width: 800px; padding: 0 1rem; }
        @media (max-width: 900px) {
          .rs-hero-section { padding: 6rem 1.5rem 3rem 1.5rem !important; }
          .rs-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
        }
        @media (max-width: 600px) {
          .rs-hero-section { padding: 5rem 1.2rem 2.5rem 1.2rem !important; min-height: auto !important; }
          .shard-tl { width: 180px !important; height: 180px !important; }
          .shard-br { width: 220px !important; height: 220px !important; }
          .rs-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="rs-hero-section">
        <div className="shard-tl" /><div className="shard-br" />
        <div className="sphere sphere-tr" /><div className="sphere sphere-br" /><div className="sphere sphere-bl" />
        <div ref={heroRef} style={{ maxWidth: '1000px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1, ...reveal(heroVisible) }}>
          <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.4rem', color: 'var(--orange)', margin: '0 0 0.2rem 0', lineHeight: 1.1, textShadow: '0 0 15px rgba(255,85,0,0.15)' }}>Stay Updated</p>
          <h1 style={{ fontSize: 'clamp(2.2rem,5vw,4rem)', fontFamily: 'var(--font-display)', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.02em', margin: '0 0 0.8rem 0', lineHeight: 1.05, color: '#0f1117' }}>Events & Workshops</h1>
          <p style={{ fontSize: '1.02rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '640px', margin: '0 auto 1.75rem' }}>Stay updated with our workshops, seminars, coding sprints, and challenges throughout the year.</p>
        </div>
      </section>

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 4rem', position: 'relative', zIndex: 2 }}>
        <div className="rs-pills">
          {CATEGORIES.map(cat => (
            <button key={cat} className={`rs-pill ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="loading-spinner" /></div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 3rem', color: '#6b7280' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>📅</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f1117', margin: '0 0 0.25rem' }}>No Events Scheduled</h3>
            <p style={{ fontSize: '0.88rem' }}>There are currently no scheduled events in this category.</p>
          </div>
        ) : (
          <motion.div className="rs-grid" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}>
            <AnimatePresence>
              {filteredEvents.map((evt) => {
                const isUpcoming = evt.date >= today;
                const isRegistered = evt.registeredUsers?.includes(user?.id);
                return (
                  <motion.div key={evt.id} className="rs-card"
                    variants={{ hidden: { opacity: 0, y: 35, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } } }}
                    whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
                    <img src={evt.poster} alt={evt.title} className="rs-card-img" />
                    <div className="rs-card-overlay">
                      <span className="rs-badge">{evt.category}</span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25, marginBottom: '0.4rem', letterSpacing: '-0.01em' }}>{evt.title}</h3>
                      <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{evt.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem', fontWeight: 500 }}>
                        <span>📍 {evt.venue.split('(')[0].trim()}</span>
                        <span>🕐 {evt.date}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {isUpcoming ? (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Starts in:</span>
                              <EventCountdown targetStr={`${evt.date}T${evt.time || '00:00'}`} />
                            </div>
                            <button onClick={(e) => handleRegister(e, evt.id)} className="rs-btn rs-btn-primary" style={{ width: '100%' }}>
                              <i className={isRegistered ? "fa-solid fa-circle-check" : "fa-solid fa-user-plus"}></i> {isRegistered ? 'Registered ✓' : 'Register Now'}
                            </button>
                          </>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>Past event</span>
                            <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', padding: '0.4rem 0.8rem', borderRadius: 10 }}>Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  );
}
