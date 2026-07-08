import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import db from '../../db';
import { getChallenges, getDailyChallenge, getUserSubmissions, getUserRank } from '../services/challengeService';
import { calculateLevel } from '../config/challengeConfig';

// Sub-components
import HeroSection from '../components/HeroSection';
import SearchFilters from '../components/SearchFilters';
import ChallengeCard from '../components/ChallengeCard';
import ChallengeModal from '../components/ChallengeModal';
import LeaderboardSidebar from '../components/LeaderboardSidebar';
import SkeletonCard from '../components/SkeletonCard';

export default function ChallengesDashboard({ user }) {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [userRank, setUserRank] = useState(null);
  
  // Loader States
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [filterDiff, setFilterDiff] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Bookmark State
  const [bookmarkedList, setBookmarkedList] = useState(user?.bookmarkedChallenges || []);

  // Modal State
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Scroll ref for Start Solving button action
  const listRef = useRef(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [chals, daily, subs, rank, allUsers] = await Promise.all([
        getChallenges({ status: 'published' }),
        getDailyChallenge(),
        user ? getUserSubmissions(user.id) : Promise.resolve([]),
        user ? getUserRank(user.id) : Promise.resolve(null),
        db.find('Users')
      ]);

      setChallenges(chals || []);
      setDailyChallenge(daily);
      setSubmissions(subs || []);
      setUserRank(rank);
      setUsers(allUsers || []);
      if (user) {
        setBookmarkedList(user.bookmarkedChallenges || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSolving = () => {
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Toggle bookmark in Firestore & Local storage
  const handleToggleBookmark = async (challengeId) => {
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
      // Update local state copy
      if (user) user.bookmarkedChallenges = updated;

      window.showToast(
        isBookmarked ? 'Removed Bookmark' : 'Added Bookmark',
        isBookmarked ? 'Removed from bookmarks.' : 'Saved to bookmarks.',
        'success'
      );
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilterDiff('all');
    setFilterCategory('all');
    setFilterTag('all');
    setSortBy('newest');
  };

  // Compute categories & tags list dynamically
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

  // Solved vs Attempted lists
  const solvedSet = useMemo(() => {
    return new Set(submissions.filter(s => s.status === 'passed').map(s => s.challengeId));
  }, [submissions]);

  // Filter & Sort Logic
  const filteredAndSortedChallenges = useMemo(() => {
    return challenges
      .filter(c => {
        if (filterDiff !== 'all' && c.difficulty !== filterDiff) return false;
        if (filterCategory !== 'all' && c.category !== filterCategory) return false;
        if (filterTag !== 'all' && (!c.tags || !c.tags.includes(filterTag))) return false;
        
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
  }, [challenges, filterDiff, filterCategory, filterTag, search, sortBy]);

  const level = calculateLevel(user?.challengeXp || 0);

  // Footer Stats
  const footerStats = useMemo(() => {
    const total = challenges.length;
    const solved = solvedSet.size;
    const pending = Math.max(total - solved, 0);
    const xpEarned = user?.challengeXp || 0;
    const rank = userRank ? `#${userRank.rank}` : '—';
    return { total, solved, pending, xpEarned, rank };
  }, [challenges, solvedSet, user, userRank]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* 🚀 Hero Section */}
      <HeroSection 
        user={user} 
        level={level} 
        userRank={userRank} 
        onStartClick={handleStartSolving} 
      />

      {/* 📅 Premium Daily Challenge Banner */}
      {dailyChallenge && (
        <div className="rounded-3xl border border-slate-800 bg-[#0f172a] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
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
              <button
                onClick={() => {
                  setSelectedChallenge(dailyChallenge);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-2xl font-black text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ff5500]/20 transition-all cursor-pointer border-none"
                style={{ backgroundColor: 'var(--orange)', color: '#ffffff' }}
              >
                <i className="fa-solid fa-play" style={{ color: '#ffffff' }} />
                Solve Now
              </button>
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

      {/* 🔍 Search and Sticky Filters Component */}
      <div ref={listRef}>
        <SearchFilters
          search={search}
          setSearch={setSearch}
          difficulty={filterDiff}
          setDifficulty={setFilterDiff}
          category={filterCategory}
          setCategory={setFilterCategory}
          tag={filterTag}
          setTag={setFilterTag}
          sortBy={sortBy}
          setSortBy={setSortBy}
          allTags={allTags}
          allCategories={allCategories}
          onReset={handleResetFilters}
        />
      </div>

      {/* 💻 Main Layout Split: Left (75%) & Right (25%) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Challenge Cards Grid */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredAndSortedChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredAndSortedChallenges.map(c => {
                const sub = submissions.find(s => s.challengeId === c.id);
                return (
                  <div 
                    key={c.id} 
                    onClick={() => {
                      setSelectedChallenge(c);
                      setIsModalOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    <ChallengeCard
                      challenge={c}
                      userSubmission={sub}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State Layout */
            <div className="text-center py-16 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[var(--orange)]/10 text-[var(--orange)] flex items-center justify-center mx-auto text-xl">
                <i className="fa-solid fa-code" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[var(--text)]">No Challenges Found</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">Try refining your tags, search keywords, or resetting all dashboard filters.</p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 border border-[var(--orange)] text-[var(--orange)] bg-transparent hover:bg-[var(--orange)]/5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Sticky Leaderboard & Progress Sidebar */}
        <div className="lg:col-span-1">
          <LeaderboardSidebar
            users={users}
            submissions={submissions}
            user={user}
          />
        </div>

      </div>

      {/* 📊 Modern Footer Quick Stats Summary */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-wrap justify-between items-center gap-4 text-xs font-semibold text-[var(--text-secondary)]">
        <div className="flex flex-wrap items-center gap-6">
          <span>Total Challenges: <strong className="text-[var(--text)]">{footerStats.total}</strong></span>
          <span>Solved: <strong className="text-emerald-500">{footerStats.solved}</strong></span>
          <span>Pending: <strong className="text-[var(--orange)]">{footerStats.pending}</strong></span>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <span>XP Accumulated: <strong className="text-yellow-500">{footerStats.xpEarned} XP</strong></span>
          <span>Standing Rank: <strong className="text-[var(--text)]">{footerStats.rank}</strong></span>
        </div>
      </div>

      {/* 🔎 Challenge Detail Modal */}
      {selectedChallenge && (
        <ChallengeModal
          challenge={selectedChallenge}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedChallenge(null);
          }}
          onSolve={() => navigate(`/challenges/${selectedChallenge.id}`)}
          isBookmarked={bookmarkedList.includes(selectedChallenge.id)}
          onToggleBookmark={handleToggleBookmark}
          userSubmission={submissions.find(s => s.challengeId === selectedChallenge.id)}
        />
      )}

    </div>
  );
}
