import { memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Modal({ isOpen, onClose, title, children, size = 'md', fullScreen, footer, footerSticky = true, bodyScrollable = true, maxHeight, closeOnBackdrop = true }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const sizes = {
    sm: { maxWidth: 420 },
    md: { maxWidth: 600 },
    lg: { maxWidth: 800 },
    xl: { maxWidth: 960 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            padding: '1rem',
          }}
          onClick={(e) => { if (closeOnBackdrop && e.target === e.currentTarget && onClose) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'var(--card)',
              borderRadius: fullScreen ? 0 : 16,
              border: '1px solid var(--border)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
              width: fullScreen ? '100vw' : '100%',
              height: fullScreen ? '100vh' : 'auto',
              maxWidth: fullScreen ? '100vw' : (sizes[size]?.maxWidth || sizes.md.maxWidth),
              maxHeight: fullScreen ? '100vh' : (maxHeight || '90vh'),
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            {title && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)',
              }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{title}</h3>
                {onClose && (
                  <button onClick={onClose} style={{
                    background: 'none', border: 'none', fontSize: '1.2rem',
                    color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem',
                  }}>
                    <i className="fas fa-times" />
                  </button>
                )}
              </div>
            )}
            <div style={{ flex: 1, overflow: bodyScrollable ? 'auto' : 'visible', padding: title ? '1.25rem 1.5rem' : '0' }}>
              {children}
            </div>
            {footer && (
              <div style={{
                borderTop: '1px solid var(--border)',
                padding: '0.85rem 1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                gap: '0.6rem', flexWrap: 'wrap',
                background: 'var(--card)',
                borderRadius: footerSticky ? '0 0 16px 16px' : 0,
                ...(footerSticky ? { position: 'sticky', bottom: 0, zIndex: 1 } : {}),
              }}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(Modal);
