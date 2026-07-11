import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import db from '../db';

/* ─── Modern card input with left icon ─── */
const CardInput = ({ type = 'text', id, placeholder, value, onChange, icon, required = false, minLength, children, style = {} }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    background: '#f3f4f6',
    borderRadius: '8px',
    padding: '0.45rem 1rem',
    border: '1.5px solid transparent',
    transition: 'all 0.2s ease',
    width: '100%',
    ...style
  }}
  onFocusCapture={e => {
    e.currentTarget.style.background = '#fff';
    e.currentTarget.style.borderColor = 'var(--orange)';
    e.currentTarget.style.boxShadow = '0 0 0 4px var(--orange-glow)';
  }}
  onBlurCapture={e => {
    e.currentTarget.style.background = '#f3f4f6';
    e.currentTarget.style.borderColor = 'transparent';
    e.currentTarget.style.boxShadow = 'none';
  }}
  >
    {icon && <i className={icon} style={{ color: '#6b7280', marginRight: '0.75rem', fontSize: '0.92rem' }} />}
    <input
      type={type}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      minLength={minLength}
      style={{
        border: 'none',
        background: 'transparent',
        padding: '0.35rem 0',
        fontSize: '0.88rem',
        color: '#1e293b',
        outline: 'none',
        width: '100%',
      }}
    />
    {children}
  </div>
);

export default function Auth({ user }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed]   = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [coords, setCoords]   = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  const [form, setForm] = useState({ email: '', password: '' });

  const params       = new URLSearchParams(location.search);
  const redirectPath = params.get('redirect') || '/';

  /* redirect if already logged in */
  useEffect(() => { if (user) navigate(redirectPath); }, [user]);

  const set = id => e => setForm(p => ({ ...p, [id]: e.target.value }));

  /* ── sign-in ── */
  const handleSignIn = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await db.login(form.email.trim(), form.password);
      window.showToast('Login Successful', `Welcome back, ${r.user.name}!`, 'success');
      setTimeout(() => navigate(redirectPath), 900);
    } catch (err) {
      window.showToast('Authentication Failed', err.message, 'error');
    } finally { setLoading(false); }
  };



  /* ════════════════════════════════════════ RENDER ════════════════════════════════════════ */
  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      background: '#fff',
    }}>

      {/* ── outer card ── */}
      <div className="auth-split-card" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.25fr',
        width: '100%',
        minHeight: 'calc(100vh - 70px)',
        background: '#fff'
      }}>

        {/* ══════ LEFT — vibrant orange panel ══════ */}
        <div 
          onMouseMove={handleMouseMove}
          style={{
            background: 'linear-gradient(135deg, #ff5500 0%, #ff8833 100%)',
            padding: '3.5rem 2.8rem',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'default',
            zIndex: 1
          }}
        >
          {/* Spotlight Glow Overlay */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: `radial-gradient(circle 220px at ${coords.x}px ${coords.y}px, rgba(255, 255, 255, 0.16) 0%, transparent 80%)`,
            pointerEvents: 'none',
            zIndex: 1
          }} />

          {/* Floating Spheres with Parallax */}
          <div style={{
            position: 'absolute',
            width: '280px',
            height: '280px',
            top: '-60px',
            right: '-100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff8833 0%, #ff5500 100%)',
            boxShadow: 'inset -25px -25px 60px rgba(0,0,0,0.4), 10px 10px 40px rgba(0,0,0,0.15)',
            transform: `translate(${coords.x * -0.04}px, ${coords.y * -0.04}px)`,
            transition: 'transform 0.12s ease-out',
            zIndex: 0,
            opacity: 0.8
          }} />
          <div style={{
            position: 'absolute',
            width: '190px',
            height: '190px',
            bottom: '-40px',
            left: '-60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff5500 0%, #cc3300 100%)',
            boxShadow: 'inset -15px -15px 40px rgba(0,0,0,0.3), 10px 10px 30px rgba(0,0,0,0.1)',
            transform: `translate(${coords.x * 0.03}px, ${coords.y * 0.03}px)`,
            transition: 'transform 0.12s ease-out',
            zIndex: 0,
            opacity: 0.9
          }} />
          <div style={{
            position: 'absolute',
            width: '150px',
            height: '150px',
            bottom: '80px',
            right: '-30px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ffaa66 0%, #ff5500 100%)',
            boxShadow: 'inset -15px -15px 35px rgba(0,0,0,0.35), 5px 15px 30px rgba(0,0,0,0.15)',
            zIndex: 0,
            opacity: 0.95
          }} />
        </div>

        {/* ══════ RIGHT — white form panel ══════ */}
        <div className="auth-form-scroll" style={{
          background: '#fff',
          padding: '2.5rem 3rem 3rem 3rem',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
          minHeight: 'calc(100vh - 70px)',
        }}>

          <div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem', fontFamily: "'Dancing Script', cursive" }}>
              Sign in
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '2rem' }}>
              One community. Endless innovation.
            </p>

            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <CardInput 
                type="email" 
                id="email" 
                placeholder="User Name" 
                value={form.email} 
                onChange={set('email')} 
                icon="fa-solid fa-user" 
                required 
              />

              <CardInput
                type={showPw ? 'text' : 'password'}
                id="password" 
                placeholder="Password"
                value={form.password} 
                onChange={set('password')} 
                icon="fa-solid fa-lock" 
                required
              >
                <button 
                  type="button" 
                  onClick={() => setShowPw(p => !p)}
                  style={{ 
                    color: 'var(--orange)', 
                    fontWeight: 700, 
                    fontSize: '0.75rem', 
                    cursor: 'pointer', 
                    marginLeft: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  {showPw ? 'HIDE' : 'SHOW'}
                </button>
              </CardInput>

              {/* Remember me row */}
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', margin: '0.2rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#64748b', fontWeight: 500 }}>
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                    style={{ accentColor: 'var(--orange)', width: '15px', height: '15px', cursor: 'pointer', borderRadius: '4px' }} />
                  Remember me
                </label>
              </div>

              <button type="submit" disabled={loading} style={{
                background: 'var(--orange)', 
                color: '#fff', border: 'none', borderRadius: '8px',
                padding: '0.75rem', fontSize: '0.9rem', fontWeight: 700,
                cursor: 'pointer', width: '100%',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: 'var(--shadow-sm)'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--orange-dark)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--orange)'; e.currentTarget.style.transform = 'none'; }}
              >
                {loading
                  ? <span className="auth-spinner" />
                  : 'Sign in'
                }
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748b', marginTop: '0.75rem' }}>
                Don't have an account?{' '}
                <span onClick={() => navigate('/signup')}
                  style={{ color: 'var(--orange)', fontWeight: 700, cursor: 'pointer' }}>
                  Sign Up
                </span>
              </p>
            </form>

          </div>
        </div>
      </div>

      {/* ── global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-spinner {
          display: inline-block;
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
        }
        .auth-form-scroll::-webkit-scrollbar { width: 4px; }
        .auth-form-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 8px; }
        .auth-form-scroll::-webkit-scrollbar-thumb:hover { background: var(--orange); }
        @media (max-width: 768px) {
          .auth-split-card {
            grid-template-columns: 1fr !important;
          }
          .auth-split-card > div:first-child {
            display: none !important;
          }
          .auth-form-scroll {
            padding: 2.5rem 1.8rem !important;
          }
        }
      `}</style>
    </div>
  );
}
