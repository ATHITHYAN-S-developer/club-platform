import db from '../db';
import { DEFAULT_BADGE_RULES } from '../config/badgeConfig';

export async function getBadgeDefinitions() {
  const all = await db.find('Badges');
  return all.length > 0 ? all : DEFAULT_BADGE_RULES;
}

export async function saveBadgeDef(data) {
  return await db.insert('Badges', data);
}

export async function updateBadgeDef(id, data) {
  return await db.update('Badges', id, data);
}

export async function deleteBadgeDef(id) {
  return await db.delete('Badges', id);
}

export async function getUserBadges(userId) {
  try {
    const user = await db.findOne('users', userId);
    return user?.badges || [];
  } catch {
    return [];
  }
}

export async function updateUserBadges(userId, badge, score, points) {
  try {
    const user = await db.findOne('users', userId);
    if (!user) return;

    const badges = user.badges || [];
    const alreadyEarned = badges.some((b) => b.id === badge.id);
    const updatedBadges = alreadyEarned ? badges : [...badges, { ...badge, earnedAt: new Date().toISOString() }];

    await db.update('users', userId, {
      badges: updatedBadges,
      totalBadges: updatedBadges.length,
      totalPoints: (user.totalPoints || 0) + points,
      highestBadge: getHigherBadge(user.highestBadge, badge),
      totalQuizzesAttempted: (user.totalQuizzesAttempted || 0) + 1,
      averageScore: calcNewAvg(user.averageScore, user.totalQuizzesAttempted || 0, score),
      bestScore: Math.max(user.bestScore || 0, score),
    });
  } catch (e) {
    console.error('Failed to update user badges', e);
  }
}

function getHigherBadge(current, earned) {
  if (!current) return earned;
  const order = ['Bronze Quiz Master', 'Silver Quiz Master', 'Gold Quiz Master', 'Diamond Quiz Master', 'Legend'];
  const curIdx = order.indexOf(current.name);
  const earnedIdx = order.indexOf(earned.name);
  return earnedIdx >= curIdx ? earned : current;
}

function calcNewAvg(currentAvg, count, newScore) {
  const total = (currentAvg || 0) * count + newScore;
  return Math.round(total / (count + 1));
}
