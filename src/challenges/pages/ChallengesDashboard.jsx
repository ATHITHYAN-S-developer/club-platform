import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import db from '../../db';
import { DIFFICULTY, CHALLENGE_TYPES, calculateLevel, getSecurityLevel } from '../config/challengeConfig';

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

  const attemptCounts = useMemo(() => {
    const map = {};
    submissions.forEach(s => { map[s.challengeId] = (map[s.challengeId] || 0) + 1; });
    return map;
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

      {/* Daily Challenge Spotlight */}
      {(() => {
        const today = new Date().toISOString().split('T')[0];
        const daily = challenges.find(c => c.isDailyChallenge && c.challengeDate?.startsWith(today));
        if (!daily) return null;
        const dailyDiff = DIFFICULTY[daily.difficulty] || DIFFICULTY.easy;
        const dailyDone = completedIds.has(daily.id);
        const dailyAttempts = attemptCounts[daily.id] || 0;
        const dailyMax = daily.maxAttempts || 0;
        const dailyLimitReached = dailyMax > 0 && dailyAttempts >= dailyMax;
        return (
          <div
            style={{
              marginBottom: 32,
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
              borderRadius: 20,
              padding: 32,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              cursor: dailyLimitReached ? 'not-allowed' : 'pointer',
              transition: 'transform .2s, box-shadow .2s',
              boxShadow: '0 8px 32px rgba(79, 70, 229, 0.25)',
            }}
            onClick={() => {
              if (dailyLimitReached) {
                window.showToast?.('Limit Reached', `You have used all ${dailyMax} attempt${dailyMax > 1 ? 's' : ''} for today's challenge.`, 'warning');
                return;
              }
              navigate(`/challenges/${daily.id}`);
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(79, 70, 229, 0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(79, 70, 229, 0.25)'; }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>🔥</span>
                <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', opacity: 0.9 }}>Daily Challenge — {today}</span>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px', lineHeight: 1.3 }}>{daily.title}</h2>
              <p style={{ fontSize: 14, opacity: 0.85, margin: 0, lineHeight: 1.5, maxWidth: 560 }}>
                {daily.description?.replace(/[#*`]/g, '').substring(0, 140)}...
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
                  {dailyDiff.label}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>+{daily.xpReward || 100} XP</span>
                {dailyMax > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>
                    {dailyAttempts}/{dailyMax} attempts
                  </span>
                )}
                {dailyDone && <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,0.25)', padding: '3px 10px', borderRadius: 999 }}>✓ Completed</span>}
                {dailyLimitReached && <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(239,68,68,0.3)', padding: '3px 10px', borderRadius: 999 }}>Limit Reached</span>}
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              <button
                style={{
                  padding: '14px 28px',
                  background: '#fff',
                  color: '#4f46e5',
                  border: 'none',
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: dailyLimitReached ? 'not-allowed' : 'pointer',
                  opacity: dailyLimitReached ? 0.6 : 1,
                  transition: 'all .2s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                disabled={dailyLimitReached}
              >
                {dailyDone ? 'Retry Challenge' : 'Start Daily Challenge'} →
              </button>
            </div>
          </div>
        );
      })()}

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
            const userAttempts = attemptCounts[ch.id] || 0;
            const maxAttempts = ch.maxAttempts || 0;
            const limitReached = maxAttempts > 0 && userAttempts >= maxAttempts;
            const todayStr = new Date().toISOString().split('T')[0];
            const isDaily = ch.isDailyChallenge && ch.challengeDate?.startsWith(todayStr);
            const secLevel = ch.security ? getSecurityLevel(ch.security) : null;
            return (
              <div
                key={ch.id}
                className="chl-card"
                style={{ cursor: limitReached ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', opacity: limitReached ? 0.65 : 1, ...(isDaily ? { border: '2px solid #7c3aed', boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)' } : {}) }}
                onClick={() => {
                  if (limitReached) {
                    window.showToast?.('Limit Reached', `You have used all ${maxAttempts} attempt${maxAttempts > 1 ? 's' : ''} for this challenge.`, 'warning');
                    return;
                  }
                  navigate(`/challenges/${ch.id}`);
                }}
              >
                {done && !limitReached && (
                  <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 11, fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: 999 }}>Done</span>
                )}
                {limitReached && (
                  <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 11, fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: 999 }}>Limit Reached</span>
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`chl-diff chl-diff-${ch.difficulty}`}>
                    <i className={`fas ${type.icon}`}></i>
                    {diff.label}
                  </span>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>{type.label}</span>
                  {isDaily && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: 999 }}>🔥 Daily</span>
                  )}
                  {secLevel && secLevel.label !== 'Basic' && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: secLevel.color, background: `${secLevel.color}15`, padding: '2px 8px', borderRadius: 999 }}>
                      {secLevel.icon} {secLevel.label}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>{ch.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {ch.description?.replace(/[#*`]/g, '').substring(0, 120)}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#4f46e5' }}>+{ch.xpReward || 100} XP</span>
                    {maxAttempts > 0 && (
                      <span style={{ fontSize: 12, color: limitReached ? '#dc2626' : '#6b7280', fontWeight: 600 }}>
                        {userAttempts}/{maxAttempts} attempts
                      </span>
                    )}
                  </div>
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
