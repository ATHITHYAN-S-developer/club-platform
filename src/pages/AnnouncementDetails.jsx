
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import db from '../db';
import SearchableSelect from '../components/ui/SearchableSelect';

const LINK_TYPES_CONFIG = {
  website: { label: '🌐 Website', color: '#3b82f6', defaultTitle: 'Official Website', defaultText: 'Visit Website', iconClass: 'fa-solid fa-globe' },
  whatsapp: { label: '💬 WhatsApp Group', color: '#25d366', defaultTitle: 'WhatsApp Community', defaultText: 'Join WhatsApp Group', iconClass: 'fa-brands fa-whatsapp' },
  youtube: { label: '🎥 YouTube Link', color: '#ef4444', defaultTitle: 'YouTube Video/Stream', defaultText: 'Watch Stream', iconClass: 'fa-brands fa-youtube' },
  github: { label: '💻 GitHub Repo', color: '#1f2937', defaultTitle: 'GitHub Repository', defaultText: 'View Repository', iconClass: 'fa-brands fa-github' },
  docs: { label: '📄 Documentation', color: '#4b5563', defaultTitle: 'Resources & Docs', defaultText: 'View Docs', iconClass: 'fa-regular fa-file-lines' },
  calendar: { label: '📅 Google Calendar', color: '#f59e0b', defaultTitle: 'Add to Calendar', defaultText: 'Add to Calendar', iconClass: 'fa-regular fa-calendar-days' },
  maps: { label: '📍 Google Maps', color: '#10b981', defaultTitle: 'Event Location', defaultText: 'Open in Maps', iconClass: 'fa-solid fa-location-dot' },
  zoom: { label: '🎥 Zoom/Video Meeting', color: '#2563eb', defaultTitle: 'Zoom Meeting', defaultText: 'Join Meeting', iconClass: 'fa-solid fa-video' },
  discord: { label: '💬 Discord Server', color: '#5865f2', defaultTitle: 'Discord Community', defaultText: 'Join Discord', iconClass: 'fa-brands fa-discord' },
  telegram: { label: '💬 Telegram Channel', color: '#24a1de', defaultTitle: 'Telegram Community', defaultText: 'Join Telegram', iconClass: 'fa-brands fa-telegram' },
  linkedin: { label: '👥 LinkedIn Page', color: '#0077b5', defaultTitle: 'LinkedIn Event', defaultText: 'View Event', iconClass: 'fa-brands fa-linkedin' },
  custom: { label: '🔗 Custom Link', color: 'var(--orange)', defaultTitle: 'Important Link', defaultText: 'Open Link', iconClass: 'fa-solid fa-link' }
};

function renderLabelWithLinks(text) {
  if (!text) return '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--orange)', textDecoration: 'underline', fontWeight: 'bold', wordBreak: 'break-all' }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

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
  
  const handleCheckboxChange = (fieldId, option, isChecked) => {
    const currentSelections = formValues[fieldId] || [];
    let nextSelections;
    if (isChecked) {
      nextSelections = [...currentSelections, option];
    } else {
      nextSelections = currentSelections.filter(val => val !== option);
    }
    setFormValues(p => ({ ...p, [fieldId]: nextSelections }));
  };

  const validateForm = () => {
    const missing = [];
    ann.formFields?.forEach(f => {
      const isInfoUrl = f.type === 'url' && (f.label || '').trim().startsWith('http');
      if (isInfoUrl) return;

      if (f.required) {
        const val = formValues[f.id];
        if (f.type === 'checkbox') {
          if (!val || !Array.isArray(val) || val.length === 0) {
            missing.push(f.label);
          }
        } else {
          if (val === undefined || val === null || String(val).trim() === '') {
            missing.push(f.label);
          }
        }
      }
    });
    if (missing.length > 0) {
      window.showToast('Required Question', `Please answer: ${missing.join(', ')}`, 'warning');
      return false;
    }
    return true;
  };


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

        // Parse importantLinks if stringified
        if (typeof item.importantLinks === 'string') {
          try { item.importantLinks = JSON.parse(item.importantLinks); } catch { item.importantLinks = []; }
        }

        if (item.eventStatus !== 'Draft' && item.status === 'draft') {
          item.status = 'published';
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
            registerNumber: user.registerNumber || '',
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

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const regId = 'reg_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      const isWaitlist = stats.remaining === 0;

      const qrDataText = [
        `Event: ${ann.title}`,
        `Ticket ID: ${regId}`,
        `Name: ${formValues.fullName || ''}`,
        `Email: ${user.email}`,
        `Phone: ${formValues.phone || ''}`,
        `Reg No: ${formValues.registerNumber || ''}`,
        `Year: ${formValues.year || '1'}`,
        `Class: ${formValues.className || ''}`
      ].join('\n');

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
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrDataText)}`,
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
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const qrDataText = [
        `Event: ${ann.title}`,
        `Ticket ID: ${userRegistration.id}`,
        `Name: ${formValues.fullName || ''}`,
        `Email: ${user.email}`,
        `Phone: ${formValues.phone || ''}`,
        `Reg No: ${formValues.registerNumber || ''}`,
        `Year: ${formValues.year || '1'}`,
        `Class: ${formValues.className || ''}`
      ].join('\n');

      await db.update('EventRegistrations', userRegistration.id, {
        submittedData: formValues,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrDataText)}`,
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
      <style>{`
        .details-grid-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 2rem;
        }
        .google-form-card {
          background: #fff;
          border: 1px solid #dadce0;
          border-radius: 8px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 0.75rem;
          position: relative;
          transition: border-color 0.2s;
        }
        .google-form-header-card {
          border-top: 8px solid var(--orange);
        }
        .google-form-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: #202124;
          margin-bottom: 0.6rem;
          display: block;
        }
        .google-form-input {
          border: none !important;
          border-bottom: 1px solid #dadce0 !important;
          border-radius: 0 !important;
          background: transparent !important;
          padding: 0.5rem 0 !important;
          font-size: 0.88rem !important;
          color: #202124 !important;
          width: 100%;
          outline: none !important;
          transition: border-bottom-color 0.2s;
          box-shadow: none !important;
        }
        .google-form-input:focus {
          border-bottom: 2px solid var(--orange) !important;
        }
        .google-form-select {
          border: none !important;
          border-bottom: 1px solid #dadce0 !important;
          border-radius: 0 !important;
          background: transparent !important;
          padding: 0.5rem 0 !important;
          font-size: 0.88rem !important;
          color: #202124 !important;
          width: 100%;
          outline: none !important;
          transition: border-bottom-color 0.2s;
          box-shadow: none !important;
          cursor: pointer;
        }
        .google-form-select:focus {
          border-bottom: 2px solid var(--orange) !important;
        }
        @media (max-width: 900px) {
          .details-grid-layout {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
        }
      `}</style>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        
        {/* Back & Share actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Link to="/announcements" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.82rem', textDecoration: 'none' }} className="hover-orange">
            <i className="fas fa-arrow-left" /> Back to Announcements
          </Link>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              window.showToast('Copied', 'Event link copied to clipboard!', 'success');
            }}
            className="btn btn-outline btn-sm"
            style={{ borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.85rem' }}
          >
            <i className="fa-solid fa-share-nodes" style={{ color: 'var(--orange)' }} /> Share Event
          </button>
        </div>

        {/* Layout */}
        <div className="details-grid-layout">
          
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
          <div style={{ position: 'sticky', top: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Event Details Card */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-circle-info" style={{ color: 'var(--orange)' }} /> Event Details
              </h3>
              
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
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 12, padding: '0.85rem' }}>
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
            </div>

            {/* Important Links (Pre-registration / General) */}
            {ann.importantLinks && ann.importantLinks.filter(l => l.enabled && !l.showAfterRegistration).length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text)', margin: '0.25rem 0 0' }}>
                  🔗 Important Links
                </h4>
                {ann.importantLinks
                  .filter(l => l.enabled && !l.showAfterRegistration)
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map(link => {
                    const config = LINK_TYPES_CONFIG[link.type] || LINK_TYPES_CONFIG.custom;
                    return (
                      <div key={link.id} style={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderLeft: `4px solid ${config.color}`,
                        borderRadius: 14,
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.6rem',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center' }}>
                            <i className={config.iconClass} style={{ color: config.color }} />
                          </span>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{link.title}</strong>
                        </div>
                        {link.description && (
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                            {link.description}
                          </p>
                        )}
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{
                            marginTop: '0.25rem',
                            borderRadius: 10,
                            textDecoration: 'none',
                            fontSize: '0.76rem',
                            padding: '0.45rem 1rem',
                            width: '100%',
                            justifyContent: 'center',
                            borderColor: config.color,
                            color: config.color,
                            fontWeight: 700
                          }}
                        >
                          {link.text || config.defaultText}
                        </a>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Action (Registration Form or Ticket) */}
            {ann.registrationEnabled ? (
              userRegistration && !isEditing ? (
                /* Render Ticket in its own card */
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', textAlign: 'center' }}>
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

                  {/* Post-Registration Action Links */}
                  {ann.importantLinks && ann.importantLinks.filter(l => l.enabled && l.showAfterRegistration).length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      borderTop: '1px solid var(--border-light)',
                      borderBottom: '1px solid var(--border-light)',
                      padding: '1rem 0',
                      margin: '1rem 0',
                      textAlign: 'left'
                    }}>
                      {ann.importantLinks
                        .filter(l => l.enabled && l.showAfterRegistration)
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map(link => {
                          const config = LINK_TYPES_CONFIG[link.type] || LINK_TYPES_CONFIG.custom;
                          return (
                            <div key={link.id} style={{
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                              borderRadius: 12,
                              padding: '1rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.5rem',
                              alignItems: 'center',
                              textAlign: 'center'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', fontWeight: 700, color: config.color }}>
                                <i className={config.iconClass} style={{ fontSize: '1rem' }} /> {link.title}
                              </div>
                              {link.description && (
                                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '0 0 0.25rem' }}>
                                  {link.description}
                                </p>
                              )}

                              {/* Safe Local QR Code Generation */}
                              {link.showQRCode && link.url && (
                                <div style={{
                                  background: '#fff',
                                  padding: '0.5rem',
                                  borderRadius: 8,
                                  border: '1px solid var(--border-light)',
                                  margin: '0.25rem 0 0.5rem',
                                  display: 'inline-flex',
                                  justifyContent: 'center',
                                  alignItems: 'center'
                                }}>
                                  <QRCodeSVG value={link.url} size={110} level="H" includeMargin={true} />
                                </div>
                              )}

                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm"
                                style={{
                                  background: config.color,
                                  borderColor: config.color,
                                  color: '#fff',
                                  fontWeight: 700,
                                  borderRadius: 8,
                                  width: '100%',
                                  justifyContent: 'center',
                                  display: 'inline-flex',
                                  padding: '0.4rem 0.75rem',
                                  textDecoration: 'none'
                                }}
                              >
                                {link.text || config.defaultText}
                              </a>
                            </div>
                          );
                        })}
                    </div>
                  )}

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
                /* Render Registration Form as Google Form */
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Google Form Header Card */}
                  <div className="google-form-card google-form-header-card">
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#202124', margin: 0, fontFamily: 'var(--font-display)' }}>
                      {isEditing ? 'Edit Registration' : stats.remaining === 0 ? 'Waitlist Registration' : 'Event Registration'}
                    </h2>
                    <p style={{ fontSize: '0.74rem', color: '#5f6368', margin: '0.35rem 0 0' }}>
                      {isEditing ? 'Modify your registration info below.' : stats.remaining === 0 ? 'The event is full. Fill this out to join the waitlist.' : 'Fill this out to reserve your seat.'}
                    </p>
                    <div style={{ borderTop: '1px solid #dadce0', marginTop: '0.85rem', paddingTop: '0.5rem', fontSize: '0.72rem', color: '#d93025' }}>
                      * Indicates required question
                    </div>
                  </div>

                  <form onSubmit={isEditing ? handleEditDetails : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {/* Name */}
                    <div className="google-form-card">
                      <label className="google-form-label">Full Name <span style={{ color: '#d93025' }}>*</span></label>
                      <input className="google-form-input" value={formValues.fullName || ''} onChange={e => setFormValues(p => ({ ...p, fullName: e.target.value }))} required placeholder="Your answer" />
                    </div>

                    {/* Email */}
                    <div className="google-form-card">
                      <label className="google-form-label">Email Address <span style={{ color: '#d93025' }}>*</span></label>
                      <input className="google-form-input" type="email" value={formValues.email || ''} readOnly style={{ opacity: 0.8, color: '#70757a', cursor: 'not-allowed' }} />
                    </div>

                    {/* Phone */}
                    <div className="google-form-card">
                      <label className="google-form-label">Phone Number <span style={{ color: '#d93025' }}>*</span></label>
                      <input className="google-form-input" type="tel" value={formValues.phone || ''} onChange={e => setFormValues(p => ({ ...p, phone: e.target.value }))} required placeholder="Your answer" />
                    </div>

                    {/* Register Number */}
                    <div className="google-form-card">
                      <label className="google-form-label">Register Number <span style={{ color: '#d93025' }}>*</span></label>
                      <input className="google-form-input" value={formValues.registerNumber || ''} onChange={e => setFormValues(p => ({ ...p, registerNumber: e.target.value }))} required placeholder="Your answer" />
                    </div>

                    {/* Year select */}
                    <div className="google-form-card">
                      <label className="google-form-label">Year <span style={{ color: '#d93025' }}>*</span></label>
                      <select className="google-form-select" value={formValues.year || '1'} onChange={e => setFormValues(p => ({ ...p, year: e.target.value }))}>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>

                    {/* Class */}
                    <div className="google-form-card">
                      <label className="google-form-label">Class <span style={{ color: '#d93025' }}>*</span></label>
                      <input className="google-form-input" value={formValues.className || ''} onChange={e => setFormValues(p => ({ ...p, className: e.target.value }))} required placeholder="Your answer" />
                    </div>

                    {/* Render extra custom fields if configured */}
                    {ann.formFields?.filter(f => !['fullName', 'email', 'phone', 'registerNumber', 'className', 'year'].includes(f.id)).map(f => {
                      const isInfoUrl = f.type === 'url';
                      
                      if (isInfoUrl) {
                        const url = (f.url || (f.label && f.label.trim().startsWith('http') ? f.label : '')).trim();
                        if (!url) return null;
                        
                        const isWhatsApp = url.includes('whatsapp.com');
                        const headingTitle = f.url ? f.label : (isWhatsApp ? 'WhatsApp Community Group' : 'Important Event Link');
                        return (
                          <div key={f.id} className="google-form-card" style={{ borderLeft: `6px solid ${isWhatsApp ? '#25d366' : 'var(--orange)'}` }}>
                            <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#202124', margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-display)' }}>
                              {isWhatsApp ? '💬' : '🔗'} {headingTitle}
                            </h3>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm"
                              style={{
                                display: 'inline-flex',
                                width: '100%',
                                justifyContent: 'center',
                                background: isWhatsApp ? '#25d366' : 'var(--orange)',
                                borderColor: isWhatsApp ? '#25d366' : 'var(--orange)',
                                color: '#fff',
                                fontWeight: 800,
                                borderRadius: 8,
                                padding: '0.5rem 1rem',
                                textDecoration: 'none',
                                fontSize: '0.8rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                            >
                              {isWhatsApp ? 'Join WhatsApp Group' : 'Visit Link'}
                            </a>
                          </div>
                        );
                      }

                      return (
                        <div key={f.id} className="google-form-card">
                          <label className="google-form-label">{renderLabelWithLinks(f.label)} {f.required && <span style={{ color: '#d93025' }}>*</span>}</label>
                          {f.type === 'select' ? (
                            <select
                              className="google-form-select"
                              value={formValues[f.id] || ''}
                              onChange={e => setFormValues(p => ({ ...p, [f.id]: e.target.value }))}
                              required={f.required}
                              style={{ cursor: 'pointer' }}
                            >
                              <option value="">Choose</option>
                              {f.options?.map((opt, oIdx) => (
                                <option key={oIdx} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : f.type === 'radio' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.4rem' }}>
                              {f.options?.map((opt, oIdx) => (
                                <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.86rem', color: '#202124' }}>
                                  <input
                                    type="radio"
                                    name={f.id}
                                    value={opt}
                                    checked={formValues[f.id] === opt}
                                    onChange={e => setFormValues(p => ({ ...p, [f.id]: e.target.value }))}
                                  />
                                  <span>{opt}</span>
                                </label>
                              ))}
                            </div>
                          ) : f.type === 'checkbox' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.4rem' }}>
                              {f.options?.map((opt, oIdx) => {
                                const isChecked = (formValues[f.id] || []).includes(opt);
                                return (
                                  <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.86rem', color: '#202124' }}>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={e => handleCheckboxChange(f.id, opt, e.target.checked)}
                                    />
                                    <span>{opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          ) : f.type === 'textarea' ? (
                            <textarea
                              className="google-form-input"
                              value={formValues[f.id] || ''}
                              onChange={e => setFormValues(p => ({ ...p, [f.id]: e.target.value }))}
                              required={f.required}
                              placeholder="Your answer"
                              rows={3}
                              style={{ resize: 'vertical', border: '1px solid #dadce0', borderRadius: 4, padding: '0.5rem', width: '100%', fontFamily: 'inherit' }}
                            />
                          ) : (
                            <input className="google-form-input" type={f.type || 'text'} value={formValues[f.id] || ''} onChange={e => setFormValues(p => ({ ...p, [f.id]: e.target.value }))} required={f.required} placeholder="Your answer" />
                          )}
                        </div>
                      );
                    })}

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', width: isEditing ? '100%' : 'auto' }}>
                        {isEditing && (
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>
                            Cancel
                          </button>
                        )}
                        <button type="submit" className="btn btn-primary btn-sm" disabled={submitting} style={{ padding: '0.5rem 1.5rem', background: stats.remaining === 0 && !isEditing ? '#f59e0b' : 'var(--orange)', borderColor: stats.remaining === 0 && !isEditing ? '#f59e0b' : 'var(--orange)', justifyContent: 'center' }}>
                          {submitting ? 'Submitting...' : isEditing ? 'Save' : stats.remaining === 0 ? 'Join Waitlist' : 'Submit'}
                        </button>
                      </div>
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

      </motion.div>
    </div>
  );
}
