import db from '../db';

const COLLECTION = 'leaderboard';

function makeEntryId(userId, quizId) {
  return `${userId}_${quizId}`;
}

function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    const aPct = (a.score || 0) / (a.total || 1);
    const bPct = (b.score || 0) / (b.total || 1);
    if (bPct !== aPct) return bPct - aPct;
    const aTime = a.timeTaken || a.timeSpent || 0;
    const bTime = b.timeTaken || b.timeSpent || 0;
    if (aTime !== bTime) return aTime - bTime;
    return new Date(a.submittedAt || 0) - new Date(b.submittedAt || 0);
  });
}

async function recalculateRanks(quizId) {
  try {
    const all = await db.find(COLLECTION);
    const quizEntries = all.filter(e => e.quizId === quizId);
    const sorted = sortEntries(quizEntries);
    const updates = sorted.map((entry, i) => ({
      id: entry.id,
      rank: i + 1,
    }));
    await Promise.all(updates.map(u => db.update(COLLECTION, u.id, { rank: u.rank })));
  } catch (e) {
    console.error('recalculateRanks failed:', e);
  }
}

export async function saveEntry(data) {
  const { userId, quizId, score, total, timeTaken } = data;
  const entryId = makeEntryId(userId, quizId);

  const existing = await db.findOne(COLLECTION, { id: entryId });

  const newPct = (score || 0) / (total || 1);
  const existingPct = existing ? (existing.score || 0) / (existing.total || 1) : -1;

  if (existing && newPct <= existingPct) {
    return existing;
  }

  const entry = {
    id: entryId,
    userId,
    userName: data.userName || '',
    userEmail: data.userEmail || '',
    userPhoto: data.userPhoto || '',
    userDepartment: data.userDepartment || '',
    userCollege: data.userCollege || '',
    quizId,
    quizTitle: data.quizTitle || '',
    quizCategory: data.quizCategory || '',
    score: score || 0,
    total: total || 1,
    percentage: Math.round(((score || 0) / (total || 1)) * 100),
    accuracy: data.accuracy || Math.round(((score || 0) / (total || 1)) * 100),
    timeTaken: timeTaken || 0,
    submittedAt: data.submittedAt || new Date().toISOString(),
    rank: 0,
    badge: data.badge || null,
  };

  try {
    await db.insert(COLLECTION, entry);
  } catch (e) {
    console.error('saveEntry insert failed:', e);
  }

  await recalculateRanks(quizId);

  return entry;
}

export function subscribeEntries(onData, onError) {
  return db.subscribeCollection(COLLECTION, (items) => {
    const withRank = items.map((item, i) => ({ ...item }));
    const quizMap = {};
    items.forEach(item => {
      if (!quizMap[item.quizId]) quizMap[item.quizId] = [];
      quizMap[item.quizId].push(item);
    });
    const result = [];
    Object.values(quizMap).forEach(entries => {
      const sorted = sortEntries(entries);
      sorted.forEach((entry, i) => {
        result.push({ ...entry, rank: i + 1 });
      });
    });
    onData(result);
  }, onError);
}

export async function getEntries(quizId) {
  const all = await db.find(COLLECTION);
  const filtered = quizId ? all.filter(e => e.quizId === quizId) : all;
  const quizMap = {};
  filtered.forEach(e => {
    if (!quizMap[e.quizId]) quizMap[e.quizId] = [];
    quizMap[e.quizId].push(e);
  });
  const result = [];
  Object.values(quizMap).forEach(entries => {
    const sorted = sortEntries(entries);
    sorted.forEach((entry, i) => {
      result.push({ ...entry, rank: i + 1 });
    });
  });
  return result;
}

export async function getUserEntries(userId) {
  const all = await db.find(COLLECTION);
  return all.filter(e => e.userId === userId);
}

export async function getUserRank(userId, quizId) {
  const entries = await getEntries(quizId);
  const entry = entries.find(e => e.userId === userId);
  if (!entry) return null;
  return { rank: entry.rank, total: entries.length, entry };
}

export async function getUserBestRank(userId) {
  const all = await db.find(COLLECTION);
  const userEntries = all.filter(e => e.userId === userId);
  if (userEntries.length === 0) return null;
  const quizMap = {};
  all.forEach(e => {
    if (!quizMap[e.quizId]) quizMap[e.quizId] = [];
    quizMap[e.quizId].push(e);
  });
  const best = userEntries.reduce((a, b) => {
    const entries = quizMap[b.quizId] || [];
    const sorted = sortEntries(entries);
    const rank = sorted.findIndex(e => e.userId === userId) + 1;
    const pct = (b.score || 0) / (b.total || 1);
    const aPct = (a.score || 0) / (a.total || 1);
    return pct > aPct ? { ...b, rank } : a;
  }, userEntries[0]);
  return best;
}

export async function deleteEntry(id) {
  try {
    await db.delete(COLLECTION, id);
    return true;
  } catch (e) {
    console.error('deleteEntry failed:', e);
    return false;
  }
}

export async function clearQuiz(quizId) {
  try {
    const entries = await db.find(COLLECTION);
    const toDelete = entries.filter(e => e.quizId === quizId);
    await Promise.allSettled(toDelete.map(e => db.delete(COLLECTION, e.id)));
    return toDelete.length;
  } catch (e) {
    console.error('clearQuiz failed:', e);
    return 0;
  }
}

export async function clearAll() {
  try {
    const entries = await db.find(COLLECTION);
    await Promise.allSettled(entries.map(e => db.delete(COLLECTION, e.id)));
    return entries.length;
  } catch (e) {
    console.error('clearAll failed:', e);
    return 0;
  }
}

export function exportCSV(data, filename = 'leaderboard.csv') {
  const headers = ['Rank', 'Name', 'Email', 'Quiz', 'Score', 'Total', 'Percentage', 'Accuracy', 'Time Taken (s)', 'Department', 'College', 'Submitted At'];
  const rows = data.map(e => [
    e.rank || '',
    e.userName || '',
    e.userEmail || '',
    e.quizTitle || '',
    e.score || 0,
    e.total || 0,
    e.percentage || 0,
    e.accuracy || 0,
    e.timeTaken || 0,
    e.userDepartment || '',
    e.userCollege || '',
    e.submittedAt || '',
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
