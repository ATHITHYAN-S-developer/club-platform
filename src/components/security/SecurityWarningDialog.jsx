import { useState, useEffect, useRef } from 'react';

const STYLES = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 11000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
  },
  dialog: {
    background: '#fff', borderRadius: 20, padding: '2.5rem 2rem',
    maxWidth: 480, width: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
    textAlign: 'center',
  },
};

function getReasonMessage(reason) {
  switch (reason) {
    case 'tab_switch': return 'You switched tabs or minimized the browser window.';
    case 'fullscreen_exit': return 'You exited fullscreen mode.';
    case 'window_blur': return 'The browser window lost focus.';
    case 'devtools': return 'Developer tools were detected.';
    case 'copy_paste': return 'Copy, cut, or paste actions are disabled during this assessment.';
    case 'right_click': return 'Right-click is disabled during this assessment.';
    case 'mouse_leave': return 'The cursor left the browser window.';
    case 'refresh': return 'Page refresh is considered a violation.';
    case 'idle': return 'No activity detected for a while.';
    default: return 'An unauthorized activity was detected.';
  }
}

export default function SecurityWarningDialog({ open, variant, reason, count, limit, onResume, onCancel, securityLevel }) {
  const resumeRef = useRef(null);

  useEffect(() => {
    if (open && resumeRef.current) {
      resumeRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') e.preventDefault();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  if (!open) return null;

  const remaining = limit ? limit - count : 0;
  const isWarning = variant === 'warning';
  const isStart = variant === 'start';
  const isLocked = variant === 'locked';
  const isTerminated = variant === 'terminated';

  return (
    <div style={STYLES.overlay} role="dialog" aria-modal="true" aria-label={isTerminated ? 'Assessment terminated' : 'Security warning'}>
      <div style={STYLES.dialog} onClick={e => e.stopPropagation()}>
        {isTerminated ? (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <i className="fa-solid fa-shield-halved" style={{ fontSize: 24, color: '#dc2626' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Assessment Terminated</h2>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 20px', lineHeight: 1.6 }}>
              Your challenge has been submitted automatically due to repeated security violations.
            </p>
            <button ref={resumeRef} onClick={onResume} style={{ height: 44, padding: '0 32px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              <i className="fa-solid fa-arrow-right" style={{ marginRight: 8 }} /> View Results
            </button>
          </>
        ) : isStart ? (
          <>
            {securityLevel && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: `${securityLevel.color}15`, color: securityLevel.color, fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
                <span>{securityLevel.icon}</span>
                <span>Security Level: {securityLevel.label}</span>
              </div>
            )}
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>This Coding Assessment is Monitored</h2>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 20px' }}>
              The following protections are enabled:
            </p>
            <div style={{ textAlign: 'left', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: 'fa-expand', text: 'Fullscreen is required' },
                { icon: 'fa-window-restore', text: 'Tab switching is prohibited' },
                { icon: 'fa-copy', text: 'Copy/Paste is disabled' },
                { icon: 'fa-ban', text: 'Right click is disabled' },
                { icon: 'fa-code', text: 'Developer tools are monitored' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
                  <i className={`fa-solid ${item.icon}`} style={{ width: 16, textAlign: 'center', color: '#4f46e5', fontSize: 13 }} />
                  <span style={{ fontSize: 14, color: '#374151' }}>{item.text}</span>
                </div>
              ))}
            </div>
            {limit && (
              <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>
                Maximum Violations: <strong style={{ color: '#111827' }}>{limit}</strong>
              </p>
            )}
            <button ref={resumeRef} onClick={onResume} style={{ height: 44, padding: '0 32px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              <i className="fa-solid fa-check" style={{ marginRight: 8 }} /> Continue
            </button>
          </>
        ) : isLocked ? (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <i className="fa-solid fa-expand" style={{ fontSize: 24, color: '#d97706' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Return to Fullscreen</h2>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 8px' }}>
              Returning to the assessment is required.
            </p>
            {remaining > 0 && (
              <p style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', margin: '0 0 20px' }}>
                Remaining violations: {remaining}
              </p>
            )}
            <button ref={resumeRef} onClick={onResume} style={{ height: 44, padding: '0 32px', background: '#d97706', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              <i className="fa-solid fa-expand" style={{ marginRight: 8 }} /> Return to Fullscreen
            </button>
          </>
        ) : (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <i className="fa-solid fa-exclamation-triangle" style={{ fontSize: 24, color: '#dc2626' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Anti-Cheat Warning</h2>
            <div style={{ background: '#fef2f2', borderRadius: 10, padding: 12, marginBottom: 16, border: '1px solid #fee2e2' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 4px' }}>Activity Detected</p>
              <p style={{ fontSize: 14, color: '#111827', margin: 0 }}>{getReasonMessage(reason)}</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: count >= limit ? '#dc2626' : '#f59e0b' }}>{count} / {limit}</div>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>Violations Registered</p>
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 1.5 }}>
              Please focus on your assessment. If you reach <strong>{limit}</strong> violations, your challenge will be <strong>auto-submitted</strong> immediately.
            </p>
            <button ref={resumeRef} onClick={onResume} style={{ height: 44, padding: '0 32px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              <i className="fa-solid fa-expand" style={{ marginRight: 8 }} /> I Understand, Resume
            </button>
          </>
        )}
      </div>
    </div>
  );
}
