import db from '../db';

export async function getTopResults(limit = 10) {
  const all = await db.find('QuizResults');
  return all
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit);
}

export async function getUserRank(userId) {
  const all = await db.find('QuizResults');
  const sorted = all.sort((a, b) => (b.score || 0) - (a.score || 0));
  const idx = sorted.findIndex((r) => r.userId === userId);
  if (idx === -1) return null;
  return { rank: idx + 1, result: sorted[idx] };
}

export async function getUserStats(userId) {
  const all = await db.find('QuizResults');
  const userResults = all.filter((r) => r.userId === userId);
  if (userResults.length === 0) return null;

  const totalScore = userResults.reduce((s, r) => s + (r.score || 0), 0);
  const bestScore = Math.max(...userResults.map((r) => r.score || 0));
  const avgPercentage = Math.round(userResults.reduce((s, r) => s + (r.percentage || 0), 0) / userResults.length);
  const sorted = all.sort((a, b) => (b.score || 0) - (a.score || 0));
  const rank = sorted.findIndex((r) => r.userId === userId) + 1;

  const categories = {};
  userResults.forEach((r) => {
    const cat = r.quizCategory || 'General';
    if (!categories[cat]) categories[cat] = { count: 0, totalPercentage: 0 };
    categories[cat].count++;
    categories[cat].totalPercentage += r.percentage || 0;
  });

  let bestCategory = null;
  let worstCategory = null;
  Object.entries(categories).forEach(([cat, data]) => {
    const avg = data.totalPercentage / data.count;
    if (!bestCategory || avg > bestCategory.avg) bestCategory = { name: cat, avg };
    if (!worstCategory || avg < worstCategory.avg) worstCategory = { name: cat, avg };
  });

  return {
    totalQuizzes: userResults.length,
    totalScore,
    bestScore,
    averagePercentage: avgPercentage,
    rank,
    bestCategory: bestCategory?.name || null,
    worstCategory: worstCategory?.name || null,
    categories,
  };
}
