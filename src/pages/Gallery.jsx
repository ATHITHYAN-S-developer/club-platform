import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db';
import workingUrls from '../data/working_gallery_urls.json';

const DEFAULT_CATEGORIES = ['All', 'Workshops', 'Seminars', 'Events', 'Coding Sprints'];

const CATEGORY_MAP = {
  'evt_1': 'Seminars',
  'evt_2': 'Seminars',
  'evt_3': 'Workshops',
  'evt_4': 'Events',
  'evt_5': 'Coding Sprints',
  'evt_6': 'Workshops',
  'evt_7': 'Seminars'
};

export default function Gallery() {
  const [events, setEvents] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [list, galleryItems] = await Promise.all([
          db.find('Events'),
          db.find('Gallery')
        ]);

        const eventItems = (galleryItems || []).filter(g => g.image);

        const cards = (list || []).map(evt => {
          // Snapshots from working_gallery_urls.json (legacy event1-event7)
          const eventNum = evt.id?.startsWith('evt_') ? evt.id.split('_')[1] : null;
          const folderKey = eventNum ? `event${eventNum}` : null;
          const legacySnaps = folderKey
            ? Object.entries(workingUrls || {})
                .filter(([path]) => path.startsWith(`/gallery/${folderKey}/`))
                .map(([_, url]) => url)
            : [];

          // Snapshots from Firestore Gallery collection uploaded by admin
          const adminSnaps = eventItems
            .filter(g => (g.eventId === evt.id || (g.eventTitle && evt.title && g.eventTitle.trim().toLowerCase() === evt.title.trim().toLowerCase())))
            .map(g => g.image);

          const snapshots = Array.from(new Set([...adminSnaps, ...legacySnaps]));
          const category = evt.category || CATEGORY_MAP[evt.id] || 'Events';

          return {
            ...evt,
            snapshots,
            category
          };
        }).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

        // General standalone gallery items (if any uploaded by admin without an eventId)
        const generalItems = eventItems
          .filter(g => !g.eventId && !g.eventTitle)
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        if (generalItems.length > 0) {
          cards.unshift({
            id: 'general_gallery',
            title: 'General Gallery',
            category: 'General',
            description: 'Standalone club moments, highlights and behind-the-scenes captures.',
            poster: generalItems[0].image,
            venue: 'Club MindCraft AI',
            date: new Date(generalItems[0].createdAt || Date.now()).toLocaleDateString(),
            snapshots: generalItems.map(g => g.image),
            isGeneral: true
          });
        }

        setEvents(cards);
      } catch (err) {
        console.error("Error loading gallery:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const dynamicCategories = Array.from(new Set(events.map(e => e.category).filter(Boolean)));
  const categories = [...DEFAULT_CATEGORIES];
  dynamicCategories.forEach(cat => {
    if (!categories.includes(cat)) {
      categories.push(cat);
    }
  });

  const filteredEvents = activeCategory === 'All'
    ? events
    : events.filter(evt => evt.category === activeCategory);

  return (
    <div style={{ background: '#ffffff', color: '#0f1117', minHeight: '80vh', position: 'relative' }}>
      <style>{`
        .rs-pills {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin: 1rem auto 2.5rem;
          max-width: 900px;
          padding: 0 1rem;
        }
        .rs-pill {
          padding: 0.45rem 1.15rem;
          border-radius: 50px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          color: #4b5563;
          transition: all 0.2s ease;
          white-space: nowrap;
          outline: none;
        }
        .rs-pill:hover {
          background: rgba(255, 85, 0, 0.08);
          border-color: rgba(255, 85, 0, 0.25);
          color: var(--orange, #ff5500);
        }
        .rs-pill.active {
          background: var(--orange, #ff5500);
          border-color: var(--orange, #ff5500);
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(255, 85, 0, 0.35);
        }
        .rs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 0.5rem 4rem;
        }
        .rs-card {
          position: relative;
          aspect-ratio: 3 / 4;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
          cursor: pointer;
          background: #ffffff;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease;
        }
        .rs-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12), 0 0 24px rgba(255, 85, 0, 0.12);
          border-color: rgba(255, 85, 0, 0.25);
        }
        .rs-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .rs-card:hover .rs-card-img {
          transform: scale(1.05);
        }
        .rs-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.94) 0%, rgba(0, 0, 0, 0.65) 45%, rgba(0, 0, 0, 0.15) 75%, transparent 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 1.6rem;
          opacity: 0;
          transform: translateY(16px);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }
        .rs-card:hover .rs-card-overlay {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .rs-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.7rem;
          border-radius: 50px;
          font-size: 0.72rem;
          font-weight: 700;
          background: #ea580c;
          color: #ffffff;
          align-self: flex-start;
          margin-bottom: 0.6rem;
          letter-spacing: 0.02em;
          box-shadow: 0 2px 8px rgba(234, 88, 12, 0.3);
        }
        .rs-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.68rem 1.2rem;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 700;
          transition: all 0.2s ease;
          cursor: pointer;
          text-decoration: none;
          border: none;
        }
        .rs-btn-primary {
          background: linear-gradient(135deg, #ff5500 0%, #ff7700 100%);
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(255, 85, 0, 0.4);
        }
        .rs-btn-primary:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(255, 85, 0, 0.5);
        }
        .fs-overlay {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: #ffffff;
          overflow-y: auto;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
        }
        .fs-back {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--orange, #ff5500);
          font-weight: 700;
          font-size: 0.9rem;
          margin-bottom: 2rem;
          cursor: pointer;
          transition: transform 0.2s ease;
          border: none;
          background: none;
          padding: 0;
          align-self: flex-start;
        }
        .fs-back:hover {
          transform: translateX(-4px);
        }
        .fs-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-top: 2rem;
          padding-bottom: 4rem;
        }
        .fs-card {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          cursor: zoom-in;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          height: 250px;
          position: relative;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fs-card.span-2 {
          grid-column: span 2;
        }
        .fs-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(255, 85, 0, 0.1);
          border-color: rgba(255, 85, 0, 0.15);
        }
        .fs-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.2) 50%, transparent 100%);
          display: flex;
          align-items: flex-end;
          padding: 1.25rem;
          transition: all 0.3s ease;
          pointer-events: none;
        }
        .fs-label {
          color: #ffffff;
          font-weight: 700;
          font-size: 0.88rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .lb-overlay {
          position: fixed;
          inset: 0;
          z-index: 3000;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: zoom-out;
        }
        .lb-close {
          position: absolute;
          top: -3rem;
          right: 0;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #fff;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-size: 1.2rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .lb-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        @media (max-width: 1024px) {
          .fs-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
          .rs-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
        }
        @media (max-width: 640px) {
          .fs-grid { grid-template-columns: 1fr; }
          .fs-card.span-2 { grid-column: span 1; }
          .rs-grid { grid-template-columns: 1fr; }
          .lb-close { top: 1rem !important; right: 1rem !important; background: rgba(0,0,0,0.5); }
        }
      `}</style>

      {/* Categories Filter Bar */}
      <div className="rs-pills">
        {categories.map(cat => (
          <button
            key={cat}
            className={`rs-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid or Loading/Empty state */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
          <div className="loading-spinner" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 1rem', color: '#9ca3af' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📸</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f1117' }}>No events found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.35rem' }}>No events in the "{activeCategory}" category.</p>
        </div>
      ) : (
        <motion.div
          className="rs-grid"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
        >
          {filteredEvents.map((evt) => (
            <motion.div
              key={evt.id}
              className="rs-card"
              variants={{
                hidden: { opacity: 0, y: 35, scale: 0.97 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
              }}
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              onClick={() => setSelectedEvent(evt)}
            >
              <img
                src={evt.poster || evt.snapshots?.[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                alt={evt.title}
                className="rs-card-img"
              />
              <div className="rs-card-overlay">
                <span className="rs-badge">{evt.category}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25, marginBottom: '0.45rem', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
                  {evt.title}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '1.2rem', fontWeight: 500 }}>
                  <span>📍 {evt.venue ? evt.venue.split('(')[0].replace(/\s+/g, ' ').trim() : 'Campus'}</span>
                  <span>{evt.date || ''}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(evt);
                  }}
                  className="rs-btn rs-btn-primary"
                  style={{ width: '100%' }}
                >
                  <i className="fa-solid fa-camera" /> View Snaps ({evt.snapshots?.length || 0})
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Full Screen Snaps Viewer Overlay */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            className="fs-overlay"
            initial={{ opacity: 0, y: '30px' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '30px' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <button className="fs-back" onClick={() => setSelectedEvent(null)}>
              <i className="fa-solid fa-arrow-left" /> Back to Gallery
            </button>
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--orange, #ff5500)' }}>
                Viewing Event Snaps
              </span>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem', color: '#0f1117', fontFamily: 'var(--font-display, inherit)', letterSpacing: '-0.02em' }}>
                {selectedEvent.title}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem', fontWeight: 500 }}>
                {selectedEvent.venue && <span>📍 Venue: {selectedEvent.venue}</span>}
                {selectedEvent.date && <span>🕐 Date: {selectedEvent.date}</span>}
                <span>📸 Snapshots: {selectedEvent.snapshots?.length || 0} items</span>
              </div>
              {selectedEvent.description && (
                <p style={{ fontSize: '0.95rem', color: '#6b7280', marginTop: '1rem', lineHeight: 1.65, maxWidth: '800px' }}>
                  {selectedEvent.description}
                </p>
              )}
            </div>

            {selectedEvent.snapshots && selectedEvent.snapshots.length > 0 ? (
              (() => {
                const displayedSnaps = selectedEvent.snapshots;
                return (
                  <motion.div
                    className="fs-grid"
                    initial="hidden"
                    animate="visible"
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
                  >
                    {displayedSnaps.map((url, idx) => {
                      const isSpan2 = idx % 6 === 1 || idx % 6 === 3;
                      return (
                        <motion.div
                          key={idx}
                          className={`fs-card ${isSpan2 ? 'span-2' : ''}`}
                          variants={{ hidden: { opacity: 0, y: 30, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }}
                          onClick={() => setLightboxUrl(url)}
                        >
                          <img
                            src={url}
                            alt="Event snapshot memory"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          />
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

      {/* Lightbox Zoom Viewer */}
      <AnimatePresence>
        {lightboxUrl && (
          <div className="lb-overlay" onClick={() => setLightboxUrl(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              style={{ position: 'relative' }}
              onClick={e => e.stopPropagation()}
            >
              <button className="lb-close" onClick={() => setLightboxUrl(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
              <img
                src={lightboxUrl}
                alt="High Res Snapshot"
                style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: 12, boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
