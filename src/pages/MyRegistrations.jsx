import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import db from '../db';

export default function MyRegistrations({ user }) {
  const [registrations, setRegistrations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState('upcoming');

  // Certificate Modal State
  const [certModal, setCertModal] = useState({ open: false, eventTitle: '', date: '' });

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [regs, anns] = await Promise.all([
          db.find('EventRegistrations'),
          db.find('Announcements'),
        ]);

        const myRegs = regs.filter(r => r.userId === user.id && r.status !== 'Cancelled');
        
        // Match announcement details for each registration record
        const enriched = myRegs.map(r => {
          const ann = anns.find(a => a.id === r.announcementId);
          return {
            ...r,
            eventTitle: ann?.title || r.quizTitle || 'Club Event',
            eventDate: ann?.date || null,
            eventTime: ann?.eventTime || '',
            venue: ann?.venue || 'TBD',
            category: ann?.category || 'General',
            bannerUrl: ann?.bannerUrl || null,
          };
        });

        setRegistrations(enriched);
        setAnnouncements(anns);
      } catch (err) {
        console.error('Failed to load user registrations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleCancelRegistration = async (id, eventTitle) => {
    if (!window.confirm(`Are you sure you want to cancel your registration for "${eventTitle}"?`)) return;
    try {
      await db.update('EventRegistrations', id, { status: 'Cancelled' });
      setRegistrations(prev => prev.filter(r => r.id !== id));
      window.showToast('Cancelled', 'Registration cancelled successfully.', 'info');
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  // Group registrations
  const grouped = useMemo(() => {
    const now = new Date();
    const result = {
      upcoming: [],
      past: [],
      waitlisted: [],
      checkedIn: [],
    };

    registrations.forEach(r => {
      if (r.status === 'Waitlisted') {
        result.waitlisted.push(r);
      } else if (r.status === 'Checked In') {
        result.checkedIn.push(r);
        result.past.push(r);
      } else {
        const eventDate = r.eventDate ? new Date(r.eventDate) : null;
        if (eventDate && eventDate < now) {
          result.past.push(r);
        } else {
          result.upcoming.push(r);
        }
      }
    });

    return result;
  }, [registrations]);

  if (!user) {
    return (
      <div className="main-content">
        <div className="empty-state" style={{ marginTop: '3rem' }}>
          <div className="empty-state-icon"><i className="fas fa-sign-in-alt"></i></div>
          <h3>Login Required</h3>
          <p>Please log in to view your event registrations.</p>
          <Link to="/auth?redirect=/my-registrations" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="loading-dots"><span></span><span></span><span></span></div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        
        {/* Header */}
        <div className="page-header" style={{ marginBottom: '2.5rem' }}>
          <span className="page-tag"><i className="fa-solid fa-ticket-simple"></i> Registrations</span>
          <h1 className="page-title">My Registered Events</h1>
          <p className="page-subtitle">Manage your event tickets, check-in statuses, and participation certificates.</p>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)',
          marginBottom: '2rem', paddingBottom: '0.2rem',
        }}>
          {[
            { id: 'upcoming', label: 'Upcoming Events', count: grouped.upcoming.length },
            { id: 'waitlisted', label: 'Waitlisted', count: grouped.waitlisted.length },
            { id: 'checkedIn', label: 'Checked In', count: grouped.checkedIn.length },
            { id: 'past', label: 'Event History', count: grouped.past.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none', border: 'none',
                padding: '0.6rem 1.2rem', cursor: 'pointer',
                fontSize: '0.86rem', fontWeight: activeTab === tab.id ? 800 : 600,
                color: activeTab === tab.id ? 'var(--orange)' : 'var(--text-secondary)',
                position: 'relative', transition: 'color 0.2s',
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  marginLeft: '0.35rem', background: activeTab === tab.id ? 'var(--orange)' : 'var(--border)',
                  color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.68rem', fontWeight: 800, padding: '1px 6px',
                  borderRadius: 20,
                }}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeRegTabLine"
                  style={{
                    position: 'absolute', bottom: -4, left: 0, right: 0,
                    height: 3, background: 'var(--orange)', borderRadius: 2,
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div>
          {grouped[activeTab].length === 0 ? (
            <div className="empty-state" style={{ padding: '3.5rem 1rem' }}>
              <div className="empty-state-icon"><i className="fa-solid fa-ticket-simple" /></div>
              <h3>No registrations found</h3>
              <p>You don't have any events listed in this category.</p>
              <Link to="/announcements" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Browse Announcements
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {grouped[activeTab].map(r => (
                <div
                  key={r.id}
                  style={{
                    background: 'var(--card)', border: '1px solid var(--border)',
                    borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
                    display: 'flex', flexDirection: 'column',
                  }}
                >
                  {/* Banner */}
                  <div style={{ height: 130, background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
                    {r.bannerUrl ? (
                      <img src={r.bannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(255,85,0,0.15) 0%, rgba(255,85,0,0.02) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--orange)', fontSize: '2.5rem' }}>
                        <i className="fa-solid fa-calendar" />
                      </div>
                    )}
                    <span style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '0.64rem', fontWeight: 800, padding: '0.25rem 0.5rem', borderRadius: 6 }}>
                      {r.category}
                    </span>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '0.96rem', fontWeight: 850, color: 'var(--text)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                      {r.eventTitle}
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                      {r.eventDate && (
                        <div>
                          <i className="fa-regular fa-calendar" style={{ width: 14, color: 'var(--orange)' }} /> {new Date(r.eventDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {r.eventTime}
                        </div>
                      )}
                      <div>
                        <i className="fa-solid fa-location-dot" style={{ width: 14, color: 'var(--orange)' }} /> {r.venue}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem', marginTop: 'auto', display: 'flex', justifyItem: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        {r.status === 'Waitlisted' ? (
                          <span style={{ color: '#f59e0b', fontSize: '0.74rem', fontWeight: 750 }}>
                            <i className="fas fa-hourglass-half" /> Waitlist
                          </span>
                        ) : r.status === 'Checked In' ? (
                          <span style={{ color: '#22c55e', fontSize: '0.74rem', fontWeight: 750 }}>
                            <i className="fas fa-circle-check" /> Checked In
                          </span>
                        ) : (
                          <span style={{ color: 'var(--orange)', fontSize: '0.74rem', fontWeight: 750 }}>
                            <i className="fas fa-ticket" /> Confirmed
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <Link to={`/announcements/${r.announcementId}`} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem', fontSize: '0.74rem' }}>
                          Ticket
                        </Link>
                        {activeTab === 'upcoming' && (
                          <button onClick={() => handleCancelRegistration(r.id, r.eventTitle)} className="btn btn-sm" style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '0.35rem 0.65rem', fontSize: '0.74rem', fontWeight: 600 }}>
                            Cancel
                          </button>
                        )}
                        {activeTab === 'past' && r.status === 'Checked In' && (
                          <button onClick={() => setCertModal({ open: true, eventTitle: r.eventTitle, date: r.eventDate })} className="btn btn-primary btn-sm" style={{ background: '#22c55e', borderColor: '#22c55e', padding: '0.35rem 0.65rem', fontSize: '0.74rem' }}>
                            <i className="fa-solid fa-award" /> Certificate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CERTIFICATE MODAL ── */}
        {certModal.open && (
          <div className="lightbox-overlay" style={{ zIndex: 99999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              background: 'var(--card)', borderRadius: 20, padding: '2rem',
              maxWidth: 720, width: '95%', textAlign: 'center',
              boxShadow: 'var(--shadow-2xl)', border: '1px solid var(--border)',
            }}>
              {/* Certificate layout to print */}
              <div id="print-certificate-element" style={{
                background: '#faf9f6', border: '12px double var(--orange)',
                borderRadius: 8, padding: '3.5rem 2rem', color: '#1a1a1a',
                fontFamily: 'serif', position: 'relative', overflow: 'hidden',
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.06)',
              }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255, 85, 0, 0.05)' }} />
                <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255, 85, 0, 0.05)' }} />

                <div style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--orange-dark)', marginBottom: '1.25rem', fontFamily: 'sans-serif' }}>
                  Mindcraft AI Club
                </div>

                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#111', fontFamily: 'var(--font-display)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Certificate of Participation
                </div>
                <div style={{ fontSize: '0.88rem', fontStyle: 'italic', color: '#555', marginBottom: '1.5rem' }}>
                  This is proudly presented to
                </div>

                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--orange)', textDecoration: 'underline', textUnderlineOffset: '6px', marginBottom: '1rem', textTransform: 'capitalize' }}>
                  {user.name}
                </div>

                <div style={{ fontSize: '0.88rem', color: '#444', maxWidth: 460, margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
                  for successfully registering and actively participating in the workshop / event
                  <strong style={{ display: 'block', fontSize: '1rem', color: '#111', marginTop: '0.5rem', fontStyle: 'normal' }}>
                    {certModal.eventTitle}
                  </strong>
                  conducted by the Mindcraft AI Club on {new Date(certModal.date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}.
                </div>

                {/* Signatures */}
                <div style={{ display: 'flex', justifyItem: 'center', justifyContent: 'space-between', maxWidth: 450, margin: '0 auto', fontSize: '0.82rem', fontFamily: 'sans-serif', fontWeight: 650, color: '#666' }}>
                  <div>
                    <div style={{ fontFamily: '"Dancing Script", cursive', fontSize: '1.25rem', color: '#111', marginBottom: '0.2rem' }}>Athi</div>
                    <div style={{ borderTop: '1px solid #aaa', paddingTop: '0.35rem', width: 130 }}>
                      Club President
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: '"Dancing Script", cursive', fontSize: '1.25rem', color: '#111', marginBottom: '0.2rem' }}>Aether AI</div>
                    <div style={{ borderTop: '1px solid #aaa', paddingTop: '0.35rem', width: 130 }}>
                      Faculty Advisor
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setCertModal({ open: false, eventTitle: '', date: '' })}>
                  Close
                </button>
                <button className="btn btn-primary" onClick={handlePrintCertificate}>
                  <i className="fa-solid fa-print" /> Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}
