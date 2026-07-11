import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import db from '../db';

/* ─── Field-to-animation config ─── */
const FIELD_CONFIG = {
  name:           { icon: 'fa-solid fa-signature',      label: 'Full Name',      color: '#ff6b35', msg: 'Tell us who you are — your name is the start of your story.' },
  className:      { icon: 'fa-solid fa-graduation-cap', label: 'Your Class',     color: '#8b5cf6', msg: 'Where are you studying? Let the learning community find you!' },
  registerNumber: { icon: 'fa-solid fa-id-badge',       label: 'Register No.',   color: '#0ea5e9', msg: 'Your unique student ID — makes you official in Mindcraft.' },
  phone:          { icon: 'fa-solid fa-mobile-screen',  label: 'Phone Number',   color: '#10b981', msg: "We'll only reach out when it really matters. Promise!" },
  email:          { icon: 'fa-solid fa-envelope-open-text', label: 'Email Address', color: '#f59e0b', msg: 'Your inbox is your gateway to events, workshops, and updates.' },
  password:       { icon: 'fa-solid fa-shield-halved',  label: 'Password',       color: '#ef4444', msg: 'Make it strong — uppercase, digits, symbols. You got this.' },
  interestedArea: { icon: 'fa-solid fa-lightbulb',      label: 'Interested Area',color: '#6366f1', msg: 'NLP? Vision? RL? Shout out your AI passion and find your tribe.' },
};

/* ─── Modern card input with left icon ─── */
const CardInput = ({ type = 'text', id, placeholder, value, onChange, icon, required = false, minLength, onFocus, onBlur, children, style = {} }) => (
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
    if (onFocus) onFocus();
  }}
  onBlurCapture={e => {
    e.currentTarget.style.background = '#f3f4f6';
    e.currentTarget.style.borderColor = 'transparent';
    e.currentTarget.style.boxShadow = 'none';
    if (onBlur) onBlur();
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

export default function Signup({ user }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed]   = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [coords, setCoords]     = useState({ x: 0, y: 0 });
  const [activeField, setActiveField] = useState(null);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  const focusField  = (field) => setActiveField(field);
  const blurField   = () => setActiveField(null);

  const activeCfg = activeField ? FIELD_CONFIG[activeField] : null;

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    className: '', registerNumber: '',
    phone: '', interestedArea: '', codingStyle: '',
  });

  const params       = new URLSearchParams(location.search);
  const redirectPath = params.get('redirect') || '/';

  /* redirect if already logged in */
  useEffect(() => { if (user) navigate(redirectPath); }, [user]);

  const set = id => e => setForm(p => ({ ...p, [id]: e.target.value }));

  /* ── sign-up ── */
  const handleSignUp = async e => {
    e.preventDefault();
    if (form.password.length < 6) {
      window.showToast('Weak Password', 'At least 6 characters required.', 'warning'); return;
    }
    if (!form.codingStyle) {
      window.showToast('Missing Field', 'Please choose your coding style.', 'warning'); return;
    }
    if (!agreed) {
      window.showToast('Terms Required', 'Please agree to the Terms and Conditions.', 'warning'); return;
    }
    setLoading(true);
    try {
      await db.register(
        form.name.trim(), form.email.trim(), form.password,
        form.className.trim(), form.registerNumber.trim(),
        form.phone.trim(), form.interestedArea.trim(), form.codingStyle,
      );
      window.showToast('Welcome!', `Registered successfully, ${form.name}!`, 'success');
      setTimeout(() => navigate(redirectPath), 1000);
    } catch (err) {
      window.showToast('Signup Failed', err.message, 'error');
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
            transform: `translate(${coords.x * -0.02}px, ${coords.y * -0.02}px)`,
            transition: 'transform 0.12s ease-out',
            zIndex: 0,
            opacity: 0.95
          }} />

          {/* ── Animated Field Hint Card ── */}
          <style>{`
            @keyframes fadeSlideUp {
              from { opacity: 0; transform: translateY(20px) scale(0.95); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes pulseDot {
              0%, 100% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.3); opacity: 1; }
            }
            @keyframes emojiFloat {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-6px); }
            }
          `}</style>
          <div style={{
            position: 'relative',
            zIndex: 2,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {activeCfg ? (
              <div key={activeField} style={{
                animation: 'fadeSlideUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
                border: `1.5px solid rgba(255,255,255,0.25)`,
                borderRadius: '20px',
                padding: '1.8rem 2rem',
                textAlign: 'center',
                maxWidth: '260px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: `${activeCfg.color}22`,
                  border: `2px solid ${activeCfg.color}66`,
                  boxShadow: `0 0 24px ${activeCfg.color}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                  animation: 'emojiFloat 2s ease-in-out infinite',
                }}>
                  <i className={activeCfg.icon} style={{
                    fontSize: '1.8rem',
                    color: activeCfg.color,
                    filter: `drop-shadow(0 0 6px ${activeCfg.color})`,
                  }} />
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  marginBottom: '0.6rem',
                }}>
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: activeCfg.color,
                    animation: 'pulseDot 1.2s ease-in-out infinite',
                    display: 'inline-block',
                    boxShadow: `0 0 8px ${activeCfg.color}`,
                  }} />
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 800, color: '#fff',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>{activeCfg.label}</span>
                </div>
                <p style={{
                  fontSize: '0.83rem',
                  color: 'rgba(255,255,255,0.88)',
                  lineHeight: 1.55,
                  margin: 0,
                  fontWeight: 400,
                }}>{activeCfg.msg}</p>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.82rem',
              }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 0.7rem',
                }}>
                  <i className="fa-solid fa-arrow-pointer" style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.5)' }} />
                </div>
                <p style={{ margin: 0, fontWeight: 500 }}>Click any field to<br />see a hint here</p>
              </div>
            )}
          </div>
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
              Sign up
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Join Mindcraft AI Club. Enter your details below.
            </p>

            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Grid row 1 */}
              <div className="signup-field-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <CardInput id="name" placeholder="Full Name *" value={form.name} onChange={set('name')} icon="fa-solid fa-user" required onFocus={() => focusField('name')} onBlur={blurField} />
                <CardInput id="className" placeholder="Class *" value={form.className} onChange={set('className')} icon="fa-solid fa-chalkboard" required onFocus={() => focusField('className')} onBlur={blurField} />
              </div>

              {/* Grid row 2 */}
              <div className="signup-field-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <CardInput id="registerNumber" placeholder="Register Number *" value={form.registerNumber} onChange={set('registerNumber')} icon="fa-solid fa-id-card" required onFocus={() => focusField('registerNumber')} onBlur={blurField} />
                <CardInput type="tel" id="phone" placeholder="Phone Number *" value={form.phone} onChange={set('phone')} icon="fa-solid fa-phone" required onFocus={() => focusField('phone')} onBlur={blurField} />
              </div>

              <CardInput type="email" id="email" placeholder="Enter your email *" value={form.email} onChange={set('email')} icon="fa-solid fa-envelope" required onFocus={() => focusField('email')} onBlur={blurField} />

              {/* password row */}
              <CardInput
                type={showPw ? 'text' : 'password'}
                id="password" 
                placeholder="Choose Password *"
                value={form.password} 
                onChange={set('password')} 
                icon="fa-solid fa-lock" 
                required
                minLength={6}
                onFocus={() => focusField('password')}
                onBlur={blurField}
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

              <CardInput id="interestedArea" placeholder="Interested Area (e.g. NLP, Computer Vision)" value={form.interestedArea} onChange={set('interestedArea')} icon="fa-solid fa-brain" onFocus={() => focusField('interestedArea')} onBlur={blurField} />

              {/* vibe picker */}
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', margin: '0.4rem 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Choose Your Style *
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                  {[
                    { id: 'hard_coding', label: '💻 Hard Coding',  desc: 'Pure, manual code' },
                    { id: 'vibe_coding', label: '🎵 Vibe Coding',  desc: 'AI tools & prompts' },
                    { id: 'exploring',   label: '🔍 Exploring',    desc: 'Ideas & research' },
                    { id: 'ai_or_other', label: '🤖 AI & Tech',    desc: 'Data science & AI' },
                  ].map(opt => {
                    const sel = form.codingStyle === opt.id;
                    return (
                      <div key={opt.id} onClick={() => setForm(p => ({ ...p, codingStyle: opt.id }))} style={{
                        border: `1.5px solid ${sel ? 'var(--orange)' : '#e2e8f0'}`,
                        background: sel ? 'var(--orange-glow)' : '#fafafa',
                        borderRadius: '8px', padding: '0.4rem 0.6rem',
                        cursor: 'pointer', transition: 'all 0.18s',
                      }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: sel ? 'var(--orange)' : '#334155' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{opt.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* agree checkbox */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  style={{ accentColor: 'var(--orange)', width: '15px', height: '15px', cursor: 'pointer' }} />
                Agreed to{' '}
                <span onClick={e => { e.preventDefault(); setShowTermsModal(true); }}
                  style={{ color: 'var(--orange)', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>
                  Terms and Conditions
                </span>
              </label>

              {/* submit */}
              <button type="submit" disabled={loading} style={{
                background: 'var(--orange)', 
                color: '#fff', border: 'none', borderRadius: '8px',
                padding: '0.75rem', fontSize: '0.9rem', fontWeight: 700,
                cursor: 'pointer', width: '100%',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                marginTop: '0.3rem',
                boxShadow: 'var(--shadow-sm)'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--orange-dark)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--orange)'; e.currentTarget.style.transform = 'none'; }}
              >
                {loading ? <span className="auth-spinner" /> : 'Register'}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
                Already a member?{' '}
                <span onClick={() => navigate('/auth')}
                  style={{ color: 'var(--orange)', fontWeight: 700, cursor: 'pointer' }}>
                  Login
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* ── Terms and Conditions Modal ── */}
      {showTermsModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            background: '#fff',
            width: '100%',
            maxWidth: '500px',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '2.2rem 2rem 2rem',
            position: 'relative',
            display: 'flex', flexDirection: 'column', gap: '1.25rem',
            animation: 'modalSlideUp 0.3s ease-out-quad',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '36px', height: '36px',
                  borderRadius: '50%',
                  background: 'var(--orange-glow)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--orange)',
                }}>
                  <i className="fa-solid fa-file-shield" style={{ fontSize: '1.1rem' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Terms & Conditions
                </h3>
              </div>
              <button onClick={() => setShowTermsModal(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#94a3b8', fontSize: '1.2rem', transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#475569'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Content List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', color: '#475569', fontSize: '0.86rem', lineHeight: 1.6 }}>
              <p style={{ margin: 0, fontWeight: 500, color: '#334155' }}>
                By signing up for the Mindcraft AI Club, you acknowledge and agree to the following:
              </p>

              {/* Term 1 */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <i className="fa-solid fa-school" style={{ color: 'var(--orange)', marginTop: '0.25rem', fontSize: '0.9rem' }} />
                <div>
                  <strong style={{ color: '#1e293b', fontSize: '0.88rem' }}>College Records Sharing</strong>
                  <p style={{ margin: '0.1rem 0 0', color: '#64748b' }}>We will share your registered details and activities with the college administration for coordination and club performance tracking.</p>
                </div>
              </div>

              {/* Term 2 */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <i className="fa-solid fa-microchip" style={{ color: 'var(--orange)', marginTop: '0.25rem', fontSize: '0.9rem' }} />
                <div>
                  <strong style={{ color: '#1e293b', fontSize: '0.88rem' }}>AI Model Training</strong>
                  <p style={{ margin: '0.1rem 0 0', color: '#64748b' }}>Your submitted details and participation work may be utilized to train and fine-tune AI models developed within club projects.</p>
                </div>
              </div>

              {/* Term 3 */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <i className="fa-solid fa-paper-plane" style={{ color: 'var(--orange)', marginTop: '0.25rem', fontSize: '0.9rem' }} />
                <div>
                  <strong style={{ color: '#1e293b', fontSize: '0.88rem' }}>Email & WhatsApp Notifications</strong>
                  <p style={{ margin: '0.1rem 0 0', color: '#64748b' }}>We will send announcements, project updates, and alerts directly to your registered email and WhatsApp phone number.</p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button onClick={() => { setAgreed(true); setShowTermsModal(false); }} style={{
                flex: 1, background: 'var(--orange)', color: '#fff',
                border: 'none', borderRadius: '8px', padding: '0.65rem',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--orange-dark)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--orange)'}
              >
                Accept & Agree
              </button>
              <button onClick={() => setShowTermsModal(false)} style={{
                background: '#f1f5f9', color: '#475569',
                border: 'none', borderRadius: '8px', padding: '0.65rem 1.2rem',
                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── global styles ── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
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
          .signup-field-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
