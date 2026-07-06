import React, { useState } from 'react';
import db from '../../db.js';

export default function SecuritySettings() {
  const [settings, setSettings] = useState({
    fullscreenRequired: true,
    tabSwitchDetection: true,
    copyPasteBlock: true,
    rightClickBlock: true,
    devToolsDetection: true,
    violationLimit: 3,
    cameraRequired: false,
    microphoneRequired: false,
  });
  const [saving, setSaving] = useState(false);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await db.updateSettings({ security: settings });
      window.showToast('Success', 'Security settings saved.', 'success');
    } catch {
      window.showToast('Error', 'Failed to save settings.', 'error');
    }
    setSaving(false);
  };

  const toggles = [
    { key: 'fullscreenRequired', label: 'Fullscreen Required', desc: 'Students must enter fullscreen mode to start quizzes.' },
    { key: 'tabSwitchDetection', label: 'Tab Switch Detection', desc: 'Detect when students switch browser tabs during a quiz.' },
    { key: 'copyPasteBlock', label: 'Copy/Paste Block', desc: 'Prevent copy and paste operations during quizzes.' },
    { key: 'rightClickBlock', label: 'Right Click Block', desc: 'Disable the right-click context menu during quizzes.' },
    { key: 'devToolsDetection', label: 'Dev Tools Detection', desc: 'Detect when developer tools are opened (basic detection).' },
    { key: 'cameraRequired', label: 'Camera Required (Optional)', desc: 'Require camera access during the quiz (future feature).' },
    { key: 'microphoneRequired', label: 'Microphone Required (Optional)', desc: 'Require microphone access during the quiz (future feature).' },
  ];

  return (
    <div>
      <div className="page-header">
        <span className="page-tag"><i className="fas fa-shield-halved"></i> Security</span>
        <h1 className="page-title">Security Settings</h1>
        <p className="page-subtitle">Configure anti-cheating measures and quiz security defaults.</p>
      </div>

      <div className="card">
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {toggles.map(t => (
              <div key={t.key} className="security-toggle-row">
                <div>
                  <strong>{t.label}</strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{t.desc}</p>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={settings[t.key]} onChange={() => handleToggle(t.key)} />
                  <span className="switch-slider"></span>
                </label>
              </div>
            ))}
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Violation Limit</label>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Number of violations before auto-submission.</p>
            <input className="form-input" type="number" min={1} max={10} style={{ width: 120 }} value={settings.violationLimit} onChange={e => setSettings(prev => ({ ...prev, violationLimit: parseInt(e.target.value) || 3 }))} />
          </div>

          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ marginTop: '1rem' }}>
            {saving ? 'Saving...' : <><i className="fas fa-save"></i> Save Settings</>}
          </button>
        </div>
      </div>
    </div>
  );
}
