import { useState, useEffect, useMemo } from 'react';
import db from '../../db';

export default function RegistrationDashboard({ announcement }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const all = await db.find('EventRegistrations');
      const filteredRegs = all.filter(r => r.announcementId === announcement.id);
      setRegistrations(filteredRegs.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt)));
    } catch {
      window.showToast('Error', 'Could not load registrations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRegistrations(); }, [announcement.id]);

  // Statistics Computations
  const stats = useMemo(() => {
    const list = registrations.filter(r => r.status !== 'Cancelled');
    const total = list.length;
    const confirmed = list.filter(r => r.status === 'Registered').length;
    const waitlisted = list.filter(r => r.status === 'Waitlisted').length;
    const checkedIn = list.filter(r => r.status === 'Checked In').length;
    const limit = announcement.seatsLimit || 100;
    const remaining = Math.max(0, limit - (confirmed + checkedIn));
    const rate = limit > 0 ? Math.round(((confirmed + checkedIn) / limit) * 100) : 0;

    return { total, confirmed, waitlisted, checkedIn, limit, remaining, rate };
  }, [registrations, announcement]);

  // Analytics aggregations (Dept, Year, Daily registrations)
  const analytics = useMemo(() => {
    const depts = {};
    const years = { '1': 0, '2': 0, '3': 0, '4': 0 };
    const dates = {};

    registrations.filter(r => r.status !== 'Cancelled').forEach(r => {
      const ddata = r.submittedData || {};
      
      // Dept
      const dept = (ddata.department || 'Other').toUpperCase().trim();
      depts[dept] = (depts[dept] || 0) + 1;

      // Year extraction from Class or Year
      const yearVal = ddata.year || ddata.className || '1';
      let year = '1';
      if (yearVal.toString().includes('4') || yearVal.toString().toUpperCase().includes('IV') || yearVal.toString().toUpperCase().includes('FINAL')) year = '4';
      else if (yearVal.toString().includes('3') || yearVal.toString().toUpperCase().includes('III') || yearVal.toString().toUpperCase().includes('THIRD')) year = '3';
      else if (yearVal.toString().includes('2') || yearVal.toString().toUpperCase().includes('II') || yearVal.toString().toUpperCase().includes('SECOND')) year = '2';
      else if (yearVal.toString().includes('1') || yearVal.toString().toUpperCase().includes('I') || yearVal.toString().toUpperCase().includes('FIRST')) year = '1';
      
      if (years[year] !== undefined) years[year]++;

      // Daily
      const dateStr = new Date(r.registeredAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
      dates[dateStr] = (dates[dateStr] || 0) + 1;
    });

    return { depts, years, dates };
  }, [registrations]);

  // Table filtering and search
  const filteredAttendees = useMemo(() => {
    return registrations.filter(r => {
      const ddata = r.submittedData || {};
      const matchesSearch = 
        (ddata.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.userEmail || '').toLowerCase().includes(search.toLowerCase()) ||
        (ddata.department || '').toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [registrations, search, statusFilter]);

  // Pagination
  const paginatedAttendees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAttendees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAttendees, currentPage]);

  const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage);

  const handleCheckIn = async (id, name) => {
    try {
      await db.update('EventRegistrations', id, {
        status: 'Checked In',
        checkedInAt: new Date().toISOString(),
        checkInMethod: 'Manual'
      });
      window.showToast('Checked In', `${name} has been checked in.`, 'success');
      loadRegistrations();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const handleMarkAbsent = async (id, name) => {
    try {
      await db.update('EventRegistrations', id, { status: 'Absent' });
      window.showToast('Absent Marked', `${name} is marked as absent.`, 'info');
      loadRegistrations();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  // Exporters
  const handleExportCSV = () => {
    if (!registrations.length) return;
    
    // Create header fields
    const customHeaders = announcement.formFields?.map(f => f.label) || [];
    const headers = ['Registration ID', 'Email', 'Registered On', 'Status', 'Full Name', 'Phone', 'Register Number', 'Year', 'Class', ...customHeaders];
    
    const rows = registrations.map(r => {
      const ddata = r.submittedData || {};
      const customRowData = announcement.formFields?.map(f => ddata[f.id] ?? '—') || [];
      return [
        r.id,
        r.userEmail,
        new Date(r.registeredAt).toLocaleDateString(),
        r.status,
        ddata.fullName || '—',
        ddata.phone || '—',
        ddata.registerNumber || '—',
        ddata.year || '—',
        ddata.className || '—',
        ...customRowData
      ].map(val => `"${val.toString().replace(/"/g, '""')}"`);
    });

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${announcement.title.toLowerCase().replace(/\s+/g, '_')}_registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Event Header Summary */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 12, padding: '1.25rem', display: 'flex', justifyItem: 'center', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dashboard for</span>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 850, color: 'var(--text)', margin: '0.15rem 0 0' }}>{announcement.title}</h2>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            <span><i className="fa-regular fa-calendar" /> {new Date(announcement.date).toLocaleDateString()}</span>
            <span>•</span>
            <span><i className="fa-solid fa-location-dot" /> {announcement.venue}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline btn-sm" onClick={handleExportCSV}>
            <i className="fas fa-file-csv" style={{ marginRight: '0.3rem' }} /> Export Excel / CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handlePrintReport}>
            <i className="fas fa-print" style={{ marginRight: '0.3rem' }} /> Print Attendee List
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Registrant', value: stats.total, color: 'var(--orange)', icon: 'fa-users' },
          { label: 'Confirmed Seats', value: stats.confirmed, color: '#3b82f6', icon: 'fa-circle-check' },
          { label: 'Waitlisted Count', value: stats.waitlisted, color: '#f59e0b', icon: 'fa-hourglass-half' },
          { label: 'Checked-In Day', value: stats.checkedIn, color: '#22c55e', icon: 'fa-clipboard-user' },
          { label: 'Remaining Seats', value: stats.remaining, color: '#6b7280', icon: 'fa-chair' },
          { label: 'Fill Ratio Rate', value: `${stats.rate}%`, color: 'var(--orange-dark)', icon: 'fa-chart-pie' },
        ].map((card, i) => (
          <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.74rem' }}>
              <span>{card.label}</span>
              <i className={`fas ${card.icon}`} style={{ color: card.color, opacity: 0.6 }} />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 850, color: 'var(--text)' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Interactive Charts Panels (Visual HSL Graphs) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Department chart */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem' }}>Department-wise Participation</h4>
          {Object.keys(analytics.depts).length === 0 ? (
            <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No data available</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {Object.entries(analytics.depts).map(([dept, count]) => {
                const pct = Math.max(8, Math.round((count / stats.total) * 100));
                return (
                  <div key={dept} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem' }}>
                    <span style={{ width: 60, fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dept}</span>
                    <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 6, height: 16, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, background: 'var(--orange)', height: '100%', borderRadius: 6, display: 'flex', alignItems: 'center', paddingLeft: 6, color: '#fff', fontSize: '0.65rem', fontWeight: 800 }}>
                        {count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Year chart */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem' }}>Academic Year Distribution</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {['1', '2', '3', '4'].map(yr => {
              const count = analytics.years[yr] || 0;
              const pct = stats.total > 0 ? Math.max(8, Math.round((count / stats.total) * 100)) : 0;
              return (
                <div key={yr} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem' }}>
                  <span style={{ width: 60, fontWeight: 700, textAlign: 'left' }}>Year {yr}</span>
                  <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 6, height: 16, overflow: 'hidden' }}>
                    {count > 0 ? (
                      <div style={{ width: `${pct}%`, background: '#3b82f6', height: '100%', borderRadius: 6, display: 'flex', alignItems: 'center', paddingLeft: 6, color: '#fff', fontSize: '0.65rem', fontWeight: 800 }}>
                        {count}
                      </div>
                    ) : (
                      <div style={{ paddingLeft: 6, color: 'var(--text-muted)', fontSize: '0.65rem' }}>0</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Registrant Table Card */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        
        {/* Table Filters & Search */}
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyItem: 'center', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 240 }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }} />
            <input
              className="form-input form-input-sm"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search registrant name, dept..."
              style={{ paddingLeft: '2rem', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['All', 'Registered', 'Checked In', 'Waitlisted', 'Absent'].map(tab => (
              <button
                key={tab}
                onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}
                style={{
                  background: statusFilter === tab ? 'var(--orange)' : 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 8,
                  padding: '0.35rem 0.75rem', fontSize: '0.74rem', fontWeight: 650,
                  color: statusFilter === tab ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table element */}
        {loading ? (
          <div className="loading-spinner" />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Contact Details</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Reg No, Yr & Class</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Registered On</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 1rem' }}>Action Operations</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No attendees match this filter.
                    </td>
                  </tr>
                ) : paginatedAttendees.map(r => {
                  const ddata = r.submittedData || {};
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, fontSize: '0.84rem', color: 'var(--text)' }}>
                        {ddata.fullName || '—'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
                        <div>{r.userEmail}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>{ddata.phone || '—'}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
                        <div>{ddata.registerNumber || '—'}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>Yr {ddata.year || '—'}, {ddata.className || '—'}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {new Date(r.registeredAt).toLocaleDateString()} at {new Date(r.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          padding: '0.15rem 0.5rem', borderRadius: 20, fontSize: '0.7rem', fontWeight: 800,
                          background: r.status === 'Checked In' ? 'rgba(34,197,94,0.1)' : r.status === 'Waitlisted' ? 'rgba(245,158,11,0.1)' : r.status === 'Absent' ? 'rgba(239,68,68,0.1)' : 'rgba(255,85,0,0.1)',
                          color: r.status === 'Checked In' ? '#22c55e' : r.status === 'Waitlisted' ? '#f59e0b' : r.status === 'Absent' ? '#ef4444' : 'var(--orange)'
                        }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                        {r.status !== 'Checked In' && r.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleCheckIn(r.id, ddata.fullName)}
                            style={{ background: '#dcfce7', border: 'none', borderRadius: 6, padding: '3px 8px', color: '#15803d', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Check-In
                          </button>
                        )}
                        {r.status === 'Checked In' && (
                          <button
                            onClick={() => handleMarkAbsent(r.id, ddata.fullName)}
                            style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, padding: '3px 8px', color: '#4b5563', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Mark Absent
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination footer */}
        {totalPages > 1 && (
          <div style={{ padding: '0.85rem 1rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyItem: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Showing {paginatedAttendees.length} of {filteredAttendees.length} records
            </span>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.3rem 0.6rem' }}
              >
                Prev
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.3rem 0.6rem' }}
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
