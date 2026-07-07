import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getBadgeDefinitions, getUserBadges } from '../services/badgeService';

export default function MyBadges({ user }) {
  const [badgeDefs, setBadgeDefs] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getBadgeDefinitions().catch(() => []),
      getUserBadges(user.id).catch(() => []),
    ]).then(([defs, ub]) => {
      setBadgeDefs(defs);
      setUserBadges(ub);
      setLoading(false);
    });
  }, [user]);

  const earnedMap = useMemo(() => {
    const map = {};
    userBadges.forEach(b => { map[b.badgeId || b.id] = b; });
    return map;
  }, [userBadges]);

  if (!user) {
    return (
      <div className="main-content">
        <div className="empty-state" style={{ marginTop: '3rem' }}>
          <div className="empty-state-icon"><i className="fas fa-sign-in-alt"></i></div>
          <h3>Sign in Required</h3>
          <p>Log in to see your badges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="page-header">
          <span className="page-tag"><i className="fas fa-medal"></i> My Badges</span>
          <h1 className="page-title">Achievements</h1>
          <p className="page-subtitle">Badges you have earned by completing quizzes and reaching milestones.</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div className="loading-dots"><span></span><span></span><span></span></div>
          </div>
        ) : badgeDefs.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <div className="empty-state-icon"><i className="fas fa-trophy"></i></div>
            <h3>No Badges Available</h3>
            <p>Badge definitions have not been set up yet.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1rem',
          }}>
            {badgeDefs.map((badge, i) => {
              const earned = earnedMap[badge.id] || earnedMap[badge.name];
              return (
                <motion.div
                  key={badge.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  style={{
                    padding: '1.5rem 1rem',
                    borderRadius: 14,
                    background: earned ? 'var(--card)' : 'var(--card)',
                    border: earned
                      ? `2px solid ${badge.color || '#ff5500'}`
                      : '1px dashed var(--border)',
                    textAlign: 'center',
                    opacity: earned ? 1 : 0.45,
                    filter: earned ? 'none' : 'grayscale(0.8)',
                    transition: 'all 0.3s',
                  }}
                >
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    margin: '0 auto 0.75rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: earned
                      ? `linear-gradient(135deg, ${badge.color || '#ff5500'}22, ${badge.color || '#ff5500'}44)`
                      : 'var(--bg-muted)',
                    fontSize: '1.6rem',
                    color: badge.color || '#ff5500',
                  }}>
                    <i className={`fas ${badge.icon || 'fa-medal'}`} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--text)' }}>
                    {badge.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {badge.description || badge.condition || ''}
                  </div>
                  {earned && (
                    <div style={{
                      marginTop: '0.6rem', fontSize: '0.72rem', fontWeight: 600,
                      color: badge.color || '#ff5500',
                    }}>
                      <i className="fas fa-check-circle" style={{ marginRight: '0.3rem' }} />
                      Earned
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
