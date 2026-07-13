import { memo } from 'react';
import { PRESETS } from '../../../utils/exportUtils';

const chipStyle = {
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '0.35rem 0.75rem',
  fontSize: '0.74rem',
  fontWeight: 650,
  cursor: 'pointer',
  transition: 'all 0.15s',
  fontFamily: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
};

function ExportPresetSelector({ active, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        Quick Presets
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {Object.entries(PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            title={preset.description}
            aria-pressed={active === key}
            style={{
              ...chipStyle,
              background: active === key ? 'rgba(255,85,0,0.1)' : 'var(--surface)',
              color: active === key ? 'var(--orange)' : 'var(--text-secondary)',
              borderColor: active === key ? 'var(--orange)' : 'var(--border)',
            }}
          >
            <i className={`fas ${preset.icon}`} />
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(ExportPresetSelector);
