import db from '../../db';

const COLLECTIONS = {
  challenges: 'Challenges',
  submissions: 'ChallengeSubmissions',
  drafts: 'ChallengeDrafts',
  leaderboard: 'ChallengeLeaderboard',
  analytics: 'ChallengeAnalytics',
  discussions: 'ChallengeDiscussions',
};

export async function getChallenges(filters = {}) {
  const all = await db.find(COLLECTIONS.challenges);
  return all.filter(c => {
    if (filters.status && c.status !== filters.status) return false;
    if (filters.difficulty && c.difficulty !== filters.difficulty) return false;
    if (filters.type && c.challengeType !== filters.type) return false;
    return c.status !== 'archived';
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getChallenge(id) {
  const challenge = await db.findOne(COLLECTIONS.challenges, { id });
  if (!challenge) return null;
  const { hiddenTestCases, solutionCode, ...safe } = challenge;
  return safe;
}

export async function getDailyChallenge() {
  const today = new Date().toISOString().split('T')[0];
  const all = await db.find(COLLECTIONS.challenges);
  return all.find(c => c.isDailyChallenge && c.challengeDate?.startsWith(today) && c.status === 'published') || null;
}

export async function getUserSubmissions(userId) {
  const all = await db.find(COLLECTIONS.submissions);
  return all.filter(s => s.userId === userId).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export async function getSubmission(id) {
  return await db.findOne(COLLECTIONS.submissions, { id });
}

export async function getChallengeSubmissions(challengeId) {
  const all = await db.find(COLLECTIONS.submissions);
  return all.filter(s => s.challengeId === challengeId).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export function subscribeLeaderboard(period, callback) {
  return db.subscribeQuery(COLLECTIONS.leaderboard, 'period', '==', period, callback);
}

export function subscribeChallenge(challengeId, callback) {
  return db.subscribe(COLLECTIONS.challenges, callback, challengeId);
}

export function subscribeUserSubmissions(userId, callback) {
  return db.subscribeQuery(COLLECTIONS.submissions, 'userId', '==', userId, callback);
}

export async function saveDraft(userId, challengeId, language, code) {
  const id = `${userId}_${challengeId}`;
  const draft = {
    userId, challengeId, language, code,
    updatedAt: new Date().toISOString(),
  };
  try {
    return await db.update(COLLECTIONS.drafts, id, draft);
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return await db.insert(COLLECTIONS.drafts, { id, ...draft });
    }
    throw error;
  }
}

export async function loadDraft(userId, challengeId) {
  const id = `${userId}_${challengeId}`;
  return await db.findOne(COLLECTIONS.drafts, { id });
}

export async function getLeaderboard(period = 'overall') {
  const all = await db.find(COLLECTIONS.leaderboard);
  return all.find(l => l.period === period)?.rankings || [];
}

export async function getUserRank(userId, period = 'overall') {
  const board = await getLeaderboard(period);
  return board.find(r => r.userId === userId) || null;
}

export async function getPendingManualReviews() {
  const all = await db.find(COLLECTIONS.submissions);
  return all.filter(s => s.status === 'pending_review').sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
}

export async function createChallenge(data) {
  return await db.insert(COLLECTIONS.challenges, {
    ...data,
    version: 1,
    status: data.status || 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function updateChallenge(id, updates) {
  return await db.update(COLLECTIONS.challenges, id, {
    ...updates,
    version: (updates.version || 0) + 1,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteChallenge(id) {
  return await db.delete(COLLECTIONS.challenges, id);
}
