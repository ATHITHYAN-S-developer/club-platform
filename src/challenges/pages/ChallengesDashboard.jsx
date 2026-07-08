import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getChallenges, getDailyChallenge, getUserSubmissions, getUserRank } from '../services/challengeService';
import { DIFFICULTY, DIFFICULTIES, CHALLENGE_TYPES } from '../config/challengeConfig';
import ChallengeCard from '../components/ChallengeCard';
import { calculateLevel, LEVELS } from '../config/challengeConfig';

export default function ChallengesDashboard({ user }) {
  const [challenges, setChallenges] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterDiff, setFilterDiff] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [chals, daily, subs, rank] = await Promise.all([
          getChallenges({ status: 'published' }),
          getDailyChallenge(),
          user ? getUserSubmissions(user.id) : Promise.resolve([]),
          user ? getUserRank(user.id) : Promise.resolve(null),
        ]);
        setChallenges(chals);
        setDailyChallenge(daily);
        setSubmissions(subs);
        setUserRank(rank);
      } catch (e) {
        console.error('Dashboard load error', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const solvedIds = new Set(submissions.filter(s => s.status === 'passed').map(s => s.challengeId));
  const attemptedIds = new Set(submissions.filter(s => s.status !== 'passed').map(s => s.challengeId));

  const level = calculateLevel(user?.challengeXp || 0);

  const filtered = challenges.filter(c => {
    if (filterDiff !== 'all' && c.difficulty !== filterDiff) return false;
    if (filterType !== 'all' && c.challengeType !== filterType) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[var(--orange)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text)]" style={{ fontFamily: 'Inter, sans-serif' }}>Coding Challenges</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Solve challenges, earn XP, and climb the leaderboard</p>
        </div>
        <Link
          to="/challenges/leaderboard"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm font-semibold text-[var(--text)] hover:border-[var(--orange)] transition-all w-fit"
        >
          <i className="fa-solid fa-trophy text-yellow-500" />
          Leaderboard
        </Link>
      </div>

      {/* Stats Row */}
      {user && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total XP', value: (user.challengeXp || 0).toLocaleString(), icon: 'fa-star', color: '#f59e0b' },
            { label: 'Level', value: level.name, icon: 'fa-ranking-star', color: '#8b5cf6' },
            { label: 'Streak', value: `${user.currentStreak || 0} days`, icon: 'fa-fire', color: '#ef4444' },
            { label: 'Rank', value: userRank ? `#${userRank.rank}` : '—', icon: 'fa-trophy', color: '#10b981' },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: `${stat.color}15`, color: stat.color }}>
                <i className={`fa-solid ${stat.icon}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide truncate">{stat.label}</p>
                <p className="text-base font-extrabold text-[var(--text)] truncate">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Premium Dark Glassmorphic Daily Challenge Banner */}
      {dailyChallenge && (
        <div className="rounded-3xl border border-slate-800 bg-[#0f172a] p-6 sm:p-8 mb-8 relative overflow-hidden shadow-2xl">
          {/* Glowing background shapes */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#ff5500]/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#ff5500]/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#ff5500] text-white tracking-widest uppercase flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Daily Challenge
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  <i className="fa-solid fa-calendar mr-1.5" />
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">{dailyChallenge.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">{dailyChallenge.description}</p>
            </div>
            
            <div className="flex items-center gap-4 flex-shrink-0">
              <Link
                to={`/challenges/${dailyChallenge.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-2xl font-black text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ff5500]/20 transition-all cursor-pointer"
                style={{ backgroundColor: 'var(--orange)', border: 'none' }}
              >
                <i className="fa-solid fa-play" style={{ color: '#ffffff' }} />
                Solve Now
              </Link>
              <div className="flex flex-col items-center justify-center p-2 px-4 rounded-2xl bg-slate-800/40 border border-slate-700/30 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reward</span>
                <span className="text-sm font-black text-yellow-400 flex items-center gap-1 mt-0.5">
                  <i className="fa-solid fa-star text-xs animate-spin-slow" />
                  {dailyChallenge.xpReward || 150} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm" />
          <input
            type="text"
            placeholder="Search challenges..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--orange)] transition-colors"
          />
        </div>
        <select
          value={filterDiff}
          onChange={e => setFilterDiff(e.target.value)}
          className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--orange)] cursor-pointer"
        >
          <option value="all">All Difficulties</option>
          {DIFFICULTIES.map(d => (
            <option key={d} value={d}>{DIFFICULTY[d].label}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--orange)] cursor-pointer"
        >
          <option value="all">All Types</option>
          {Object.entries(CHALLENGE_TYPES).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
          {filtered.length} challenge{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Challenge Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(c => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              userSubmission={submissions.find(s => s.challengeId === c.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <i className="fa-solid fa-code text-4xl mb-3" />
          <p className="text-lg font-medium">No challenges found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
