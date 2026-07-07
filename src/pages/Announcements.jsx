import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import db from '../db';

export default function Announcements({ user }) {
  const [announcements, setAnnouncements] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [anns, regs] = await Promise.all([
          db.find('Announcements'),
          db.find('EventRegistrations'),
        ]);

        // Auto calculate statuses based on dates/times dynamically
        const now = new Date();
        const updatedAnns = anns.map(a => {
          let eventStatus = a.eventStatus || 'Published';
          
          if (a.date) {
            const eventDate = new Date(`${a.date}T${a.eventTime || '00:00:00'}`);
            if (eventDate < now) {
              eventStatus = 'Completed';
            }
          }
          return { ...a, eventStatus };
        });

        setAnnouncements(updatedAnns);
        setRegistrations(regs);
      } catch (err) {
        console.error('Failed to load announcements:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(announcements.map(a => a.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [announcements]);

  const filtered = useMemo(() => {
    return announcements.filter(a => {
      // Hide drafts for non-admins
      const isDraft = a.status === 'draft' || a.eventStatus === 'Draft';
      if (isDraft && user?.role !== 'admin') return false;

      const matchesSearch = (a.title || '').toLowerCase().includes(search.toLowerCase()) ||
                            (a.organizer || '').toLowerCase().includes(search.toLowerCase()) ||
                            (a.shortDescription || '').toLowerCase().includes(search.toLowerCase());

      const matchesCategory = categoryFilter === 'All' || a.category === categoryFilter;
      const matchesPriority = priorityFilter === 'All' || a.priority === priorityFilter;
      
      const matchesStatus = statusFilter === 'All' || 
                           (statusFilter === 'Open' && a.registrationEnabled && a.eventStatus === 'Registration Open') ||
                           (statusFilter === 'Closed' && a.eventStatus === 'Registration Closed') ||
                           (statusFilter === 'Upcoming' && a.eventStatus === 'Upcoming') ||
                           (statusFilter === 'Completed' && a.eventStatus === 'Completed');

      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    });
  }, [announcements, search, categoryFilter, priorityFilter, statusFilter, user]);

  const pinned = useMemo(() => filtered.filter(a => a.pinned), [filtered]);
  const unpinned = useMemo(() => filtered.filter(a => !a.pinned), [filtered]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return announcements
      .filter(a => a.date && new Date(`${a.date}T${a.eventTime || '00:00:00'}`) > now && a.status !== 'draft' && a.eventStatus !== 'Draft')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
  }, [announcements]);

  // Helpers
  const isRecent = (dateStr) => {
    const created = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'Urgent': return '#ef4444';
      case 'Important': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Draft': { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', icon: 'fa-pen-ruler' },
      'Published': { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', icon: 'fa-circle-check' },
      'Registration Open': { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', icon: 'fa-ticket' },
      'Registration Closed': { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', icon: 'fa-lock' },
      'Upcoming': { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', icon: 'fa-clock' },
      'Ongoing': { bg: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', icon: 'fa-hourglass-half' },
      'Completed': { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', icon: 'fa-flag-checkered' },
      'Cancelled': { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', icon: 'fa-ban' }
    };
    const s = styles[status] || styles.Published;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.65rem', borderRadius: 8, background: s.bg, color: s.color, fontSize: '0.74rem', fontWeight: 700 }}>
        <i className={`fas ${s.icon}`} /> {status}
      </span>
    );
  };

  const getRemainingSeats = (ann) => {
    if (!ann.registrationEnabled) return null;
    const count = registrations.filter(r => r.announcementId === ann.id && r.status !== 'Cancelled').length;
    const limit = ann.seatsLimit || 100;
    const remaining = Math.max(0, limit - count);
    return { registered: count, limit, remaining };
  };

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="loading-dots"><span></span><span></span><span></span></div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <style>{`
        .announcements-grid-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 2rem;
        }
        .announcement-card-item {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease;
        }
        .announcement-card-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--orange);
        }
        .announcement-filter-grid {
          display: grid;
          grid-template-columns: 1fr auto auto auto;
          gap: 0.75rem;
          margin-bottom: 2rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1rem;
        }
        @media (max-width: 900px) {
          .announcements-grid-layout {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .announcement-filter-grid {
            grid-template-columns: 1fr !important;
            gap: 0.6rem !important;
          }
        }
      `}</style>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        
        {/* Header */}
        <div className="page-header" style={{ marginBottom: '2rem' }}>
          <span className="page-tag"><i className="fas fa-bullhorn"></i> Announcements</span>
          <h1 className="page-title">Club News & Events</h1>
          <p className="page-subtitle">Stay updated with our seminars, coding workshops, and recruitments.</p>
        </div>

        {/* Filter Bar */}
        <div className="announcement-filter-grid">
          <div style={{ position: 'relative' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search announcements, topics..."
              style={{ paddingLeft: '2.3rem', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <select className="form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ minWidth: 140 }}>
            <option value="All">All Categories</option>
            {categories.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select className="form-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ minWidth: 140 }}>
            <option value="All">All Priorities</option>
            <option value="Normal">Normal</option>
            <option value="Important">Important</option>
            <option value="Urgent">Urgent</option>
          </select>

          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ minWidth: 150 }}>
            <option value="All">All Statuses</option>
            <option value="Open">Open Registrations</option>
            <option value="Closed">Closed Registrations</option>
            <option value="Upcoming">Upcoming Events</option>
            <option value="Completed">Completed Events</option>
          </select>
        </div>

        {/* Main Grid Layout */}
        <div className="announcements-grid-layout">
          
          {/* Announcements list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filtered.length === 0 ? (
              <div className="empty-state" style={{ padding: '3.5rem 1rem' }}>
                <div className="empty-state-icon"><i className="fas fa-bullhorn" /></div>
                <h3>No announcements found</h3>
                <p>Try refining your search keywords or filters.</p>
              </div>
            ) : (
              <>
                {/* Render Pinned First */}
                {pinned.map(a => (
                  <motion.div
                    key={a.id}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="announcement-card-item"
                    style={{ border: '2px solid var(--orange)' }}
                  >
                    {a.bannerUrl && (
                      <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                        <img src={a.bannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--orange)', color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '0.35rem 0.65rem', borderRadius: 6, display: 'flex', alignItems: 'center', gap: '0.3rem', boxShadow: 'var(--shadow-sm)' }}>
                          <i className="fas fa-thumbtack" /> PINNED
                        </span>
                      </div>
                    )}
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{a.category}</span>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(a.date || a.createdAt).toLocaleDateString()}</span>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: getPriorityColor(a.priority) }}>
                          <i className="fas fa-circle" style={{ fontSize: '0.5rem', marginRight: '0.25rem' }} /> {a.priority}
                        </span>
                        {getStatusBadge(a.eventStatus)}
                      </div>

                      <h2 style={{ fontSize: '1.25rem', fontWeight: 850, color: 'var(--text)', marginBottom: '0.5rem' }}>
                        <Link to={`/announcements/${a.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
                      </h2>

                      <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                        {a.shortDescription}
                      </p>

                      {/* Seats & CTA */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {a.registrationEnabled ? (() => {
                          const seatInfo = getRemainingSeats(a);
                          return (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              <i className="fas fa-users" style={{ marginRight: '0.35rem' }} />
                              {seatInfo.registered} / {seatInfo.limit} Registered
                              {seatInfo.remaining <= 10 && seatInfo.remaining > 0 && (
                                <span style={{ color: '#ef4444', marginLeft: '0.5rem', fontWeight: 700 }}>
                                  🔥 Only {seatInfo.remaining} seats left!
                                </span>
                              )}
                              {seatInfo.remaining === 0 && (
                                <span style={{ color: '#f59e0b', marginLeft: '0.5rem', fontWeight: 700 }}>
                                  ⚠️ Waitlist Active
                                </span>
                              )}
                            </div>
                          );
                        })() : <div />}

                        <Link to={`/announcements/${a.id}`} className="btn btn-primary btn-sm">
                          Read More <i className="fas fa-arrow-right" style={{ marginLeft: '0.35rem' }} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Render Unpinned */}
                {unpinned.map(a => (
                  <motion.div
                    key={a.id}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="announcement-card-item"
                  >
                    {a.status === 'draft' && (
                      <span style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#6b7280', color: '#fff', fontSize: '0.64rem', fontWeight: 800, padding: '0.25rem 0.5rem', borderRadius: 6, zIndex: 10 }}>
                        DRAFT
                      </span>
                    )}
                    {a.bannerUrl && (
                      <div style={{ height: 160, overflow: 'hidden' }}>
                        <img src={a.bannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{a.category}</span>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(a.date || a.createdAt).toLocaleDateString()}</span>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: getPriorityColor(a.priority) }}>
                          <i className="fas fa-circle" style={{ fontSize: '0.5rem', marginRight: '0.25rem' }} /> {a.priority}
                        </span>
                        {getStatusBadge(a.eventStatus)}
                        {isRecent(a.createdAt) && (
                          <span style={{ background: 'rgba(255, 85, 0, 0.1)', color: 'var(--orange)', fontSize: '0.64rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: 4 }}>NEW</span>
                        )}
                      </div>

                      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.4rem' }}>
                        <Link to={`/announcements/${a.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
                      </h2>

                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                        {a.shortDescription}
                      </p>

                      {/* Seats & CTA */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyItem: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {a.registrationEnabled ? (() => {
                          const seatInfo = getRemainingSeats(a);
                          return (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              <i className="fas fa-users" style={{ marginRight: '0.35rem' }} />
                              {seatInfo.registered} / {seatInfo.limit} Registered
                              {seatInfo.remaining <= 10 && seatInfo.remaining > 0 && (
                                <span style={{ color: '#ef4444', marginLeft: '0.5rem', fontWeight: 700 }}>
                                  🔥 Only {seatInfo.remaining} left!
                                </span>
                              )}
                              {seatInfo.remaining === 0 && (
                                <span style={{ color: '#f59e0b', marginLeft: '0.5rem', fontWeight: 700 }}>
                                  ⚠️ Waitlist Active
                                </span>
                              )}
                            </div>
                          );
                        })() : <div />}

                        <Link to={`/announcements/${a.id}`} className="btn btn-secondary btn-sm">
                          Read More
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </div>

          {/* Sidebar widget panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Upcoming events panel */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-calendar-check" style={{ color: 'var(--orange)' }} /> Upcoming Events
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {upcomingEvents.length === 0 ? (
                  <div style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No upcoming events
                  </div>
                ) : (
                  upcomingEvents.map(e => (
                    <div key={e.id} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.85rem' }}>
                      <Link to={`/announcements/${e.id}`} style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', lineHeight: 1.4 }} className="hover-orange">
                        {e.title}
                      </Link>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '0.35rem' }}>
                        <span><i className="fa-regular fa-calendar" /> {new Date(e.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        <span>•</span>
                        <span><i className="fa-solid fa-location-dot" /> {e.venue || 'TBD'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick stats widget */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Total Notices</span>
                <strong style={{ color: 'var(--text)' }}>{announcements.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Active Events</span>
                <strong style={{ color: 'var(--text)' }}>{announcements.filter(a => a.registrationEnabled && a.eventStatus !== 'Completed').length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Your Registrations</span>
                <strong style={{ color: 'var(--orange)' }}>
                  {registrations.filter(r => r.userId === user?.id && r.status !== 'Cancelled').length}
                </strong>
              </div>
            </div>

          </div>

        </div>

      </motion.div>
    </div>
  );
}
