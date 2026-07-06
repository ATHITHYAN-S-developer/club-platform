import { useState, useRef, useEffect } from 'react';
import db from '../db';

export default function Contact() {
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const heroRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setHeroVisible(true); obs.disconnect(); }
    }, { threshold: 0.05 });
    if (heroRef.current) obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await db.insert('ContactMessages', {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        status: 'unread',
        createdAt: new Date().toISOString(),
      });
      window.showToast('Message Sent', 'Your inquiry has been successfully sent to the board.', 'success');
      setSuccess(true);
    } catch (err) {
      window.showToast('Error', err.message || 'Failed to send message.', 'error');
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' });
    setSuccess(false);
  };

  const reveal = (vis) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'none' : 'translateY(40px)',
    transition: 'opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)',
  });

  const contactItems = [
    { icon: 'fa-envelope', title: 'Email', desc: 'mindcraftaiclub@gmail.com' },
    { icon: 'fa-location-dot', title: 'Location', desc: 'CSE Department, Tech Block' },
    { icon: 'fa-clock', title: 'Club Hours', desc: 'Weekly meets every Friday, 4 PM' },
    { icon: 'fa-hashtag', title: 'Social', desc: '@mindcraft_ai (Instagram, LinkedIn)' },
  ];

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
        .rs-card {
          background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 1.5rem;
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1); box-shadow: 0 4px 16px rgba(0,0,0,0.04);
          height: 100%; position: relative; overflow: hidden;
        }
        .rs-card::before {
          content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px;
          background: linear-gradient(90deg, var(--orange), var(--orange-light));
          transform: scaleX(0); transform-origin: left; transition: transform 0.35s ease;
        }
        .rs-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(255,85,0,0.1); border-color: rgba(255,85,0,0.15); }
        .rs-card:hover::before { transform: scaleX(1); }
        .rs-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem;
          padding: 0.5rem 1.1rem; border-radius: 10px; font-size: 0.82rem; font-weight: 600;
          transition: all 0.2s ease; cursor: pointer; text-decoration: none; border: none;
        }
        .rs-btn-primary { background: var(--orange); color: #ffffff; box-shadow: 0 4px 12px rgba(255,85,0,0.3); }
        .rs-btn-primary:hover { background: var(--orange-dark); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,85,0,0.4); }
        .rs-btn-outline { background: transparent; color: #0f1117; border: 1px solid #e5e7eb; }
        .rs-btn-outline:hover { background: #f9fafb; border-color: var(--orange); color: var(--orange); }
        .form-input-c {
          width: 100%; padding: 0.65rem 0.85rem; border-radius: 10px; background: #f8f9fa;
          border: 1px solid #e5e7eb; color: #0f1117; outline: none; transition: all 0.3s ease;
          font-size: 0.88rem; font-family: inherit; box-sizing: border-box;
        }
        .form-input-c:focus { border-color: var(--orange); box-shadow: 0 0 0 3px rgba(255,85,0,0.1); }
        .form-textarea-c { resize: vertical; min-height: 100px; }
        @media (max-width: 900px) {
          .rs-hero-section { padding: 6rem 1.5rem 3rem 1.5rem !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
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
          <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.4rem', color: 'var(--orange)', margin: '0 0 0.2rem 0', lineHeight: 1.1, textShadow: '0 0 15px rgba(255,85,0,0.15)' }}>Connect With Us</p>
          <h1 style={{ fontSize: 'clamp(2.2rem,5vw,4rem)', fontFamily: 'var(--font-display)', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.02em', margin: '0 0 0.8rem 0', lineHeight: 1.05, color: '#0f1117' }}>Get in Touch</h1>
          <p style={{ fontSize: '1.02rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '640px', margin: '0 auto 1.75rem' }}>Have a question, suggestion, or collaboration idea? We'd love to hear from you.</p>
        </div>
      </section>

      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem 4rem', position: 'relative', zIndex: 2 }}>
        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="rs-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.2rem', color: '#0f1117', marginBottom: '1.5rem' }}>
              <i className="fa-solid fa-envelope" style={{ color: 'var(--orange)', marginRight: '0.5rem' }}></i> Send a Message
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#0f1117', marginBottom: '0.35rem' }} htmlFor="name">Name <span style={{ color: '#dc2626' }}>*</span></label>
                <input className="form-input-c" type="text" id="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#0f1117', marginBottom: '0.35rem' }} htmlFor="email">Email <span style={{ color: '#dc2626' }}>*</span></label>
                <input className="form-input-c" type="email" id="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#0f1117', marginBottom: '0.35rem' }} htmlFor="message">Message <span style={{ color: '#dc2626' }}>*</span></label>
                <textarea className="form-input-c form-textarea-c" id="message" rows={4} value={formData.message} onChange={handleChange} required />
              </div>
              {success ? (
                <button className="rs-btn rs-btn-outline" type="button" onClick={handleReset} style={{ width: '100%', justifyContent: 'center' }}>
                  <i className="fa-solid fa-undo"></i> Send Another
                </button>
              ) : (
                <button className="rs-btn rs-btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
                  <i className="fa-solid fa-paper-plane"></i> Send Message
                </button>
              )}
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {contactItems.map((item, i) => (
              <div key={i} className="rs-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,85,0,0.08)', border: '1px solid rgba(255,85,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: 'var(--orange)', flexShrink: 0 }}>
                  <i className={`fa-solid ${item.icon}`}></i>
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f1117' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
