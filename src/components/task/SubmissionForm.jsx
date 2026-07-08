import { useState, useEffect, useRef, useCallback } from 'react';
import { getFieldDefinitions } from '../../config/taskConfig';
import { saveDraft, loadDraft, clearDraft, getLastSaved } from '../../utils/autosave';

const fieldTypeMap = {
  url: { type: 'url', tag: 'input' },
  text: { type: 'text', tag: 'input' },
  textarea: { tag: 'textarea' },
};

export default function SubmissionForm({ task, user, onSubmit, loading }) {
  const [fields, setFields] = useState({});
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const autosaveRef = useRef(null);
  const initialLoadDone = useRef(false);

  const fieldDefs = getFieldDefinitions(task.taskType);

  const userId = user?.id;
  const taskId = task?.id;

  useEffect(() => {
    if (!taskId || !userId || initialLoadDone.current) return;
    initialLoadDone.current = true;
    const draft = loadDraft(taskId, userId);
    if (draft?.data) {
      setFields(draft.data);
      setLastSaved(draft.savedAt);
      setDraftRestored(true);
    }
  }, [taskId, userId]);

  useEffect(() => {
    if (!taskId || !userId || !draftRestored) return;
    autosaveRef.current = setInterval(() => {
      saveDraft(taskId, userId, fields);
      setLastSaved(new Date().toISOString());
    }, 10000);
    return () => clearInterval(autosaveRef.current);
  }, [taskId, userId, fields, draftRestored]);

  const handleChange = useCallback((key, value) => {
    setFields(prev => ({ ...prev, [key]: value }));
    setErrors(prev => prev[key] ? { ...prev, [key]: null } : prev);
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    for (const field of fieldDefs) {
      if (field.required && !fields[field.key]?.trim()) {
        newErrors[field.key] = `${field.label} is required`;
      }
      if (fields[field.key] && field.type === 'url') {
        try {
          new URL(fields[field.key]);
        } catch {
          newErrors[field.key] = 'Please enter a valid URL';
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fieldDefs, fields]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      clearDraft(taskId, userId);
      setLastSaved(null);
      onSubmit(fields);
    }
  };

  const handleSaveDraft = () => {
    saveDraft(taskId, userId, fields);
    setLastSaved(new Date().toISOString());
    window.showToast?.('Draft Saved', 'Your progress has been saved.', 'success');
  };

  if (!fieldDefs.length) {
    return <div className="sf-no-fields">No submission fields configured for this task type.</div>;
  }

  const fieldList = fieldDefs.map((field) => {
    const comp = fieldTypeMap[field.type] || fieldTypeMap.text;
    const isInvalid = errors[field.key];
    const value = fields[field.key] || '';

    return (
      <div key={field.key} className="sf-field">
        <label className="sf-label">
          {field.label}
          {field.required && <span className="sf-required">*</span>}
        </label>
        {comp.tag === 'textarea' ? (
          <div className="sf-input-wrap">
            <textarea
              className={`sf-input ${isInvalid ? 'sf-invalid' : ''}`}
              value={value}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
            />
            <span className="sf-charcount">{value.length}</span>
          </div>
        ) : (
          <div className="sf-input-wrap">
            <input
              type={comp.type || 'text'}
              className={`sf-input ${isInvalid ? 'sf-invalid' : ''}`}
              value={value}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        )}
        {isInvalid && <span className="sf-error">{isInvalid}</span>}
      </div>
    );
  });

  const previewContent = (
    <div className="sf-preview-inner">
      {fieldDefs.map(field => {
        const val = fields[field.key];
        if (!val) return null;
        return (
          <div key={field.key} className="sf-preview-field">
            <span className="sf-preview-label">{field.label}</span>
            {field.type === 'url' ? (
              <a href={val} target="_blank" rel="noreferrer" className="sf-preview-url">{val}</a>
            ) : (
              <p className="sf-preview-value">{val}</p>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <form className="submission-form" onSubmit={handleSubmit}>
      <h3 className="sf-title">
        <i className="fa-solid fa-paper-plane" style={{ color: 'var(--orange)' }} />
        {' '}Submit Your Work
      </h3>

      {draftRestored && (
        <div className="sf-draft-banner">
          <i className="fa-solid fa-file-pen" /> Draft restored from {lastSaved ? new Date(lastSaved).toLocaleString() : 'earlier'}
        </div>
      )}

      {fieldList}

      {showPreview && (
        <div className={`sf-preview ${fullscreenPreview ? 'sf-preview-fullscreen' : ''}`}>
          <div className="sf-preview-header">
            <span><i className="fa-solid fa-eye" /> Preview</span>
            <div className="sf-preview-actions">
              {!fullscreenPreview && (
                <button type="button" className="sf-preview-expand" onClick={() => setFullscreenPreview(true)} title="Fullscreen">
                  <i className="fa-solid fa-expand" />
                </button>
              )}
              {fullscreenPreview && (
                <button type="button" className="sf-preview-expand" onClick={() => setFullscreenPreview(false)} title="Inline">
                  <i className="fa-solid fa-compress" />
                </button>
              )}
              <button type="button" className="sf-preview-close" onClick={() => { setShowPreview(false); setFullscreenPreview(false); }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          </div>
          {previewContent}
        </div>
      )}

      <div className="sf-actions">
        <button type="button" className="sf-preview-btn" onClick={() => setShowPreview(p => !p)}>
          <i className={`fa-solid ${showPreview ? 'fa-eye-slash' : 'fa-eye'}`} />
          {' '}{showPreview ? 'Hide Preview' : 'Preview'}
        </button>
        <button type="button" className="sf-draft-btn" onClick={handleSaveDraft}>
          <i className="fa-solid fa-floppy-disk" /> Save Draft
        </button>
        <button type="submit" className="sf-submit" disabled={loading}>
          {loading ? (
            <><i className="fa-solid fa-spinner fa-spin" /> Submitting...</>
          ) : (
            <><i className="fa-solid fa-paper-plane" /> Submit Task</>
          )}
        </button>
      </div>

      <style>{`
        .submission-form { display: flex; flex-direction: column; gap: 1rem; padding: 1.5rem; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-md); }
        .sf-title { font-size: 1rem; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 0.5rem; color: var(--text); }
        .sf-draft-banner { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.75rem; background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; font-size: 0.78rem; color: #92400e; font-weight: 500; }
        [data-theme="dark"] .sf-draft-banner { background: #422006; border-color: #78350f; color: #fde68a; }
        .sf-field { display: flex; flex-direction: column; gap: 0.3rem; }
        .sf-label { font-size: 0.82rem; font-weight: 600; color: var(--text); }
        .sf-required { color: #ef4444; margin-left: 2px; }
        .sf-input-wrap { position: relative; }
        .sf-input { padding: 0.6rem 0.85rem; border: 1px solid var(--border); border-radius: 10px; font-size: 0.85rem; color: var(--text); background: var(--surface); transition: all 0.2s; font-family: inherit; width: 100%; box-sizing: border-box; }
        .sf-input:focus { outline: none; border-color: var(--orange); box-shadow: 0 0 0 3px var(--orange-glow); background: var(--card); }
        .sf-input.sf-invalid { border-color: #ef4444; background: #fef2f2; }
        [data-theme="dark"] .sf-input.sf-invalid { background: #3b1010; }
        .sf-charcount { position: absolute; bottom: 0.3rem; right: 0.5rem; font-size: 0.6rem; color: var(--text-muted); pointer-events: none; }
        .sf-error { font-size: 0.72rem; color: #ef4444; font-weight: 500; }
        .sf-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .sf-preview-btn, .sf-draft-btn, .sf-submit {
          display: flex; align-items: center; justify-content: center; gap: 0.35rem;
          padding: 0.6rem 1rem; border-radius: 10px; font-size: 0.82rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s; flex: 1;
        }
        .sf-preview-btn { background: var(--surface); border: 1px solid var(--border); color: var(--text-secondary); }
        .sf-preview-btn:hover { background: var(--surface-2); color: var(--text); }
        .sf-draft-btn { background: var(--surface-2); border: 1px solid var(--border); color: var(--text-secondary); }
        .sf-draft-btn:hover { background: var(--border); color: var(--text); }
        .sf-submit { background: var(--orange); border: none; color: white; }
        .sf-submit:hover { background: var(--orange-dark); box-shadow: var(--shadow-brand); }
        .sf-submit:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
        .sf-preview { border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
        .sf-preview-header { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.85rem; background: var(--surface-2); border-bottom: 1px solid var(--border); font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); }
        .sf-preview-actions { display: flex; gap: 0.25rem; }
        .sf-preview-expand, .sf-preview-close { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.2rem 0.35rem; border-radius: 6px; font-size: 0.8rem; }
        .sf-preview-expand:hover, .sf-preview-close:hover { background: var(--surface); color: var(--text); }
        .sf-preview-inner { padding: 0.85rem; display: flex; flex-direction: column; gap: 0.75rem; max-height: 400px; overflow-y: auto; }
        .sf-preview-field { display: flex; flex-direction: column; gap: 0.15rem; }
        .sf-preview-label { font-size: 0.72rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; }
        .sf-preview-url { font-size: 0.82rem; color: var(--orange); word-break: break-all; }
        .sf-preview-value { font-size: 0.85rem; color: var(--text); margin: 0; line-height: 1.5; white-space: pre-wrap; }
        .sf-preview-fullscreen { position: fixed; inset: 0; z-index: 200; background: var(--bg); display: flex; flex-direction: column; border: none; border-radius: 0; }
        .sf-preview-fullscreen .sf-preview-inner { max-height: none; flex: 1; padding: 1.5rem; }
        .sf-no-fields { padding: 2rem; text-align: center; color: var(--text-muted); font-style: italic; }
      `}</style>
    </form>
  );
}
