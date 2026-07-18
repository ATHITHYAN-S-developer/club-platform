import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import db from './db';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import Loading from './components/ui/Loading';
import ScrollToTop from './components/ScrollToTop';
import { ThemeProvider } from './contexts/ThemeContext';

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%' }}
    >
      {children}
    </motion.div>
  );
}

const Home = lazy(() => import('./pages/Home'));
const Members = lazy(() => import('./pages/Members'));
const Resources = lazy(() => import('./pages/Resources'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Events = lazy(() => import('./pages/Events'));
const Quiz = lazy(() => import('./pages/QuizPage'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Winners = lazy(() => import('./pages/Winners'));
const Contact = lazy(() => import('./pages/Contact'));
const Careers = lazy(() => import('./pages/Careers'));
const Admin = lazy(() => import('./pages/Admin'));
const Auth = lazy(() => import('./pages/Auth'));
const Signup = lazy(() => import('./pages/Signup'));
const MyResults = lazy(() => import('./pages/MyResults'));
const MyBadges = lazy(() => import('./pages/MyBadges'));
const Announcements = lazy(() => import('./pages/Announcements'));
const AnnouncementDetails = lazy(() => import('./pages/AnnouncementDetails'));
const ChallengesDashboard = lazy(() => import('./challenges/pages/ChallengesDashboard'));
const ChallengeSolve = lazy(() => import('./challenges/pages/ChallengeSolve'));
const ChallengesLeaderboard = lazy(() => import('./challenges/pages/ChallengesLeaderboard'));
const ChallengesProfile = lazy(() => import('./challenges/pages/ChallengesProfile'));
function PageLoading() {
  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}><Loading /></div>;
}

function ProtectedRoute({ children, roleRequired, user, authLoading }) {
  if (authLoading) return <div className="loading-spinner" />;
  if (!user) {
    const redirectUrl = window.location.pathname + window.location.search;
    return <Navigate to={`/auth?redirect=${encodeURIComponent(redirectUrl)}`} replace />;
  }
  if (roleRequired && user.role !== roleRequired) {
    window.showToast('Access Denied', 'Unauthorized access level.', 'error');
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const location = useLocation();
  const isFullscreenPage = location.pathname === '/auth' || location.pathname === '/signup';
  const isExamMode = location.pathname.startsWith('/challenges/') && 
                     location.pathname !== '/challenges' && 
                     location.pathname !== '/challenges/leaderboard' && 
                     location.pathname !== '/challenges/profile';

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

  const appContent = (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', position: 'relative' }}>
      {!isExamMode && <Header user={user} />}
      <div className={`main-content ${location.pathname === '/' ? 'home-main-content' : ''} ${location.pathname.startsWith('/quiz') ? 'quiz-main-content' : ''}`}>
        {authLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <Suspense fallback={<PageLoading />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                <Route path="/members" element={<PageTransition><Members /></PageTransition>} />
                <Route path="/resources" element={<ProtectedRoute user={user} authLoading={authLoading}><PageTransition><Resources /></PageTransition></ProtectedRoute>} />
                <Route path="/gallery" element={<PageTransition><Gallery /></PageTransition>} />
                <Route path="/events" element={<PageTransition><Events user={user} /></PageTransition>} />
                <Route path="/winners" element={<PageTransition><Winners /></PageTransition>} />
                <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
                <Route path="/auth" element={<PageTransition><Auth user={user} /></PageTransition>} />
                <Route path="/signup" element={<PageTransition><Signup user={user} /></PageTransition>} />
                <Route path="/quiz" element={<ProtectedRoute user={user} authLoading={authLoading}><PageTransition><Quiz user={user} /></PageTransition></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute user={user} authLoading={authLoading}><PageTransition><Leaderboard user={user} /></PageTransition></ProtectedRoute>} />
                <Route path="/careers" element={<ProtectedRoute user={user} authLoading={authLoading}><PageTransition><Careers /></PageTransition></ProtectedRoute>} />
                <Route path="/my-results" element={<ProtectedRoute user={user} authLoading={authLoading}><PageTransition><MyResults user={user} /></PageTransition></ProtectedRoute>} />
                <Route path="/my-badges" element={<ProtectedRoute user={user} authLoading={authLoading}><PageTransition><MyBadges user={user} /></PageTransition></ProtectedRoute>} />
                <Route path="/announcements" element={<PageTransition><Announcements user={user} /></PageTransition>} />
                <Route path="/announcements/:id" element={<PageTransition><AnnouncementDetails user={user} /></PageTransition>} />
                <Route path="/challenges" element={<ProtectedRoute user={user} authLoading={authLoading}><PageTransition><ChallengesDashboard user={user} /></PageTransition></ProtectedRoute>} />
                <Route path="/challenges/leaderboard" element={<ProtectedRoute user={user} authLoading={authLoading}><PageTransition><ChallengesLeaderboard user={user} /></PageTransition></ProtectedRoute>} />
                <Route path="/challenges/profile" element={<ProtectedRoute user={user} authLoading={authLoading}><PageTransition><ChallengesProfile user={user} /></PageTransition></ProtectedRoute>} />
                <Route path="/challenges/:id" element={<ProtectedRoute user={user} authLoading={authLoading}><PageTransition><ChallengeSolve user={user} /></PageTransition></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute roleRequired="admin" user={user} authLoading={authLoading}><PageTransition><Admin user={user} /></PageTransition></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        )}
      </div>
      {!isExamMode && location.pathname !== '/' && <Footer />}
      <div id="toast-container" className="toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} id={toast.id} title={toast.title} message={toast.message} type={toast.type} onClose={removeToast} />
        ))}
      </div>
    </div>
  );

  if (isFullscreenPage) {
    return (
      <ThemeProvider>
        <ScrollToTop />
        <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Header user={user} />
          <div style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
            {authLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <Suspense fallback={<PageLoading />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<Auth user={user} />} />
                  <Route path="/signup" element={<Signup user={user} />} />
                </Routes>
              </Suspense>
            )}
          </div>
          <Footer />
          <div id="toast-container" className="toast-container">
            {toasts.map((toast) => (
              <Toast key={toast.id} id={toast.id} title={toast.title} message={toast.message} type={toast.type} onClose={removeToast} />
            ))}
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return <ThemeProvider><ScrollToTop />{appContent}</ThemeProvider>;
}
