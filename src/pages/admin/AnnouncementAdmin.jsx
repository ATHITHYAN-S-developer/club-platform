import { useState, useEffect, useMemo } from 'react';
import db from '../../db';
import RegistrationDashboard from './RegistrationDashboard';

const LINK_TYPES_CONFIG = {
  website: { label: '🌐 Website', color: '#3b82f6', defaultTitle: 'Official Website', defaultText: 'Visit Website', domain: 'https://' },
  whatsapp: { label: '💬 WhatsApp Group', color: '#25d366', defaultTitle: 'WhatsApp Community', defaultText: 'Join WhatsApp Group', domain: 'chat.whatsapp.com' },
  youtube: { label: '🎥 YouTube Link', color: '#ef4444', defaultTitle: 'YouTube Video/Stream', defaultText: 'Watch Stream', domain: 'youtube.com' },
  github: { label: '💻 GitHub Repo', color: '#1f2937', defaultTitle: 'GitHub Repository', defaultText: 'View Repository', domain: 'github.com' },
  docs: { label: '📄 Documentation', color: '#4b5563', defaultTitle: 'Resources & Docs', defaultText: 'View Docs', domain: 'https://' },
  calendar: { label: '📅 Google Calendar', color: '#f59e0b', defaultTitle: 'Add to Calendar', defaultText: 'Add to Calendar', domain: 'https://' },
  maps: { label: '📍 Google Maps', color: '#10b981', defaultTitle: 'Event Location', defaultText: 'Open in Maps', domain: 'https://' },
  zoom: { label: '🎥 Zoom/Video Meeting', color: '#2563eb', defaultTitle: 'Zoom Meeting', defaultText: 'Join Meeting', domain: 'zoom.us' },
  discord: { label: '💬 Discord Server', color: '#5865f2', defaultTitle: 'Discord Community', defaultText: 'Join Discord', domain: 'discord' },
  telegram: { label: '💬 Telegram Channel', color: '#24a1de', defaultTitle: 'Telegram Community', defaultText: 'Join Telegram', domain: 't.me' },
  linkedin: { label: '👥 LinkedIn Page', color: '#0077b5', defaultTitle: 'LinkedIn Event', defaultText: 'View Event', domain: 'linkedin.com' },
  custom: { label: '🔗 Custom Link', color: 'var(--orange)', defaultTitle: 'Important Link', defaultText: 'Open Link', domain: 'https://' }
};

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'link_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
};

const validateLinkUrl = (type, url) => {
  if (!url || !url.startsWith('https://')) {
    return 'URL must start with https://';
  }
  try {
    new URL(url);
  } catch (e) {
    return 'Please enter a valid URL';
  }
  
  const config = LINK_TYPES_CONFIG[type];
  if (config && config.domain && config.domain !== 'https://') {
    if (!url.toLowerCase().includes(config.domain.toLowerCase())) {
      return `URL does not match the selected link type. Must contain '${config.domain}'`;
    }
  }
  return null;
};

export default function AnnouncementAdmin({ user }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  // Tab within Announcement Admin
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'form' | 'dashboard'
  const [selectedAnn, setSelectedAnn] = useState(null);

  // Form State
  const [form, setForm] = useState({
    title: '', category: 'Workshop', priority: 'Normal',
    date: '', eventTime: '', venue: '', organizer: 'Mindcraft AI',
    shortDescription: '', content: '', bannerUrl: '',
    pinned: false, status: 'draft', eventStatus: 'Draft',
    registrationEnabled: false, seatsLimit: 100, waitlistLimit: 10,
    registrationOpenDate: '', registrationCloseDate: '',
    allowCancellation: true, allowEditing: true, autoCloseWhenFull: true,
    formFields: [], faqs: [], gallery: { photos: [], videos: [], slides: [] },
    importantLinks: []
  });

  // FAQ builder helper state
  const [faqInput, setFaqInput] = useState({ q: '', a: '' });

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const all = await db.find('Announcements');
      setAnnouncements(all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch {
      window.showToast('Error', 'Could not load announcements.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAnnouncements(); }, []);

  const handleCreateNew = () => {
    setEditingId(null);
    setForm({
      title: '', category: 'Workshop', priority: 'Normal',
      date: '', eventTime: '', venue: '', organizer: 'Mindcraft AI',
      shortDescription: '', content: '', bannerUrl: '',
      pinned: false, status: 'draft', eventStatus: 'Draft',
      registrationEnabled: false, seatsLimit: 100, waitlistLimit: 10,
      registrationOpenDate: '', registrationCloseDate: '',
      allowCancellation: true, allowEditing: true, autoCloseWhenFull: true,
      formFields: [
        { id: 'fullName', label: 'Full Name', type: 'text', required: true },
        { id: 'email', label: 'Email Address', type: 'email', required: true },
        { id: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { id: 'department', label: 'Department', type: 'select', options: ['CSE', 'CSE (AI & ML)', 'AI & DS', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'MCA', 'MBA', 'Other'], required: true },
        { id: 'year', label: 'Year', type: 'select', options: ['1', '2', '3', '4'], required: true },
        { id: 'className', label: 'Class', type: 'text', required: true },
      ],
      faqs: [], gallery: { photos: [], videos: [], slides: [] },
      importantLinks: []
    });
    setCurrentView('form');
  };

  const handleEdit = (ann) => {
    setEditingId(ann.id);
    // Parse FAQs if stored as JSON string
    let parsedFaqs = ann.faqs || [];
    if (typeof parsedFaqs === 'string') {
      try { parsedFaqs = JSON.parse(parsedFaqs); } catch { parsedFaqs = []; }
    }

    let parsedLinks = ann.importantLinks || [];
    if (typeof parsedLinks === 'string') {
      try { parsedLinks = JSON.parse(parsedLinks); } catch { parsedLinks = []; }
    }
    
    setForm({
      ...ann,
      faqs: parsedFaqs,
      importantLinks: parsedLinks,
      gallery: ann.gallery || { photos: [], videos: [], slides: [] }
    });
    setCurrentView('form');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title) return;

    // Validate URLs in importantLinks
    const links = form.importantLinks || [];
    for (const link of links) {
      if (!link.url || link.url.trim() === '' || link.url === 'https://') {
        window.showToast('Validation Error', `URL is required for link "${link.title || 'Untitled'}"`, 'error');
        return;
      }
      const validationError = validateLinkUrl(link.type, link.url);
      if (validationError) {
        window.showToast('Invalid URL', `"${link.title || 'Untitled'}": ${validationError}`, 'error');
        return;
      }
    }

    try {
      const isDraft = form.eventStatus === 'Draft';
      const updatedStatus = isDraft ? 'draft' : 'published';
      const payload = {
        ...form,
        status: updatedStatus,
        faqs: JSON.stringify(form.faqs) // stringify to prevent complex object issues in simple dbs
      };

      if (editingId) {
        // Update
        await db.update('Announcements', editingId, payload);
        window.showToast('Updated', 'Announcement updated successfully.', 'success');
      } else {
        // Insert
        const newId = 'ann_' + Date.now();
        await db.insert('Announcements', {
          ...payload,
          id: newId,
          createdAt: new Date().toISOString(),
        });

        // Notify all users about new announcement only if not draft
        if (!isDraft) {
          await db.insert('Notifications', {
            id: 'nt_' + Date.now(),
            userId: 'all', // Broadcast to everyone
            title: `New announcement: ${form.title}`,
            message: form.shortDescription,
            read: false,
            createdAt: new Date().toISOString()
          });
        }

        window.showToast('Created', 'New announcement published.', 'success');
      }
      loadAnnouncements();
      setCurrentView('list');
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await db.delete('Announcements', id);
      window.showToast('Deleted', 'Announcement removed.', 'success');
      loadAnnouncements();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const handleTogglePin = async (ann) => {
    try {
      await db.update('Announcements', ann.id, { pinned: !ann.pinned });
      window.showToast(ann.pinned ? 'Unpinned' : 'Pinned', 'Notice priority updated.', 'info');
      loadAnnouncements();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  // Custom Field Form Functions
  const addCustomField = () => {
    const fieldId = 'cfield_' + Date.now();
    const newField = {
      id: fieldId,
      label: 'New Question',
      type: 'text',
      required: false,
      options: ['Option 1']
    };
    setForm(p => ({
      ...p,
      formFields: [...p.formFields, newField]
    }));
  };

  const removeCustomField = (id) => {
    setForm(p => ({
      ...p,
      formFields: p.formFields.filter(f => f.id !== id)
    }));
  };

  const updateFieldProperty = (id, prop, val) => {
    setForm(p => ({
      ...p,
      formFields: p.formFields.map(f => {
        if (f.id !== id) return f;
        const updated = { ...f, [prop]: val };
        // Initialize options if switching to option-based type
        if (['select', 'radio', 'checkbox'].includes(val) && prop === 'type' && (!f.options || f.options.length === 0)) {
          updated.options = ['Option 1'];
        }
        return updated;
      })
    }));
  };

  const addFieldOption = (fieldId, optionVal) => {
    if (!optionVal.trim()) return;
    setForm(p => ({
      ...p,
      formFields: p.formFields.map(f => {
        if (f.id !== fieldId) return f;
        return {
          ...f,
          options: [...(f.options || []), optionVal.trim()]
        };
      })
    }));
  };

  const removeFieldOption = (fieldId, index) => {
    setForm(p => ({
      ...p,
      formFields: p.formFields.map(f => {
        if (f.id !== fieldId) return f;
        return {
          ...f,
          options: (f.options || []).filter((_, i) => i !== index)
        };
      })
    }));
  };

  const updateFieldOption = (fieldId, index, newVal) => {
    setForm(p => ({
      ...p,
      formFields: p.formFields.map(f => {
        if (f.id !== fieldId) return f;
        const newOptions = [...(f.options || [])];
        newOptions[index] = newVal;
        return {
          ...f,
          options: newOptions
        };
      })
    }));
  };

  const moveField = (index, direction) => {
    const fields = [...form.formFields];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const temp = fields[index];
    fields[index] = fields[targetIndex];
    fields[targetIndex] = temp;
    setForm(p => ({ ...p, formFields: fields }));
  };

  // Important Links Manager helpers
  const addImportantLink = () => {
    const linkId = generateUUID();
    const defaultType = 'website';
    const typeConfig = LINK_TYPES_CONFIG[defaultType];
    const newLink = {
      id: linkId,
      type: defaultType,
      enabled: true,
      order: (form.importantLinks || []).length + 1,
      title: typeConfig.defaultTitle,
      description: '',
      text: typeConfig.defaultText,
      url: 'https://',
      showAfterRegistration: false,
      showQRCode: false
    };
    setForm(p => ({
      ...p,
      importantLinks: [...(p.importantLinks || []), newLink]
    }));
  };

  const removeImportantLink = (id) => {
    setForm(p => ({
      ...p,
      importantLinks: (p.importantLinks || []).filter(l => l.id !== id)
    }));
  };

  const updateImportantLink = (id, updates) => {
    setForm(p => ({
      ...p,
      importantLinks: (p.importantLinks || []).map(l => {
        if (l.id !== id) return l;
        return { ...l, ...updates };
      })
    }));
  };

  const moveImportantLink = (index, direction) => {
    const links = [...(form.importantLinks || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= links.length) return;

    // Swap order
    const temp = links[index].order;
    links[index].order = links[targetIdx].order;
    links[targetIdx].order = temp;

    setForm(p => ({
      ...p,
      importantLinks: links
    }));
  };

  // FAQ Form Functions
  const addFaq = () => {
    if (!faqInput.q || !faqInput.a) return;
    setForm(p => ({
      ...p,
      faqs: [...p.faqs, faqInput]
    }));
    setFaqInput({ q: '', a: '' });
  };

  const removeFaq = (index) => {
    setForm(p => ({
      ...p,
      faqs: p.faqs.filter((_, i) => i !== index)
    }));
  };

  const [uploadingImage, setUploadingImage] = useState(false);
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const publicUrl = await db.uploadFile(file, 'uploads');
      setForm(p => ({ ...p, bannerUrl: publicUrl }));
      window.showToast('Uploaded', 'Banner image uploaded successfully!', 'success');
    } catch (err) {
      window.showToast('Error', 'Image upload failed: ' + err.message, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDownloadCSV = async (ann) => {
    try {
      const regs = await db.find('EventRegistrations');
      const filtered = regs.filter(r => r.announcementId === ann.id);
      if (!filtered.length) {
        window.showToast('No Data', 'No registrations found for this event.', 'info');
        return;
      }
      
      const customHeaders = ann.formFields?.map(f => f.label) || [];
      const headers = ['Registration ID', 'Email', 'Registered On', 'Status', 'Full Name', 'Phone', 'Register Number', 'Year', 'Class', ...customHeaders];
      
      const rows = filtered.map(r => {
        const ddata = r.submittedData || {};
        const customRowData = ann.formFields?.map(f => ddata[f.id] ?? '—') || [];
        return [
          r.id || '—',
          r.userEmail || '—',
          r.registeredAt ? new Date(r.registeredAt).toLocaleDateString() : '—',
          r.status || '—',
          ddata.fullName || '—',
          ddata.phone || '—',
          ddata.registerNumber || '—',
          ddata.year || '—',
          ddata.className || '—',
          ...customRowData
        ].map(val => {
          const safeVal = val === null || val === undefined ? '—' : val;
          return `"${safeVal.toString().replace(/"/g, '""')}"`;
        });
      });

      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${ann.title.toLowerCase().replace(/\s+/g, '_')}_registrations.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.showToast('Downloaded', 'CSV file downloaded successfully.', 'success');
    } catch (err) {
      window.showToast('Error', 'Failed to export CSV: ' + err.message, 'error');
    }
  };

  if (currentView === 'dashboard' && selectedAnn) {
    return (
      <div>
        <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedAnn(null); setCurrentView('list'); }} style={{ marginBottom: '1.25rem' }}>
          <i className="fas fa-arrow-left" /> Back to Announcements list
        </button>
        <RegistrationDashboard announcement={selectedAnn} user={user} />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      
      {/* Header tab controls */}
      <div className="ann-header-row" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
            📢 Event & Announcement Manager
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
            Manage club notices, configure event registrations, and review attendees.
          </p>
        </div>

        {currentView === 'list' ? (
          <button className="btn btn-primary btn-sm" onClick={handleCreateNew}>
            <i className="fa-solid fa-plus" /> New Announcement
          </button>
        ) : (
          <button className="btn btn-secondary btn-sm" onClick={() => setCurrentView('list')}>
            Cancel
          </button>
        )}
      </div>

      {currentView === 'list' ? (
        /* Render Table list */
        loading ? (
          <div className="loading-spinner" />
        ) : (
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Title</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Priority</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Event Status</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Registrations</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No announcements posted yet.
                    </td>
                  </tr>
                ) : announcements.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 650 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {a.pinned && <i className="fas fa-thumbtack" style={{ color: 'var(--orange)', fontSize: '0.78rem' }} />}
                        <span style={{ fontSize: '0.86rem', color: 'var(--text)' }}>{a.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.8rem' }}>{a.category}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: a.priority === 'Urgent' ? '#ef4444' : a.priority === 'Important' ? '#f59e0b' : '#10b981', fontWeight: 700 }}>
                      {a.priority}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.8rem' }}>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, background: a.eventStatus === 'Completed' ? 'rgba(0,0,0,0.06)' : a.eventStatus === 'Registration Open' ? 'rgba(34,197,94,0.1)' : 'rgba(255,85,0,0.1)', color: a.eventStatus === 'Completed' ? '#6b7280' : a.eventStatus === 'Registration Open' ? '#22c55e' : 'var(--orange)' }}>
                        {a.eventStatus || 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.8rem' }}>
                      {a.registrationEnabled ? (
                        <button
                          onClick={() => { setSelectedAnn(a); setCurrentView('dashboard'); }}
                          style={{ background: 'rgba(255,85,0,0.08)', border: 'none', borderRadius: 6, padding: '3px 8px', color: 'var(--orange)', fontWeight: 700, cursor: 'pointer', fontSize: '0.74rem' }}
                        >
                          View Registrations
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Disabled</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                      {a.registrationEnabled && (
                        <button onClick={() => handleDownloadCSV(a)} style={{ background: '#e0f2fe', border: 'none', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0284c7' }} title="Download registrations (Excel/CSV)">
                          <i className="fa-solid fa-download" />
                        </button>
                      )}
                      <button onClick={() => handleTogglePin(a)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }} title={a.pinned ? 'Unpin' : 'Pin'}>
                        <i className="fa-solid fa-thumbtack" />
                      </button>
                      <button onClick={() => handleEdit(a)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Edit">
                        <i className="fa-solid fa-pen" />
                      </button>
                      <button onClick={() => handleDelete(a.id, a.title)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#dc2626' }} title="Delete">
                        <i className="fa-solid fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Render Create / Edit Form */
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Section: Basic Information */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 12, padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              1. Basic Information
            </h4>
            <div className="ann-grid-2" style={{ marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Announcement Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="e.g. LLM Hackathon 2026" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Category *</label>
                <select className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ width: '100%' }}>
                  <option value="Workshop">Workshop</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Recruitment">Recruitment</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="ann-grid-3" style={{ marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Priority *</label>
                <select className="form-input" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} style={{ width: '100%' }}>
                  <option value="Normal">Normal</option>
                  <option value="Important">Important</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Event Status *</label>
                <select className="form-input" value={form.eventStatus} onChange={e => setForm(p => ({ ...p, eventStatus: e.target.value }))} style={{ width: '100%' }}>
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Registration Open">Registration Open</option>
                  <option value="Registration Closed">Registration Closed</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '1.2rem', gap: '0.5rem' }}>
                <input type="checkbox" id="pinned" checked={form.pinned} onChange={e => setForm(p => ({ ...p, pinned: e.target.checked }))} />
                <label htmlFor="pinned" style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text)' }}>Pin Announcement</label>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Banner Image</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  disabled={uploadingImage}
                  style={{ display: 'none' }}
                  id="banner-file-input"
                />
                <label
                  htmlFor="banner-file-input"
                  className="btn btn-secondary btn-sm"
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem' }}
                >
                  <i className="fa-solid fa-cloud-arrow-up" />
                  {uploadingImage ? 'Uploading image...' : 'Upload Banner Image'}
                </label>
                
                {form.bannerUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img
                      src={form.bannerUrl}
                      alt="Banner Preview"
                      style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, bannerUrl: '' }))}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 650 }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Short Description *</label>
              <input className="form-input" value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))} required placeholder="Summarize the announcement in 1-2 sentences" style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Rich Text Content (Supports Markdown headings #, list *, code ```) *</label>
              <textarea className="form-input" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} required placeholder="Write detailed markdown-like instructions, event details, venue links..." style={{ width: '100%', minHeight: 120, fontFamily: 'monospace', fontSize: '0.84rem' }} />
            </div>
          </div>

          {/* Section: Event & Organizer Details */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 12, padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              2. Event Coordinates & Venue
            </h4>
            <div className="ann-grid-2" style={{ marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Event Date (YYYY-MM-DD)</label>
                <input className="form-input" type="date" value={form.date || ''} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Event Time</label>
                <input className="form-input" value={form.eventTime || ''} onChange={e => setForm(p => ({ ...p, eventTime: e.target.value }))} placeholder="e.g. 10:00 AM" style={{ width: '100%' }} />
              </div>
            </div>

                <div className="ann-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Venue</label>
                <input className="form-input" value={form.venue || ''} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} placeholder="e.g. Seminar Hall A / Google Meet" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Organizer Name</label>
                <input className="form-input" value={form.organizer || ''} onChange={e => setForm(p => ({ ...p, organizer: e.target.value }))} style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Section: Important Links */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 12, padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              3. Important Links
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
              {(form.importantLinks || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map((link, idx) => {
                const config = LINK_TYPES_CONFIG[link.type] || LINK_TYPES_CONFIG.custom;
                return (
                  <div key={link.id} style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderLeft: `4px solid ${config.color}`,
                    borderRadius: 12,
                    padding: '1.25rem',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    {/* Top Row: Type select & Title */}
                    <div className="ann-grid-2">
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Link Type</label>
                        <select
                          className="form-input form-input-sm"
                          value={link.type}
                          onChange={e => {
                            const newType = e.target.value;
                            const typeConfig = LINK_TYPES_CONFIG[newType];
                            updateImportantLink(link.id, {
                              type: newType,
                              title: typeConfig.defaultTitle,
                              text: typeConfig.defaultText
                            });
                          }}
                          style={{ width: '100%' }}
                        >
                          {Object.entries(LINK_TYPES_CONFIG).map(([val, cfg]) => (
                            <option key={val} value={val}>{cfg.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Title</label>
                        <input
                          className="form-input form-input-sm"
                          value={link.title || ''}
                          onChange={e => updateImportantLink(link.id, { title: e.target.value })}
                          placeholder="e.g. Official Website"
                          style={{ width: '100%', fontWeight: 700 }}
                        />
                      </div>
                    </div>

                    {/* Middle Row: Description, Button Text, URL */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Description</label>
                        <input
                          className="form-input form-input-sm"
                          value={link.description || ''}
                          onChange={e => updateImportantLink(link.id, { description: e.target.value })}
                          placeholder="Optional short description..."
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Button Text</label>
                          <input
                            className="form-input form-input-sm"
                            value={link.text || ''}
                            onChange={e => updateImportantLink(link.id, { text: e.target.value })}
                            placeholder="Button label..."
                            style={{ width: '100%' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Order</label>
                          <input
                            className="form-input form-input-sm"
                            type="number"
                            value={link.order || 0}
                            onChange={e => updateImportantLink(link.id, { order: parseInt(e.target.value) || 0 })}
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>URL Link *</label>
                      <input
                        className="form-input form-input-sm"
                        value={link.url || ''}
                        onChange={e => updateImportantLink(link.id, { url: e.target.value })}
                        placeholder="https://"
                        style={{ width: '100%' }}
                      />
                    </div>

                    {/* Bottom Toggles & Delete */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-light)',
                      paddingTop: '0.65rem',
                      marginTop: '0.25rem',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <input
                            type="checkbox"
                            id={`enabled-${link.id}`}
                            checked={link.enabled !== false}
                            onChange={e => updateImportantLink(link.id, { enabled: e.target.checked })}
                          />
                          <label htmlFor={`enabled-${link.id}`} style={{ fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            Enabled
                          </label>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <input
                            type="checkbox"
                            id={`showAfterReg-${link.id}`}
                            checked={link.showAfterRegistration || false}
                            onChange={e => updateImportantLink(link.id, { showAfterRegistration: e.target.checked })}
                          />
                          <label htmlFor={`showAfterReg-${link.id}`} style={{ fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            Show After Registration (Ticket)
                          </label>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <input
                            type="checkbox"
                            id={`showQRCode-${link.id}`}
                            checked={link.showQRCode || false}
                            onChange={e => updateImportantLink(link.id, { showQRCode: e.target.checked })}
                          />
                          <label htmlFor={`showQRCode-${link.id}`} style={{ fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            Generate QR Code
                          </label>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {/* Order buttons */}
                        <button
                          type="button"
                          onClick={() => moveImportantLink(idx, -1)}
                          disabled={idx === 0}
                          style={{
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            opacity: idx === 0 ? 0.4 : 1
                          }}
                          title="Move Up"
                        >
                          <i className="fa-solid fa-chevron-up" style={{ fontSize: '0.7rem' }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImportantLink(idx, 1)}
                          disabled={idx === (form.importantLinks || []).length - 1}
                          style={{
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            opacity: idx === (form.importantLinks || []).length - 1 ? 0.4 : 1
                          }}
                          title="Move Down"
                        >
                          <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.7rem' }} />
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => removeImportantLink(link.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.08)',
                            color: '#ef4444',
                            border: 'none',
                            padding: '0.35rem 0.65rem',
                            borderRadius: 8,
                            fontSize: '0.72rem',
                            fontWeight: 650,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            cursor: 'pointer'
                          }}
                        >
                          <i className="fa-solid fa-trash-can" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addImportantLink}
              style={{
                borderRadius: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1.25rem',
                cursor: 'pointer'
              }}
            >
              <i className="fa-solid fa-plus" /> Add Link
            </button>
          </div>

          {/* Section: Registration Controls */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 12, padding: '1.25rem' }}>
            <h4 className="ann-section-header" style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span>4. Registration Controls</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <input type="checkbox" id="regEnabled" checked={form.registrationEnabled} onChange={e => setForm(p => ({ ...p, registrationEnabled: e.target.checked }))} />
                <label htmlFor="regEnabled" style={{ fontSize: '0.74rem', fontWeight: 700 }}>Enable Registration Form</label>
              </div>
            </h4>

            {form.registrationEnabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="ann-grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Seat Limit (Max Capacity)</label>
                    <input className="form-input" type="number" min="1" value={form.seatsLimit || 100} onChange={e => setForm(p => ({ ...p, seatsLimit: parseInt(e.target.value) }))} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Waitlist Limit</label>
                    <input className="form-input" type="number" min="0" value={form.waitlistLimit || 10} onChange={e => setForm(p => ({ ...p, waitlistLimit: parseInt(e.target.value) }))} style={{ width: '100%' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input type="checkbox" id="allowCancel" checked={form.allowCancellation} onChange={e => setForm(p => ({ ...p, allowCancellation: e.target.checked }))} />
                      <label htmlFor="allowCancel" style={{ fontSize: '0.72rem', fontWeight: 600 }}>Allow Cancellations</label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input type="checkbox" id="allowEdit" checked={form.allowEditing} onChange={e => setForm(p => ({ ...p, allowEditing: e.target.checked }))} />
                      <label htmlFor="allowEdit" style={{ fontSize: '0.72rem', fontWeight: 600 }}>Allow Editing Info</label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input type="checkbox" id="autoClose" checked={form.autoCloseWhenFull} onChange={e => setForm(p => ({ ...p, autoCloseWhenFull: e.target.checked }))} />
                      <label htmlFor="autoClose" style={{ fontSize: '0.72rem', fontWeight: 600 }}>Auto-Close when full</label>
                    </div>
                  </div>
                </div>

            <div className="ann-grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Registration Open Date</label>
                    <input className="form-input" type="date" value={form.registrationOpenDate || ''} onChange={e => setForm(p => ({ ...p, registrationOpenDate: e.target.value }))} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Registration Close Date</label>
                    <input className="form-input" type="date" value={form.registrationCloseDate || ''} onChange={e => setForm(p => ({ ...p, registrationCloseDate: e.target.value }))} style={{ width: '100%' }} />
                  </div>                {/* Form Fields builder */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 750, color: 'var(--text)', marginBottom: '0.75rem' }}>
                    Custom Registration Form Fields
                  </label>
                  
                  {/* Google Forms-like field cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                    {form.formFields?.map((f, idx) => {
                      const isCore = ['fullName', 'email', 'phone', 'department', 'year', 'className'].includes(f.id);
                      const hasOptions = ['select', 'radio', 'checkbox'].includes(f.type);
                      
                      return (
                        <div key={f.id} style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderLeft: '4px solid var(--orange)',
                          borderRadius: 12,
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.85rem',
                          position: 'relative'
                        }}>
                          {/* Top line with Label and Type */}
                          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {f.type === 'url' ? (
                              <div style={{ flex: 1, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: 150 }}>
                                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                                    Heading Title
                                  </label>
                                  <input
                                    className="form-input form-input-sm"
                                    value={f.label}
                                    onChange={e => updateFieldProperty(f.id, 'label', e.target.value)}
                                    placeholder="e.g. Join WhatsApp Group"
                                    style={{ width: '100%', fontWeight: 700 }}
                                    required
                                  />
                                </div>
                                <div style={{ flex: 1.5, minWidth: 200 }}>
                                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                                    Pasting URL
                                  </label>
                                  <input
                                    className="form-input form-input-sm"
                                    value={f.url || ''}
                                    onChange={e => updateFieldProperty(f.id, 'url', e.target.value)}
                                    placeholder="e.g. https://chat.whatsapp.com/..."
                                    style={{ width: '100%', fontWeight: 700 }}
                                    required
                                  />
                                </div>
                              </div>
                            ) : (
                              <div style={{ flex: 1, minWidth: 200 }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                                  Question Title
                                </label>
                                <input
                                  className="form-input form-input-sm"
                                  value={f.label}
                                  onChange={e => updateFieldProperty(f.id, 'label', e.target.value)}
                                  placeholder="e.g. GitHub Profile"
                                  style={{ width: '100%', fontWeight: 700 }}
                                  required
                                />
                              </div>
                            )}
                            <div style={{ width: 180 }}>
                              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                                Input Type
                              </label>
                              <select
                                className="form-input form-input-sm"
                                value={f.type}
                                disabled={isCore && f.id !== 'department' && f.id !== 'year'}
                                onChange={e => updateFieldProperty(f.id, 'type', e.target.value)}
                                style={{ width: '100%', cursor: 'pointer' }}
                              >
                                <option value="text">Short Text</option>
                                <option value="textarea">Paragraph</option>
                                <option value="number">Number</option>
                                <option value="email">Email</option>
                                <option value="url">URL Link</option>
                                <option value="radio">Multiple Choice (Radio)</option>
                                <option value="checkbox">Checkboxes</option>
                                <option value="select">Dropdown</option>
                              </select>
                            </div>
                          </div>

                          {/* Options List for Radio, Checkbox, Select */}
                          {hasOptions && (
                            <div style={{
                              background: 'var(--card)',
                              padding: '1rem',
                              borderRadius: 8,
                              border: '1px solid var(--border-light)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.5rem'
                            }}>
                              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                Configure Options:
                              </span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {f.options?.map((opt, oIdx) => (
                                  <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {f.type === 'radio' && <i className="fa-regular fa-circle" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />}
                                    {f.type === 'checkbox' && <i className="fa-regular fa-square" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />}
                                    {f.type === 'select' && <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{oIdx + 1}.</span>}
                                    
                                    <input
                                      className="form-input form-input-sm"
                                      value={opt}
                                      onChange={e => updateFieldOption(f.id, oIdx, e.target.value)}
                                      placeholder={`Option ${oIdx + 1}`}
                                      style={{ flex: 1, padding: '0.25rem 0.5rem', height: 'auto', minHeight: 'unset' }}
                                      required
                                    />
                                    
                                    <button
                                      type="button"
                                      onClick={() => removeFieldOption(f.id, oIdx)}
                                      disabled={f.options.length <= 1}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        opacity: f.options.length <= 1 ? 0.4 : 1
                                      }}
                                      title="Remove option"
                                    >
                                      <i className="fa-solid fa-trash-can" style={{ fontSize: '0.8rem' }} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Add Option Form Row */}
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  className="form-input form-input-sm"
                                  placeholder="Add new option..."
                                  id={`new-opt-input-${f.id}`}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addFieldOption(f.id, e.target.value);
                                      e.target.value = '';
                                    }
                                  }}
                                  style={{ flex: 1, padding: '0.25rem 0.5rem', height: 'auto', minHeight: 'unset' }}
                                />
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.25rem 0.75rem', height: 'auto', minHeight: 'unset', fontSize: '0.72rem' }}
                                  onClick={() => {
                                    const inputEl = document.getElementById(`new-opt-input-${f.id}`);
                                    if (inputEl && inputEl.value.trim()) {
                                      addFieldOption(f.id, inputEl.value);
                                      inputEl.value = '';
                                    }
                                  }}
                                >
                                  Add Option
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Card Footer Controls */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderTop: '1px solid var(--border-light)',
                            paddingTop: '0.65rem',
                            marginTop: '0.25rem'
                          }}>
                            {/* Reordering and field identification */}
                            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveField(idx, -1)}
                                style={{
                                  background: 'var(--card)',
                                  border: '1px solid var(--border)',
                                  borderRadius: 6,
                                  width: 24,
                                  height: 24,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  opacity: idx === 0 ? 0.4 : 1
                                }}
                                title="Move Up"
                              >
                                <i className="fa-solid fa-chevron-up" style={{ fontSize: '0.7rem' }} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === form.formFields.length - 1}
                                onClick={() => moveField(idx, 1)}
                                style={{
                                  background: 'var(--card)',
                                  border: '1px solid var(--border)',
                                  borderRadius: 6,
                                  width: 24,
                                  height: 24,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  opacity: idx === form.formFields.length - 1 ? 0.4 : 1
                                }}
                                title="Move Down"
                              >
                                <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.7rem' }} />
                              </button>
                              
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                                {isCore ? 'System Field' : 'Custom Field'}
                              </span>
                            </div>

                            {/* Required switch + Delete */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <input
                                  type="checkbox"
                                  id={`req-check-${f.id}`}
                                  checked={f.required}
                                  disabled={isCore}
                                  onChange={e => updateFieldProperty(f.id, 'required', e.target.checked)}
                                />
                                <label htmlFor={`req-check-${f.id}`} style={{ fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                  Required
                                </label>
                              </div>
                              
                              {!isCore && (
                                <button
                                  type="button"
                                  className="btn btn-sm"
                                  onClick={() => removeCustomField(f.id)}
                                  style={{
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    color: '#ef4444',
                                    border: 'none',
                                    padding: '0.35rem 0.65rem',
                                    borderRadius: 8,
                                    fontSize: '0.72rem',
                                    fontWeight: 650,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <i className="fa-solid fa-trash-can" /> Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Field Button */}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={addCustomField}
                    style={{
                      borderRadius: 8,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 1.25rem',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="fa-solid fa-plus" /> Add Custom Question
                  </button>
                </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: FAQs list */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 12, padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              5. Event FAQs Accordions
            </h4>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {form.faqs?.map((faq, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyItem: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.8rem' }}>
                  <div style={{ textAlign: 'left' }}>
                    <strong>Q: {faq.q}</strong>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '0.15rem' }}>A: {faq.a}</div>
                  </div>
                  <button type="button" onClick={() => removeFaq(i)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                    <i className="fas fa-trash" />
                  </button>
                </div>
              ))}
            </div>

            {/* FAQ Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--card)', border: '1px dashed var(--border)', padding: '0.85rem', borderRadius: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Question</label>
                <input className="form-input form-input-sm" value={faqInput.q} onChange={e => setFaqInput(p => ({ ...p, q: e.target.value }))} placeholder="e.g. Do I need to bring a laptop?" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Answer</label>
                <input className="form-input form-input-sm" value={faqInput.a} onChange={e => setFaqInput(p => ({ ...p, a: e.target.value }))} placeholder="e.g. Yes, please bring your laptop with Node.js installed." style={{ width: '100%' }} />
              </div>
              <button type="button" onClick={addFaq} className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}>
                Add FAQ
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setCurrentView('list')} style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              <i className="fa-solid fa-floppy-disk" /> {editingId ? 'Save Changes' : 'Publish Announcement'}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
