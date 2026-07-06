import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import db from '../db';

export default function TopBar({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [pendingNotifs, setPendingNotifs] = useState(0);

  // Sync search input with URL if query changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search') || '';
    setSearchValue(q);
  }, [location]);

  // Fetch pending join requests for the notification badge
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const reqs = await db.find('JoinRequests');
        const count = reqs.filter(r => r.status === 'Pending').length;
        setPendingNotifs(count);
      } catch (e) {
        console.error(e);
      }
    };
    fetchNotifs();
    
    // Periodically sync every 15 seconds to keep it updated
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      const query = searchValue.trim();
      if (query) {
        navigate(`/resources?search=${encodeURIComponent(query)}`);
      } else {
        navigate('/resources');
      }
    }
  };

  const handleNotifClick = () => {
    // Redirect to admin request panel if logged in as admin
    const currentUser = db.getCurrentUser();
    if (currentUser && currentUser.role === 'admin') {
      navigate('/admin?tab=requests');
    } else {
      window.showToast('Notifications', 'Only admins can review pending join requests.', 'info');
    }
  };

  return (
    <div className="top-bar">
      <div className="global-search-container">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input 
          type="text" 
          className="global-search-input" 
          placeholder="Search projects..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      <div className="top-bar-actions">
        <button 
          className="theme-btn" 
          id="global-theme-toggle" 
          aria-label="Toggle theme" 
          style={{ marginRight: '0.5rem' }}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <i className="fa-solid fa-moon"></i>
          ) : (
            <i className="fa-solid fa-sun"></i>
          )}
        </button>
        <div className="notification-bell" onClick={handleNotifClick} style={{ cursor: 'pointer' }}>
          <i className="fa-solid fa-bell"></i>
          {pendingNotifs > 0 && (
            <div className="notification-badge" id="global-notif-badge"></div>
          )}
        </div>
      </div>
    </div>
  );
}
