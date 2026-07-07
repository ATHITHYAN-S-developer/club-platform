import { useState, useEffect, useRef } from 'react';
import db from '../db';

export default function NotificationCenter({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    if (!user) return;

    // Fetch notifications
    const loadNotifications = async () => {
      try {
        const all = await db.find('Notifications');
        const userNotifs = all.filter(n => n.userId === user.id || n.userId === 'all');
        // Sort newest first
        setNotifications(userNotifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 15000); // Poll every 15s

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.allSettled(unread.map(n => db.update('Notifications', n.id, { read: true })));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await Promise.allSettled(notifications.map(n => db.delete('Notifications', n.id)));
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  if (!user) return null;

  return (
    <div ref={dropdownRef} className="notification-center-container" style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none', border: 'none', color: 'var(--text-secondary)',
          fontSize: '1.25rem', cursor: 'pointer', position: 'relative',
          padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--orange)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <i className="fa-regular fa-bell" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            background: '#ef4444', color: '#fff', fontSize: '0.62rem',
            fontWeight: 800, minWidth: 15, height: 15, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2px', border: '2px solid var(--card)',
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', right: 0, top: '2.5rem',
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 14, boxShadow: 'var(--shadow-xl)', width: 320,
          zIndex: 9999, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontWeight: 750, fontSize: '0.88rem', color: 'var(--text)' }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none', border: 'none', color: 'var(--orange)',
                  fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 280, overflowY: 'auto', background: 'var(--surface)' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <i className="fa-regular fa-bell-slash" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block', opacity: 0.5 }} />
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  style={{
                    padding: '0.85rem 1rem',
                    borderBottom: '1px solid var(--border-light)',
                    background: n.read ? 'transparent' : 'rgba(255, 85, 0, 0.03)',
                    transition: 'background 0.2s',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    {!n.read && (
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: 'var(--orange)', marginTop: 5, flexShrink: 0,
                      }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.82rem', fontWeight: n.read ? 600 : 750,
                        color: 'var(--text)', lineHeight: 1.4,
                      }}>
                        {n.title}
                      </div>
                      <div style={{
                        fontSize: '0.76rem', color: 'var(--text-secondary)',
                        marginTop: '0.2rem', lineHeight: 1.4,
                      }}>
                        {n.message}
                      </div>
                      <div style={{
                        fontSize: '0.65rem', color: 'var(--text-muted)',
                        marginTop: '0.35rem',
                      }}>
                        {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
              <button
                onClick={handleClearAll}
                style={{
                  background: 'none', border: 'none', color: '#ef4444',
                  fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer',
                  width: '100%', padding: '0.25rem 0',
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
