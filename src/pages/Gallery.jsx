import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db';
import workingUrls from '../../working_gallery_urls.json';

export default function Gallery() {
  const [events, setEvents] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);
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
        const EVENT_NAMES = {
          'event1': 'Mind of Machines Keynote',
          'event2': 'Data Preprocessing Seminar',
          'event3': 'n8n Workflow Automation',
          'event4': 'Plot to Bot Event',
          'event5': 'Vibe Coding Sprint',
          'event6': 'API Alchemy Workshop',
          'event7': 'DeployX Hybrid Seminar'
        };

        const list = await db.find('Events');
        
        const CATEGORIES = {
          'evt_1': 'Seminars', 'evt_2': 'Seminars', 'evt_3': 'Workshops',
          'evt_4': 'Events', 'evt_5': 'Coding Sprints', 'evt_6': 'Workshops', 'evt_7': 'Seminars'
        };

        const eventsWithSnaps = list.map(evt => {
          const eventNum = evt.id.split('_')[1];
          const folderKey = `event${eventNum}`;
          const snapshots = Object.entries(workingUrls)
            .filter(([localPath]) => localPath.startsWith(`/gallery/${folderKey}/`))
            .map(([_, supabaseUrl]) => supabaseUrl);
          return { ...evt, folderKey, snapshots, category: CATEGORIES[evt.id] || 'Events' };
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        setEvents(eventsWithSnaps);
      } catch (err) {
        console.error("Error loading gallery events:", err);
      } finally { setLoading(false); }
    })();
  }, []);

  const filteredEvents = activeCategory === 'All'
    ? events
    : events.filter(evt => evt.category === activeCategory);

  const reveal = (vis) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'none' : 'translateY(40px)',
    transition: 'opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)',
  });

  return (
    <div style={{ background: '#ffffff', color: '#0f1117', minHeight: '100vh', overflowX: 'hidden', position: 'relative', margin: '-2.5rem -3.5rem', padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        @keyframes marquee-ltr { from { transform: translateX(0); } to { transform: translateX(-50%); } }
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
        .rs-pill { padding: 0.4rem 0.85rem; border-radius: 50px; font-size: 0.78rem; font-weight: 600; cursor: pointer; background: #f3f4f6; border: 1px solid #e5e7eb; color: #6b7280; transition: all 0.2s ease; white-space: nowrap; }
        .rs-pill:hover { background: rgba(255,85,0,0.08); border-color: rgba(255,85,0,0.2); color: var(--orange); }
        .rs-pill.active { background: var(--orange); border-color: var(--orange); color: #ffffff; box-shadow: 0 4px 12px rgba(255,85,0,0.3); }
        .rs-card { position: relative; aspect-ratio: 3/4; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04); border: 1px solid #e5e7eb; cursor: pointer; background: #ffffff; transition: all 0.4s cubic-bezier(0.16,1,0.3,1); }
        .rs-card:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 12px 32px rgba(255,85,0,0.1); border-color: rgba(255,85,0,0.15); }
        .rs-card-img { width: 100%; height: 100%; object-fit: cover; transition: all 0.5s cubic-bezier(0.16,1,0.3,1); }
        .rs-card:hover .rs-card-img { transform: scale(1.05); }
        .rs-card-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0) 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: 2.5rem 1.5rem 1.5rem; opacity: 0; transform: translateY(20px); transition: all 0.4s cubic-bezier(0.16,1,0.3,1); pointer-events: none; }
        .rs-card:hover .rs-card-overlay { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .rs-badge { display: inline-flex; align-items: center; padding: 0.25rem 0.6rem; border-radius: 50px; font-size: 0.65rem; font-weight: 600; background: rgba(255,85,0,0.06); border: 1px solid rgba(255,85,0,0.12); color: var(--orange); align-self: flex-start; margin-bottom: 0.75rem; }
        .rs-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem; padding: 0.5rem 1.1rem; border-radius: 10px; font-size: 0.82rem; font-weight: 600; transition: all 0.2s ease; cursor: pointer; text-decoration: none; border: none; }
        .rs-btn-primary { background: var(--orange); color: #ffffff; box-shadow: 0 4px 12px rgba(255,85,0,0.3); }
        .rs-btn-primary:hover { background: var(--orange-dark); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,85,0,0.4); }
        .rs-btn-outline { background: transparent; color: #0f1117; border: 1px solid #e5e7eb; }
        .rs-btn-outline:hover { background: #f9fafb; border-color: var(--orange); color: var(--orange); }
        .rs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 2rem; margin-top: 2.5rem; }
        .rs-pills { display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap; margin: 3rem auto 1rem; max-width: 800px; padding: 0 1rem; }
        .fs-overlay { position: fixed; inset: 0; z-index: 2000; background: #ffffff; overflow-y: auto; padding: 2.5rem 2rem; display: flex; flex-direction: column; }
        .fs-back { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--orange); font-weight: 700; font-size: 0.9rem; margin-bottom: 2rem; cursor: pointer; transition: transform 0.2s ease; border: none; background: none; padding: 0; align-self: flex-start; }
        .fs-back:hover { transform: translateX(-4px); }
        .fs-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-top: 2rem; padding-bottom: 4rem; }
        .fs-card { border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04); cursor: zoom-in; border: 1px solid #e5e7eb; background: #ffffff; height: 250px; position: relative; transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }
        .fs-card.span-2 { grid-column: span 2; }
        .fs-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(255,85,0,0.1); border-color: rgba(255,85,0,0.15); }
        .fs-card-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 40%, transparent 100%); display: flex; align-items: flex-end; padding: 1.25rem; transition: all 0.3s ease; pointer-events: none; }
        .fs-card:hover .fs-card-overlay { background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%); }
        .fs-label { color: #ffffff; font-weight: 700; font-size: 0.88rem; letter-spacing: 0.05em; text-transform: uppercase; }
        .lb-overlay { position: fixed; inset: 0; z-index: 3000; background: rgba(0,0,0,0.95); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; cursor: zoom-out; }
        .lb-close { position: absolute; top: -3rem; right: 0; background: rgba(255,255,255,0.1); border: none; color: #fff; width: 36px; height: 36px; border-radius: 50%; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .lb-close:hover { background: rgba(255,255,255,0.2); }
        @media (max-width: 1024px) { .fs-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 900px) { .rs-hero-section { padding: 6rem 1.5rem 3rem 1.5rem !important; } .rs-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); } }
        @media (max-width: 640px) { .fs-grid { grid-template-columns: 1fr; } .fs-card.span-2 { grid-column: span 1; } }
        @media (max-width: 600px) { .rs-hero-section { padding: 5rem 1.2rem 2.5rem 1.2rem !important; min-height: auto !important; } .shard-tl { width: 180px !important; height: 180px !important; } .shard-br { width: 220px !important; height: 220px !important; } .rs-grid { grid-template-columns: 1fr; } .lb-close { top: 1rem !important; right: 1rem !important; background: rgba(0,0,0,0.5); } }
      `}</style>

      <section className="rs-hero-section">
        <div className="shard-tl" /><div className="shard-br" />
        <div className="sphere sphere-tr" /><div className="sphere sphere-br" /><div className="sphere sphere-bl" />
        <div ref={heroRef} style={{ maxWidth: '1000px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1, ...reveal(heroVisible) }}>
          <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.4rem', color: 'var(--orange)', margin: '0 0 0.2rem 0', lineHeight: 1.1, textShadow: '0 0 15px rgba(255,85,0,0.15)' }}>Captured Moments</p>
          <h1 style={{ fontSize: 'clamp(2.2rem,5vw,4rem)', fontFamily: 'var(--font-display)', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.02em', margin: '0 0 0.8rem 0', lineHeight: 1.05, color: '#0f1117' }}>Moments & Memories</h1>
          <p style={{ fontSize: '1.02rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '640px', margin: '0 auto 1.75rem' }}>Select an event poster below to view all the captured snapshots in a full-screen layout.</p>
        </div>
      </section>

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 4rem', position: 'relative', zIndex: 2 }}>
        <div className="rs-pills">
          {['All', 'Workshops', 'Seminars', 'Events', 'Coding Sprints'].map(cat => (
            <button key={cat} className={`rs-pill ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="loading-spinner" /></div>
        ) : (
          <motion.div className="rs-grid" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}>
            {filteredEvents.map((evt) => (
              <motion.div key={evt.id} className="rs-card"
                variants={{ hidden: { opacity: 0, y: 35, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } } }}
                whileInView="visible" viewport={{ once: true, margin: "-40px" }}
                onClick={() => setSelectedEvent(evt)}>
                <img src={evt.poster} alt={evt.title} className="rs-card-img" />
                <div className="rs-card-overlay">
                  <span className="rs-badge">{evt.category}</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25, marginBottom: '0.4rem', letterSpacing: '-0.01em' }}>{evt.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.25rem', fontWeight: 500 }}>
                    <span>📍 {evt.venue.split('(')[0].trim()}</span>
                    <span>🕐 {evt.date}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedEvent(evt); }} className="rs-btn rs-btn-primary" style={{ width: '100%' }}>
                    <i className="fa-solid fa-images"></i> View Snaps ({evt.snapshots?.length || 0})
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <AnimatePresence>
        {selectedEvent && (
          <motion.div className="fs-overlay"
            initial={{ opacity: 0, y: '30px' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '30px' }}
            transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}>
            <button className="fs-back" onClick={() => setSelectedEvent(null)}>
              <i className="fa-solid fa-arrow-left" /> Back to Gallery
            </button>
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--orange)' }}>Viewing Event Snaps</span>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem', color: '#0f1117', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{selectedEvent.title}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem', fontWeight: 500 }}>
                <span>📍 Venue: {selectedEvent.venue}</span>
                <span>🕐 Date: {selectedEvent.date}</span>
                <span>📸 Snapshots: {selectedEvent.snapshots?.length || 0} items</span>
              </div>
              <p style={{ fontSize: '0.95rem', color: '#6b7280', marginTop: '1rem', lineHeight: 1.65, maxWidth: '800px' }}>{selectedEvent.description}</p>
            </div>
            {selectedEvent.snapshots && selectedEvent.snapshots.length > 0 ? (
              (() => {
                const displayedSnaps = selectedEvent.snapshots;
                return (
                  <motion.div className="fs-grid" initial="hidden" animate="visible"
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}>
                    {displayedSnaps.map((url, idx) => {
                      const isSpan2 = idx % 6 === 1 || idx % 6 === 3;
                      return (
                        <motion.div key={idx} className={`fs-card ${isSpan2 ? 'span-2' : ''}`}
                          variants={{ hidden: { opacity: 0, y: 30, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16,1,0.3,1] } } }}
                          onClick={() => setLightboxUrl(url)}>
                          <img src={url} alt="Event snapshot memory" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                          <div className="fs-card-overlay">
                            <span className="fs-label">Snap #{(idx + 1).toString().padStart(2, '0')}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                );
              })()
            ) : (
              <div style={{ textAlign: 'center', padding: '6rem 0', color: '#9ca3af' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📸</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f1117' }}>No snaps found</h3>
                <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>No snapshots are currently uploaded for this event.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightboxUrl && (
          <div className="lb-overlay" onClick={() => setLightboxUrl(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              style={{ position: 'relative' }}
              onClick={e => e.stopPropagation()}>
              <button className="lb-close" onClick={() => setLightboxUrl(null)}><i className="fa-solid fa-xmark" /></button>
              <img src={lightboxUrl} alt="High Res Snapshot" style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: 12, boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
