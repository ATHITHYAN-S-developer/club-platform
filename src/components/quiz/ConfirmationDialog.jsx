import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmationDialog({ open, onConfirm, onCancel, submitting }) {
  const [text, setText] = useState('');

  const handleClose = () => {
    setText('');
    onCancel();
  };

  const handleConfirm = () => {
    if (text === 'FINISH') {
      setText('');
      onConfirm();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            style={{
              background: 'var(--card)', borderRadius: 16, padding: '2rem',
              maxWidth: 420, width: '90%', boxShadow: 'var(--shadow-xl)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(255,85,0,0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.75rem',
              }}>
                <i className="fas fa-check-circle" style={{ color: 'var(--orange)', fontSize: '1.6rem' }} />
              </div>
              <h2 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>Submit Quiz?</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                You have unanswered questions. Type <strong>FINISH</strong> below to confirm submission.
              </p>
            </div>

            <input
              autoFocus
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); if (e.key === 'Escape') handleClose(); }}
              placeholder='Type "FINISH" to confirm...'
              style={{
                width: '100%', padding: '0.7rem 1rem', border: `2px solid ${text === 'FINISH' ? 'var(--orange)' : 'var(--border)'}`,
                borderRadius: 10, fontSize: '0.95rem', fontWeight: 700,
                textAlign: 'center', letterSpacing: '0.08em',
                background: 'var(--surface)', color: 'var(--text)',
                outline: 'none', marginBottom: '1rem',
              }}
            />

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleConfirm}
                disabled={text !== 'FINISH' || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
