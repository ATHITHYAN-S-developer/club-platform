import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import db from '../../db';
import { BADGE_DEFINITIONS, calculateLevel } from '../config/challengeConfig';

export default function ChallengesProfile({ user }) {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (user) {
          const all = await db.find('ChallengeSubmissions');
          setSubmissions(all.filter(s => s.userId === user.id).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="chl-container" style={{ textAlign: 'center', paddingTop: 96 }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin .65s linear infinite', margin: '0 auto' }}></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="chl-container" style={{ textAlign: 'center', paddingTop: 96 }}>
        <i className="fas fa-user" style={{ fontSize: 32, color: '#9ca3af', marginBottom: 16, opacity: 0.5 }}></i>
        <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 16 }}>Sign in to view your profile.</p>
        <button onClick={() => navigate('/auth')} style={{ padding: '10px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Sign In</button>
      </div>
    );
  }

  const level = calculateLevel(user.challengeXp || 0);
  const totalPassed = submissions.filter(s => s.status === 'passed').length;
  const totalFailed = submissions.filter(s => s.status === 'failed').length;
  const uniqueSolved = new Set(submissions.filter(s => s.status === 'passed').map(s => s.challengeId)).size;
  const userBadges = user.badges || [];
  const badgeDefs = BADGE_DEFINITIONS.filter(b => userBadges.includes(b.id));
  const totalXp = user.challengeXp || 0;

  const recentSubs = submissions.slice(0, 10);

  return (
    <div className="chl-container">
      <div style={{ marginBottom: 48 }}>
        <h1 className="chl-section-title">Profile</h1>
        <p className="chl-section-sub" style={{ marginBottom: 0 }}>Your challenge stats and achievements.</p>
      </div>

      <div className="chl-profile-layout">
        {/* Left: Profile Card */}
        <div className="chl-profile-card">
          <img
            src={user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=4f46e5&color=fff`}
            alt={user.name}
            className="chl-profile-avatar"
          />
          <div className="chl-profile-name">{user.name || 'User'}</div>
          <div className="chl-profile-level">{level.icon} {level.name}</div>

          <div style={{ marginTop: 24 }}>
            <div className="chl-profile-stat">
              <span className="chl-profile-stat-label">Total XP</span>
              <span className="chl-profile-stat-value">{totalXp.toLocaleString()}</span>
            </div>
            <div className="chl-profile-stat">
              <span className="chl-profile-stat-label">Solved</span>
              <span className="chl-profile-stat-value">{uniqueSolved}</span>
            </div>
            <div className="chl-profile-stat">
              <span className="chl-profile-stat-label">Attempts</span>
              <span className="chl-profile-stat-value">{submissions.length}</span>
            </div>
            <div className="chl-profile-stat">
              <span className="chl-profile-stat-label">Pass Rate</span>
              <span className="chl-profile-stat-value">{submissions.length > 0 ? Math.round((totalPassed / submissions.length) * 100) : 0}%</span>
            </div>
            <div className="chl-profile-stat">
              <span className="chl-profile-stat-label">Streak</span>
              <span className="chl-profile-stat-value">{user.currentStreak || 0} days</span>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
            <div className="chl-card">
              <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Passed</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#059669' }}>{totalPassed}</div>
            </div>
            <div className="chl-card">
              <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Failed</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#dc2626' }}>{totalFailed}</div>
            </div>
            <div className="chl-card">
              <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Accuracy</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#4f46e5' }}>
                {submissions.length > 0 ? Math.round((totalPassed / submissions.length) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Badges */}
          {badgeDefs.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Badges</h3>
              <div className="chl-badges">
                {badgeDefs.map(b => (
                  <div key={b.id} className="chl-badge" title={b.desc}>
                    <span className="chl-badge-icon">{b.icon}</span>
                    {b.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submission History */}
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Submission History</h3>
            {recentSubs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
                <i className="fas fa-history" style={{ fontSize: 24, opacity: 0.4, marginBottom: 12 }}></i>
                <p style={{ fontSize: 14 }}>No submissions yet. Start solving challenges!</p>
              </div>
            ) : (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                <table className="chl-lb-table">
                  <thead>
                    <tr>
                      <th>Challenge</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th>Language</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSubs.map(sub => (
                      <tr key={sub.id}>
                        <td style={{ fontWeight: 600, color: '#111827' }}>{sub.taskTitle || sub.challengeId}</td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 999, background: sub.status === 'passed' ? '#d1fae5' : '#fee2e2', color: sub.status === 'passed' ? '#059669' : '#dc2626' }}>
                            {sub.status === 'passed' ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                        <td style={{ color: '#4f46e5', fontWeight: 600 }}>{sub.xpEarned || 0}</td>
                        <td style={{ color: '#6b7280' }}>{sub.language || '—'}</td>
                        <td style={{ color: '#9ca3af', fontSize: 13 }}>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
