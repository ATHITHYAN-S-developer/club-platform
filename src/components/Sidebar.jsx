import { NavLink, useNavigate } from 'react-router-dom';
import db from '../db';

export default function Sidebar({ user, isCollapsed, toggleCollapse, isMobileOpen, closeMobile }) {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await db.logout();
      window.showToast('Logged Out', 'You have been safely logged out.', 'info');
      navigate('/');
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const navItems = [
    { to: '/', label: 'Home', icon: 'fa-house' },
    { to: '/announcements', label: 'Announcements', icon: 'fa-bullhorn' },
    { to: '/my-registrations', label: 'My Registrations', icon: 'fa-ticket-simple' },
    { to: '/members', label: 'Members', icon: 'fa-users' },
    { to: '/resources', label: 'Resources', icon: 'fa-book' },
    { to: '/gallery', label: 'Gallery', icon: 'fa-image' },
    { to: '/events', label: 'Events', icon: 'fa-calendar-days' },
    { to: '/quiz', label: 'Weekly Quiz', icon: 'fa-brain' },
    { to: '/winners', label: 'Weekly Winners', icon: 'fa-trophy' },
    { to: '/tasks', label: 'Tasks', icon: 'fa-square-check' },
    { to: '/task-leaderboard', label: 'Task Leaderboard', icon: 'fa-ranking-star' },
    { to: '/join', label: 'Join Club', icon: 'fa-hand-fist' },
    { to: '/contact', label: 'Contact', icon: 'fa-phone' },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`} id="app-sidebar">
      <div className="sidebar-header">
        <NavLink to="/" className="sidebar-logo" onClick={closeMobile}>
          <span className="logo-dot"></span> <span>MINDCRAFT AI</span>
        </NavLink>
        <button className="sidebar-toggle-btn" onClick={toggleCollapse}>
          <i className={`fa-solid ${isCollapsed ? 'fa-angles-right' : 'fa-angles-left'}`}></i>
        </button>
      </div>

      <ul className="sidebar-menu">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <i className={`fa-solid ${item.icon}`}></i> <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
        {user && user.role === 'admin' && (
          <li>
            <NavLink to="/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <i className="fa-solid fa-crown"></i> <span>Admin Panel</span>
            </NavLink>
          </li>
        )}
      </ul>

      {user ? (
        <div className="sidebar-user">
          <img className="sidebar-user-avatar" src={user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=ff5500&color=fff`} alt={user.name} />
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user.name}</span>
            <span className="sidebar-user-role">{user.role}</span>
          </div>
          <button onClick={handleLogout} className="sidebar-user-logout" title="Logout">
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      ) : (
        <div className="sidebar-user" style={{ justifyContent: 'center' }}>
          <NavLink to="/auth" className="btn btn-primary btn-sm" style={{ borderRadius: '8px', width: '100%' }} onClick={closeMobile}>
            <i className="fa-solid fa-right-to-bracket"></i> <span>Sign In</span>
          </NavLink>
        </div>
      )}
    </aside>
  );
}
