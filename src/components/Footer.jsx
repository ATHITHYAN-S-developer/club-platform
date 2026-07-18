export default function Footer() {
  return (
    <>
      <style>{`
        .site-footer {
          border-top: 1px solid var(--border-light);
          padding: 5rem 2rem 3rem;
          background: var(--bg-2);
          color: var(--text-secondary);
          font-size: 0.85rem;
        }
        .footer-main-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1.5fr;
          gap: 3rem;
          max-width: 1200px;
          margin: 0 auto 4rem;
        }
        .footer-section-title {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .footer-logo-area { display: flex; flex-direction: column; gap: 1.25rem; }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 800;
          font-size: 1.2rem;
          color: var(--text);
          font-style: italic;
        }
        .footer-social-icons { display: flex; gap: 0.8rem; margin-top: 0.5rem; }
        .footer-social-btn {
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--surface);
          border: 1px solid var(--border-light);
          color: var(--text-secondary);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease; text-decoration: none;
        }
        .footer-social-btn:hover {
          background: var(--orange); color: #fff;
          border-color: var(--orange); transform: translateY(-2px);
        }
        .footer-address { line-height: 1.7; color: var(--text-secondary); }
        .footer-link-group { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
        .footer-text-link {
          color: var(--orange); text-decoration: none; font-weight: 600;
          display: inline-flex; align-items: center; gap: 0.25rem;
          transition: color 0.2s ease;
        }
        .footer-text-link:hover { color: var(--orange-dark); text-decoration: underline; }
        .coordinators-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .coordinator-card {
          background: var(--card); border: 1px solid var(--border-light);
          border-radius: var(--radius-sm); padding: 0.85rem 1rem;
          box-shadow: var(--shadow-sm); display: flex; flex-direction: column;
          gap: 0.2rem; transition: transform 0.2s, box-shadow 0.2s;
        }
        .coordinator-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .coordinator-badge {
          align-self: flex-start; font-size: 0.62rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.05em;
          padding: 0.15rem 0.45rem; border-radius: 4px; margin-bottom: 0.2rem;
        }
        .coordinator-badge.faculty { background: rgba(255, 85, 0, 0.08); color: var(--orange); }
        .coordinator-badge.student { background: rgba(245, 158, 11, 0.08); color: #d97706; }
        .coordinator-name { font-weight: 700; color: var(--text); font-size: 0.84rem; }
        .footer-copyright {
          text-align: center; font-size: 0.78rem; color: var(--text-muted);
          border-top: 1px solid var(--border-light); padding-top: 2rem; margin-top: 2rem;
        }
        @media (max-width: 1024px) {
          .footer-main-grid { grid-template-columns: 1fr 1fr; }
          .footer-main-grid > *:last-child { grid-column: span 2; }
        }
        @media (max-width: 600px) {
          .footer-main-grid { grid-template-columns: 1fr; gap: 2rem; }
          .footer-main-grid > *:last-child { grid-column: span 1; }
          .coordinators-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <footer className="site-footer">
        <div className="footer-main-grid">
          <div className="footer-logo-area">
            <div className="footer-brand">
              <img src="/logo.png" alt="Logo" style={{ height: '26px' }} />
              <span>AiDots</span>
            </div>
            <p style={{ lineHeight: 1.6, fontSize: '0.85rem' }}>
              Organized by Department of Computer Science and Engineering at Velalar College of Engineering and Technology.
              Dedicated to fostering technical excellence and creative innovation among students nationwide.
            </p>
            <div className="footer-social-icons">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Instagram">
                <i className="fa-brands fa-instagram" />
              </a>
              <a href="https://velalarengg.ac.in" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Website">
                <i className="fa-solid fa-globe" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="footer-section-title">
              <i className="fa-solid fa-location-dot" style={{ color: 'var(--orange)' }} /> Location
            </h4>
            <div className="footer-address">
              <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>Velalar College of Engineering and Technology</p>
              <p>Thindal, Erode - 638 012</p>
              <p>Tamil Nadu, India</p>
            </div>
            <div className="footer-link-group">
              <a href="https://maps.google.com/?q=Velalar+College+of+Engineering+and+Technology" target="_blank" rel="noopener noreferrer" className="footer-text-link">
                Get Directions <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.7rem' }} />
              </a>
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Official Portal</span>
                <a href="https://www.velalarengg.ac.in/" target="_blank" rel="noopener noreferrer" className="footer-text-link" style={{ fontSize: '0.85rem' }}>
                  www.velalarengg.ac.in/
                </a>
              </div>
            </div>
          </div>
          <div>
            <h4 className="footer-section-title">
              <i className="fa-solid fa-user-gear" style={{ color: 'var(--orange)' }} /> Coordinators
            </h4>
            <div className="coordinators-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="coordinator-card">
                <span className="coordinator-badge faculty" style={{ background: 'rgba(255, 85, 0, 0.08)', color: 'var(--orange)' }}>Faculty Mentor</span>
                <span className="coordinator-name">Ms. R. VIDHYA</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Assistant Professor</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>AiDots</span>
              </div>
              <div className="coordinator-card">
                <span className="coordinator-badge faculty" style={{ background: 'rgba(255, 85, 0, 0.08)', color: 'var(--orange)' }}>Faculty Advisor</span>
                <span className="coordinator-name">Mr. V. DINESH KUMAR</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Assistant Professor</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>AiDots</span>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-copyright">
          <p style={{ margin: 0 }}>© 2026 AiDots Club. Developed by CSE Department.</p>
        </div>
      </footer>
    </>
  );
}
