import { motion, AnimatePresence } from 'framer-motion';

export default function ViolationDialog({ open, reason, count, limit, onResume }) {
  const getReasonMessage = (r) => {
    switch (r) {
      case 'tab_switch':
        return 'You switched tabs or minimized the browser window.';
      case 'fullscreen_exit':
        return 'You exited fullscreen mode.';
      case 'devtools':
        return 'Developer tools opening attempt detected.';
      case 'copy_paste':
        return 'Copy/Cut/Paste actions are disabled during the quiz.';
      case 'escape_key':
        return 'Escape key press detected.';
      default:
        return 'An unauthorized browser activity was detected.';
    }
  };

  const remaining = limit - count;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 11000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            style={{
              background: 'var(--card)', borderRadius: 20, padding: '2.5rem 2rem',
              maxWidth: 440, width: '90%', boxShadow: 'var(--shadow-2xl)',
              border: '2px solid rgba(239, 68, 68, 0.2)',
              textAlign: 'center',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <i className="fas fa-exclamation-triangle" style={{ color: '#ef4444', fontSize: '1.8rem' }} />
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>
              Anti-Cheat Warning
            </h2>

            <div style={{
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: 12,
              padding: '0.85rem 1rem',
              margin: '1.25rem 0',
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Activity Detected
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginTop: '0.25rem' }}>
                {getReasonMessage(reason)}
              </div>
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ef4444' }}>
                {count} / {limit}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Violations Registered
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text)',
                marginTop: '0.75rem',
                fontWeight: 500,
                lineHeight: 1.5,
              }}>
                Please focus on your quiz. If you reach <strong>{limit}</strong> violations, your quiz will be <strong>auto-submitted</strong> immediately.
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.8rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                background: '#ef4444',
                borderColor: '#ef4444',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
                borderRadius: 10,
              }}
              onClick={onResume}
            >
              <i className="fas fa-expand" style={{ marginRight: '0.5rem' }} />
              I Understand, Resume Quiz
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
