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

  /* ── google sign-in ── */
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const r = await db.loginWithGoogle();
      window.showToast('Login Successful', `Welcome back, ${r.user.name}!`, 'success');
      setTimeout(() => navigate(redirectPath), 900);
    } catch (err) {
      if (err.message === 'NOT_REGISTERED') {
        window.showToast('Registration Required', 'Please register first before using Continue with Google.', 'error');
      } else {
        window.showToast('Authentication Failed', err.message, 'error');
      }
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
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem', fontFamily: 'var(--font-display)' }}>
              Sign in
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '2rem' }}>
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit
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

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0 1.25rem' }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>or continue with</span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              </div>

              {/* Google Button */}
              <button onClick={handleGoogleSignIn} disabled={loading} style={{
                width: '100%', padding: '0.7rem',
                border: '1.5px solid #e2e8f0', borderRadius: '8px',
                background: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                fontSize: '0.85rem', fontWeight: 600, color: '#1e293b',
                transition: 'all 0.15s'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? <span className="auth-spinner" /> : 'Continue with Google'}
              </button>
          </div>
        </div>
      </div>

      {/* ── global styles ── */}
      <style>{`
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
