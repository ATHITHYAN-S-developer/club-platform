import { useState, useRef, useEffect } from 'react';
import { LANGUAGES } from '../config/challengeConfig';

export default function LanguageSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = LANGUAGES.find(l => l.id === value) || LANGUAGES[3];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text)] hover:border-[var(--border-hover)] transition-colors cursor-pointer whitespace-nowrap"
      >
        <span className={`code-lang-dot w-2 h-2 rounded-full`} style={{ background: getLangColor(value) }} />
        {selected.name}
        <i className={`fa-solid fa-chevron-down text-[10px] text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg z-50 max-h-72 overflow-y-auto">
          {LANGUAGES.map(lang => (
            <button
              key={lang.id}
              onClick={() => { onChange(lang.id); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors cursor-pointer
                ${lang.id === value ? 'bg-[var(--orange)]/10 text-[var(--orange)] font-medium' : 'text-[var(--text)] hover:bg-[var(--surface)]'}`}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: getLangColor(lang.id) }} />
              <span>{lang.name}</span>
              <span className="ml-auto text-[11px] text-[var(--text-muted)]">{lang.version}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getLangColor(id) {
  const colors = {
    c: '#555555', cpp: '#00599C', java: '#ED8B00', python: '#3776AB',
    javascript: '#F7DF1E', typescript: '#3178C6', go: '#00ADD8', rust: '#DEA584',
    php: '#777BB4', csharp: '#239120', kotlin: '#7F52FF', swift: '#F05138',
  };
  return colors[id] || '#888';
}
