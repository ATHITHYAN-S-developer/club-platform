import db from '../db';

export async function saveResult(data) {
  return await db.insert('QuizResults', {
    ...data,
    createdAt: new Date().toISOString(),
  });
}

export async function getUserResults(userId, limit = 50) {
  const all = await db.find('QuizResults');
  return all
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt))
    .slice(0, limit);
}

export async function getQuizResults(quizId) {
  const all = await db.find('QuizResults');
  return all.filter((r) => r.quizId === quizId);
}

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
  return idx >= 0 ? idx + 1 : null;
}
