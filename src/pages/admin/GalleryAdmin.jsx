import { useState, useEffect, useRef } from 'react';
import db, { supabaseServiceClient } from '../../db';

const CATEGORIES = ['Events', 'Workshops', 'Seminars', 'Coding Sprints', 'General'];
const BUCKET = 'gallery';

const inputStyle = {
  width: '100%', padding: '0.65rem 0.9rem', border: '1px solid var(--border)',
  borderRadius: 8, fontSize: '0.88rem', color: 'var(--text)', background: 'var(--surface)',
  marginBottom: '0.65rem'
};

export default function GalleryAdmin() {
  const [events, setEvents] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [destination, setDestination] = useState('general');
  const [category, setCategory] = useState('Events');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileRef = useRef();

  const isAdminUpload = item => Boolean(item.createdAt) && Boolean(item.image);

  const load = async () => {
    try {
      const [galleryList, eventList] = await Promise.all([db.find('Gallery'), db.find('Events')]);
      setItems((galleryList || []).filter(isAdminUpload).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setEvents((eventList || []).sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch {
      window.showToast('Error', 'Could not load gallery items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFileChange = e => {
    const picked = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    if (!picked.length) return;
    setSelectedFiles(prev => [...prev, ...picked.map(file => ({ file, preview: URL.createObjectURL(file) }))]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeFile = idx => {
    setSelectedFiles(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      window.showToast('No Images', 'Select at least one image to upload.', 'error');
      return;
    }
    setSaving(true);
    try {
      const evt = events.find(e => e.id === destination);
      const isGeneral = destination === 'general';
      const fallbackTitle = title.trim() || (isGeneral ? 'General Gallery' : evt?.title || 'Event Gallery');
      const folder = isGeneral ? 'general' : destination;

      for (let i = 0; i < selectedFiles.length; i++) {
        const { file } = selectedFiles[i];
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const path = `admin/${folder}/${Date.now()}_${i}_${Math.random().toString(36).slice(2, 9)}.${ext}`;
        const { error: uploadError } = await supabaseServiceClient.storage.from(BUCKET).upload(path, file, { upsert: true });
        if (uploadError) throw new Error(uploadError.message);
        const { data: { publicUrl } } = supabaseServiceClient.storage.from(BUCKET).getPublicUrl(path);

        await db.insert('Gallery', {
          title: fallbackTitle,
          description: description.trim(),
          category: category || 'Events',
          eventId: isGeneral ? null : destination,
          eventTitle: isGeneral ? null : (evt?.title || ''),
          image: publicUrl
        });
      }

      window.showToast('Uploaded!', `${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''} added to the gallery.`, 'success');
      selectedFiles.forEach(s => URL.revokeObjectURL(s.preview));
      setSelectedFiles([]);
      setTitle('');
      setDescription('');
      load();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this image from the gallery?')) return;
    try {
      await db.deleteFile(item.image);
      await db.delete('Gallery', item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
      window.showToast('Deleted', 'Image removed from gallery.', 'success');
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const destinationLabel = item => item.eventId
    ? (item.eventTitle || events.find(e => e.id === item.eventId)?.title || 'Event')
    : 'General';

  return (
    <div className="admin-grid-layout">
      {/* ── Upload form ── */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)' }}>
          <i className="fa-solid fa-cloud-arrow-up" style={{ color: 'var(--orange)', marginRight: '0.5rem' }} />Upload Gallery Images
        </h3>

        <div onClick={() => fileRef.current?.click()} style={{
          width: '100%', minHeight: selectedFiles.length ? 'auto' : '130px',
          borderRadius: '10px', background: 'var(--surface)',
          border: `2px dashed ${selectedFiles.length ? 'var(--orange)' : 'var(--border)'}`,
          overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', transition: 'border-color 0.25s', marginBottom: '0.75rem',
          padding: selectedFiles.length ? '0.6rem' : 0
        }}>
          {selectedFiles.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {selectedFiles.map((s, i) => (
                <div key={i} style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img src={s.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={e => { e.stopPropagation(); removeFile(i); }} title="Remove"
                    style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', padding: '1.5rem 0' }}>
              <i className="fa-solid fa-images" style={{ fontSize: '1.6rem', color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>Click to Select Images (multiple allowed)</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: 'none' }} />

        <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Add to</label>
        <select value={destination} onChange={e => setDestination(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
          <option value="general">General (standalone)</option>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
        </select>

        <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (defaults to event name)" style={inputStyle} />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" rows={3}
          style={{ ...inputStyle, marginBottom: '0.75rem', resize: 'vertical' }} />

        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleUpload} disabled={saving}>
          {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Uploading…</> : <><i className="fa-solid fa-plus" /> Upload {selectedFiles.length || ''} {selectedFiles.length === 1 ? 'Image' : 'Images'}</>}
        </button>
      </div>

      {/* ── Existing images ── */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>Uploaded Images</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{items.length}</span>
        </div>
        {loading ? <div className="loading-spinner" style={{ margin: '2rem auto' }} /> : (
          <div style={{ padding: '0.75rem', maxHeight: 560, overflowY: 'auto' }}>
            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                <i className="fa-regular fa-images" style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.6rem' }} />
                No images uploaded yet.
              </div>
            ) : items.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.7rem', borderRadius: 10, borderBottom: '1px solid var(--border-light)' }}>
                <img src={item.image} alt={item.title} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
                    <span><i className="fa-solid fa-folder" style={{ marginRight: '0.25rem' }} />{destinationLabel(item)}</span>
                    <span><i className="fa-solid fa-tag" style={{ marginRight: '0.25rem' }} />{item.category}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(item)} title="Delete"
                  style={{ background: '#fee2e2', border: 'none', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#dc2626', fontSize: '0.78rem', flexShrink: 0 }}>
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
