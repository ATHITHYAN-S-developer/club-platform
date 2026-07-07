import { useState, useEffect, useRef } from 'react';
import db, { supabaseServiceClient } from '../db';
import QuizManagement from './admin/QuizManagement';
import LeaderboardAdmin from './admin/LeaderboardAdmin';
import StudentManagement from './admin/StudentManagement';
import AnalyticsTab from './admin/AnalyticsTab';
import SecuritySettings from './admin/SecuritySettings';
import AnnouncementAdmin from './admin/AnnouncementAdmin';

const SIDEBAR_SECTIONS = [
  {
    label: 'MAIN',
    items: [
      { id: 'dashboard',   label: 'Dashboard',     icon: 'fa-chart-pie' },
      { id: 'analytics',   label: 'Analytics',     icon: 'fa-chart-line' },
      { id: 'winners',     label: 'Winners',       icon: 'fa-trophy' },
      { id: 'leaderboard', label: 'Leaderboard',   icon: 'fa-ranking-star' },
    ]
  },
  {
    label: 'MANAGEMENT',
    items: [
      { id: 'members',     label: 'Members',       icon: 'fa-users' },
      { id: 'core',        label: 'Core Board',    icon: 'fa-star' },
      { id: 'events',      label: 'Events',        icon: 'fa-calendar' },
      { id: 'announcements', label: 'Announcements', icon: 'fa-bullhorn' },
      { id: 'messages',    label: 'Messages',      icon: 'fa-envelope' },
      { id: 'quizzes',     label: 'Quizzes',       icon: 'fa-question-circle' },
      { id: 'students',    label: 'Students',      icon: 'fa-graduation-cap' },
      { id: 'security',    label: 'Security',      icon: 'fa-shield-halved' },
      { id: 'badges',      label: 'Badges',        icon: 'fa-medal' },
    ]
  }
];

/* ── helpers ── */
function downloadCSV(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r[h] ?? '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function Badge({ color, children }) {
  const colors = {
    green:  { bg: '#dcfce7', text: '#15803d' },
    orange: { bg: '#ffedd5', text: '#c2410c' },
    blue:   { bg: '#dbeafe', text: '#1d4ed8' },
    grey:   { bg: '#f3f4f6', text: '#6b7280' },
  };
  const c = colors[color] || colors.grey;
  return (
    <span style={{ background: c.bg, color: c.text, padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em' }}>
      {children}
    </span>
  );
}

/* ═══════════════════════════════════ MEMBERS TAB ═══════════════════════════════════ */
function MembersTab() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    try { setMembers(await db.find('Users')); }
    catch { window.showToast('Error', 'Could not load members.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDeleteMember = async (id, name, email) => {
    if (!window.confirm(`Are you sure you want to delete member "${name}"?`)) return;
    try {
      await db.delete('Users', id, email);
      window.showToast('Member Deleted', 'The member record has been removed.', 'success');
      load();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const filtered = members.filter(m =>
    (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.role || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.45rem 0.9rem', flex: 1, maxWidth: 320 }}>
          <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members…" style={{ border: 'none', background: 'none', fontSize: '0.88rem', color: 'var(--text)', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => downloadCSV(filtered, 'members.csv')}>
            <i className="fa-solid fa-download" /> Export CSV
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>All Members</span>
          <Badge color="blue">{filtered.length} total</Badge>
        </div>
        {loading ? (
          <div className="loading-spinner" />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th><th>Year</th><th>Department</th><th>Joined</th><th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No members found</td></tr>
                ) : filtered.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <img src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || 'U')}&background=ff5500&color=fff`} alt={m.name} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                        <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem' }}>{m.name || '—'}</span>
                      </div>
                    </td>
                    <td>{m.email}</td>
                    <td><Badge color={m.role === 'admin' ? 'orange' : 'grey'}>{m.role || 'member'}</Badge></td>
                    <td>{m.year || '—'}</td>
                    <td>{m.department || '—'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => handleDeleteMember(m.id, m.name, m.email)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#dc2626', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ CORE BOARD TAB ═══════════════════════════════════ */
function CoreBoardTab({ allMembers }) {
  const [coreMembers, setCoreMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: '', year: '', linkedin: '', instagram: '', github: '', portfolio: '', description: '' });
  const fileRef = useRef();

  const load = async () => {
    try { setCoreMembers(await db.find('CoreMembers')); }
    catch { window.showToast('Error', 'Could not load core members.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const isLinkedMember = email => allMembers.some(m => m.email?.toLowerCase() === email?.toLowerCase());

  const handleStartEdit = m => {
    setEditingId(m.id);
    setForm({
      name: m.name || '',
      email: m.email || '',
      role: m.role || '',
      year: m.year || '',
      linkedin: m.linkedin || '',
      instagram: m.instagram || '',
      github: m.github || '',
      portfolio: m.portfolio || '',
      description: m.description || ''
    });
    setImagePreview(m.photo || '');
    setImageFile(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', email: '', role: '', year: '', linkedin: '', instagram: '', github: '', portfolio: '', description: '' });
    setImagePreview('');
    setImageFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.role) {
      window.showToast('Missing Fields', 'Name, Email and Role are required.', 'error'); return;
    }
    setUploading(true);
    try {
      let photoUrl = imagePreview;

      if (imageFile) {
        // Upload image to Supabase
        const ext = imageFile.name.split('.').pop();
        const path = `core/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabaseServiceClient.storage.from('member_photos').upload(path, imageFile, { upsert: true });
        if (uploadError) throw new Error(uploadError.message);
        const { data: { publicUrl } } = supabaseServiceClient.storage.from('member_photos').getPublicUrl(path);
        photoUrl = publicUrl;
      } else if (!photoUrl && !editingId) {
        window.showToast('No Photo', 'Please select a photo first.', 'error');
        setUploading(false);
        return;
      }

      if (editingId) {
        await db.update('CoreMembers', editingId, { ...form, photo: photoUrl });
        window.showToast('Updated!', `${form.name} updated successfully.`, 'success');
      } else {
        await db.insert('CoreMembers', { ...form, photo: photoUrl, createdAt: new Date().toISOString() });
        window.showToast('Added!', `${form.name} added to the Core Board.`, 'success');
      }
      handleCancelEdit();
      load();
    } catch (err) {
      window.showToast('Operation Failed', err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, name, email) => {
    if (!window.confirm(`Delete ${name} from Core Board?`)) return;
    try {
      await db.delete('CoreMembers', id, email);
      window.showToast('Deleted', `${name} removed.`, 'success');
      setCoreMembers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  return (
    <div className="admin-grid-layout">
      {/* ADD FORM */}
      <div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)' }}>
            <i className={editingId ? "fa-solid fa-user-pen" : "fa-solid fa-user-plus"} style={{ color: 'var(--orange)', marginRight: '0.5rem' }} />
            {editingId ? 'Edit Core Member' : 'Add Core Member'}
          </h3>

          {/* Photo Upload */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div onClick={() => fileRef.current?.click()} style={{ width: 90, height: 90, borderRadius: '50%', margin: '0 auto 0.75rem', background: 'var(--surface)', border: `2px dashed ${imagePreview ? 'var(--orange)' : 'var(--border)'}`, overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.25s' }}>
              {imagePreview ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className="fa-solid fa-camera" style={{ color: 'var(--text-muted)', fontSize: '1.4rem' }} />}
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()}>
              <i className="fa-solid fa-upload" /> {imageFile ? 'Change Photo' : 'Upload Photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </div>

          {[
            { key: 'name',      placeholder: 'Full Name *',    icon: 'fa-user' },
            { key: 'email',     placeholder: 'Email *',        icon: 'fa-envelope' },
            { key: 'role',      placeholder: 'Role / Position *', icon: 'fa-id-badge' },
            { key: 'year',      placeholder: 'Year (e.g. 2024)', icon: 'fa-graduation-cap' },
            { key: 'linkedin',  placeholder: 'LinkedIn URL',   icon: 'fa-linkedin' },
            { key: 'instagram', placeholder: 'Instagram URL',  icon: 'fa-instagram' },
            { key: 'github',    placeholder: 'GitHub URL',     icon: 'fa-github' },
            { key: 'portfolio', placeholder: 'Portfolio URL',  icon: 'fa-globe' },
          ].map(({ key, placeholder, icon }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.85rem', marginBottom: '0.65rem' }}>
              <i className={`fa-${icon.includes('linkedin') || icon.includes('instagram') || icon.includes('github') ? 'brands' : 'solid'} ${icon}`} style={{ color: 'var(--text-muted)', fontSize: '0.82rem', width: 16, textAlign: 'center' }} />
              <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} style={{ border: 'none', background: 'none', fontSize: '0.86rem', color: 'var(--text)', width: '100%' }} />
            </div>
          ))}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.85rem', marginBottom: '0.65rem' }}>
            <i className="fa-solid fa-paragraph" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', width: 16, textAlign: 'center', marginTop: '0.25rem' }} />
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description / Bio" rows={3} style={{ border: 'none', background: 'none', fontSize: '0.86rem', color: 'var(--text)', width: '100%', resize: 'none', outline: 'none', fontFamily: 'inherit' }} />
          </div>

          {form.email && (
            <div style={{ marginBottom: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 8, background: isLinkedMember(form.email) ? '#dcfce7' : '#fef9c3', fontSize: '0.78rem', color: isLinkedMember(form.email) ? '#15803d' : '#92400e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <i className={`fa-solid ${isLinkedMember(form.email) ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
              {isLinkedMember(form.email) ? 'Email found in members list — will be auto-linked.' : 'Email not found in members list.'}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleAdd} disabled={uploading}>
              {uploading ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : <><i className="fa-solid fa-check" /> {editingId ? 'Save Changes' : 'Add Member'}</>}
            </button>
            {editingId && (
              <button className="btn btn-secondary" style={{ padding: '0.72rem 1.2rem' }} onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CORE MEMBERS LIST */}
      <div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>Current Core Board</span>
            <Badge color="orange">{coreMembers.length} members</Badge>
          </div>
          {loading ? <div className="loading-spinner" /> : (
            <div style={{ padding: '0.75rem' }}>
              {coreMembers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-star" style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.3 }} />
                  <p style={{ fontSize: '0.88rem' }}>No core members yet.</p>
                </div>
              ) : coreMembers.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem', borderRadius: 10, transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <img src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=ff5500&color=fff`} alt={m.name} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{m.name}</span>
                      {isLinkedMember(m.email) && <Badge color="green">Linked</Badge>}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{m.role}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                      {m.linkedin && <a href={m.linkedin} target="_blank" rel="noreferrer" style={{ color: '#0077b5', fontSize: '0.85rem' }}><i className="fa-brands fa-linkedin" /></a>}
                      {m.github && <a href={m.github} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}><i className="fa-brands fa-github" /></a>}
                      {m.instagram && <a href={m.instagram} target="_blank" rel="noreferrer" style={{ color: '#e1306c', fontSize: '0.85rem' }}><i className="fa-brands fa-instagram" /></a>}
                      {m.portfolio && <a href={m.portfolio} target="_blank" rel="noreferrer" style={{ color: 'var(--orange)', fontSize: '0.85rem' }}><i className="fa-solid fa-globe" /></a>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    <button onClick={() => handleStartEdit(m)} style={{ background: 'var(--surface)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.82rem', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
                      title="Edit Member"
                    >
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button onClick={() => handleDelete(m.id, m.name, m.email)} style={{ background: '#fee2e2', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#dc2626', fontSize: '0.82rem', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
                      title="Delete Member"
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ EVENTS TAB ═══════════════════════════════════ */
function EventsTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', date: '', venue: '', description: '', poster: '' });
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileRef = useRef();

  const load = async () => {
    try { setEvents((await db.find('Events')).sort((a, b) => new Date(b.date) - new Date(a.date))); }
    catch { window.showToast('Error', 'Could not load events.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAdd = async () => {
    if (!form.title || !form.date) { window.showToast('Missing Fields', 'Title and Date are required.', 'error'); return; }
    setSaving(true);
    try {
      let posterUrl = form.poster;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `events/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabaseServiceClient.storage.from('member_photos').upload(path, imageFile, { upsert: true });
        if (uploadError) throw new Error(uploadError.message);
        const { data: { publicUrl } } = supabaseServiceClient.storage.from('member_photos').getPublicUrl(path);
        posterUrl = publicUrl;
      }

      await db.insert('Events', { ...form, poster: posterUrl, createdAt: new Date().toISOString() });
      window.showToast('Event Added!', form.title, 'success');
      setForm({ title: '', date: '', venue: '', description: '', poster: '' });
      setImageFile(null);
      setImagePreview('');
      if (fileRef.current) fileRef.current.value = '';
      load();
    } catch (err) { window.showToast('Error', err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete event: ${title}?`)) return;
    try { await db.delete('Events', id); setEvents(prev => prev.filter(e => e.id !== id)); window.showToast('Deleted', title, 'success'); }
    catch (err) { window.showToast('Error', err.message, 'error'); }
  };

  return (
    <div className="admin-grid-layout">
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)' }}>
          <i className="fa-solid fa-calendar-plus" style={{ color: 'var(--orange)', marginRight: '0.5rem' }} />Add Event
        </h3>

        {/* Poster Image Upload */}
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <div onClick={() => fileRef.current?.click()} style={{
            width: '100%',
            height: '130px',
            borderRadius: '10px',
            background: 'var(--surface)',
            border: `2px dashed ${imagePreview ? 'var(--orange)' : 'var(--border)'}`,
            overflow: 'hidden',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.25s',
            marginBottom: '0.5rem'
          }}>
            {imagePreview ? (
              <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                <i className="fa-solid fa-image" style={{ fontSize: '1.6rem', color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>Click to Upload Event Poster</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        </div>

        {[
          { key: 'title', placeholder: 'Event Title *', type: 'text' },
          { key: 'date', placeholder: 'Date *', type: 'date' },
          { key: 'venue', placeholder: 'Venue / Location', type: 'text' },
          { key: 'poster', placeholder: 'Poster URL (optional fallback)', type: 'text' },
        ].map(({ key, placeholder, type }) => (
          <input key={key} type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
            style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.88rem', color: 'var(--text)', background: 'var(--surface)', marginBottom: '0.65rem' }} />
        ))}
        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={3}
          style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.88rem', color: 'var(--text)', background: 'var(--surface)', marginBottom: '0.75rem', resize: 'vertical' }} />
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAdd} disabled={saving}>
          {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : <><i className="fa-solid fa-plus" /> Add Event</>}
        </button>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.88rem' }}>All Events</div>
        {loading ? <div className="loading-spinner" /> : (
          <div style={{ padding: '0.75rem', maxHeight: 460, overflowY: 'auto' }}>
            {events.length === 0 ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No events yet.</div> : events.map(ev => (
              <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', padding: '0.85rem', borderRadius: 10, borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{ev.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    <i className="fa-solid fa-calendar" style={{ marginRight: '0.3rem' }} />{ev.date}
                    {ev.venue && <><i className="fa-solid fa-location-dot" style={{ marginLeft: '0.8rem', marginRight: '0.3rem' }} />{ev.venue}</>}
                  </div>
                </div>
                <button onClick={() => handleDelete(ev.id, ev.title)} style={{ background: '#fee2e2', border: 'none', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#dc2626', fontSize: '0.78rem', flexShrink: 0 }}>
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ DASHBOARD TAB ═══════════════════════════════════ */
function DashboardTab() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const u = await db.find('Users');
        const r = await db.find('JoinRequests');
        setMembers(u);
        setRequests(r);
      } catch (err) {
        window.showToast('Error', 'Could not load dashboard data.', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="loading-spinner" />;

  // 1. Class-wise counts (Registered Members)
  const classCounts = {};
  members.forEach(m => {
    const cName = (m.className || 'Unknown').trim();
    classCounts[cName] = (classCounts[cName] || 0) + 1;
  });
  const sortedClasses = Object.entries(classCounts).sort((a, b) => b[1] - a[1]);

  // 2. Coding style visual analysis (All registered members + applicants)
  const codingStyleCounts = {
    hard_coding: 0,
    vibe_coding: 0,
    exploring: 0,
    ai_or_other: 0
  };
  members.forEach(m => {
    if (m.codingStyle && codingStyleCounts[m.codingStyle] !== undefined) {
      codingStyleCounts[m.codingStyle]++;
    }
  });
  requests.forEach(r => {
    if (r.codingStyle && codingStyleCounts[r.codingStyle] !== undefined) {
      codingStyleCounts[r.codingStyle]++;
    }
  });
  const totalStyleVotes = Object.values(codingStyleCounts).reduce((a, b) => a + b, 0);

  const styleDetails = [
    { id: 'hard_coding', label: '💻 Hard Coding', desc: 'Pure, manual code', color: '#6366f1' },
    { id: 'vibe_coding', label: '🎵 Vibe Coding', desc: 'AI tools & prompts', color: '#f97316' },
    { id: 'exploring',   label: '🔍 Exploring',    desc: 'Ideas & research', color: '#14b8a6' },
    { id: 'ai_or_other', label: '🤖 AI & Tech',    desc: 'Data science & AI', color: '#a855f7' },
  ];

  // 3. Interested Areas (All registered members + applicants)
  const interestCounts = {};
  const addInterest = (str) => {
    if (!str) return;
    str.split(',').forEach(item => {
      let key = item.trim();
      // Capitalize first letter of each word
      key = key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      if (key) {
        interestCounts[key] = (interestCounts[key] || 0) + 1;
      }
    });
  };
  members.forEach(m => addInterest(m.interestedArea));
  requests.forEach(r => addInterest(r.interestedArea || r.interests));
  const topInterests = Object.entries(interestCounts).sort((a, b) => b[1] - a[1]).slice(0, 12);

  const handleDownloadReach = () => {
    const formattedMembers = members.map(m => ({
      Name: m.name || '',
      Email: m.email || '',
      Phone: m.phone || '',
      'Class Name': m.className || '',
      'Register Number': m.registerNumber || '',
      'Type': 'Registered Member',
      'Interested Area': m.interestedArea || '',
      'Coding Style': m.codingStyle ? m.codingStyle.replace('_', ' ') : ''
    }));

    const formattedRequests = requests.map(r => ({
      Name: r.name || '',
      Email: r.email || '',
      Phone: r.phone || '',
      'Class Name': r.className || '',
      'Register Number': r.registerNumber || '',
      'Type': `Interested Student (${r.status || 'Pending'})`,
      'Interested Area': r.interestedArea || r.interests || '',
      'Coding Style': r.codingStyle ? r.codingStyle.replace('_', ' ') : ''
    }));

    const combined = [...formattedMembers, ...formattedRequests];
    downloadCSV(combined, `total_club_reach_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Summary Stats cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59, 130, 246, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontSize: '1.4rem', flexShrink: 0 }}>
            <i className="fa-solid fa-user-check" />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>{members.length}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 600 }}>Registered Members</div>
          </div>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(249, 115, 22, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316', fontSize: '1.4rem', flexShrink: 0 }}>
            <i className="fa-solid fa-heart" />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>{requests.length}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 600 }}>Interested Students</div>
          </div>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16, 185, 129, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: '1.4rem', flexShrink: 0 }}>
            <i className="fa-solid fa-circle-check" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>{members.length + requests.length}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 600 }}>Total Club Reach</div>
          </div>
          <button onClick={handleDownloadReach} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.45rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'all 0.2s', flexShrink: 0 }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--orange)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            <i className="fa-solid fa-file-excel" style={{ color: '#107c41' }} /> Export
          </button>
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }} className="admin-grid-layout">
        {/* Left Card: Coding Style Visual Analysis */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.75rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-chart-column" style={{ color: 'var(--orange)' }} />
            Coding Style Preferences
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Visual analysis of how club members and applicants approach coding (out of {totalStyleVotes} total selections).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, justifyContent: 'center' }}>
            {styleDetails.map(style => {
              const count = codingStyleCounts[style.id] || 0;
              const pct = totalStyleVotes > 0 ? Math.round((count / totalStyleVotes) * 100) : 0;
              return (
                <div key={style.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>{style.label}</span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>— {style.desc}</span>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: style.color }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: 'var(--surface)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: style.color, borderRadius: '5px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Class breakdown & Interests */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Class-wise Separation */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-graduation-cap" style={{ color: 'var(--orange)' }} />
              Class-wise Distribution
            </h3>
            
            {sortedClasses.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No registered class data available.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                {sortedClasses.map(([cName, count]) => (
                  <div key={cName} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fa-solid fa-circle-user" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text)' }}>{cName}</span>
                    </div>
                    <span style={{
                      background: 'var(--orange)',
                      color: '#fff',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '10px'
                    }}>
                      {count} {count === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Interests */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-brain" style={{ color: 'var(--orange)' }} />
              Student Interests / Areas
            </h3>
            
            {topInterests.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No interest area data available.</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {topInterests.map(([interest, count]) => (
                  <div key={interest} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(255, 85, 0, 0.06)',
                    border: '1px solid rgba(255, 85, 0, 0.12)',
                    borderRadius: '8px',
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: 'var(--text)'
                  }}>
                    <span>{interest}</span>
                    <span style={{ color: 'var(--orange)', fontSize: '0.72rem', fontWeight: 800 }}>({count})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ ANNOUNCEMENTS TAB ═══════════════════════════════════ */




/* ═══════════════════════════════════ APPLICATIONS TAB ═══════════════════════════════════ */
function RequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const list = await db.find('JoinRequests');
      setRequests(list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)));
    } catch {
      window.showToast('Error', 'Could not load applications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await db.update('JoinRequests', id, { status });
      window.showToast('Status Updated', `Application status set to ${status}.`, 'success');
      load();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    try {
      await db.delete('JoinRequests', id);
      window.showToast('Deleted', 'Application request removed.', 'success');
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  if (loading) return <div className="loading-spinner" />;

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>Recruitment Applications</span>
        <Badge color="orange">{requests.length} submissions</Badge>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Details</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Contact</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Area</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Vibe Poll</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ textAlign: 'center', padding: '0.75rem 1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No applications received yet.
                </td>
              </tr>
            ) : requests.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{r.name}</td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem' }}>
                  <div style={{ fontWeight: 500 }}>Reg: {r.registerNumber}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>Class: {r.className}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem' }}>
                  <div>{r.email}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{r.phone}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem' }}>{r.interestedArea || '—'}</td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', textTransform: 'capitalize' }}>
                  {r.codingStyle ? r.codingStyle.replace('_', ' ') : '—'}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <Badge color={r.status === 'Approved' ? 'green' : r.status === 'Rejected' ? 'grey' : 'orange'}>
                    {r.status || 'Pending'}
                  </Badge>
                </td>
                <td style={{ padding: '0.85rem 1rem', display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                  {r.status !== 'Approved' && (
                    <button onClick={() => handleStatus(r.id, 'Approved')} style={{ background: '#dcfce7', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#15803d', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}>
                      Approve
                    </button>
                  )}
                  {r.status !== 'Rejected' && (
                    <button onClick={() => handleStatus(r.id, 'Rejected')} style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#4b5563', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}>
                      Reject
                    </button>
                  )}
                  <button onClick={() => handleDelete(r.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#dc2626', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ MESSAGES TAB ═══════════════════════════════════ */
function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    try { setMessages(await db.find('ContactMessages')); }
    catch { window.showToast('Error', 'Could not load messages.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await db.update('ContactMessages', id, { status: 'read' });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m));
    } catch (err) { window.showToast('Error', err.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await db.delete('ContactMessages', id);
      setMessages(prev => prev.filter(m => m.id !== id));
      window.showToast('Deleted', 'Message removed.', 'success');
    } catch (err) { window.showToast('Error', err.message, 'error'); }
  };

  const filtered = messages.filter(m =>
    (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.message || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.45rem 0.9rem', flex: 1, maxWidth: 320 }}>
          <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages…" style={{ border: 'none', background: 'none', fontSize: '0.88rem', color: 'var(--text)', width: '100%' }} />
        </div>
        <Badge color="blue">{filtered.length} total</Badge>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-spinner" />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Message</th><th>Date</th><th>Status</th><th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No messages found</td></tr>
                ) : filtered.map(m => (
                  <tr key={m.id}>
                    <td><span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem' }}>{m.name}</span></td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{m.email}</td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.message}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}</td>
                    <td><Badge color={m.status === 'unread' ? 'orange' : 'green'}>{m.status || 'unread'}</Badge></td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                        {m.status === 'unread' && (
                          <button onClick={() => handleMarkRead(m.id)} style={{ background: '#dbeafe', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#1d4ed8', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}>
                            Mark Read
                          </button>
                        )}
                        <button onClick={() => handleDelete(m.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#dc2626', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ LEADERBOARD TAB ═══════════════════════════════════ */
function LeaderboardTab() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [filterQuiz, setFilterQuiz] = useState('all');
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'time'

  useEffect(() => {
    (async () => {
      try {
        const data = await db.find('QuizResults');
        setResults(data);
      } catch { window.showToast('Error', 'Could not load leaderboard.', 'error'); }
      finally { setLoading(false); }
    })();
  }, []);

  const quizTitles = [...new Set(results.map(r => r.quizTitle))];
  const filtered = filterQuiz === 'all' ? results : results.filter(r => r.quizTitle === filterQuiz);

  const sorted = [...filtered].sort((a, b) => {
    const aPct = a.total > 0 ? a.score / a.total : 0;
    const bPct = b.total > 0 ? b.score / b.total : 0;
    return sortBy === 'score' ? bPct - aPct : (a.timeSpent || 999) - (b.timeSpent || 999);
  });

  const ranked = sorted.map((r, i) => ({ rank: i + 1, ...r }));

  const handleDeleteResult = async (id, userName) => {
    if (!window.confirm(`Delete result for "${userName}"?`)) return;
    try {
      await db.delete('QuizResults', id);
      setResults(prev => prev.filter(r => r.id !== id));
      window.showToast('Deleted', `Result for ${userName} removed.`, 'success');
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete ALL quiz results? This cannot be undone.')) return;
    setDeleting(true);
    try {
      for (const r of results) {
        await db.delete('QuizResults', r.id);
      }
      setResults([]);
      window.showToast('Cleared', 'All quiz results have been deleted.', 'success');
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="loading-spinner" />;

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.35rem 0.75rem' }}>
          <i className="fa-solid fa-filter" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
          <select value={filterQuiz} onChange={e => setFilterQuiz(e.target.value)}
            style={{ border: 'none', background: 'none', fontSize: '0.84rem', color: 'var(--text)', padding: '0.25rem 0', outline: 'none', fontWeight: 600 }}>
            <option value="all">All Quizzes</option>
            {quizTitles.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.25rem' }}>
          <button onClick={() => setSortBy('score')}
            style={{ padding: '0.3rem 0.7rem', borderRadius: 7, fontSize: '0.78rem', fontWeight: 700, border: 'none', cursor: 'pointer',
              background: sortBy === 'score' ? 'var(--orange)' : 'transparent',
              color: sortBy === 'score' ? '#fff' : 'var(--text-secondary)' }}>
            <i className="fa-solid fa-percentage" /> Score %
          </button>
          <button onClick={() => setSortBy('time')}
            style={{ padding: '0.3rem 0.7rem', borderRadius: 7, fontSize: '0.78rem', fontWeight: 700, border: 'none', cursor: 'pointer',
              background: sortBy === 'time' ? 'var(--orange)' : 'transparent',
              color: sortBy === 'time' ? '#fff' : 'var(--text-secondary)' }}>
            <i className="fa-solid fa-clock" /> Fastest
          </button>
        </div>
        <Badge color="blue">{ranked.length} entries</Badge>
        {ranked.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={handleClearAll} disabled={deleting} style={{ marginLeft: 'auto', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '0.4rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {deleting ? <><i className="fa-solid fa-spinner fa-spin" /> Clearing…</> : <><i className="fa-solid fa-trash-can" /> Clear All</>}
          </button>
        )}
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 50, textAlign: 'center' }}>#</th>
                <th>Name</th>
                <th>Quiz</th>
                <th>Score</th>
                <th>Time</th>
                <th>Date</th>
                <th style={{ textAlign: 'center', width: 60 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {ranked.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No results yet</td></tr>
              ) : ranked.map(r => (
                <tr key={r.id}>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 30, height: 30, borderRadius: '50%',
                      background: r.rank <= 3 ? 'rgba(255,85,0,0.12)' : 'var(--surface)',
                      color: r.rank <= 3 ? 'var(--orange)' : 'var(--text-secondary)',
                      fontWeight: 800, fontSize: '0.82rem'
                    }}>{r.rank}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)' }}>{r.userName}</div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{r.quizTitle}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{r.score}/{r.total}</span>
                      <Badge color={r.total > 0 && r.score / r.total >= 0.8 ? 'green' : r.total > 0 && r.score / r.total >= 0.5 ? 'orange' : 'grey'}>
                        {r.total > 0 ? Math.round((r.score / r.total) * 100) : 0}%
                      </Badge>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{r.timeSpent ? `${r.timeSpent}s` : '—'}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.date ? new Date(r.date).toLocaleDateString() : '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => handleDeleteResult(r.id, r.userName)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#dc2626', fontSize: '0.74rem' }} title="Delete result">
                      <i className="fa-solid fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ WINNERS TAB ═══════════════════════════════════ */
function WinnersTab() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [form, setForm] = useState({ name: '', department: '', achievement: '', certificate: '' });
  const fileRef = useRef();

  const load = async () => {
    try { setWinners(await db.find('WeeklyWinners')); }
    catch { window.showToast('Error', 'Could not load winners.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.achievement || !form.department) {
      window.showToast('Missing Fields', 'Name, Department and Achievement are required.', 'error');
      return;
    }
    setUploading(true);
    try {
      let photoUrl = imagePreview;
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `winners/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabaseServiceClient.storage.from('member_photos').upload(path, imageFile, { upsert: true });
        if (uploadError) throw new Error(uploadError.message);
        const { data: { publicUrl } } = supabaseServiceClient.storage.from('member_photos').getPublicUrl(path);
        photoUrl = publicUrl;
      } else {
        photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=ff5500&color=fff&size=150`;
      }
      await db.insert('WeeklyWinners', { ...form, photo: photoUrl, createdAt: new Date().toISOString() });
      window.showToast('Added!', `${form.name} added as a Winner.`, 'success');
      setForm({ name: '', department: '', achievement: '', certificate: '' });
      setImagePreview('');
      setImageFile(null);
      if (fileRef.current) fileRef.current.value = '';
      load();
    } catch (err) { window.showToast('Error', err.message, 'error'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await db.delete('WeeklyWinners', id);
      setWinners(prev => prev.filter(w => w.id !== id));
      window.showToast('Deleted', `${name} removed.`, 'success');
    } catch (err) { window.showToast('Error', err.message, 'error'); }
  };

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className="admin-grid-layout">
      <div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)' }}>
            <i className="fa-solid fa-user-plus" style={{ color: 'var(--orange)', marginRight: '0.5rem' }} /> Add Weekly Winner
          </h3>

          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div onClick={() => fileRef.current?.click()} style={{ width: 90, height: 90, borderRadius: '50%', margin: '0 auto 0.75rem', background: 'var(--surface)', border: `2px dashed ${imagePreview ? 'var(--orange)' : 'var(--border)'}`, overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {imagePreview ? <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className="fa-solid fa-camera" style={{ color: 'var(--text-muted)', fontSize: '1.4rem' }} />}
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()}>
              <i className="fa-solid fa-upload" /> {imageFile ? 'Change' : 'Upload Photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Winner Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. John Doe" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Department</label>
              <input className="form-input" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="e.g. Computer Science" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Achievement</label>
              <textarea className="form-input" value={form.achievement} onChange={e => setForm(p => ({ ...p, achievement: e.target.value }))} placeholder="e.g. Winner of Weekly JS Quiz" style={{ width: '100%', minHeight: 60, fontFamily: 'inherit' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Certificate Link (Optional)</label>
              <input className="form-input" value={form.certificate} onChange={e => setForm(p => ({ ...p, certificate: e.target.value }))} placeholder="https://example.com/cert" style={{ width: '100%' }} />
            </div>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={uploading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
              {uploading ? 'Adding...' : <><i className="fa-solid fa-plus" /> Add Winner</>}
            </button>
          </div>
        </div>
      </div>

      <div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>All Winners</span>
            <Badge color="green">{winners.length} total</Badge>
          </div>
          {winners.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No winners added yet.</div>
          ) : (
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 600, overflowY: 'auto' }}>
              {winners.map(w => (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={w.photo} alt={w.name} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-light)' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text)' }}>{w.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{w.department}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>{w.achievement}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(w.id, w.name)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#dc2626', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ SETTINGS TAB ═══════════════════════════════════ */
/* ═══════════════════════════════════ BADGES TAB ═══════════════════════════════════ */
function BadgeManagementTab() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', icon: 'fa-medal', description: '', minScore: 0, color: '#ff5500' });

  const load = async () => {
    try {
      const all = await db.find('Badges');
      setBadges(all);
    } catch { setBadges([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', icon: 'fa-medal', description: '', minScore: 0, color: '#ff5500' });
  };

  const handleEdit = (badge) => {
    setEditingId(badge.id);
    setForm({
      name: badge.name || '',
      icon: badge.icon || 'fa-medal',
      description: badge.description || '',
      minScore: badge.minScore ?? 0,
      color: badge.color || '#ff5500',
    });
  };

  const handleSave = async () => {
    if (!form.name) { window.showToast('Missing', 'Badge name is required.', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form, minScore: Number(form.minScore) || 0 };
      if (editingId) {
        await db.update('Badges', editingId, payload);
        window.showToast('Updated', `"${form.name}" badge updated.`, 'success');
      } else {
        await db.insert('Badges', { ...payload, createdAt: new Date().toISOString() });
        window.showToast('Created', `"${form.name}" badge created.`, 'success');
      }
      resetForm();
      load();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete badge "${name}"?`)) return;
    try {
      await db.delete('Badges', id);
      setBadges(prev => prev.filter(b => b.id !== id));
      window.showToast('Deleted', `"${name}" removed.`, 'success');
    } catch (err) { window.showToast('Error', err.message, 'error'); }
  };

  const iconOptions = [
    'fa-medal', 'fa-trophy', 'fa-star', 'fa-bolt', 'fa-crown', 'fa-gem',
    'fa-fire', 'fa-shield-halved', 'fa-brain', 'fa-rocket', 'fa-flask',
    'fa-leaf', 'fa-heart', 'fa-certificate', 'fa-award',
  ];

  return (
    <div className="admin-grid-layout">
      <div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)' }}>
            <i className="fa-solid fa-medal" style={{ color: 'var(--orange)', marginRight: '0.5rem' }} />
            {editingId ? 'Edit Badge' : 'Create Badge'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Badge Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Gold Scholar" style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Icon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {iconOptions.map(icon => (
                  <button key={icon} onClick={() => setForm(p => ({ ...p, icon }))}
                    style={{
                      width: 36, height: 36, borderRadius: 8, border: `2px solid ${form.icon === icon ? 'var(--orange)' : 'var(--border)'}`,
                      background: form.icon === icon ? 'rgba(255,85,0,0.1)' : 'var(--surface)',
                      color: 'var(--text)', fontSize: '0.9rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <i className={`fa-solid ${icon}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Color</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid var(--border)', padding: 2, cursor: 'pointer' }} />
                <input className="form-input" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} placeholder="#ff5500" style={{ flex: 1 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Min Score (%)</label>
              <input type="number" min="0" max="100" className="form-input" value={form.minScore} onChange={e => setForm(p => ({ ...p, minScore: e.target.value }))} placeholder="e.g. 80" style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Description</label>
              <textarea className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Awarded for scoring 80% or above" style={{ width: '100%', minHeight: 60, fontFamily: 'inherit' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : <><i className="fa-solid fa-check" /> {editingId ? 'Save Changes' : 'Create Badge'}</>}
              </button>
              {editingId && (
                <button className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>Badge Definitions</span>
            <Badge color="blue">{badges.length} total</Badge>
          </div>
          {loading ? <div className="loading-spinner" /> : badges.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No badges defined yet.</div>
          ) : (
            <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 500, overflowY: 'auto' }}>
              {badges.map((b, i) => (
                <div key={b.id || i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${b.color || '#ff5500'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: b.color || '#ff5500', flexShrink: 0 }}>
                    <i className={`fa-solid ${b.icon || 'fa-medal'}`} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text)' }}>{b.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {b.description || b.condition || ''} {b.minScore != null && <span style={{ color: 'var(--orange)' }}>— ≥{b.minScore}%</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                    <button onClick={() => handleEdit(b)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button onClick={() => handleDelete(b.id, b.name)} style={{ background: '#fee2e2', border: 'none', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#dc2626', fontSize: '0.74rem' }}>
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ QUIZZES TAB ═══════════════════════════════════ */

/* ═══════════════════════════════════ MAIN ADMIN PAGE ═══════════════════════════════════ */
export default function Admin({ user }) {
  const [tab, setTab] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ members: 0, core: 0, events: 0 });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [m, c, e] = await Promise.all([
          db.find('Users'), db.find('CoreMembers'), db.find('Events')
        ]);
        setMembers(m);
        setStats({ members: m.length, core: c.length, events: e.length });
      } catch { /* ignore */ }
    })();
  }, []);

  const statCards = [
    { label: 'Total Members', value: stats.members, icon: 'fa-users',      color: '#3b82f6' },
    { label: 'Core Board',    value: stats.core,    icon: 'fa-star',       color: '#f59e0b' },
    { label: 'Events',        value: stats.events,  icon: 'fa-calendar',   color: '#10b981' },
  ];

  const sidebarWidth = sidebarCollapsed ? 60 : 220;

  return (
    <div>
      <style>{`
        .admin-grid-layout {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 1.5rem;
        }
        @media (max-width: 768px) {
          .admin-grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
        .admin-sidebar { width: ${sidebarWidth}px; min-width: ${sidebarWidth}px; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 0.75rem 0; display: flex; flex-direction: column; transition: width 0.3s ease, min-width 0.3s ease; overflow: hidden; height: fit-content; position: sticky; top: 1.5rem; }
        .admin-sidebar-btn { display: flex; align-items: center; gap: 0.6rem; width: 100%; padding: 0.6rem 1rem; border: none; background: none; cursor: pointer; font-size: 0.84rem; font-weight: 600; color: var(--text-secondary); transition: all 0.18s ease; text-align: left; white-space: nowrap; }
        .admin-sidebar-btn:hover { background: rgba(255,85,0,0.06); color: var(--text); }
        .admin-sidebar-btn.active { background: var(--orange); color: #fff; box-shadow: 0 2px 8px rgba(255,85,0,0.25); }
        .admin-sidebar-btn i { width: 20px; text-align: center; font-size: 0.9rem; flex-shrink: 0; }
        .admin-sidebar-section { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); letter-spacing: 0.08em; padding: 0.75rem 1rem 0.35rem; text-transform: uppercase; white-space: nowrap; }
        .admin-sidebar-divider { height: 1px; background: var(--border); margin: 0.35rem 1rem; }
        .admin-sidebar-user { display: flex; align-items: center; gap: 0.6rem; padding: 0.75rem 1rem; border-top: 1px solid var(--border); margin-top: auto; white-space: nowrap; }
        .admin-sidebar-user img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
        .admin-sidebar-user-info { flex: 1; min-width: 0; }
        .admin-sidebar-user-name { font-size: 0.8rem; font-weight: 700; color: var(--text); display: block; }
        .admin-sidebar-user-role { font-size: 0.68rem; color: var(--text-muted); text-transform: capitalize; }
        .admin-sidebar-user-logout { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 6px; flex-shrink: 0; }
        .admin-sidebar-user-logout:hover { color: #dc2626; background: rgba(220,38,38,0.08); }
        .admin-sidebar-toggle { display: flex; align-items: center; justify-content: center; padding: 0.5rem; border: none; background: none; cursor: pointer; color: var(--text-muted); width: 100%; }
        .admin-sidebar-toggle:hover { color: var(--orange); }
        @media (max-width: 900px) {
          .admin-page-row { flex-direction: column !important; }
          .admin-sidebar { width: 100% !important; min-width: unset !important; flex-direction: row !important; flex-wrap: wrap !important; padding: 0.4rem 0.5rem !important; position: static !important; height: auto !important; }
          .admin-sidebar-section, .admin-sidebar-divider, .admin-sidebar-user, .admin-sidebar-toggle { display: none !important; }
          .admin-sidebar-btn { padding: 0.4rem 0.6rem !important; font-size: 0.75rem !important; width: auto !important; border-radius: 8px !important; }
        }
      `}</style>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,85,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-crown" style={{ color: 'var(--orange)', fontSize: '1rem' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>Admin Panel</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Welcome back, {user?.name || 'Admin'}</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fa-solid ${s.icon}`} style={{ color: s.color, fontSize: '0.9rem' }} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sidebar + Content Row */}
      <div className="admin-page-row" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <div className="admin-sidebar">
          <button className="admin-sidebar-toggle" onClick={() => setSidebarCollapsed(p => !p)} title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
            <i className={`fa-solid ${sidebarCollapsed ? 'fa-angles-right' : 'fa-angles-left'}`} />
          </button>

          {SIDEBAR_SECTIONS.map((section, si) => (
            <div key={si} style={{ width: '100%' }}>
              {!sidebarCollapsed && <div className="admin-sidebar-section">{section.label}</div>}
              {section.items.map(item => (
                <button key={item.id} className={`admin-sidebar-btn ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>
                  <i className={`fa-solid ${item.icon}`} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              ))}
              {si < SIDEBAR_SECTIONS.length - 1 && !sidebarCollapsed && <div className="admin-sidebar-divider" />}
            </div>
          ))}

          {!sidebarCollapsed && <div className="admin-sidebar-divider" />}
          <div className="admin-sidebar-user">
            <img src={user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ff5500&color=fff`} alt="" />
            {!sidebarCollapsed && (
              <>
                <div className="admin-sidebar-user-info">
                  <span className="admin-sidebar-user-name">{user?.name || 'User'}</span>
                  <span className="admin-sidebar-user-role">{user?.role || 'member'}</span>
                </div>
                <button className="admin-sidebar-user-logout" onClick={async () => { try { await db.logout(); window.showToast('Logged Out', 'See you soon!', 'info'); } catch {} }} title="Logout">
                  <i className="fa-solid fa-right-from-bracket" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {tab === 'dashboard'    && <DashboardTab />}
          {tab === 'analytics'    && <AnalyticsTab />}
          {tab === 'winners'      && <WinnersTab />}
          {tab === 'leaderboard'  && <LeaderboardAdmin />}
          {tab === 'members'      && <MembersTab />}
          {tab === 'core'         && <CoreBoardTab allMembers={members} />}
          {tab === 'events'       && <EventsTab />}
          {tab === 'announcements' && <AnnouncementAdmin />}
          {tab === 'messages'     && <MessagesTab />}
          {tab === 'quizzes'      && <QuizManagement />}
          {tab === 'students'     && <StudentManagement />}
          {tab === 'security'     && <SecuritySettings />}
          {tab === 'badges'       && <BadgeManagementTab />}
        </div>
      </div>
    </div>
  );
}