import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import db from '../db';
import NotificationCenter from './NotificationCenter';

export default function Header({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const profileRef = useRef(null);
  const moreRef = useRef(null);



  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target)) setIsMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const handleLogout = async () => {
    try {
      await db.logout();
      window.showToast('Logged Out', 'You have been safely logged out.', 'info');
      setIsProfileOpen(false);
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
    { to: '/challenges', label: 'Challenges', icon: 'fa-laptop-code' },
    { to: '/quiz', label: 'Quiz', icon: 'fa-brain' },
    { to: '/careers', label: 'Careers', icon: 'fa-diagram-project' },
    { to: '/leaderboard', label: 'Leaderboard', icon: 'fa-ranking-star' },
    { to: '/winners', label: 'Winners', icon: 'fa-trophy' },
    { to: '/contact', label: 'Contact', icon: 'fa-phone' },
  ];

  const primaryNavItems = [
    { to: '/', label: 'Home', icon: 'fa-house' },
    { to: '/announcements', label: 'Announcements', icon: 'fa-bullhorn' },
    { to: '/members', label: 'Members', icon: 'fa-users' },
    { to: '/resources', label: 'Resources', icon: 'fa-book' },
    { to: '/challenges', label: 'Challenges', icon: 'fa-laptop-code' },
    { to: '/events', label: 'Events', icon: 'fa-calendar-days' },
  ];

  const exploreNavItems = [
    { to: '/my-registrations', label: 'My Registrations', icon: 'fa-ticket-simple' },
    { to: '/gallery', label: 'Gallery', icon: 'fa-image' },
    { to: '/quiz', label: 'Quiz', icon: 'fa-brain' },
    { to: '/careers', label: 'Careers', icon: 'fa-diagram-project' },
    { to: '/leaderboard', label: 'Leaderboard', icon: 'fa-ranking-star' },
    { to: '/winners', label: 'Winners', icon: 'fa-trophy' },
  ];

  return (
    <header className="site-header">
      <Link to="/" className="header-logo" onClick={() => setIsMobileOpen(false)}>
        <img src="/logo.png" alt="Logo" style={{ height: '30px', objectFit: 'contain', marginRight: '0.4rem' }} /> <span>MINDCRAFT AI</span>
      </Link>

      <nav className="nav-menu-desktop">
        {primaryNavItems.map((item) => (
          <li key={item.to} className="nav-item-top">
            <NavLink to={item.to} className={({ isActive }) => `nav-link-top ${isActive ? 'active' : ''}`}>
              <i className={`fa-solid ${item.icon}`}></i> <span>{item.label}</span>
            </NavLink>
          </li>
        ))}

        <div className="more-dropdown-container" ref={moreRef}>
          <button className={`nav-link-top more-trigger ${isMoreOpen ? 'active' : ''}`} onClick={() => setIsMoreOpen(prev => !prev)}>
            <i className="fa-solid fa-cubes"></i> <span>Explore</span> <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.65rem', marginLeft: '0.2rem' }}></i>
          </button>
          <div className={`more-dropdown-menu ${isMoreOpen ? 'active' : ''}`}>
            {exploreNavItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`} onClick={() => setIsMoreOpen(false)}>
                <i className={`fa-solid ${item.icon}`}></i> <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <div className="header-actions">




        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <NotificationCenter user={user} />
            <div className="profile-dropdown-container" ref={profileRef}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="header-email-display" style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{user.email}</span>
                <button className="profile-trigger" onClick={() => setIsProfileOpen(prev => !prev)}>
                  <img className="profile-avatar-top" src={user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=ff5500&color=fff`} alt={user.name} />
                </button>
              </div>
            <div className={`profile-dropdown-menu ${isProfileOpen ? 'active' : ''}`}>
              <div className="dropdown-user-header">
                <span className="dropdown-user-name">{user.name}</span>
                <span className="dropdown-user-role">{user.role}</span>
              </div>
              <Link to="/challenges/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                <i className="fa-solid fa-user-gear"></i> Challenge Profile
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                  <i className="fa-solid fa-crown"></i> Admin Panel
                </Link>
              )}
              <button onClick={handleLogout} className="dropdown-item logout-btn">
                <i className="fa-solid fa-right-from-bracket"></i> Logout
              </button>
            </div>
          </div>
          </div>
        ) : (
          <Link to="/signup" className="btn btn-primary btn-sm header-signin-btn">
            <i className="fa-solid fa-user-plus"></i> <span>Join</span>
          </Link>
        )}

        <button className="mobile-nav-toggle" onClick={() => setIsMobileOpen(prev => !prev)}>
          <i className={`fa-solid ${isMobileOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
      </div>

      <div className={`mobile-nav-drawer ${isMobileOpen ? 'active' : ''}`}>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
            <i className={`fa-solid ${item.icon}`}></i> <span>{item.label}</span>
          </NavLink>
        ))}
        {user && user.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
            <i className="fa-solid fa-crown"></i> <span>Admin Panel</span>
          </NavLink>
        )}

        <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {user ? (
            <button onClick={handleLogout} className="mobile-nav-link" style={{ border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', color: '#dc2626' }}>
              <i className="fa-solid fa-right-from-bracket"></i> <span>Logout</span>
            </button>
          ) : (
             <NavLink to="/signup" className="mobile-nav-link" onClick={() => setIsMobileOpen(false)}>
               <i className="fa-solid fa-user-plus"></i> <span>Join</span>
             </NavLink>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .header-email-display {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
