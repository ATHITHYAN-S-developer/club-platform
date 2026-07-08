import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import db from '../../db';
import { calculateLevel } from '../config/challengeConfig';

const rankColors = {
  1: { bg: '#f59e0b', border: '#f59e0b', text: '#fff', glow: 'rgba(245,158,11,0.3)' },
  2: { bg: '#94a3b8', border: '#94a3b8', text: '#fff', glow: 'rgba(148,163,184,0.3)' },
  3: { bg: '#d97706', border: '#d97706', text: '#fff', glow: 'rgba(217,119,6,0.3)' },
};

export default function ChallengesLeaderboard({ user }) {
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('overall');
  const [timeFilter, setTimeFilter] = useState('alltime');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersData, subsData, quizData] = await Promise.all([
          db.find('Users'), db.find('ChallengeSubmissions'), db.find('QuizResults')
        ]);
        setUsers(usersData || []);
        setSubmissions(subsData || []);
        setQuizResults(quizData || []);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const leaderboardData = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const isWithinTimeFilter = (dateStr) => {
      if (timeFilter === 'alltime') return true;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return timeFilter === 'weekly' ? date >= startOfWeek : timeFilter === 'monthly' ? date >= startOfMonth : true;
    };
    return users.map(u => {
      const userCodingSubs = submissions.filter(s => s.userId === u.id && isWithinTimeFilter(s.submittedAt));
      const userQuizSubs = quizResults.filter(q => q.userId === u.id && isWithinTimeFilter(q.date || q.submittedAt));
      const passedCoding = userCodingSubs.filter(s => s.status === 'passed');
      const codingXP = passedCoding.reduce((sum, s) => sum + (s.xpEarned || 0), 0);
      const totalCodingAccuracy = passedCoding.length > 0
        ? Math.round(passedCoding.reduce((sum, s) => sum + (s.score?.accuracyScore || 0), 0) / (passedCoding.length * 700) * 100) : 0;
      const avgSolveTime = passedCoding.length > 0
        ? Math.round(passedCoding.reduce((sum, s) => sum + (s.timeTaken || 0), 0) / passedCoding.length) : 0;
      const quizXP = userQuizSubs.reduce((sum, q) => sum + (q.xpEarned || q.score * 10 || 0), 0);
      const streak = u.currentStreak || 0;
      const badgesCount = (u.badges || []).length + (u.taskBadges || []).length;
      let displayXP = 0;
      if (categoryFilter === 'overall') displayXP = codingXP + quizXP;
      else if (categoryFilter === 'coding') displayXP = codingXP;
      else if (categoryFilter === 'quiz') displayXP = quizXP;
      const overallXP = (u.xp || 0) + (u.challengeXp || 0);
      return {
        id: u.id, name: u.name || 'Anonymous User', email: u.email,
        photo: u.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=ff5500&color=fff`,
        department: u.department || 'Computer Science', className: u.className || 'CS',
        xp: displayXP, level: calculateLevel(overallXP), streak, badgesCount,
        completedTasks: passedCoding.length, avgSolveTime, accuracy: totalCodingAccuracy, codingXP, quizXP
      };
    })
    .filter(u => {
      if (searchQuery.trim() === '') return true;
      return u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.department.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      if (a.avgSolveTime !== b.avgSolveTime) return a.avgSolveTime - b.avgSolveTime;
      return a.name.localeCompare(b.name);
    })
    .map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [users, submissions, quizResults, categoryFilter, timeFilter, searchQuery]);

  const podium = useMemo(() => {
    const list = leaderboardData.slice(0, 3);
    const result = [null, null, null];
    if (list[1]) result[0] = list[1];
    if (list[0]) result[1] = list[0];
    if (list[2]) result[2] = list[2];
    return result;
  }, [leaderboardData]);

  const restOfLeaderboard = useMemo(() => leaderboardData.slice(3), [leaderboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-2 border-[var(--orange)] border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 border-2 border-[var(--orange)]/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text)] tracking-tight flex items-center gap-3">
            <i className="fa-solid fa-trophy text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">See how you rank against the best minds in the club</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Category filter */}
          <div className="flex bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)]">
            {['overall', 'coding', 'quiz'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className="relative px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize"
                style={{
                  backgroundColor: categoryFilter === cat ? 'var(--orange)' : 'transparent',
                  color: categoryFilter === cat ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Time filter */}
          <div className="flex bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)]">
            {[
              { id: 'alltime', label: 'All Time' },
              { id: 'weekly', label: 'Weekly' },
              { id: 'monthly', label: 'Monthly' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTimeFilter(t.id)}
                className="relative px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                style={{
                  backgroundColor: timeFilter === t.id ? 'var(--orange)' : 'transparent',
                  color: timeFilter === t.id ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 max-w-md relative">
        <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm" />
        <input
          type="text"
          placeholder="Search by name or department..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--orange)] transition-all placeholder:text-[var(--text-muted)]"
        />
      </motion.div>

      {/* Podium */}
      {searchQuery === '' && (
        <div className="grid grid-cols-3 items-end max-w-3xl mx-auto gap-4 mb-12 mt-4">
          {/* 2nd Place */}
          {podium[0] ? (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-3 group">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-300 text-slate-800 text-xs font-black flex items-center justify-center border-2 border-[var(--bg)] shadow-lg z-10"
                >
                  2
                </motion.div>
                <img src={podium[0].photo} alt="" className="w-16 h-16 rounded-full border-4 border-slate-300 object-cover shadow-md group-hover:scale-105 transition-transform" />
              </div>
              <div className="text-center w-full px-2">
                <p className="font-bold text-[var(--text)] text-sm truncate">{podium[0].name}</p>
                <p className="text-[10px] text-[var(--text-muted)] truncate">{podium[0].department}</p>
                <p className="text-xs font-extrabold text-[var(--orange)] mt-1">{podium[0].xp.toLocaleString()} XP</p>
              </div>
              <div className="w-full bg-gradient-to-t from-slate-300/20 to-slate-300/40 rounded-t-2xl h-24 mt-3 border-t border-slate-300/30" />
            </motion.div>
          ) : <div />}

          {/* 1st Place */}
          {podium[1] ? (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-3 group">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 z-10"
                >
                  <i className="fa-solid fa-crown text-yellow-500 text-xl animate-bounce" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-yellow-500 text-white text-xs font-black flex items-center justify-center border-2 border-[var(--bg)] shadow-lg z-10"
                >
                  1
                </motion.div>
                <img src={podium[1].photo} alt="" className="w-20 h-20 rounded-full border-4 border-yellow-500 object-cover shadow-lg group-hover:scale-105 transition-transform" />
              </div>
              <div className="text-center w-full px-2">
                <p className="font-bold text-[var(--text)] text-base truncate">{podium[1].name}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{podium[1].department}</p>
                <p className="text-sm font-black text-[var(--orange)] mt-1">{podium[1].xp.toLocaleString()} XP</p>
              </div>
              <div className="w-full bg-gradient-to-t from-yellow-500/20 to-yellow-500/40 rounded-t-2xl h-36 mt-3 border-t border-yellow-500/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent animate-pulse" style={{ animationDuration: '3s' }} />
              </div>
            </motion.div>
          ) : <div />}

          {/* 3rd Place */}
          {podium[2] ? (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-3 group">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-[var(--bg)] shadow-lg z-10"
                >
                  3
                </motion.div>
                <img src={podium[2].photo} alt="" className="w-14 h-14 rounded-full border-4 border-amber-600 object-cover shadow-md group-hover:scale-105 transition-transform" />
              </div>
              <div className="text-center w-full px-2">
                <p className="font-bold text-[var(--text)] text-xs truncate">{podium[2].name}</p>
                <p className="text-[9px] text-[var(--text-muted)] truncate">{podium[2].department}</p>
                <p className="text-xs font-extrabold text-[var(--orange)] mt-1">{podium[2].xp.toLocaleString()} XP</p>
              </div>
              <div className="w-full bg-gradient-to-t from-amber-600/15 to-amber-600/35 rounded-t-2xl h-16 mt-3 border-t border-amber-600/25" />
            </motion.div>
          ) : <div />}
        </div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6 text-center w-16">Rank</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Level</th>
                <th className="py-4 px-6 text-center">Streak</th>
                <th className="py-4 px-6 text-center">Challenges</th>
                <th className="py-4 px-6 text-center">Accuracy</th>
                <th className="py-4 px-6 text-center">Badges</th>
                <th className="py-4 px-6 text-right w-28">XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {(searchQuery === '' ? restOfLeaderboard : leaderboardData).map((u, i) => {
                const isCurrentUser = user && u.id === user.id;
                return (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.03 }}
                    className={`transition-colors ${isCurrentUser ? 'bg-[var(--orange)]/5' : 'hover:bg-[var(--surface)]'}`}
                  >
                    <td className="py-4 px-6 text-center">
                      {u.rank <= 3 ? (
                        <span className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-black shadow-sm ${
                          u.rank === 1 ? 'bg-yellow-500 text-white shadow-yellow-500/30' :
                          u.rank === 2 ? 'bg-slate-300 text-slate-800 shadow-slate-300/30' :
                          'bg-amber-600 text-white shadow-amber-600/30'
                        }`}>
                          {u.rank}
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-[var(--text-muted)]">{u.rank}</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={u.photo} alt="" className="w-9 h-9 rounded-full object-cover border border-[var(--border)]" />
                        <div>
                          <div className="font-bold text-sm text-[var(--text)] flex items-center gap-1.5">
                            {u.name}
                            {isCurrentUser && <span className="text-[9px] font-bold bg-[var(--orange)] text-white px-1.5 py-0.5 rounded-md">YOU</span>}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">{u.department} • {u.className}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-[var(--text-secondary)]">
                      <span className="inline-flex items-center gap-1">
                        <span>{u.level.icon}</span>
                        <span>{u.level.name}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {u.streak > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-red-500 font-semibold text-sm">
                          <i className="fa-solid fa-fire text-xs" />
                          {u.streak}
                        </span>
                      ) : <span className="text-[var(--text-muted)]">—</span>}
                    </td>
                    <td className="py-4 px-6 text-center text-sm font-semibold text-[var(--text)]">{u.completedTasks}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${u.accuracy}%`, backgroundColor: u.accuracy >= 70 ? '#10b981' : u.accuracy >= 40 ? '#f59e0b' : '#ef4444' }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-[var(--text)]">{u.accuracy}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-sm font-semibold text-[var(--text)]">
                      {u.badgesCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-yellow-500">
                          <i className="fa-solid fa-medal text-xs" />
                          {u.badgesCount}
                        </span>
                      ) : <span className="text-[var(--text-muted)]">—</span>}
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-sm relative">
                      <span style={{ color: 'var(--orange)' }}>{u.xp.toLocaleString()} XP</span>
                    </td>
                  </motion.tr>
                );
              })}
              {leaderboardData.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-[var(--text-muted)]">
                    No participants match found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
