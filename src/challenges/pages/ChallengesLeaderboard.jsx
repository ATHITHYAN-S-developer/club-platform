import { useState, useEffect, useMemo } from 'react';
import db from '../../db';

const PERIODS = [
  { key: 'overall', label: 'Overall' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

export default function ChallengesLeaderboard({ user }) {
  const [period, setPeriod] = useState('overall');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const boards = await db.find('ChallengeLeaderboard');
        const board = boards.find(b => b.period === period);
        setLeaderboard(board?.rankings || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [period]);

  const filtered = useMemo(() => {
    if (!search) return leaderboard;
    const q = search.toLowerCase();
    return leaderboard.filter(r => r.userName?.toLowerCase().includes(q));
  }, [leaderboard, search]);

  const userRank = useMemo(() => {
    if (!user) return null;
    const idx = leaderboard.findIndex(r => r.userId === user.id);
    if (idx === -1) return null;
    return { ...leaderboard[idx], rank: idx + 1 };
  }, [leaderboard, user]);

  const topRanks = filtered.slice(0, 10);

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
        <h1 className="chl-section-title">Leaderboard</h1>
        <p className="chl-section-sub" style={{ marginBottom: 0 }}>Top challengers ranked by performance.</p>
      </div>

      {/* Period tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: '#f3f4f6', padding: 4, borderRadius: 8, width: 'fit-content' }}>
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            style={{
              padding: '8px 20px', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: period === p.key ? '#fff' : 'transparent',
              color: period === p.key ? '#111827' : '#6b7280',
              boxShadow: period === p.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all .2s',
            }}
          >{p.label}</button>
        ))}
      </div>

      {/* Search */}
      <input
        className="chl-search"
        placeholder="Search players..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 24, maxWidth: 360 }}
      />

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        {topRanks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
            <i className="fas fa-trophy" style={{ fontSize: 28, marginBottom: 12, opacity: 0.4 }}></i>
            <p style={{ fontSize: 14 }}>No rankings yet for this period.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
          <table className="chl-lb-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th>
                <th>Player</th>
                <th style={{ textAlign: 'right' }}>Score</th>
                <th style={{ textAlign: 'right' }}>Accuracy</th>
                <th style={{ textAlign: 'right' }}>Streak</th>
                <th style={{ textAlign: 'right' }}>Badges</th>
              </tr>
            </thead>
            <tbody>
              {topRanks.map((r, i) => {
                const rank = i + 1;
                return (
                  <tr key={r.userId}>
                    <td>
                      {rank <= 3 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', color: '#fff', fontSize: 12, fontWeight: 700, background: rank === 1 ? '#f59e0b' : rank === 2 ? '#9ca3af' : '#d97706' }}>
                          {rank}
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af', fontWeight: 700, fontSize: 14, paddingLeft: 8 }}>{rank}</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={r.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userName)}&background=4f46e5&color=fff`}
                          alt={r.userName}
                          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', background: '#f3f4f6' }}
                        />
                        <span style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{r.userName}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#4f46e5' }}>{r.totalScore?.toLocaleString() || 0}</td>
                    <td style={{ textAlign: 'right', color: '#6b7280', fontSize: 14 }}>{r.accuracy || 0}%</td>
                    <td style={{ textAlign: 'right', color: '#6b7280', fontSize: 14 }}>
                      {r.streak > 0 && <span style={{ color: '#f59e0b' }}>🔥 {r.streak}</span>}
                      {!r.streak && '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        {(r.badges || []).slice(0, 3).map(b => (
                          <span key={b} style={{ fontSize: 14 }} title={b}>{b === 'first_challenge' ? '🎯' : b === 'streak_7' ? '🔥' : b === 'streak_30' ? '💪' : '🏅'}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* User row */}
      {userRank && userRank.rank > 10 && (
        <div style={{ marginTop: 24, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
          <table className="chl-lb-table">
            <tbody>
              <tr className="chl-lb-row-user">
                <td style={{ width: 48 }}>
                  <span style={{ color: '#4f46e5', fontWeight: 700, fontSize: 14, paddingLeft: 8 }}>{userRank.rank}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={userRank.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(userRank.userName)}&background=4f46e5&color=fff`}
                      alt={userRank.userName}
                      style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ fontWeight: 600 }}>{userRank.userName} <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 12 }}>(you)</span></span>
                  </div>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#4f46e5' }}>{userRank.totalScore?.toLocaleString() || 0}</td>
                <td style={{ textAlign: 'right', color: '#6b7280' }}>{userRank.accuracy || 0}%</td>
                <td style={{ textAlign: 'right', color: '#6b7280' }}>{userRank.streak > 0 ? `🔥 ${userRank.streak}` : '—'}</td>
                <td style={{ textAlign: 'right' }}></td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
