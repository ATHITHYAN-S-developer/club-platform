import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import db from './db';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';

import Home from './pages/Home';
import Members from './pages/Members';
import Resources from './pages/Resources';
import Gallery from './pages/Gallery';
import Events from './pages/Events';
import Quiz from './pages/QuizPage';
import Leaderboard from './pages/Leaderboard';
import Winners from './pages/Winners';
import Tasks from './pages/Tasks';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import Signup from './pages/Signup';

export default function App() {
  const location = useLocation();
  const isFullscreenPage = location.pathname === '/auth' || location.pathname === '/signup';

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = db.subscribeAuth((profile) => {
      setUser(profile);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    window.showToast = (title, message, type = 'success') => {
      const id = Date.now() + Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type }]);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const ProtectedRoute = ({ children, roleRequired }) => {
    if (authLoading) return <div className="loading-spinner"></div>;
    if (!user) {
      const redirectUrl = window.location.pathname + window.location.search;
      return <Navigate to={`/auth?redirect=${encodeURIComponent(redirectUrl)}`} replace />;
    }
    if (roleRequired && user.role !== roleRequired) {
      window.showToast('Access Denied', 'Unauthorized access level.', 'error');
      return <Navigate to="/" replace />;
    }
    return children;
  };

  if (isFullscreenPage) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header user={user} />
        <div style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
          {authLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth user={user} />} />
              <Route path="/signup" element={<Signup user={user} />} />
            </Routes>
          )}
        </div>
        <Footer />
        <div id="toast-container" className="toast-container">
          {toasts.map((toast) => (
            <Toast key={toast.id} id={toast.id} title={toast.title} message={toast.message} type={toast.type} onClose={removeToast} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', position: 'relative' }}>

      <Header user={user} />

      <div className={`main-content ${location.pathname === '/' ? 'home-main-content' : ''}`}>
        {authLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/members" element={<Members />} />
            <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/events" element={<Events user={user} />} />
            <Route path="/winners" element={<Winners />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth user={user} />} />
            <Route path="/signup" element={<Signup user={user} />} />
            <Route path="/quiz" element={<ProtectedRoute><Quiz user={user} /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard user={user} /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Tasks user={user} /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roleRequired="admin"><Admin user={user} /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>

      <Footer />
      <div id="toast-container" className="toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} id={toast.id} title={toast.title} message={toast.message} type={toast.type} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
}
