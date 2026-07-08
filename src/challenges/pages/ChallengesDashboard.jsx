import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import db from '../../db';
import { DIFFICULTY, CHALLENGE_TYPES, calculateLevel } from '../config/challengeConfig';

const difficultyKeys = ['easy', 'medium', 'hard'];
const typeKeys = Object.keys(CHALLENGE_TYPES);

export default function ChallengesDashboard({ user }) {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const all = await db.find('Challenges');
        setChallenges(all.filter(c => c.status === 'published'));
        if (user) {
          const subs = await db.find('ChallengeSubmissions');
          setSubmissions(subs.filter(s => s.userId === user.id));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const stats = useMemo(() => {
    const total = challenges.length;
    const completed = submissions.filter(s => s.status === 'passed').length;
    const userId = user?.id;
    let streak = 0;
    if (userId) {
      const passed = submissions.filter(s => s.status === 'passed')
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      if (passed.length > 0) {
        let count = 1;
        const today = new Date();
        for (let i = 1; i < passed.length; i++) {
          const prev = new Date(passed[i - 1].submittedAt);
          const curr = new Date(passed[i].submittedAt);
          const diffDays = (prev - curr) / (1000 * 60 * 60 * 24);
          if (diffDays <= 1.5) count++;
          else break;
        }
        streak = count;
      }
    }
    return { total, completed, streak, xp: user?.challengeXp || 0 };
  }, [challenges, submissions, user]);

  const filtered = useMemo(() => {
    return challenges.filter(c => {
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (diffFilter && c.difficulty !== diffFilter) return false;
      if (typeFilter && c.challengeType !== typeFilter) return false;
      return true;
    });
  }, [challenges, search, diffFilter, typeFilter]);

  const completedIds = useMemo(() => {
    return new Set(submissions.filter(s => s.status === 'passed').map(s => s.challengeId));
  }, [submissions]);

  if (loading) {
    return (
      <div className="chl-container" style={{ textAlign: 'center', paddingTop: 96 }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin .65s linear infinite', margin: '0 auto' }}></div>
      </div>
    );
  }

  return (
    <div className="chl-container">
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <h1 className="chl-section-title">Challenges</h1>
        <p className="chl-section-sub" style={{ marginBottom: 0 }}>Solve coding challenges, earn XP, and climb the leaderboard.</p>
      </div>

      {/* Stats */}
      <div className="chl-stats">
        <div className="chl-stat">
          <div className="chl-stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}><i className="fas fa-code"></i></div>
          <div>
            <div className="chl-stat-value">{stats.total}</div>
            <div className="chl-stat-label">Total Challenges</div>
          </div>
        </div>
        <div className="chl-stat">
          <div className="chl-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}><i className="fas fa-check-circle"></i></div>
          <div>
            <div className="chl-stat-value">{stats.completed}</div>
            <div className="chl-stat-label">Completed</div>
          </div>
        </div>
        <div className="chl-stat">
          <div className="chl-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><i className="fas fa-fire"></i></div>
          <div>
            <div className="chl-stat-value">{stats.streak}</div>
            <div className="chl-stat-label">Day Streak</div>
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

      {/* Filters */}
      <div className="chl-filters">
        <input
          className="chl-search"
          placeholder="Search challenges..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="chl-select" value={diffFilter} onChange={e => setDiffFilter(e.target.value)}>
          <option value="">All Difficulties</option>
          {difficultyKeys.map(d => (
            <option key={d} value={d}>{DIFFICULTY[d].label}</option>
          ))}
        </select>
        <select className="chl-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {typeKeys.map(t => (
            <option key={t} value={t}>{CHALLENGE_TYPES[t].label}</option>
          ))}
        </select>
      </div>

      {/* Challenge Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#9ca3af' }}>
          <i className="fas fa-search" style={{ fontSize: 32, marginBottom: 16, opacity: 0.5 }}></i>
          <p style={{ fontSize: 16 }}>No challenges found matching your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {filtered.map(ch => {
            const diff = DIFFICULTY[ch.difficulty] || DIFFICULTY.easy;
            const type = CHALLENGE_TYPES[ch.challengeType] || CHALLENGE_TYPES.coding;
            const done = completedIds.has(ch.id);
            return (
              <div
                key={ch.id}
                className="chl-card"
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}
                onClick={() => navigate(`/challenges/${ch.id}`)}
              >
                {done && (
                  <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 11, fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: 999 }}>Done</span>
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`chl-diff chl-diff-${ch.difficulty}`}>
                    <i className={`fas ${type.icon}`}></i>
                    {diff.label}
                  </span>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>{type.label}</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>{ch.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {ch.description?.replace(/[#*`]/g, '').substring(0, 120)}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#4f46e5' }}>+{ch.xpReward || 100} XP</span>
                  {ch.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      {ch.tags.slice(0, 2).map(tag => (
                        <span key={tag} style={{ fontSize: 11, color: '#9ca3af', background: '#f3f4f6', padding: '2px 8px', borderRadius: 4 }}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
