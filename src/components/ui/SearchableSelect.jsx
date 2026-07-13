import { useState, useRef, useEffect, useMemo, memo } from 'react';

function SearchableSelect({ value, onChange, options = [], placeholder = 'Select...', required = false, label }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const wrapRef = useRef(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(o => o.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    setHighlightIdx(-1);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const select = (val) => {
    onChange(val);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIdx >= 0 && highlightIdx < filtered.length) select(filtered[highlightIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIdx];
      if (item) item.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIdx]);

  const displayText = value || '';

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          border: 'none',
          borderBottom: open ? '2px solid var(--orange)' : '1px solid #dadce0',
          borderRadius: 0,
          background: 'transparent',
          padding: '0.5rem 0',
          fontSize: '0.88rem',
          color: value ? '#202124' : '#9aa0a6',
          width: '100%',
          outline: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'border-bottom-color 0.2s',
          userSelect: 'none',
        }}
      >
        <span>{displayText || placeholder}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0, marginLeft: 8, opacity: 0.5, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <path d="M2 4.5L6 8.5L10 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 9999,
          background: '#fff',
          border: '1px solid #dadce0',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          marginTop: 4,
          maxHeight: 260,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Search input */}
          {options.length > 6 && (
            <div style={{ padding: '8px 12px 4px', borderBottom: '1px solid #f0f0f0' }}>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search..."
                style={{
                  width: '100%',
                  border: '1px solid #dadce0',
                  borderRadius: 6,
                  padding: '6px 10px',
                  fontSize: '0.82rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}
          {/* Options list */}
          <div ref={listRef} style={{ overflowY: 'auto', maxHeight: options.length > 6 ? 200 : 260 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', color: '#9aa0a6', fontSize: '0.82rem' }}>
                No results found
              </div>
            ) : filtered.map((opt, i) => (
              <div
                key={opt}
                onClick={() => select(opt)}
                style={{
                  padding: '10px 14px',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  background: opt === value ? 'rgba(var(--orange-rgb), 0.08)' : i === highlightIdx ? '#f5f5f5' : 'transparent',
                  color: '#202124',
                  fontWeight: opt === value ? 600 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={() => setHighlightIdx(i)}
              >
                {opt === value && (
                  <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0, color: 'var(--orange)' }}>
                    <path d="M3 7.5L5.5 10L11 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span style={{ marginLeft: opt === value ? 0 : 22 }}>{opt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(SearchableSelect);
