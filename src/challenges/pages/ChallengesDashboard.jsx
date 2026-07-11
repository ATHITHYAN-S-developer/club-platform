import { useState, useEffect, useMemo } from 'react';
import db from '../../db';

export default function ChallengesDashboard({ user }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const all = await db.find('Challenges');
        setChallenges(all.filter(c => c.status === 'published'));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const stats = useMemo(() => {
    return { total: challenges.length, xp: user?.challengeXp || 0 };
  }, [challenges, user]);

  if (loading) {
    return (
      <div className="chl-container" style={{ textAlign: 'center', paddingTop: 96 }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin .65s linear infinite', margin: '0 auto' }}></div>
      </div>
    );
  }

  return (
    <div className="chl-container">
      <div style={{ marginBottom: 48 }}>
        <h1 className="chl-section-title">Challenges</h1>
        <p className="chl-section-sub" style={{ marginBottom: 0 }}>Solve coding challenges, earn XP, and climb the leaderboard.</p>
      </div>

      <div className="chl-stats">
        <div className="chl-stat">
          <div className="chl-stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}><i className="fas fa-code"></i></div>
          <div>
            <div className="chl-stat-value">{stats.total}</div>
            <div className="chl-stat-label">Total Challenges</div>
          </div>
        </div>
        <div className="chl-stat">
          <div className="chl-stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><i className="fas fa-star"></i></div>
          <div>
            <div className="chl-stat-value">{stats.xp.toLocaleString()}</div>
            <div className="chl-stat-label">Total XP</div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '64px 0', color: '#9ca3af' }}>
        <i className="fas fa-code" style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}></i>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#6b7280' }}>No challenges available yet.</p>
        <p style={{ fontSize: 14, marginTop: 8 }}>Check back later for new coding challenges!</p>
      </div>
    </div>
  );
}
