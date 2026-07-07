import { memo } from 'react';

function Button({ children, variant = 'primary', size = 'md', className = '', loading, icon, ...props }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
    fontWeight: 600, borderRadius: 10, cursor: 'pointer', border: 'none',
    transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
    fontFamily: 'inherit', whiteSpace: 'nowrap',
    opacity: props.disabled ? 0.5 : 1,
    pointerEvents: props.disabled ? 'none' : 'auto',
  };

  const variants = {
    primary: {
      background: 'var(--orange)', color: '#fff',
      boxShadow: '0 2px 12px rgba(255,85,0,0.25)',
    },
    secondary: {
      background: 'var(--surface)', color: 'var(--text)',
      border: '1px solid var(--border)',
    },
    outline: {
      background: 'transparent', color: 'var(--text-secondary)',
      border: '1px solid var(--border)',
    },
    ghost: {
      background: 'transparent', color: 'var(--text-secondary)',
      border: 'none',
    },
    danger: {
      background: '#fee2e2', color: '#dc2626', border: 'none',
    },
  };

  const sizes = {
    sm: { padding: '0.4rem 0.85rem', fontSize: '0.78rem' },
    md: { padding: '0.6rem 1.2rem', fontSize: '0.85rem' },
    lg: { padding: '0.8rem 1.8rem', fontSize: '0.95rem' },
  };

  const style = { ...base, ...(variants[variant] || variants.primary), ...(sizes[size] || sizes.md) };

  return (
    <button type="button" style={style} className={className} {...props}>
      {loading ? <i className="fas fa-spinner fa-spin" /> : icon ? <i className={`fas ${icon}`} /> : null}
      {children}
    </button>
  );
}

export default memo(Button);
