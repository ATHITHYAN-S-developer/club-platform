import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import db from '../db';

// Simple client-side Markdown interpreter for Rich Text Announcements
function renderRichText(text) {
  if (!text) return '';
  
  // Escapes html to prevent XSS
  const div = document.createElement('div');
  div.innerText = text;
  let html = div.innerHTML;

  // Headings (e.g., ### Heading)
  html = html.replace(/^### (.*?)$/gm, '<h4 style="font-size: 1rem; font-weight: 800; margin-top: 1rem; color: var(--text);">$1</h4>');
  html = html.replace(/^## (.*?)$/gm, '<h3 style="font-size: 1.15rem; font-weight: 800; margin-top: 1.25rem; color: var(--text);">$1</h3>');
  html = html.replace(/^# (.*?)$/gm, '<h2 style="font-size: 1.35rem; font-weight: 900; margin-top: 1.5rem; color: var(--orange);">$1</h2>');

  // Bold (**text**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text);">$1</strong>');
  
  // Lists (e.g., * Item)
  html = html.replace(/^\* (.*?)$/gm, '<li style="margin-left: 1.5rem; margin-bottom: 0.35rem; font-size: 0.88rem; color: var(--text-secondary);">$1</li>');
  html = html.replace(/^- (.*?)$/gm, '<li style="margin-left: 1.5rem; margin-bottom: 0.35rem; font-size: 0.88rem; color: var(--text-secondary);">$1</li>');

  // Code Blocks (```code```)
  html = html.replace(/```([\s\S]*?)```/g, '<pre style="background: var(--surface); border: 1px solid var(--border); padding: 1rem; border-radius: 10px; font-family: monospace; font-size: 0.82rem; overflow-x: auto; color: var(--text); margin: 1rem 0;">$1</pre>');

  // External Links ([label](url))
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--orange); text-decoration: underline; font-weight: 600;">$1</a>');

  // Convert linebreaks to <br/> (except inside lists or code)
  return <div dangerouslySetInnerHTML={{ __html: html.split('\n').map(line => {
    if (line.trim().startsWith('<li') || line.trim().startsWith('<h') || line.trim().startsWith('<pre') || line.trim().startsWith('</pre')) {
      return line;
    }
    return line + '<br/>';
  }).join('') }} style={{ lineHeight: 1.6, fontSize: '0.9rem', color: 'var(--text-secondary)' }} />;
}

export default function AnnouncementDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ann, setAnn] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formValues, setFormValues] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // FAQ states
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Seat limit & calculation helpers
  const userRegistration = useMemo(() => {
    if (!user) return null;
    return registrations.find(r => r.announcementId === id && r.userId === user.id && r.status !== 'Cancelled');
  }, [registrations, user, id]);

  const stats = useMemo(() => {
    if (!ann) return { total: 0, limit: 100, remaining: 100, status: 'Open' };
    const list = registrations.filter(r => r.announcementId === id && r.status !== 'Cancelled');
    const total = list.length;
    const limit = ann.seatsLimit || 100;
    const remaining = Math.max(0, limit - total);
    
    let status = ann.eventStatus || 'Published';
    if (remaining === 0 && ann.autoCloseWhenFull) {
      status = 'Registration Closed';
    }

    return { total, limit, remaining, status };
  }, [ann, registrations, id]);

  // Load Announcement + Registrations
  useEffect(() => {
    const load = async () => {
      try {
        const item = await db.findOne('Announcements', { id });
        if (!item) {
          window.showToast('Not Found', 'Announcement does not exist.', 'error');
          navigate('/announcements');
          return;
        }

        // Parse FAQs if stringified
        if (typeof item.faqs === 'string') {
          try { item.faqs = JSON.parse(item.faqs); } catch { item.faqs = []; }
        }

        setAnn(item);

        const regs = await db.find('EventRegistrations');
        setRegistrations(regs);

        // Pre-fill student defaults if user logged in
        if (user) {
          setFormValues({
            fullName: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            college: user.college || 'VCET',
            department: user.department || '',
            year: user.year || '1',
            className: user.className || '',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!user) {
      window.showToast('Login Required', 'Please sign in to register for events.', 'warning');
      navigate(`/auth?redirect=/announcements/${id}`);
      return;
    }

    setSubmitting(true);
    try {
      const regId = 'reg_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      const isWaitlist = stats.remaining === 0;

      const record = {
        id: regId,
        announcementId: id,
        quizId: ann.id, // For backwards compatibility
        quizTitle: ann.title,
        userId: user.id,
        userEmail: user.email,
        submittedData: formValues,
        registeredAt: new Date().toISOString(),
        status: isWaitlist ? 'Waitlisted' : 'Registered',
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${regId}`,
      };

      await db.insert('EventRegistrations', record);

      // Create local user notification
      await db.insert('Notifications', {
        id: 'nt_' + Date.now(),
        userId: user.id,
        title: isWaitlist ? 'Added to Waitlist' : 'Event Registration Confirmed!',
        message: isWaitlist
          ? `You have been waitlisted for "${ann.title}". We will notify you if a slot opens up.`
          : `Your ticket for "${ann.title}" has been successfully generated.`,
        read: false,
        createdAt: new Date().toISOString(),
      });

      // Reload
      const regs = await db.find('EventRegistrations');
      setRegistrations(regs);
      setSuccessMsg(isWaitlist ? 'Waitlist Joined Successful!' : 'Registration Successful!');
      setIsEditing(false);
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDetails = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await db.update('EventRegistrations', userRegistration.id, {
        submittedData: formValues,
      });
      
      const regs = await db.find('EventRegistrations');
      setRegistrations(regs);
      window.showToast('Updated', 'Registration details updated successfully.', 'success');
      setIsEditing(false);
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!window.confirm('Are you sure you want to cancel your registration? This action is irreversible.')) return;
    setSubmitting(true);
    try {
      await db.update('EventRegistrations', userRegistration.id, {
        status: 'Cancelled',
      });

      // Create notification
      await db.insert('Notifications', {
        id: 'nt_' + Date.now(),
        userId: user.id,
        title: 'Registration Cancelled',
        message: `Your registration for "${ann.title}" has been cancelled.`,
        read: false,
        createdAt: new Date().toISOString(),
      });

      const regs = await db.find('EventRegistrations');
      setRegistrations(regs);
      window.showToast('Cancelled', 'Registration cancelled successfully.', 'info');
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = () => {
    setFormValues(userRegistration.submittedData);
    setIsEditing(true);
  };

  // Countdown timer calculations
  const countdownText = useMemo(() => {
    if (!ann?.registrationCloseDate) return null;
    const closeDate = new Date(ann.registrationCloseDate);
    const now = new Date();
    const diff = closeDate - now;

    if (diff <= 0) return 'Registration closed';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `Registration closes in ${days} day${days > 1 ? 's' : ''}`;
    return `Registration closes in ${hours} hour${hours > 1 ? 's' : ''}`;
  }, [ann]);

  if (loading || !ann) {
    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="loading-dots"><span></span><span></span><span></span></div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        
        {/* Back Link */}
        <Link to="/announcements" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.82rem', textDecoration: 'none', marginBottom: '1.25rem' }} className="hover-orange">
          <i className="fas fa-arrow-left" /> Back to Announcements
        </Link>

        {/* Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
          
          {/* Details Column */}
          <div>
            {/* Banner */}
            {ann.bannerUrl && (
              <div style={{ width: '100%', height: 260, borderRadius: 16, overflow: 'hidden', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <img src={ann.bannerUrl} alt={ann.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ann.category}</span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Posted on {new Date(ann.createdAt).toLocaleDateString()}</span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: ann.priority === 'Urgent' ? '#ef4444' : ann.priority === 'Important' ? '#f59e0b' : '#10b981' }}>{ann.priority} Priority</span>
              </div>

              <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text)', marginBottom: '1.25rem', fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>
                {ann.title}
              </h1>

              {/* Rich text renderer */}
              <div style={{ marginBottom: '2rem' }}>
                {renderRichText(ann.content || ann.shortDescription)}
              </div>

              {/* Attachments & links */}
              {((ann.attachments && ann.attachments.length > 0) || (ann.links && ann.links.length > 0)) && (
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', marginTop: '2.5rem' }}>
                  <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem' }}>
                    Attachments & Resources
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {ann.attachments?.map((at, i) => (
                      <a key={i} href={at.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.85rem', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.8rem', color: 'var(--text)', textDecoration: 'none', background: 'var(--surface)' }} className="hover-orange-border">
                        <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444' }} /> {at.name}
                      </a>
                    ))}
                    {ann.links?.map((ln, i) => (
                      <a key={i} href={ln.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.85rem', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.8rem', color: 'var(--text)', textDecoration: 'none', background: 'var(--surface)' }} className="hover-orange-border">
                        <i className="fa-solid fa-link" style={{ color: 'var(--orange)' }} /> {ln.label || 'Link'}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Event Post-Gallery (renders if Completed) */}
            {ann.eventStatus === 'Completed' && ann.gallery && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa-solid fa-photo-film" style={{ color: 'var(--orange)' }} /> Event Archive & Gallery
                </h3>
                {ann.gallery.photos?.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
                    {ann.gallery.photos.map((ph, i) => (
                      <a href={ph} target="_blank" rel="noopener noreferrer" key={i} style={{ borderRadius: 10, overflow: 'hidden', height: 100, border: '1px solid var(--border)' }}>
                        <img src={ph} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No media uploaded for this event.</div>
                )}
              </div>
            )}

            {/* FAQs Accordion */}
            {ann.faqs && ann.faqs.length > 0 && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem' }}>
                <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem' }}>
                  Frequently Asked Questions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {ann.faqs.map((faq, i) => (
                    <div key={i} style={{ border: '1px solid var(--border-light)', borderRadius: 10, overflow: 'hidden' }}>
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                        style={{
                          width: '100%', padding: '0.85rem 1rem', background: 'var(--surface)',
                          border: 'none', textAlign: 'left', display: 'flex',
                          alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                          fontWeight: 700, fontSize: '0.84rem', color: 'var(--text)',
                        }}
                      >
                        {faq.q}
                        <i className={`fas ${expandedFaq === i ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }} />
                      </button>
                      {expandedFaq === i && (
                        <div style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'var(--card)', borderTop: '1px solid var(--border-light)', lineHeight: 1.5 }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column Widget (Event Information & Registration) */}
          <div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', position: 'sticky', top: '1.5rem' }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-circle-info" style={{ color: 'var(--orange)' }} /> Event Details
              </h3>
              
              {/* Details table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                {ann.date && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fa-regular fa-calendar" style={{ width: 16, color: 'var(--orange)' }} />
                    <div>
                      <strong>Date:</strong> {new Date(ann.date).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                )}
                {ann.eventTime && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fa-regular fa-clock" style={{ width: 16, color: 'var(--orange)' }} />
                    <div>
                      <strong>Time:</strong> {ann.eventTime}
                    </div>
                  </div>
                )}
                {ann.venue && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fa-solid fa-location-dot" style={{ width: 16, color: 'var(--orange)' }} />
                    <div>
                      <strong>Venue:</strong> {ann.venue}
                    </div>
                  </div>
                )}
                {ann.organizer && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fa-regular fa-user" style={{ width: 16, color: 'var(--orange)' }} />
                    <div>
                      <strong>Organizer:</strong> {ann.organizer}
                    </div>
                  </div>
                )}
              </div>

              {/* Registration Control Info */}
              {ann.registrationEnabled && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 12, padding: '0.85rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyItem: 'center', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 650, color: 'var(--text-secondary)' }}>
                    <span>Capacity:</span>
                    <strong style={{ color: 'var(--text)' }}>{stats.limit} seats</strong>
                  </div>
                  <div style={{ display: 'flex', justifyItem: 'center', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 650, color: 'var(--text-secondary)', marginTop: '0.45rem' }}>
                    <span>Seats Left:</span>
                    {stats.remaining > 0 ? (
                      <strong style={{ color: stats.remaining <= 10 ? '#ef4444' : '#22c55e' }}>{stats.remaining} left</strong>
                    ) : (
                      <strong style={{ color: '#f59e0b' }}>FULL (Waitlist Active)</strong>
                    )}
                  </div>
                  {countdownText && (
                    <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '0.65rem', paddingTop: '0.45rem', fontSize: '0.74rem', color: '#ef4444', fontWeight: 700, textAlign: 'center' }}>
                      {countdownText}
                    </div>
                  )}
                </div>
              )}

              {/* Action (Registration Form or Ticket) */}
              {ann.registrationEnabled ? (
                userRegistration && !isEditing ? (
                  /* Render Ticket */
                  <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                    <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontSize: '0.82rem', fontWeight: 800, padding: '0.5rem', borderRadius: 8, marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', width: '100%', justifyContent: 'center' }}>
                      <i className="fas fa-check-circle" /> {successMsg || (userRegistration.status === 'Waitlisted' ? 'Waitlisted Successful' : 'Registration Confirmed')}
                    </div>

                    {/* QR Code */}
                    <div style={{ width: 140, height: 140, margin: '0 auto 1rem', padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: 12, background: '#fff' }}>
                      <img src={userRegistration.qrCodeUrl} alt="QR Check-in Ticket" style={{ width: '100%', height: '100%' }} />
                    </div>

                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                      Registration ID: <strong style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{userRegistration.id}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {ann.allowEditing !== false && (
                        <button className="btn btn-outline btn-sm" onClick={startEdit} style={{ flex: 1, justifyContent: 'center' }}>
                          Edit Info
                        </button>
                      )}
                      {ann.allowCancellation !== false && (
                        <button className="btn btn-sm" onClick={handleCancelRegistration} style={{ flex: 1, justifyContent: 'center', color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)', border: 'none' }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Render Registration Form */
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.85rem' }}>
                      {isEditing ? 'Update Details' : stats.remaining === 0 ? 'Join Waitlist' : 'Register for Event'}
                    </h4>
                    
                    <form onSubmit={isEditing ? handleEditDetails : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {/* Name */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Full Name *</label>
                        <input className="form-input form-input-sm" value={formValues.fullName || ''} onChange={e => setFormValues(p => ({ ...p, fullName: e.target.value }))} required style={{ width: '100%' }} />
                      </div>

                      {/* Email (Read-only as they are logged in) */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Email Address *</label>
                        <input className="form-input form-input-sm" type="email" value={formValues.email || ''} readOnly style={{ width: '100%', opacity: 0.8, cursor: 'not-allowed', background: 'rgba(0,0,0,0.03)' }} />
                      </div>

                      {/* Phone */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Phone Number *</label>
                        <input className="form-input form-input-sm" type="tel" value={formValues.phone || ''} onChange={e => setFormValues(p => ({ ...p, phone: e.target.value }))} required style={{ width: '100%' }} />
                      </div>

                      {/* Department */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Department *</label>
                        <input className="form-input form-input-sm" value={formValues.department || ''} onChange={e => setFormValues(p => ({ ...p, department: e.target.value }))} required placeholder="e.g. CSE" style={{ width: '100%' }} />
                      </div>

                      {/* Year select */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Year *</label>
                        <select className="form-input form-input-sm" value={formValues.year || '1'} onChange={e => setFormValues(p => ({ ...p, year: e.target.value }))} style={{ width: '100%' }}>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                      </div>

                      {/* Class */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Class *</label>
                        <input className="form-input form-input-sm" value={formValues.className || ''} onChange={e => setFormValues(p => ({ ...p, className: e.target.value }))} required placeholder="e.g. CSE A" style={{ width: '100%' }} />
                      </div>

                      {/* Render extra custom fields if configured */}
                      {ann.formFields?.filter(f => !['fullName', 'email', 'phone', 'department', 'className', 'year'].includes(f.id)).map(f => (
                        <div key={f.id}>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{f.label} {f.required && '*'}</label>
                          {f.type === 'select' ? (
                            <select className="form-input form-input-sm" value={formValues[f.id] || ''} onChange={e => setFormValues(p => ({ ...p, [f.id]: e.target.value }))} required={f.required} style={{ width: '100%' }}>
                              <option value="">Select Option</option>
                              {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input className="form-input form-input-sm" type={f.type || 'text'} value={formValues[f.id] || ''} onChange={e => setFormValues(p => ({ ...p, [f.id]: e.target.value }))} required={f.required} placeholder={`Enter ${f.label.toLowerCase()}`} style={{ width: '100%' }} />
                          )}
                        </div>
                      ))}

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {isEditing && (
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>
                            Cancel
                          </button>
                        )}
                        <button type="submit" className="btn btn-primary btn-sm" disabled={submitting} style={{ flex: 1, background: stats.remaining === 0 && !isEditing ? '#f59e0b' : 'var(--orange)', borderColor: stats.remaining === 0 && !isEditing ? '#f59e0b' : 'var(--orange)', justifyContent: 'center' }}>
                          {submitting ? 'Please wait...' : isEditing ? 'Save Changes' : stats.remaining === 0 ? 'Join Waitlist' : 'Register Now'}
                        </button>
                      </div>
                    </form>
                  </div>
                )
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', background: 'var(--surface)', padding: '1rem', borderRadius: 12 }}>
                  Registration not required for this event. Just show up at the venue!
                </div>
              )}
            </div>
          </div>

        </div>

      </motion.div>
    </div>
  );
}
