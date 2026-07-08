import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import db from '../../db';
import { calculateLevel, BADGE_DEFINITIONS } from '../config/challengeConfig';
import { getChallenges, getUserSubmissions } from '../services/challengeService';

export default function ChallengesProfile({ user }) {
  const [submissions, setSubmissions] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingSocials, setUpdatingSocials] = useState(false);
  const [socialForm, setSocialForm] = useState({
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: ''
  });
  
  // Code modal state
  const [selectedSub, setSelectedSub] = useState(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [chals, subs, leaderboard] = await Promise.all([
          getChallenges({ status: 'published' }),
          getUserSubmissions(user.id),
          db.find('ChallengeLeaderboard')
        ]);
        setChallenges(chals);
        setSubmissions(subs);

        // Find user rank from precalculated leaderboard
        const board = leaderboard.find(l => l.period === 'overall')?.rankings || [];
        const index = board.findIndex(r => r.userId === user.id);
        if (index !== -1) {
          setRank(index + 1);
        }

        // Set social defaults
        setSocialForm({
          githubUrl: user.githubUrl || user.github || '',
          linkedinUrl: user.linkedinUrl || user.linkedin || '',
          portfolioUrl: user.portfolioUrl || user.portfolio || ''
        });
      } catch (err) {
        console.error('Error loading profile statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const passedSubmissions = useMemo(() => {
    return submissions.filter(s => s.status === 'passed');
  }, [submissions]);

  // Statistics computations
  const stats = useMemo(() => {
    const total = passedSubmissions.length;
    const totalXP = (user?.xp || 0) + (user?.challengeXp || 0);
    const streak = user?.currentStreak || 0;
    
    // Average completion time
    const avgTime = total > 0
      ? Math.round(passedSubmissions.reduce((sum, s) => sum + (s.timeTaken || 0), 0) / total)
      : 0;

    // Accuracy Calculation
    const totalAttempts = submissions.length;
    const accuracy = totalAttempts > 0
      ? Math.round((passedSubmissions.length / totalAttempts) * 100)
      : 0;

    return { total, totalXP, streak, avgTime, accuracy, totalAttempts };
  }, [submissions, passedSubmissions, user]);

  const level = useMemo(() => {
    return calculateLevel(stats.totalXP);
  }, [stats.totalXP]);

  // Language Usage Data for PieChart
  const languageChartData = useMemo(() => {
    const counts = {};
    submissions.forEach(s => {
      counts[s.language] = (counts[s.language] || 0) + 1;
    });

    const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];
    return Object.entries(counts).map(([name, count], idx) => ({
      name: name.toUpperCase(),
      value: count,
      color: colors[idx % colors.length]
    }));
  }, [submissions]);

  // Weekly submissions rate for AreaChart
  const weeklyActivityData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(day => ({ name: day, submissions: 0, solved: 0 }));

    // Get past 7 days
    const now = new Date();
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - i);
      return d.toDateString();
    }).reverse();

    const dayNameMap = {};
    last7Days.forEach(dStr => {
      const d = new Date(dStr);
      dayNameMap[dStr] = days[d.getDay()];
    });

    submissions.forEach(s => {
      const dateStr = new Date(s.submittedAt).toDateString();
      if (dayNameMap[dateStr]) {
        const item = data.find(d => d.name === dayNameMap[dateStr]);
        if (item) {
          item.submissions += 1;
          if (s.status === 'passed') item.solved += 1;
        }
      }
    });

    return data;
  }, [submissions]);

  const handleSaveSocials = async (e) => {
    e.preventDefault();
    if (!user) return;
    setUpdatingSocials(true);
    try {
      await db.update('Users', user.id, {
        githubUrl: socialForm.githubUrl,
        linkedinUrl: socialForm.linkedinUrl,
        portfolioUrl: socialForm.portfolioUrl
      });
      window.showToast('Success', 'Social profiles updated successfully.', 'success');
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    } finally {
      setUpdatingSocials(false);
    }
  };

  const earnedBadges = useMemo(() => {
    const unlockedIds = new Set(user?.badges || []);
    return BADGE_DEFINITIONS.map(badge => ({
      ...badge,
      unlocked: unlockedIds.has(badge.id)
    }));
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[var(--orange)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* Profile Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* User Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--orange)] to-violet-500" />
          <img
            src={user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ff5500&color=fff`}
            alt=""
            className="w-24 h-24 rounded-full border-4 border-[var(--border)] object-cover shadow-md mb-4"
          />
          <h2 className="text-xl font-bold text-[var(--text)]">{user?.name}</h2>
          <p className="text-xs text-[var(--text-muted)]">{user?.department || 'Student Member'} • {user?.className || 'CS'}</p>
          
          <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--orange)]/10 text-[var(--orange)]">
            <span>{level.icon}</span>
            <span>{level.name} (Lvl {Math.floor(stats.totalXP / 1000) + 1})</span>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-[var(--border-light)] text-center">
            <div>
              <p className="text-xs text-[var(--text-muted)] font-medium">Rank</p>
              <p className="text-lg font-bold text-[var(--text)]">{rank ? `#${rank}` : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] font-medium">Streak</p>
              <p className="text-lg font-bold text-red-500">🔥 {stats.streak}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] font-medium">Solved</p>
              <p className="text-lg font-bold text-green-500">{stats.total}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Analytics & Charts */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="text-base font-bold text-[var(--text)] mb-4">Coding Performance Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Weekly Activity */}
            <div className="h-48">
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide">Weekly Activity</p>
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={weeklyActivityData}>
                  <defs>
                    <linearGradient id="submissionsColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--orange)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--orange)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
                  <Area type="monotone" dataKey="submissions" stroke="var(--orange)" strokeWidth={2} fillOpacity={1} fill="url(#submissionsColor)" />
                  <Area type="monotone" dataKey="solved" stroke="#10b981" strokeWidth={1.5} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Language Breakdown */}
            <div className="h-48 flex flex-col justify-between">
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wide">Languages Used</p>
              {languageChartData.length > 0 ? (
                <div className="flex items-center h-full">
                  <div className="w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={languageChartData}
                          innerRadius={30}
                          outerRadius={50}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {languageChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 text-left space-y-1 overflow-y-auto max-h-[140px] pr-2">
                    {languageChartData.map((lang) => (
                      <div key={lang.name} className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-secondary)]">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: lang.color }} />
                        <span>{lang.name} ({lang.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-[var(--text-muted)]">No language stats available yet.</div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Social Integrations Form */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 mb-8">
        <h3 className="text-base font-bold text-[var(--text)] mb-4">🔗 Social Profile Settings</h3>
        <form onSubmit={handleSaveSocials} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">GitHub Profile Link</label>
            <input
              type="url"
              className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)]"
              value={socialForm.githubUrl}
              onChange={e => setSocialForm(p => ({ ...p, githubUrl: e.target.value }))}
              placeholder="https://github.com/username"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">LinkedIn Profile Link</label>
            <input
              type="url"
              className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)]"
              value={socialForm.linkedinUrl}
              onChange={e => setSocialForm(p => ({ ...p, linkedinUrl: e.target.value }))}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Portfolio Website</label>
            <input
              type="url"
              className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)]"
              value={socialForm.portfolioUrl}
              onChange={e => setSocialForm(p => ({ ...p, portfolioUrl: e.target.value }))}
              placeholder="https://myportfolio.dev"
            />
          </div>
          <button
            type="submit"
            disabled={updatingSocials}
            className="px-5 py-2 bg-[var(--orange)] text-white rounded-xl text-sm font-bold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer inline-flex items-center justify-center"
          >
            {updatingSocials ? 'Saving...' : 'Save Profiles'}
          </button>
        </form>
      </div>

      {/* Badges Drawer Grid */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 mb-8">
        <h3 className="text-base font-bold text-[var(--text)] mb-4">🏆 Achievements & Badges</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {earnedBadges.map((badge) => (
            <div
              key={badge.id}
              className={`rounded-xl border p-3 flex flex-col items-center text-center transition-all ${
                badge.unlocked 
                  ? 'border-[var(--orange)]/30 bg-gradient-to-b from-[var(--orange)]/5 to-transparent' 
                  : 'border-[var(--border)] bg-[var(--surface)]/50 opacity-40'
              }`}
            >
              <span className="text-3xl mb-1">{badge.icon}</span>
              <p className="text-xs font-bold text-[var(--text)] leading-tight">{badge.name}</p>
              <p className="text-[9px] text-[var(--text-muted)] mt-1 leading-tight">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Solved List Table */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)] flex justify-between items-center">
          <h3 className="text-base font-bold text-[var(--text)]">Submission History</h3>
          <span className="text-xs font-semibold text-[var(--text-muted)]">{submissions.length} Submissions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-6">Challenge Title</th>
                <th className="py-3 px-6">Submitted Date</th>
                <th className="py-3 px-6">Language</th>
                <th className="py-3 px-6 text-center">Attempts</th>
                <th className="py-3 px-6 text-center">Score</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--surface)]">
                  <td className="py-3.5 px-6 font-bold text-sm text-[var(--text)]">
                    {s.taskTitle || s.challengeId}
                  </td>
                  <td className="py-3.5 px-6 text-xs text-[var(--text-secondary)]">
                    {new Date(s.submittedAt).toLocaleDateString()} {new Date(s.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-6 text-xs text-[var(--text-secondary)] uppercase">
                    {s.language}
                  </td>
                  <td className="py-3.5 px-6 text-center text-sm font-semibold">
                    {s.attemptNumber || 1}
                  </td>
                  <td className="py-3.5 px-6 text-center text-sm font-extrabold text-[var(--orange)]">
                    {s.score?.finalScore || 0}
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.status === 'passed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {s.status === 'passed' ? 'PASSED' : 'FAILED'}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <button
                      onClick={() => setSelectedSub(s)}
                      className="px-3 py-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-xs font-semibold text-[var(--text)] hover:border-[var(--orange)] transition-colors cursor-pointer"
                    >
                      View Code
                    </button>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-[var(--text-muted)]">
                    No coding challenges submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Modal */}
      <AnimatePresence>
        {selectedSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setSelectedSub(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-[var(--text)]">{selectedSub.taskTitle}</h4>
                  <p className="text-[10px] text-[var(--text-muted)]">Submitted: {new Date(selectedSub.submittedAt).toLocaleString()} • Lang: {selectedSub.language.toUpperCase()}</p>
                </div>
                <button onClick={() => setSelectedSub(null)} className="text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer">
                  <i className="fa-solid fa-xmark text-lg" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 bg-[#1e1e1e] text-white">
                <pre className="font-mono text-xs whitespace-pre-wrap select-text leading-relaxed">
                  <code>{selectedSub.code}</code>
                </pre>
              </div>
              <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)] flex justify-end">
                <button onClick={() => setSelectedSub(null)} className="px-4 py-1.5 bg-[var(--orange)] text-white font-bold text-xs rounded-lg cursor-pointer hover:brightness-110">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
