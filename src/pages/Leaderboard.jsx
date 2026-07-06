import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import db from '../db.js';
import LeaderboardPodium from '../components/quiz/LeaderboardPodium';
import LeaderboardTable from '../components/quiz/LeaderboardTable';
import { computeBadges } from '../data/quiz/badges.js';

export default function Leaderboard({ user }) {
  const [results, setResults] = useState([]);
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
      const quizMap = {};
      qData.forEach(q => { quizMap[q.id] = q; });
      const enriched = rData.map(r => {
        const q = quizMap[r.quizId];
        return { ...r, total: r.total || q?.questions?.length || 1, totalTime: q?.timeLimit * 60 || 300 };
      });
      setResults(enriched);
    } catch (e) {
      console.error('Failed to load leaderboard:', e);
    }
    setLoading(false);
  };

  const filteredResults = useMemo(() => {
    let data = [...results];

    if (quizFilter !== 'all') {
      data = data.filter(r => r.quizId === quizFilter);
    }

    if (timeFilter === 'today') {
      const today = new Date().toDateString();
      data = data.filter(r => new Date(r.date || r.submittedAt).toDateString() === today);
    } else if (timeFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      data = data.filter(r => new Date(r.date || r.submittedAt) >= weekAgo);
    } else if (timeFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      data = data.filter(r => new Date(r.date || r.submittedAt) >= monthAgo);
    }

    data.sort((a, b) => {
      const aPct = (a.score || 0) / (a.total || 1);
      const bPct = (b.score || 0) / (b.total || 1);
      if (bPct !== aPct) return bPct - aPct;
      const aAcc = a.accuracy || Math.round((a.score || 0) / (a.total || 1) * 100);
      const bAcc = b.accuracy || Math.round((b.score || 0) / (b.total || 1) * 100);
      if (bAcc !== aAcc) return bAcc - aAcc;
      const aTime = a.timeTaken || a.timeSpent || 0;
      const bTime = b.timeTaken || b.timeSpent || 0;
      if (aTime !== bTime) return aTime - bTime;
      return new Date(a.date || a.submittedAt) - new Date(b.date || b.submittedAt);
    });

    const seen = new Set();
    data = data.filter(r => {
      const key = `${r.userId}-${r.quizId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const ranked = data.map((r, i) => ({ ...r, rank: i + 1 }));

    const userResultsMap = {};
    ranked.forEach(r => {
      if (!userResultsMap[r.userId]) userResultsMap[r.userId] = [];
      userResultsMap[r.userId].push(r);
    });

    return ranked.map(r => ({
      ...r,
      badges: computeBadges(r, userResultsMap[r.userId] || []),
    }));
  }, [results, quizFilter, timeFilter]);

  const topThree = filteredResults.slice(0, 3);
  const stats = useMemo(() => {
    if (filteredResults.length === 0) return { participants: 0, avgScore: 0, highestScore: 0, avgAccuracy: 0, fastestTime: 0 };
    const avgScore = filteredResults.reduce((s, r) => s + (r.score || 0), 0) / filteredResults.length;
    const highestScore = Math.max(...filteredResults.map(r => (r.score || 0) / (r.total || 1) * 100));
    const avgAcc = filteredResults.reduce((s, r) => s + (r.accuracy || Math.round((r.score || 0) / (r.total || 1) * 100)), 0) / filteredResults.length;
    const fastestTime = Math.min(...filteredResults.map(r => r.timeTaken || r.timeSpent || 999999));
    return {
      participants: filteredResults.length,
      avgScore: Math.round(avgScore * 10) / 10,
      highestScore: Math.round(highestScore),
      avgAccuracy: Math.round(avgAcc),
      fastestTime: fastestTime === 999999 ? 0 : fastestTime,
    };
  }, [filteredResults]);

  const quizOptions = useMemo(() => {
    const map = {};
    results.forEach(r => { map[r.quizId] = r.quizTitle; });
    return Object.entries(map).map(([id, title]) => ({ id, title }));
  }, [results]);

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
          <div className="lb-stat-card"><div className="lb-stat-value">{stats.fastestTime}s</div><div className="lb-stat-label">Fastest Time</div></div>
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
      </motion.div>
    </div>
  );
}
