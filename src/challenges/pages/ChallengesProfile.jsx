import { useState, useEffect, useMemo } from 'react';
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
    githubUrl: '', linkedinUrl: '', portfolioUrl: ''
  });
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
        const board = leaderboard.find(l => l.period === 'overall')?.rankings || [];
        const index = board.findIndex(r => r.userId === user.id);
        if (index !== -1) setRank(index + 1);
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

  const passedSubmissions = useMemo(() => submissions.filter(s => s.status === 'passed'), [submissions]);

  const stats = useMemo(() => {
    const total = passedSubmissions.length;
    const totalXP = (user?.xp || 0) + (user?.challengeXp || 0);
    const streak = user?.currentStreak || 0;
    const avgTime = total > 0 ? Math.round(passedSubmissions.reduce((sum, s) => sum + (s.timeTaken || 0), 0) / total) : 0;
    const totalAttempts = submissions.length;
    const accuracy = totalAttempts > 0 ? Math.round((passedSubmissions.length / totalAttempts) * 100) : 0;
    return { total, totalXP, streak, avgTime, accuracy, totalAttempts };
  }, [submissions, passedSubmissions, user]);

  const level = useMemo(() => calculateLevel(stats.totalXP), [stats.totalXP]);

  const languageChartData = useMemo(() => {
    const counts = {};
    submissions.forEach(s => { counts[s.language] = (counts[s.language] || 0) + 1; });
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];
    return Object.entries(counts).map(([name, count], idx) => ({
      name: name.toUpperCase(), value: count, color: colors[idx % colors.length]
    }));
  }, [submissions]);

  const weeklyActivityData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(day => ({ name: day, submissions: 0, solved: 0 }));
    const now = new Date();
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(); d.setDate(now.getDate() - i); return d.toDateString();
    }).reverse();
    const dayNameMap = {};
    last7Days.forEach(dStr => { const d = new Date(dStr); dayNameMap[dStr] = days[d.getDay()]; });
    submissions.forEach(s => {
      const dateStr = new Date(s.submittedAt).toDateString();
      if (dayNameMap[dateStr]) {
        const item = data.find(d => d.name === dayNameMap[dateStr]);
        if (item) { item.submissions += 1; if (s.status === 'passed') item.solved += 1; }
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
        githubUrl: socialForm.githubUrl, linkedinUrl: socialForm.linkedinUrl, portfolioUrl: socialForm.portfolioUrl
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
    return BADGE_DEFINITIONS.map(badge => ({ ...badge, unlocked: unlockedIds.has(badge.id) }));
  }, [user]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* User Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--orange)] to-violet-500" />
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            src={user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ff5500&color=fff`}
            alt=""
            className="w-24 h-24 rounded-full border-4 border-[var(--border)] object-cover shadow-md mb-4"
          />
          <h2 className="text-xl font-bold text-[var(--text)]">{user?.name}</h2>
          <p className="text-xs text-[var(--text-muted)]">{user?.department || 'Student Member'} • {user?.className || 'CS'}</p>
          <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--orange)]/10 text-[var(--orange)] border border-[var(--orange)]/20">
            <span>{level.icon}</span>
            <span>{level.name}</span>
          </div>
          {/* Level progress */}
          <div className="w-full mt-4">
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-1">
              <span>Level Progress</span>
              <span>{Math.floor(stats.totalXP / 1000) + 1}</span>
            </div>
            <div className="w-full bg-[var(--surface)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((stats.totalXP % 1000) / 1000) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-[var(--orange)] to-[var(--orange-light)]"
              />
            </div>
          </div>
          <div className="w-full grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-[var(--border-light)]">
            {[
              { label: 'Rank', value: rank ? `#${rank}` : '—', color: 'var(--text)' },
              { label: 'Streak', value: `${stats.streak}d`, color: '#ef4444' },
              { label: 'Solved', value: stats.total, color: '#10b981' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                <p className="text-xs text-[var(--text-muted)] font-medium">{s.label}</p>
                <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="text-base font-bold text-[var(--text)] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-line text-[var(--orange)]" />
            Coding Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly Activity */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="h-48"
            >
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide flex items-center gap-1">
                <i className="fa-solid fa-calendar-week text-[var(--orange)]" />
                Weekly Activity
              </p>
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={weeklyActivityData}>
                  <defs>
                    <linearGradient id="submissionsColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--orange)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--orange)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
                  <Area type="monotone" dataKey="submissions" stroke="var(--orange)" strokeWidth={2} fillOpacity={1} fill="url(#submissionsColor)" />
                  <Area type="monotone" dataKey="solved" stroke="#10b981" strokeWidth={1.5} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Language Usage */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="h-48 flex flex-col justify-between"
            >
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wide flex items-center gap-1">
                <i className="fa-solid fa-code text-[var(--orange)]" />
                Languages Used
              </p>
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
                        <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: lang.color }} />
                        <span className="truncate">{lang.name}</span>
                        <span className="text-[var(--text-muted)] ml-auto">{lang.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-[var(--text-muted)]">No language stats available yet.</div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Social Profiles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
      >
        <h3 className="text-base font-bold text-[var(--text)] mb-4 flex items-center gap-2">
          <i className="fa-solid fa-link text-[var(--orange)]" />
          Social Profile Links
        </h3>
        <form onSubmit={handleSaveSocials} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {[
            { key: 'githubUrl', label: 'GitHub Profile', icon: 'fa-github', placeholder: 'https://github.com/username' },
            { key: 'linkedinUrl', label: 'LinkedIn Profile', icon: 'fa-linkedin', placeholder: 'https://linkedin.com/in/username' },
            { key: 'portfolioUrl', label: 'Portfolio Website', icon: 'fa-globe', placeholder: 'https://myportfolio.dev' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block flex items-center gap-1.5">
                <i className={`fa-brands ${field.icon} text-[var(--orange)]`} />
                {field.label}
              </label>
              <div className="relative">
                <i className={`fa-brands ${field.icon} absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm`} />
                <input
                  type="url"
                  className="w-full pl-9 pr-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)] transition-all"
                  value={socialForm[field.key]}
                  onChange={e => setSocialForm(p => ({ ...p, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                />
              </div>
            </div>
          ))}
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={updatingSocials}
            className="px-5 py-2.5 text-white rounded-xl text-sm font-bold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer inline-flex items-center justify-center gap-2 border-none"
            style={{ backgroundColor: 'var(--orange)' }}
          >
            {updatingSocials ? (
              <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            ) : (
              <><i className="fa-solid fa-check" /> Save Profiles</>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
      >
        <h3 className="text-base font-bold text-[var(--text)] mb-4 flex items-center gap-2">
          <i className="fa-solid fa-medal text-[var(--orange)]" />
          Achievements & Badges
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {earnedBadges.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05, type: 'spring', stiffness: 100 }}
              className={`relative rounded-xl border p-4 flex flex-col items-center text-center transition-all group ${
                badge.unlocked
                  ? 'border-[var(--orange)]/30 bg-gradient-to-b from-[var(--orange)]/5 to-transparent hover:border-[var(--orange)]/50 hover:shadow-lg hover:shadow-[var(--orange)]/10'
                  : 'border-[var(--border)] bg-[var(--surface)]/50 opacity-45'
              }`}
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{badge.icon}</span>
              <p className="text-xs font-bold text-[var(--text)] leading-tight">{badge.name}</p>
              <p className="text-[9px] text-[var(--text-muted)] mt-1 leading-tight">{badge.desc}</p>
              {!badge.unlocked && (
                <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-[var(--bg)]/60 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-bold text-[var(--text-muted)] bg-[var(--card)] px-2 py-1 rounded-md shadow-sm">Locked</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Submission History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)] flex justify-between items-center">
          <h3 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-[var(--orange)]" />
            Submission History
          </h3>
          <span className="text-xs font-semibold text-[var(--text-muted)] bg-[var(--card)] px-2.5 py-1 rounded-lg border border-[var(--border)]">
            {submissions.length} submissions
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-6">Challenge</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Language</th>
                <th className="py-3 px-6 text-center">Attempts</th>
                <th className="py-3 px-6 text-center">Score</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {submissions.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.03 }}
                  className="hover:bg-[var(--surface)] transition-colors"
                >
                  <td className="py-3.5 px-6 font-bold text-sm text-[var(--text)]">{s.taskTitle || s.challengeId}</td>
                  <td className="py-3.5 px-6 text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1">
                      <i className="fa-regular fa-calendar text-[10px]" />
                      {new Date(s.submittedAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] block">{new Date(s.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="py-3.5 px-6 text-xs text-[var(--text-secondary)] uppercase font-semibold">{s.language}</td>
                  <td className="py-3.5 px-6 text-center text-sm font-semibold text-[var(--text)]">{s.attemptNumber || 1}</td>
                  <td className="py-3.5 px-6 text-center text-sm font-extrabold" style={{ color: 'var(--orange)' }}>{s.score?.finalScore || 0}</td>
                  <td className="py-3.5 px-6 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      s.status === 'passed'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      <i className={`fa-solid ${s.status === 'passed' ? 'fa-circle-check' : 'fa-circle-xmark'}`} />
                      {s.status === 'passed' ? 'Passed' : 'Failed'}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <button
                      onClick={() => setSelectedSub(s)}
                      className="px-3 py-1.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-xs font-semibold text-[var(--text)] hover:border-[var(--orange)] hover:text-[var(--orange)] transition-all cursor-pointer"
                    >
                      View Code
                    </button>
                  </td>
                </motion.tr>
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
      </motion.div>

      {/* Code Modal */}
      <AnimatePresence>
        {selectedSub && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
            onClick={() => setSelectedSub(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-4 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-[var(--text)] flex items-center gap-2">
                    <i className="fa-solid fa-code text-[var(--orange)]" />
                    {selectedSub.taskTitle}
                  </h4>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Submitted: {new Date(selectedSub.submittedAt).toLocaleString()} • {selectedSub.language?.toUpperCase()}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setSelectedSub(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-xmark text-lg" />
                </motion.button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 bg-[#1e1e1e] text-white">
                <pre className="font-mono text-xs whitespace-pre-wrap select-text leading-relaxed">
                  <code>{selectedSub.code}</code>
                </pre>
              </div>
              <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)] flex justify-end">
                <button
                  onClick={() => setSelectedSub(null)}
                  className="px-5 py-2 bg-[var(--orange)] text-white font-bold text-xs rounded-xl cursor-pointer hover:brightness-110 transition-all border-none"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
