import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import db from '../db.js';
import LeaderboardPodium from '../components/quiz/LeaderboardPodium';
import LeaderboardTable from '../components/quiz/LeaderboardTable';

// Helper to format seconds to m and s format
const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return '-';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

// Safe date parsing helper
const safeGetDate = (dateStr) => {
  if (!dateStr) return new Date(0);
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date(0) : d;
};

export default function Leaderboard({ user }) {
  const [results, setResults] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizFilter, setQuizFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rData, qData] = await Promise.all([
        db.find('QuizResults'),
        db.find('Quiz'),
      ]);

      const validResults = Array.isArray(rData) ? rData : [];
      const validQuizzes = Array.isArray(qData) ? qData : [];

      setQuizzes(validQuizzes);

      const quizMap = {};
      validQuizzes.forEach(q => { quizMap[q.id] = q; });

      const enriched = validResults.map(r => {
        const q = quizMap[r.quizId];
        return {
          ...r,
          total: r.total || q?.questions?.length || 1,
          totalTime: q?.timeLimit * 60 || 300,
          userName: r.userName || 'Anonymous',
          userPhoto: r.userPhoto || r.photo || null,
        };
      });

      setResults(enriched);
    } catch (e) {
      console.error('Failed to load leaderboard data:', e);
    }
    setLoading(false);
  };

  const filteredResults = useMemo(() => {
    let data = [...results];

    // Filter by quiz
    if (quizFilter !== 'all') {
      data = data.filter(r => r.quizId === quizFilter);
    }

    // Filter by time period
    const today = new Date();
    if (timeFilter === 'today') {
      const todayStr = today.toDateString();
      data = data.filter(r => safeGetDate(r.date || r.submittedAt).toDateString() === todayStr);
    } else if (timeFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      data = data.filter(r => safeGetDate(r.date || r.submittedAt) >= weekAgo);
    } else if (timeFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(today.getMonth() - 1);
      data = data.filter(r => safeGetDate(r.date || r.submittedAt) >= monthAgo);
    }

    // Sort by best score percentage, then best accuracy percentage, then fastest time, then earliest submission date
    data.sort((a, b) => {
      const aPct = (a.score || 0) / (a.total || 1);
      const bPct = (b.score || 0) / (b.total || 1);
      if (bPct !== aPct) return bPct - aPct;

      const aAcc = a.accuracy || Math.round((a.score || 0) / (a.total || 1) * 100);
      const bAcc = b.accuracy || Math.round((b.score || 0) / (b.total || 1) * 100);
      if (bAcc !== aAcc) return bAcc - aAcc;

      // Handle time taken safely (treat 0 or missing as maximum possible completion time)
      const aTime = a.timeTaken || a.timeSpent || 999999;
      const bTime = b.timeTaken || b.timeSpent || 999999;
      if (aTime !== bTime) return aTime - bTime;

      return safeGetDate(a.date || a.submittedAt).getTime() - safeGetDate(b.date || b.submittedAt).getTime();
    });

    // Deduplicate per user per quiz so only their absolute best attempt shows
    const seen = new Set();
    data = data.filter(r => {
      const userKey = r.userId || r.userEmail || r.userName || r.id || 'anonymous';
      const key = `${userKey}-${r.quizId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Add rank numbering
    const ranked = data.map((r, i) => ({ ...r, rank: i + 1 }));

    return ranked.map(r => ({
      ...r,
      badges: r.badge ? [r.badge] : [],
    }));
  }, [results, quizFilter, timeFilter]);

  const topThree = filteredResults.slice(0, 3);

  const stats = useMemo(() => {
    if (filteredResults.length === 0) {
      return { participants: 0, avgScore: 0, highestScore: 0, avgAccuracy: 0, fastestTime: '-' };
    }

    const uniqueParticipants = new Set(filteredResults.map(r => r.userId || r.userEmail || r.userName || r.id)).size;
    const avgScore = filteredResults.reduce((s, r) => s + (r.score || 0), 0) / filteredResults.length;
    const highestScore = Math.max(...filteredResults.map(r => ((r.score || 0) / (r.total || 1)) * 100));
    const avgAcc = filteredResults.reduce((s, r) => s + (r.accuracy || Math.round((r.score || 0) / (r.total || 1) * 100)), 0) / filteredResults.length;

    // Only look at actual positive completion times
    const validTimes = filteredResults.map(r => r.timeTaken || r.timeSpent || 0).filter(t => t > 0);
    const fastestTime = validTimes.length > 0 ? Math.min(...validTimes) : 0;

    return {
      participants: uniqueParticipants,
      avgScore: Math.round(avgScore * 10) / 10,
      highestScore: Math.round(highestScore),
      avgAccuracy: Math.round(avgAcc),
      fastestTime: fastestTime > 0 ? formatDuration(fastestTime) : '-',
    };
  }, [filteredResults]);

  // Retrieve quizzes lists from both the results set and the database for robust filters dropdown listing
  const quizOptions = useMemo(() => {
    const map = {};
    quizzes.forEach(q => { map[q.id] = q.title; });
    results.forEach(r => { if (r.quizId && !map[r.quizId]) map[r.quizId] = r.quizTitle; });
    return Object.entries(map).map(([id, title]) => ({ id, title }));
  }, [quizzes, results]);

  if (loading) {
    return (
      <div className="main-content" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-dots"><span></span><span></span><span></span></div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="page-header">
          <span className="page-tag"><i className="fas fa-ranking-star"></i> Leaderboard</span>
          <h1 className="page-title">Top Performers</h1>
          <p className="page-subtitle">Ranked by highest score, accuracy, and completion time.</p>
        </div>

        <div className="lb-stats">
          <div className="lb-stat-card"><div className="lb-stat-value">{stats.participants}</div><div className="lb-stat-label">Participants</div></div>
          <div className="lb-stat-card"><div className="lb-stat-value">{stats.avgScore}</div><div className="lb-stat-label">Avg Score</div></div>
          <div className="lb-stat-card"><div className="lb-stat-value">{stats.highestScore}%</div><div className="lb-stat-label">Highest Score</div></div>
          <div className="lb-stat-card"><div className="lb-stat-value">{stats.avgAccuracy}%</div><div className="lb-stat-label">Avg Accuracy</div></div>
          <div className="lb-stat-card"><div className="lb-stat-value">{stats.fastestTime}</div><div className="lb-stat-label">Fastest Time</div></div>
        </div>

        <div className="filter-bar">
          <div className="filter-buttons">
            {['all', 'today', 'week', 'month'].map(t => (
              <button key={t} className={`btn btn-sm ${timeFilter === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTimeFilter(t)}>
                {t === 'all' ? 'All Time' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <select className="form-select" style={{ width: 'auto', minWidth: 180 }} value={quizFilter} onChange={(e) => setQuizFilter(e.target.value)}>
            <option value="all">All Quizzes</option>
            {quizOptions.map(o => (
              <option key={o.id} value={o.id}>{o.title}</option>
            ))}
          </select>
        </div>

        {topThree.length >= 3 && <LeaderboardPodium topThree={topThree} />}

        <LeaderboardTable data={filteredResults} currentUserId={user?.id} />

        {/* Personal Rank */}
        {user && (() => {
          const myEntries = filteredResults.filter(r => r.userId === user.id || r.userEmail === user.email);
          if (myEntries.length === 0) return null;
          const best = myEntries.reduce((a, b) => ((b.score || 0) / (b.total || 1)) > ((a.score || 0) / (a.total || 1)) ? b : a);
          if (best.rank <= 10) return null;
          return (
            <div style={{
              marginTop: '1.5rem', padding: '1rem', borderRadius: 14,
              background: 'var(--card)', border: '2px solid var(--orange)',
              display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(255,85,0,0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <i className="fas fa-user" style={{ color: 'var(--orange)', fontSize: '1.2rem' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>Your Rank</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Best score: {best.percentage || Math.round((best.score || 0) / (best.total || 1) * 100)}%
                </div>
              </div>
              <div style={{
                fontSize: '1.8rem', fontWeight: 800, color: 'var(--orange)',
              }}>
                #{best.rank}
              </div>
              {best.badge && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.3rem 0.65rem', borderRadius: 8,
                  background: `${best.badge.color}15`,
                }}>
                  <i className={`fas ${best.badge.icon || 'fa-medal'}`} style={{ color: best.badge.color }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: best.badge.color }}>
                    {best.badge.name}
                  </span>
                </div>
              )}
            </div>
          );
        })()}
      </motion.div>
    </div>
  );
}
