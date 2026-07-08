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
      
      {/* 🚀 UpLabs Styled Hero Section */}
      <HeroSection 
        dailyChallenge={dailyChallenge}
        onSolveDaily={() => {
          if (dailyChallenge) {
            setSelectedChallenge(dailyChallenge);
            setIsModalOpen(true);
          }
        }}
      />

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

      {/* 💻 UpLabs Style Main Layout: Full-Width List & Sidebar below */}
      <div className="space-y-6">
        
        {/* Header */}
        <div className="border-b border-[var(--border-light)] pb-3">
          <h2 className="text-xl font-black text-[var(--text)] tracking-tight">Active Challenges</h2>
          <p className="text-xs text-[var(--text-muted)] font-semibold mt-1 uppercase tracking-wider">{filteredAndSortedChallenges.length} Challenges</p>
        </div>

        {/* Challenge Cards Rows Stack with explicit gaps */}
        <div className="flex flex-col gap-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse bg-[var(--card)] border border-[var(--border)] rounded-2xl h-24" />
              ))}
            </div>
          ) : filteredAndSortedChallenges.length > 0 ? (
            filteredAndSortedChallenges.map(c => {
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
            })
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
      </div>

      {/* 📊 Leaderboard & Achievements Sections Below list (Full-Width Columns) */}
      <div className="border-t border-[var(--border)] pt-8 mt-12">
        <h2 className="text-xl font-black text-[var(--text)] tracking-tight mb-6">🏆 Community & Insights</h2>
        <LeaderboardSidebar
          users={users}
          submissions={submissions}
          user={user}
        />
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
