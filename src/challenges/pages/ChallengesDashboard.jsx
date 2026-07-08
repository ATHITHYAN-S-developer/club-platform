import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import db from '../../db';
import { getChallenges, getUserSubmissions, getUserRank } from '../services/challengeService';
import { DIFFICULTY, calculateLevel } from '../config/challengeConfig';

export default function ChallengesDashboard({ user }) {
  const navigate = useNavigate();

  // Scroll references
  const challengesRef = useRef(null);
  const leaderboardRef = useRef(null);

  // States
  const [challenges, setChallenges] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [filterDiff, setFilterDiff] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'solved', 'attempted', 'unsolved'
  const [sortBy, setSortBy] = useState('newest');

  // Bookmarked list state (stored locally or in user profiles)
  const [bookmarkedList, setBookmarkedList] = useState(user?.bookmarkedChallenges || []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [chals, subs, rank, allUsers] = await Promise.all([
          getChallenges({ status: 'published' }),
          user ? getUserSubmissions(user.id) : Promise.resolve([]),
          user ? getUserRank(user.id) : Promise.resolve(null),
          db.find('Users')
        ]);
        setChallenges(chals || []);
        setSubmissions(subs || []);
        setUserRank(rank);
        setUsers(allUsers || []);
        if (user) {
          setBookmarkedList(user.bookmarkedChallenges || []);
        }
      } catch (err) {
        console.error('Failed to load redesigned dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // Handle Bookmarks
  const handleToggleBookmark = async (challengeId, e) => {
    e.stopPropagation();
    if (!user) {
      window.showToast('Auth Required', 'Please login to bookmark challenges.', 'warning');
      return;
    }
    const isBookmarked = bookmarkedList.includes(challengeId);
    const updated = isBookmarked
      ? bookmarkedList.filter(id => id !== challengeId)
      : [...bookmarkedList, challengeId];

    try {
      await db.update('Users', user.id, { bookmarkedChallenges: updated });
      setBookmarkedList(updated);
      if (user) user.bookmarkedChallenges = updated;
      window.showToast(
        isBookmarked ? 'Removed' : 'Bookmarked',
        isBookmarked ? 'Removed from bookmarks.' : 'Challenge bookmarked.',
        'success'
      );
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setFilterDiff('all');
    setFilterCategory('all');
    setFilterTag('all');
    setFilterStatus('all');
    setSortBy('newest');
  };

  // Scroll Actions
  const scrollToChallenges = () => {
    challengesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToLeaderboard = () => {
    leaderboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Dynamic tags and categories lists
  const allCategories = useMemo(() => {
    const cats = new Set(challenges.map(c => c.category).filter(Boolean));
    return Array.from(cats);
  }, [challenges]);

  const allTags = useMemo(() => {
    const tags = new Set();
    challenges.forEach(c => {
      if (Array.isArray(c.tags)) {
        c.tags.forEach(t => tags.add(t));
      }
    });
    return Array.from(tags);
  }, [challenges]);

  // Submission Sets
  const solvedSet = useMemo(() => {
    return new Set(submissions.filter(s => s.status === 'passed').map(s => s.challengeId));
  }, [submissions]);

  const attemptedSet = useMemo(() => {
    return new Set(submissions.filter(s => s.status !== 'passed').map(s => s.challengeId));
  }, [submissions]);

  // Filter & Sort core logic
  const filteredChallenges = useMemo(() => {
    return challenges
      .filter(c => {
        if (filterDiff !== 'all' && c.difficulty !== filterDiff) return false;
        if (filterCategory !== 'all' && c.category !== filterCategory) return false;
        if (filterTag !== 'all' && (!c.tags || !c.tags.includes(filterTag))) return false;

        // Status filter
        if (filterStatus === 'solved' && !solvedSet.has(c.id)) return false;
        if (filterStatus === 'attempted' && (!attemptedSet.has(c.id) || solvedSet.has(c.id))) return false;
        if (filterStatus === 'unsolved' && (solvedSet.has(c.id) || attemptedSet.has(c.id))) return false;

        // Search match
        if (search) {
          const query = search.toLowerCase();
          const matchesTitle = c.title.toLowerCase().includes(query);
          const matchesDesc = c.description?.toLowerCase().includes(query);
          const matchesTag = c.tags?.some(t => t.toLowerCase().includes(query));
          return matchesTitle || matchesDesc || matchesTag;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || '') - new Date(a.createdAt || '');
        }
        if (sortBy === 'xp-desc') {
          return (b.xpReward || 0) - (a.xpReward || 0);
        }
        if (sortBy === 'xp-asc') {
          return (a.xpReward || 0) - (b.xpReward || 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [challenges, filterDiff, filterCategory, filterTag, filterStatus, search, sortBy, solvedSet, attemptedSet]);

  // Leaderboard Calculation
  const leaderboardUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => (b.challengeXp || 0) - (a.challengeXp || 0))
      .map((u, index) => ({ ...u, rank: index + 1 }));
  }, [users]);

  const top10Leaderboard = useMemo(() => {
    return leaderboardUsers.slice(0, 10);
  }, [leaderboardUsers]);

  const currentUserLeaderboardRank = useMemo(() => {
    if (!user) return null;
    return leaderboardUsers.find(u => u.id === user.id) || null;
  }, [leaderboardUsers, user]);

  const showCurrentUserBelowTop10 = useMemo(() => {
    if (!currentUserLeaderboardRank) return false;
    return currentUserLeaderboardRank.rank > 10;
  }, [currentUserLeaderboardRank]);

  // Weekly Progress (solved in the past 7 days)
  const weeklyProgress = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - 7);

    const solvedCount = submissions.filter(s => {
      if (s.userId !== user?.id || s.status !== 'passed') return false;
      return new Date(s.submittedAt) >= startOfWeek;
    }).length;

    const target = 10;
    const pct = Math.min((solvedCount / target) * 100, 100);
    return { solvedCount, target, pct };
  }, [submissions, user]);

  // Contribution Calendar Heatmap (15 weeks = 105 days)
  const heatmapWeeks = useMemo(() => {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - 105);
    // Align to Sunday
    const day = startDate.getDay();
    startDate.setDate(startDate.getDate() - day);

    const passedDates = new Set(
      submissions
        .filter(s => s.userId === user?.id && s.status === 'passed')
        .map(s => new Date(s.submittedAt).toDateString())
    );

    const daysList = [];
    const temp = new Date(startDate);
    while (temp <= now) {
      daysList.push({
        dateStr: temp.toDateString(),
        solved: passedDates.has(temp.toDateString())
      });
      temp.setDate(temp.getDate() + 1);
    }

    const weeks = [];
    let currentWeek = [];
    daysList.forEach((dayObj, idx) => {
      currentWeek.push(dayObj);
      if (currentWeek.length === 7 || idx === daysList.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    return weeks;
  }, [submissions, user]);

  // Achievements
  const achievements = useMemo(() => {
    const passedCount = solvedSet.size;
    const streak = user?.currentStreak || 0;

    return [
      { name: 'First Blood', desc: 'Solve 1st challenge', reward: '100 XP', icon: 'fa-droplet', color: '#ef4444', unlocked: passedCount >= 1 },
      { name: '7 Day Streak', desc: 'Maintain 7 day streak', reward: '250 XP', icon: 'fa-fire', color: '#f59e0b', unlocked: streak >= 7 },
      { name: 'Speed Solver', desc: 'Solve under 5 mins', reward: '150 XP', icon: 'fa-bolt', color: '#3b82f6', unlocked: submissions.some(s => s.userId === user?.id && s.status === 'passed' && s.timeTaken && s.timeTaken <= 300) },
      { name: 'Top 10 Star', desc: 'Reach Top 10 rank', reward: '500 XP', icon: 'fa-crown', color: '#8b5cf6', unlocked: top10Leaderboard.some(m => m.id === user?.id) }
    ];
  }, [solvedSet, user, submissions, top10Leaderboard]);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16 space-y-12" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. HERO SECTION (Height ~340px) */}
      <section className="relative bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white min-h-[340px] flex items-center shadow-lg">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Hero Left */}
          <div className="space-y-5">
            <h1 className="text-[52px] font-bold tracking-tight leading-none text-white">
              Coding Challenges
            </h1>
            <p className="text-base text-indigo-100 max-w-lg leading-relaxed">
              Practice coding problems, compete with others, improve your ranking, and earn achievements.
            </p>
            <div className="flex gap-4 pt-2">
              <button
                onClick={scrollToChallenges}
                className="px-6 py-3 bg-[#ff5500] hover:bg-[#ff6a1a] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer border-none"
              >
                Explore Challenges
              </button>
              <button
                onClick={scrollToLeaderboard}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
              >
                View Leaderboard
              </button>
            </div>
          </div>

          {/* Hero Right: 4 Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total Challenges', value: challenges.length, icon: 'fa-code-branch', color: 'from-[#ff5500]/20 to-transparent' },
              { label: 'Active Participants', value: users.length, icon: 'fa-users', color: 'from-emerald-500/20 to-transparent' },
              { label: 'Total XP Available', value: challenges.reduce((acc, c) => acc + (c.xpReward || 0), 0) + ' XP', icon: 'fa-star', color: 'from-amber-500/20 to-transparent' },
              { label: 'Weekly Contests', value: 'Active', icon: 'fa-calendar-check', color: 'from-violet-500/20 to-transparent' }
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border border-white/10 bg-white/5 bg-gradient-to-br ${stat.color} p-4 flex items-center gap-3.5`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-sm">
                  <i className={`fa-solid ${stat.icon}`} />
                </div>
                <div>
                  <p className="text-[11px] text-indigo-200 font-bold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-base md:text-lg font-black text-white mt-0.5">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Section Wrappers */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 space-y-12">

        {/* 2. SEARCH & FILTERS SECTION */}
        <section className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm space-y-5">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-[#ff5500] rounded-xl text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-5 pt-1">
            <div className="relative">
              <select
                value={filterDiff}
                onChange={e => setFilterDiff(e.target.value)}
                className="pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#ff5500] cursor-pointer appearance-none min-w-[125px]"
              >
                <option value="all">Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#ff5500] cursor-pointer appearance-none min-w-[125px]"
              >
                <option value="all">Category</option>
                {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filterTag}
                onChange={e => setFilterTag(e.target.value)}
                className="pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#ff5500] cursor-pointer appearance-none min-w-[125px]"
              >
                <option value="all">Tags</option>
                {allTags.map(t => <option key={t} value={t}>#{t}</option>)}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#ff5500] cursor-pointer appearance-none min-w-[125px]"
              >
                <option value="all">Status</option>
                <option value="solved">Solved</option>
                <option value="attempted">Attempted</option>
                <option value="unsolved">Unsolved</option>
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#ff5500] cursor-pointer appearance-none min-w-[130px]"
              >
                <option value="newest">Sort By: Newest</option>
                <option value="xp-desc">XP: High to Low</option>
                <option value="xp-asc">XP: Low to High</option>
                <option value="title">Alphabetical</option>
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
            </div>

            <button
              onClick={handleResetFilters}
              className="px-4 py-2.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer ml-auto flex items-center gap-1.5"
            >
              <i className="fa-solid fa-arrow-rotate-left" /> Reset Filters
            </button>
          </div>
        </section>

        {/* 3. CHALLENGE STATISTICS SECTION */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: '250+ Challenges', value: 'Problem Library', color: 'text-indigo-600', icon: 'fa-cube' },
            { label: '35 Categories', value: 'Diverse Domains', color: 'text-emerald-600', icon: 'fa-tags' },
            { label: '1200+ Participants', value: 'Active Members', color: 'text-amber-600', icon: 'fa-circle-user' },
            { label: '15k+ Submissions', value: 'Evaluated Runs', color: 'text-rose-600', icon: 'fa-server' }
          ].map((card, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-xs flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-sm ${card.color}`}>
                <i className={`fa-solid ${card.icon}`} />
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900 tracking-tight leading-none">{card.label}</p>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">{card.value}</p>
              </div>
            </div>
          ))}
        </section>

        {/* 4. CHALLENGE LIST SECTION */}
        <section ref={challengesRef} className="space-y-6 pt-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h2 className="text-[32px] font-bold text-slate-900 tracking-tight">Active Challenges</h2>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{filteredChallenges.length} Open Tasks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white border border-slate-200 rounded-[20px] h-60" />
              ))
            ) : filteredChallenges.length > 0 ? (
              filteredChallenges.map(c => {
                const diffObj = DIFFICULTY[c.difficulty] || DIFFICULTY.easy;
                const isSolved = solvedSet.has(c.id);
                const isAttempted = attemptedSet.has(c.id);
                const isBookmarked = bookmarkedList.includes(c.id);

                return (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/challenges/${c.id}`)}
                    className="group bg-white border border-slate-200 hover:border-[#ff5500]/40 rounded-[20px] p-6 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Badge strip */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-2">
                          <span
                            className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider"
                            style={{ backgroundColor: `${diffObj.color}15`, color: diffObj.color }}
                          >
                            {diffObj.label}
                          </span>
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">
                            {c.category}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleToggleBookmark(c.id, e)}
                          className="text-slate-400 hover:text-[#ff5500] text-xs bg-transparent border-none cursor-pointer"
                        >
                          <i className={`${isBookmarked ? 'fa-solid text-[#ff5500]' : 'fa-regular'} fa-bookmark`} />
                        </button>
                      </div>

                      {/* Header */}
                      <h3 className="text-[22px] font-semibold text-slate-800 tracking-tight group-hover:text-[#ff5500] transition-colors leading-tight mb-2">
                        {c.title}
                      </h3>

                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
                        {c.description}
                      </p>

                      {/* Tags */}
                      {c.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {c.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Info & Action */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                        <span className="flex items-center gap-1 text-slate-800"><i className="fa-solid fa-star text-yellow-500" /> {c.xpReward || 100} XP</span>
                        <span className="flex items-center gap-1"><i className="fa-solid fa-clock" /> {c.estimatedTime || '10m'}</span>
                      </div>
                      
                      <button
                        className="px-4 py-2 text-white font-extrabold text-xs rounded-xl border-none transition-all flex items-center gap-1"
                        style={{ backgroundColor: isSolved ? '#10b981' : '#ff5500' }}
                      >
                        {isSolved ? '✓ Solved' : isAttempted ? 'Resume' : 'Solve'}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-16 bg-white border border-slate-200 rounded-[20px] p-8 space-y-3">
                <i className="fa-solid fa-code text-4xl text-slate-300" />
                <h3 className="text-base font-bold text-slate-700">No Challenges Found</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">Try resetting filters to show all published tasks.</p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 border border-slate-300 text-slate-600 hover:border-[#ff5500] hover:text-[#ff5500] bg-transparent rounded-xl text-xs font-bold transition-all cursor-pointer mt-2"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 5. COMMUNITY SECTION */}
        <section className="space-y-6 pt-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-[32px] font-bold text-slate-900 tracking-tight">Community & Progress</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Weekly Progress */}
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm space-y-4">
              <h3 className="text-[22px] font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                <i className="fa-solid fa-circle-notch text-[#ff5500]" />
                Weekly Progress
              </h3>
              <div className="space-y-4 pt-1">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-500">Solved this week</span>
                  <span className="text-[#ff5500] font-black">{weeklyProgress.solvedCount} / {weeklyProgress.target}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${weeklyProgress.pct}%`, backgroundColor: '#ff5500' }}
                  />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">Solve challenges daily to reach your goal and claim weekend XP multiplier rewards!</p>
              </div>
            </div>

            {/* Card 2: Contribution Heatmap */}
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-[22px] font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                  <i className="fa-solid fa-calendar-days text-[#ff5500]" />
                  Activity Grid
                </h3>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">15 Weeks</span>
              </div>
              <div className="flex justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 overflow-x-auto">
                <div className="grid grid-flow-col gap-1 text-center">
                  {heatmapWeeks.map((week, wIdx) => (
                    <div key={wIdx} className="grid grid-rows-7 gap-1">
                      {week.map((day, dIdx) => (
                        <div
                          key={dIdx}
                          className="w-2.5 h-2.5 rounded-[2px] transition-colors"
                          style={{
                            backgroundColor: day.solved ? '#ff5500' : '#e2e8f0',
                            opacity: day.solved ? 1 : 0.65
                          }}
                          title={`${day.dateStr}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase pt-1">
                <span>Less</span>
                <div className="flex gap-1 items-center">
                  <span className="w-2.5 h-2.5 rounded-[1px] bg-[#e2e8f0]" />
                  <span className="w-2.5 h-2.5 rounded-[1px] bg-[#ff5500]" />
                </div>
                <span>More</span>
              </div>
            </div>

            {/* Card 3: Achievements */}
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm space-y-4">
              <h3 className="text-[22px] font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                <i className="fa-solid fa-award text-[#ff5500]" />
                Achievements
              </h3>
              <div className="grid grid-cols-2 gap-3.5 pt-1">
                {achievements.map((badge, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                      badge.unlocked ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/50 border-slate-100 opacity-60'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
                      style={{
                        backgroundColor: badge.unlocked ? `${badge.color}15` : '#cbd5e1',
                        color: badge.unlocked ? badge.color : '#64748b'
                      }}
                    >
                      <i className={`fa-solid ${badge.icon}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-extrabold text-slate-800 leading-tight truncate">{badge.name}</p>
                      <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* 6. LEADERBOARD SECTION */}
        <section ref={leaderboardRef} className="space-y-6 pt-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-[32px] font-bold text-slate-900 tracking-tight">Leaderboard</h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-[20px] shadow-sm overflow-hidden p-6 space-y-4">
            <div className="space-y-2">
              {top10Leaderboard.map((member) => {
                const isSelf = member.id === user?.id;
                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border border-slate-100 transition-all ${
                      isSelf ? 'bg-orange-50/50 border-[#ff5500]/30 shadow-xs' : 'bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-sm font-black w-6 text-slate-400 text-center">
                        {member.rank === 1 ? '🥇' : member.rank === 2 ? '🥈' : member.rank === 3 ? '🥉' : member.rank}
                      </span>
                      <img
                        src={member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'U')}&background=ff5500&color=fff`}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <span className={`text-sm font-extrabold truncate ${isSelf ? 'text-[#ff5500]' : 'text-slate-800'}`}>{member.name}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">{member.challengeXp || 0} XP</span>
                  </div>
                );
              })}
            </div>

            {/* Current logged-in user below Top 10 spacer */}
            {showCurrentUserBelowTop10 && currentUserLeaderboardRank && (
              <div className="pt-4 border-t border-dashed border-slate-200">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Your Standing</p>
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#ff5500]/30 bg-orange-50/40 shadow-xs">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-sm font-black w-6 text-[#ff5500] text-center">
                      #{currentUserLeaderboardRank.rank}
                    </span>
                    <img
                      src={currentUserLeaderboardRank.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserLeaderboardRank.name || 'U')}&background=ff5500&color=fff`}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <span className="text-sm font-black text-[#ff5500] truncate">You</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{currentUserLeaderboardRank.challengeXp || 0} XP</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 7. DASHBOARD FOOTER QUICK SUMMARY */}
        <section className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm flex flex-wrap justify-between items-center gap-6 text-sm font-bold text-slate-600">
          <div className="flex flex-wrap items-center gap-8">
            <span>Total Challenges: <strong className="text-slate-900">{footerStats.total}</strong></span>
            <span>Solved: <strong className="text-emerald-600">{footerStats.solved}</strong></span>
            <span>Pending: <strong className="text-amber-500">{footerStats.pending}</strong></span>
          </div>
          <div className="flex flex-wrap items-center gap-8 font-black">
            <span>XP Accumulated: <strong className="text-yellow-600">{footerStats.xpEarned} XP</strong></span>
            <span>Current Rank: <strong className="text-slate-900">{footerStats.rank}</strong></span>
          </div>
        </section>

      </div>
    </div>
  );
}
