import db from '../db';
import { DEFAULT_BADGE_RULES } from '../config/badgeConfig';

// ─── Helpers ────────────────────────────────────────────────────────────────

function pct(score, total) {
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

function getBadgeTier(percentage) {
  if (percentage === 100) return 'Legend';
  if (percentage >= 90) return 'Diamond Quiz Master';
  if (percentage >= 75) return 'Gold Quiz Master';
  if (percentage >= 60) return 'Silver Quiz Master';
  if (percentage >= 40) return 'Bronze Quiz Master';
  return null;
}

function getBadgeColor(tier) {
  const map = {
    'Legend': '#ff4500',
    'Diamond Quiz Master': '#b9f2ff',
    'Gold Quiz Master': '#ffd700',
    'Silver Quiz Master': '#c0c0c0',
    'Bronze Quiz Master': '#cd7f32',
  };
  return map[tier] || '#666';
}

function getBadgeIcon(tier) {
  const map = {
    'Legend': 'fa-crown',
    'Diamond Quiz Master': 'fa-gem',
    'Gold Quiz Master': 'fa-trophy',
    'Silver Quiz Master': 'fa-medal',
    'Bronze Quiz Master': 'fa-medal',
  };
  return map[tier] || 'fa-star';
}

function getBadgePoints(tier) {
  const rule = DEFAULT_BADGE_RULES.find(r => r.name === tier);
  return rule?.rewardPoints || 0;
}

function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ─── Filter helpers ──────────────────────────────────────────────────────────

function filterByDate(results, period) {
  if (period === 'overall') return results;
  const now = new Date();
  return results.filter(r => {
    const d = new Date(r.submittedAt || r.createdAt);
    if (period === 'weekly') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    }
    if (period === 'monthly') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return d >= monthAgo;
    }
    return true;
  });
}

// ─── Core aggregation: best result per user ──────────────────────────────────

function aggregateBestPerUser(results) {
  const byUser = {};
  for (const r of results) {
    const uid = r.userId || r.userEmail || r.userName;
    const existing = byUser[uid];
    const rPct = pct(r.score, r.total);
    if (!existing) {
      byUser[uid] = { ...r, percentage: rPct };
    } else {
      const ePct = existing.percentage;
      // Higher % wins; tie → faster time wins
      if (rPct > ePct || (rPct === ePct && (r.timeTaken || 999) < (existing.timeTaken || 999))) {
        byUser[uid] = { ...r, percentage: rPct };
      }
    }
  }
  return Object.values(byUser);
}

// ─── Main Leaderboard data loader ───────────────────────────────────────────

export async function getLeaderboardData({ period = 'overall', quizId = 'all', category = 'all', difficulty = 'all' } = {}) {
  const allResults = await db.find('QuizResults');

  // Apply date filter
  let filtered = filterByDate(allResults, period);

  // Apply quiz filter
  if (quizId !== 'all') filtered = filtered.filter(r => r.quizId === quizId);

  // Apply category filter
  if (category !== 'all') filtered = filtered.filter(r => (r.quizCategory || '').toLowerCase() === category.toLowerCase());

  // Apply difficulty filter
  if (difficulty !== 'all') filtered = filtered.filter(r => (r.difficulty || '').toLowerCase() === difficulty.toLowerCase());

  // Best per user
  const bestPerUser = aggregateBestPerUser(filtered);

  // Sort: highest % first, then fastest time
  const sorted = bestPerUser.sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    return (a.timeTaken || 999) - (b.timeTaken || 999);
  });

  // Attach ranks + badge info
  const ranked = sorted.map((r, i) => {
    const tier = r.badge?.name || getBadgeTier(r.percentage);
    return {
      ...r,
      rank: i + 1,
      percentage: r.percentage,
      badgeTier: tier,
      badgeColor: getBadgeColor(tier),
      badgeIcon: getBadgeIcon(tier),
      points: r.points || r.badge?.rewardPoints || getBadgePoints(tier) || 0,
    };
  });

  return { ranked, allFiltered: filtered };
}

// ─── Statistics Cards ────────────────────────────────────────────────────────

export function computeStats(allResults) {
  if (!allResults.length) return {
    totalParticipants: 0,
    highestScore: 0,
    averageScore: 0,
    fastestTime: null,
    totalBadges: 0,
    passRate: 0,
  };

  const uniqueUsers = new Set(allResults.map(r => r.userId || r.userEmail));
  const scores = allResults.map(r => pct(r.score, r.total));
  const times = allResults.filter(r => r.timeTaken > 0).map(r => r.timeTaken);
  const passes = allResults.filter(r => r.pass).length;
  const badgesCount = allResults.filter(r => r.badge || getBadgeTier(pct(r.score, r.total))).length;

  return {
    totalParticipants: uniqueUsers.size,
    highestScore: Math.max(...scores),
    averageScore: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
    fastestTime: times.length ? Math.min(...times) : null,
    totalBadges: badgesCount,
    passRate: Math.round((passes / allResults.length) * 100),
  };
}

// ─── Personal stats for logged-in user ──────────────────────────────────────

export function computePersonalStats(allResults, userId) {
  const mine = allResults.filter(r => r.userId === userId || r.userEmail === userId);
  if (!mine.length) return null;

  const sorted = [...mine].sort((a, b) => new Date(a.submittedAt || a.createdAt) - new Date(b.submittedAt || b.createdAt));
  const scores = mine.map(r => pct(r.score, r.total));
  const times = mine.filter(r => r.timeTaken > 0).map(r => r.timeTaken);
  const totalPoints = mine.reduce((s, r) => s + (r.points || 0), 0);

  // Badge tally
  const badgeTally = { Legend: 0, 'Diamond Quiz Master': 0, 'Gold Quiz Master': 0, 'Silver Quiz Master': 0, 'Bronze Quiz Master': 0 };
  for (const r of mine) {
    const tier = r.badge?.name || getBadgeTier(pct(r.score, r.total));
    if (tier && badgeTally[tier] !== undefined) badgeTally[tier]++;
  }

  // Streak computation
  let currentStreak = 0;
  let highestStreak = 0;
  let tempStreak = 0;
  for (const r of sorted) {
    if (r.pass) {
      tempStreak++;
      highestStreak = Math.max(highestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  // Current streak = tail of sorted results
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].pass) currentStreak++;
    else break;
  }

  // Achievements
  const achievements = [];
  if (scores.some(s => s === 100)) achievements.push({ key: 'perfect', label: 'Perfect Score', icon: 'fa-star', color: '#ffd700', desc: 'Scored 100% on a quiz' });
  if (times.length && Math.min(...times) < 60) achievements.push({ key: 'speed', label: 'Speed Demon', icon: 'fa-bolt', color: '#ff6b35', desc: 'Finished a quiz in under 60 seconds' });
  if (scores.some(s => s >= 90)) achievements.push({ key: 'accuracy', label: 'Highest Accuracy', icon: 'fa-bullseye', color: '#00c9a7', desc: 'Scored 90%+ accuracy' });
  if (mine.length >= 1 && mine[0].pass) achievements.push({ key: 'first_attempt', label: 'First Attempt Success', icon: 'fa-flag', color: '#7c3aed', desc: 'Passed on your first ever quiz attempt' });
  if (mine.length >= 5) achievements.push({ key: 'champion', label: 'Quiz Champion', icon: 'fa-crown', color: '#ff4500', desc: 'Completed 5+ quizzes' });
  if (currentStreak >= 3) achievements.push({ key: 'streak', label: `${currentStreak}-Quiz Streak`, icon: 'fa-fire', color: '#ef4444', desc: `On a ${currentStreak}-quiz winning streak` });

  // Performance trend (last 8 quizzes)
  const trend = sorted.slice(-8).map((r, i) => ({
    label: `Q${i + 1}`,
    score: pct(r.score, r.total),
    accuracy: pct(r.correct || r.score, r.total),
    timeTaken: r.timeTaken || 0,
    date: r.submittedAt || r.createdAt,
    quizTitle: r.quizTitle || 'Quiz',
  }));

  return {
    totalCompleted: mine.length,
    averageScore: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
    bestScore: Math.max(...scores),
    averageAccuracy: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
    totalPoints,
    totalBadges: Object.values(badgeTally).reduce((s, v) => s + v, 0),
    badgeTally,
    currentStreak,
    highestStreak,
    achievements,
    trend,
    recentResults: sorted.slice(-5).reverse(),
  };
}

// ─── My Rank ─────────────────────────────────────────────────────────────────

export function findMyRank(ranked, userId, userEmail) {
  return ranked.find(r => r.userId === userId || r.userEmail === userEmail || r.userEmail === userId) || null;
}

// ─── Rank Movement ────────────────────────────────────────────────────────────

export async function getRankMovement(userId, currentRank) {
  // Compare using only results excluding the most recent submission
  const allResults = await db.find('QuizResults');
  const mine = allResults
    .filter(r => r.userId === userId || r.userEmail === userId)
    .sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt));

  if (mine.length < 2) return 'NEW';

  // Compute rank without the most recent submission
  const withoutLatest = allResults.filter(r => r.id !== mine[0].id);
  const prev = aggregateBestPerUser(withoutLatest).sort((a, b) => {
    const ap = pct(a.score, a.total), bp = pct(b.score, b.total);
    if (bp !== ap) return bp - ap;
    return (a.timeTaken || 999) - (b.timeTaken || 999);
  });
  const prevIdx = prev.findIndex(r => r.userId === userId || r.userEmail === userId);
  const prevRank = prevIdx >= 0 ? prevIdx + 1 : null;

  if (!prevRank) return 'NEW';
  if (currentRank < prevRank) return `↑ ${prevRank - currentRank}`;
  if (currentRank > prevRank) return `↓ ${currentRank - prevRank}`;
  return '—';
}

// ─── Fastest Finishers ───────────────────────────────────────────────────────

export function getFastestFinishers(allResults, limit = 5) {
  return [...allResults]
    .filter(r => r.timeTaken > 0 && r.pass)
    .sort((a, b) => a.timeTaken - b.timeTaken)
    .slice(0, limit)
    .map((r, i) => ({
      rank: i + 1,
      userName: r.userName || 'Anonymous',
      userId: r.userId,
      quizTitle: r.quizTitle || '—',
      timeTaken: r.timeTaken,
      timeFormatted: formatTime(r.timeTaken),
      percentage: pct(r.score, r.total),
      badge: r.badge?.name || getBadgeTier(pct(r.score, r.total)),
    }));
}

// ─── Hall of Fame ────────────────────────────────────────────────────────────

export function getHallOfFame(allResults) {
  if (!allResults.length) return null;

  // Highest score
  const highestScoreResult = allResults.reduce((best, r) => {
    const p = pct(r.score, r.total);
    return p > pct(best.score, best.total) ? r : best;
  });

  // Fastest completion (pass only)
  const passResults = allResults.filter(r => r.pass && r.timeTaken > 0);
  const fastestResult = passResults.length
    ? passResults.reduce((best, r) => r.timeTaken < best.timeTaken ? r : best)
    : null;

  // Most reward points per user
  const pointsByUser = {};
  for (const r of allResults) {
    const uid = r.userId || r.userEmail;
    pointsByUser[uid] = (pointsByUser[uid] || 0) + (r.points || 0);
  }
  const topPointsUid = Object.entries(pointsByUser).sort((a, b) => b[1] - a[1])[0];
  const mostPointsResult = topPointsUid
    ? allResults.find(r => (r.userId || r.userEmail) === topPointsUid[0])
    : null;

  // Most badges per user
  const badgesByUser = {};
  for (const r of allResults) {
    const uid = r.userId || r.userEmail;
    const tier = r.badge?.name || getBadgeTier(pct(r.score, r.total));
    if (tier) badgesByUser[uid] = (badgesByUser[uid] || 0) + 1;
  }
  const topBadgesUid = Object.entries(badgesByUser).sort((a, b) => b[1] - a[1])[0];
  const mostBadgesResult = topBadgesUid
    ? allResults.find(r => (r.userId || r.userEmail) === topBadgesUid[0])
    : null;

  return {
    highestScore: {
      userName: highestScoreResult.userName || 'Anonymous',
      quizTitle: highestScoreResult.quizTitle || '—',
      percentage: pct(highestScoreResult.score, highestScoreResult.total),
      score: `${highestScoreResult.score}/${highestScoreResult.total}`,
    },
    fastestCompletion: fastestResult ? {
      userName: fastestResult.userName || 'Anonymous',
      quizTitle: fastestResult.quizTitle || '—',
      timeFormatted: formatTime(fastestResult.timeTaken),
      percentage: pct(fastestResult.score, fastestResult.total),
    } : null,
    mostPoints: mostPointsResult ? {
      userName: mostPointsResult.userName || 'Anonymous',
      totalPoints: topPointsUid[1],
    } : null,
    mostBadges: mostBadgesResult ? {
      userName: mostBadgesResult.userName || 'Anonymous',
      totalBadges: topBadgesUid[1],
    } : null,
  };
}

// ─── Fun Insights ─────────────────────────────────────────────────────────────

export function getFunInsights(allResults, userId, userEmail) {
  const myResults = allResults.filter(r => r.userId === userId || r.userEmail === userEmail || r.userEmail === userId);
  if (!myResults.length) return [];

  const allScores = allResults.map(r => pct(r.score, r.total)).sort((a, b) => a - b);
  const myBestScore = Math.max(...myResults.map(r => pct(r.score, r.total)));
  const beatedCount = allScores.filter(s => s < myBestScore).length;
  const beatedPct = allScores.length > 0 ? Math.round((beatedCount / allScores.length) * 100) : 0;

  const insights = [];

  if (beatedPct > 0) {
    insights.push(`🎯 You scored higher than ${beatedPct}% of all participants.`);
  }

  const myAvg = Math.round(myResults.reduce((s, r) => s + pct(r.score, r.total), 0) / myResults.length);
  const globalAvg = Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length);

  if (myAvg > globalAvg) {
    insights.push(`📈 Your average score (${myAvg}%) is above the global average (${globalAvg}%).`);
  }

  if (myResults.length >= 2) {
    const sorted = [...myResults].sort((a, b) => new Date(a.submittedAt || a.createdAt) - new Date(b.submittedAt || b.createdAt));
    const oldScore = pct(sorted[0].score, sorted[0].total);
    const newScore = pct(sorted[sorted.length - 1].score, sorted[sorted.length - 1].total);
    const diff = newScore - oldScore;
    if (diff > 0) {
      insights.push(`🚀 Your accuracy improved by ${diff}% compared to your first quiz.`);
    } else if (diff < 0) {
      insights.push(`💪 Keep practicing — you've taken ${myResults.length} quizzes and are building consistency.`);
    }
  }

  const times = myResults.filter(r => r.timeTaken > 0).map(r => r.timeTaken);
  const allTimes = allResults.filter(r => r.timeTaken > 0).map(r => r.timeTaken).sort((a, b) => a - b);
  if (times.length && allTimes.length) {
    const myFastest = Math.min(...times);
    const fasterCount = allTimes.filter(t => t < myFastest).length;
    const fasterPct = Math.round((fasterCount / allTimes.length) * 100);
    if (fasterPct < 20) {
      insights.push(`⚡ Your fastest completion time puts you in the top ${100 - fasterPct}% of all participants.`);
    }
  }

  return insights.slice(0, 4);
}

// ─── Available Quizzes/Categories for filter dropdowns ───────────────────────

export function getFilterOptions(allResults) {
  const quizzes = [...new Map(allResults.map(r => [r.quizId, { id: r.quizId, title: r.quizTitle }])).values()];
  const categories = [...new Set(allResults.map(r => r.quizCategory).filter(Boolean))];
  const difficulties = [...new Set(allResults.map(r => r.difficulty).filter(Boolean))];
  return { quizzes, categories, difficulties };
}

export { formatTime, getBadgeColor, getBadgeIcon, getBadgeTier, pct };
