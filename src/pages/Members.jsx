import { useState, useEffect, useRef } from 'react';
import db from '../db';

export default function Members() {
  const [coreMembers, setCoreMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Senior');
  const [animating, setAnimating] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
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

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedMember(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTabSwitch = (tab) => {
    if (tab === activeTab || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTimeout(() => setAnimating(false), 50);
    }, 250);
  };

  const seniors = coreMembers.filter(m => (m.category || 'Senior') === 'Senior');
  const juniors = coreMembers.filter(m => m.category === 'Junior');
  const displayMembers = activeTab === 'Senior' ? seniors : juniors;

  // Group members by role / position
  const rolePriority = (roleName) => {
    const r = (roleName || '').toLowerCase();
    if (r.includes('president') || r.includes('guildmaster') || r.includes('founder') || r.includes('chief')) return 1;
    if (r.includes('vice') || r.includes('co-') || r.includes('lead') || r.includes('strategist')) return 2;
    if (r.includes('head') || r.includes('manager') || r.includes('coordinator') || r.includes('secretary') || r.includes('treasurer')) return 3;
    if (r.includes('member') || r.includes('guildmember')) return 4;
    return 5;
  };

  const groupMembersByRole = (members) => {
    const groups = {};
    members.forEach(m => {
      const roleKey = m.role ? m.role.trim() : 'Core Member';
      if (!groups[roleKey]) groups[roleKey] = [];
      groups[roleKey].push(m);
    });

    return Object.entries(groups).sort(([roleA], [roleB]) => {
      const pA = rolePriority(roleA);
      const pB = rolePriority(roleB);
      if (pA !== pB) return pA - pB;
      return roleA.localeCompare(roleB);
    });
  };

  const groupedMembers = groupMembersByRole(displayMembers);

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
          position: relative; min-height: 55vh; display: flex; align-items: center; justify-content: center;
          padding: 6rem 3.5rem 3rem 3.5rem; overflow: hidden; background: #ffffff;
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

        /* Toggle Styles */
        .members-toggle-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 3rem;
          position: sticky;
          top: 70px;
          z-index: 10;
          padding: 0.5rem 0;
        }
        .members-toggle {
          display: flex;
          position: relative;
          background: #f3f4f6;
          border-radius: 50px;
          padding: 4px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
        }
        .members-toggle-btn {
          position: relative;
          z-index: 2;
          border: none;
          background: none;
          padding: 0.6rem 1.6rem;
          font-size: 0.88rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          color: #6b7280;
          transition: color 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-radius: 50px;
          white-space: nowrap;
          user-select: none;
        }
        .members-toggle-btn.active {
          color: #fff;
        }
        .members-toggle-btn:not(.active):hover {
          color: #374151;
        }
        .members-toggle-slider {
          position: absolute;
          top: 4px;
          height: calc(100% - 8px);
          border-radius: 50px;
          background: linear-gradient(135deg, var(--orange), #ff8c42);
          box-shadow: 0 4px 15px rgba(255, 85, 0, 0.3);
          transition: left 0.35s cubic-bezier(0.16, 1, 0.3, 1), width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1;
        }
        .members-toggle-count {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.1rem 0.45rem;
          border-radius: 20px;
          min-width: 20px;
          text-align: center;
          line-height: 1.4;
        }
        .members-toggle-btn.active .members-toggle-count {
          background: rgba(255,255,255,0.25);
          color: #fff;
        }
        .members-toggle-btn:not(.active) .members-toggle-count {
          background: #e5e7eb;
          color: #6b7280;
        }

        /* Centered Grid Card Styles */
        .centered-member-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
          max-width: 300px;
        }
        .centered-member-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 18px 40px rgba(255, 85, 0, 0.12) !important;
          border-color: rgba(255, 85, 0, 0.35) !important;
        }
        .centered-member-card:hover .member-photo-frame img {
          transform: scale(1.05);
        }
        .centered-member-card:hover .view-bio-hint {
          color: var(--orange);
          background: #fff3eb;
        }

        .member-photo-frame {
          width: 100%;
          height: 280px;
          border-radius: 14px;
          overflow: hidden;
          background: #f3f4f6;
          margin-bottom: 1.1rem;
          position: relative;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.06);
        }
        .member-photo-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          transition: transform 0.4s ease;
        }

        .view-bio-hint {
          font-size: 0.76rem;
          font-weight: 700;
          color: #6b7280;
          background: #f3f4f6;
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          margin-top: 0.85rem;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.25s ease;
        }

        .orange-social-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--orange, #ff5500);
          color: #ffffff !important;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          transition: all 0.25s ease;
          box-shadow: 0 2px 8px rgba(255, 85, 0, 0.25);
          text-decoration: none;
        }
        .orange-social-btn:hover {
          transform: translateY(-2px) scale(1.08);
          background: var(--orange-dark, #cc4400);
          box-shadow: 0 4px 14px rgba(255, 85, 0, 0.4);
        }

        /* Modal Styles */
        .member-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 17, 23, 0.75);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: fadeInOverlay 0.25s ease forwards;
        }
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .member-modal-card {
          background: #ffffff;
          border-radius: 24px;
          max-width: 680px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 60px rgba(0,0,0,0.3);
          position: relative;
          display: flex;
          flex-direction: column;
          animation: scaleUpModal 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scaleUpModal {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @media (max-width: 900px) {
          .members-page-root { margin: 0 !important; }
          .rs-hero-section { padding: 5rem 1.5rem 2.5rem 1.5rem !important; }
          .modal-content-grid { flex-direction: column !important; text-align: center !important; }
          .modal-photo-area { width: 100% !important; height: 260px !important; }
        }
        @media (max-width: 600px) {
          .rs-hero-section { padding: 4.5rem 1.2rem 2rem 1.2rem !important; min-height: auto !important; }
          .shard-tl { width: 180px !important; height: 180px !important; }
          .shard-br { width: 220px !important; height: 220px !important; }
          .members-toggle-btn { padding: 0.5rem 1.1rem; font-size: 0.82rem; }
        }
      `}</style>

      {/* Hero Header */}
      <section className="rs-hero-section">
        <div className="shard-tl" /><div className="shard-br" />
        <div className="sphere sphere-tr" /><div className="sphere sphere-br" /><div className="sphere sphere-bl" />
        <div ref={heroRef} style={{ maxWidth: '1000px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1, ...reveal(heroVisible) }}>
          <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.4rem', color: 'var(--orange)', margin: '0 0 0.2rem 0', lineHeight: 1.1, textShadow: '0 0 15px rgba(255,85,0,0.15)' }}>Meet the Team</p>
          <h1 style={{ fontSize: 'clamp(2.2rem,5vw,4rem)', fontFamily: 'var(--font-display)', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.02em', margin: '0 0 0.8rem 0', lineHeight: 1.05, color: '#0f1117' }}>Team Awesome</h1>
          <p style={{ fontSize: '1.02rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '640px', margin: '0 auto 1.75rem' }}>Meet the visionaries, engineers, and designers directing Mindcraft AI. Click on any member card to view their full bio & details.</p>
        </div>
      </section>

      {/* Main Content Area */}
      <section style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 2rem 4rem', position: 'relative', zIndex: 2 }}>
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
          <>
            {/* Toggle Tabs */}
            <div className="members-toggle-wrap">
              <div className="members-toggle" ref={el => {
                if (!el) return;
                const btns = el.querySelectorAll('.members-toggle-btn');
                const slider = el.querySelector('.members-toggle-slider');
                if (!slider || btns.length < 2) return;
                const activeBtn = activeTab === 'Senior' ? btns[0] : btns[1];
                slider.style.left = activeBtn.offsetLeft + 'px';
                slider.style.width = activeBtn.offsetWidth + 'px';
              }}>
                <div className="members-toggle-slider" />
                <button
                  className={`members-toggle-btn ${activeTab === 'Senior' ? 'active' : ''}`}
                  onClick={() => handleTabSwitch('Senior')}
                >
                  <i className="fa-solid fa-crown" style={{ fontSize: '0.82rem' }} />
                  Seniors
                  <span className="members-toggle-count">{seniors.length}</span>
                </button>
                <button
                  className={`members-toggle-btn ${activeTab === 'Junior' ? 'active' : ''}`}
                  onClick={() => handleTabSwitch('Junior')}
                >
                  <i className="fa-solid fa-rocket" style={{ fontSize: '0.82rem' }} />
                  Juniors
                  <span className="members-toggle-count">{juniors.length}</span>
                </button>
              </div>
            </div>

            {/* Position Groups */}
            <div className={`members-content-area ${animating ? 'fade-out' : 'fade-in'}`}>
              {groupedMembers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#9ca3af' }}>
                  <i className={`fa-solid ${activeTab === 'Senior' ? 'fa-crown' : 'fa-rocket'}`} style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'block', opacity: 0.3 }} />
                  <p style={{ fontSize: '1rem', fontWeight: 500 }}>No {activeTab.toLowerCase()} members yet.</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>Members can be added from the Admin panel.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4.5rem' }}>
                  {groupedMembers.map(([roleTitle, roleMembers]) => (
                    <div key={roleTitle} className="role-group-section" style={{ textAlign: 'center' }}>
                      {/* Position Title Header (Centered) */}
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.85rem',
                        marginBottom: '2.5rem',
                        paddingBottom: '0.85rem',
                        borderBottom: '2px solid #f3f4f6',
                        width: '100%',
                        maxWidth: '600px'
                      }}>
                        <div style={{
                          width: '6px',
                          height: '24px',
                          borderRadius: '4px',
                          background: 'linear-gradient(180deg, var(--orange), #ff8c42)',
                          boxShadow: '0 2px 10px rgba(255, 85, 0, 0.35)'
                        }} />
                        <h2 style={{
                          fontSize: '1.3rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: '#0f1117',
                          margin: 0,
                          fontFamily: 'var(--font-display)'
                        }}>
                          {roleTitle}
                        </h2>
                      </div>

                      {/* Centered Flexbox Cards Container */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '2rem',
                        justifyContent: 'center',
                        alignItems: 'stretch'
                      }}>
                        {roleMembers.map((m) => (
                          <div
                            key={m.id}
                            className="centered-member-card"
                            style={{ flex: '0 1 290px' }}
                            onClick={() => setSelectedMember(m)}
                          >
                            {/* Clear Portrait Image */}
                            <div className="member-photo-frame">
                              <img
                                src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=ff5500&color=fff`}
                                alt={m.name}
                              />
                            </div>

                            {/* Name */}
                            <h3 style={{
                              fontSize: '1.15rem',
                              fontWeight: 800,
                              color: '#0f1117',
                              margin: '0 0 0.25rem 0',
                              fontFamily: 'var(--font-display)',
                              lineHeight: 1.2
                            }}>
                              {m.name}
                            </h3>

                            {/* Role */}
                            <p style={{
                              fontSize: '0.86rem',
                              fontWeight: 600,
                              fontStyle: 'italic',
                              color: 'var(--orange)',
                              margin: '0 0 0.5rem 0'
                            }}>
                              {m.role}
                            </p>

                            {/* Click hint button */}
                            <div className="view-bio-hint">
                              <i className="fa-solid fa-circle-info" />
                              View Profile
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Member Details Modal */}
      {selectedMember && (
        <div
          className="member-modal-overlay"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="member-modal-card"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: (selectedMember.category || 'Senior') === 'Senior' ? '#eff6ff' : '#fffbe6',
                  color: (selectedMember.category || 'Senior') === 'Senior' ? '#1d4ed8' : '#d97706',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  border: (selectedMember.category || 'Senior') === 'Senior' ? '1px solid #bfdbfe' : '1px solid #fef08a'
                }}>
                  {selectedMember.category || 'Senior'} Member
                </span>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                style={{
                  border: 'none',
                  background: '#f3f4f6',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--orange)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}
                title="Close"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Modal Body Grid */}
            <div className="modal-content-grid" style={{ display: 'flex', gap: '2rem', padding: '2rem 1.75rem', alignItems: 'flex-start' }}>
              {/* Photo Column */}
              <div className="modal-photo-area" style={{ width: '200px', flexShrink: 0 }}>
                <div style={{
                  width: '100%',
                  height: '240px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: '#f3f4f6',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)'
                }}>
                  <img
                    src={selectedMember.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.name)}&background=ff5500&color=fff`}
                    alt={selectedMember.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                  />
                </div>
              </div>

              {/* Information Column */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#0f1117',
                  margin: '0 0 0.25rem 0',
                  fontFamily: 'var(--font-display)'
                }}>
                  {selectedMember.name}
                </h3>

                <p style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'var(--orange)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: '0 0 1.25rem 0'
                }}>
                  {selectedMember.role}
                </p>

                <div style={{ width: '40px', height: '2px', background: 'var(--orange)', marginBottom: '1.25rem' }} />

                {/* Description */}
                <p style={{
                  fontSize: '0.94rem',
                  color: '#4b5563',
                  lineHeight: 1.7,
                  marginBottom: '1.75rem'
                }}>
                  {selectedMember.description || `${selectedMember.name} contributes to directing technology initiatives and organizing community workshops at Mindcraft AI.`}
                </p>

                {/* Social & Contact Buttons */}
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                  {selectedMember.email && (
                    <a href={`mailto:${selectedMember.email}`} className="orange-social-btn" title="Send Email">
                      <i className="fa-solid fa-envelope" />
                    </a>
                  )}
                  {selectedMember.linkedin && (
                    <a href={selectedMember.linkedin} target="_blank" rel="noreferrer" className="orange-social-btn" title="LinkedIn Profile">
                      <i className="fa-brands fa-linkedin-in" />
                    </a>
                  )}
                  {selectedMember.github && (
                    <a href={selectedMember.github} target="_blank" rel="noreferrer" className="orange-social-btn" title="GitHub Profile">
                      <i className="fa-brands fa-github" />
                    </a>
                  )}
                  {selectedMember.instagram && (
                    <a href={selectedMember.instagram} target="_blank" rel="noreferrer" className="orange-social-btn" title="Instagram Profile">
                      <i className="fa-brands fa-instagram" />
                    </a>
                  )}
                  {selectedMember.portfolio && (
                    <a href={selectedMember.portfolio} target="_blank" rel="noreferrer" className="orange-social-btn" title="Portfolio Website">
                      <i className="fa-solid fa-globe" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
