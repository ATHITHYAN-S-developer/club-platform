import db from '../db';
import { calculateLevel, SYSTEM_BADGES, BADGE_BONUS_XP, getFieldDefinitions, getScoringCriteria } from '../config/taskConfig';

export async function createTask(data) {
  const task = {
    ...data,
    status: data.status || 'draft',
    totalSubmissions: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return await db.insert('Tasks', task);
}

export async function updateTask(id, updates) {
  return await db.update('Tasks', id, { ...updates, updatedAt: new Date().toISOString() });
}

export async function deleteTask(id) {
  await db.delete('Tasks', id);
  const subs = await db.find('TaskSubmissions');
  const taskSubs = subs.filter(s => s.taskId === id);
  for (const sub of taskSubs) {
    await db.delete('TaskSubmissions', sub.id);
  }
}

export async function getTask(id) {
  return await db.findOne('Tasks', { id });
}

export async function listTasks(filter = {}) {
  const all = await db.find('Tasks');
  return all.filter(t => {
    if (filter.status && t.status !== filter.status) return false;
    if (filter.visibility && t.visibility !== filter.visibility) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getVisibleTasks(user) {
  const all = await db.find('Tasks');
  return all.filter(t => {
    if (t.status === 'archived' || t.status === 'draft') return false;
    if (t.visibility === 'all') return true;
    if (t.visibility === 'core' && user.role === 'admin') return true;
    if (t.visibility === user.year) return true;
    if (t.visibility === 'departments' && t.selectedDepartments?.includes(user.department)) return true;
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function submitTask(taskId, userId, userName, userEmail, userPhoto, userDepartment, fields) {
  const task = await getTask(taskId);
  if (!task) throw new Error('Task not found');
  if (task.status !== 'open') throw new Error('This task is not accepting submissions');

  const existingSubs = await db.find('TaskSubmissions');
  const userSubs = existingSubs.filter(s => s.taskId === taskId && s.userId === userId);
  const attemptNumber = userSubs.length + 1;

  if (!task.allowMultipleSubmissions && userSubs.length > 0) {
    throw new Error('Multiple submissions are not allowed for this task');
  }

  if (task.maxAttempts && attemptNumber > task.maxAttempts) {
    throw new Error(`Maximum attempts (${task.maxAttempts}) reached for this task`);
  }

  if (!task.lateSubmissionAllowed) {
    const dueDate = new Date(task.dueDate + 'T' + (task.dueTime || '23:59'));
    if (new Date() > dueDate) {
      throw new Error('Submission deadline has passed');
    }
  }

  const submission = {
    taskId,
    taskTitle: task.title,
    userId,
    userName,
    userEmail,
    userPhoto,
    userDepartment,
    attemptNumber,
    status: 'submitted',
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    xpAwardedAt: null,
    ...fields,
  };

  const result = await db.insert('TaskSubmissions', submission);
  await updateTask(taskId, { totalSubmissions: task.totalSubmissions + 1 });
  return result;
}

export async function getUserSubmissions(userId) {
  const all = await db.find('TaskSubmissions');
  return all.filter(s => s.userId === userId).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export async function getSubmission(id) {
  return await db.findOne('TaskSubmissions', { id });
}

export async function getTaskSubmissions(taskId) {
  const all = await db.find('TaskSubmissions');
  return all.filter(s => s.taskId === taskId).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export async function getPendingReviews() {
  const all = await db.find('TaskSubmissions');
  return all.filter(s => s.status === 'submitted' || s.status === 'under_review').sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
}

export async function updateSubmissionStatus(id, status) {
  return await db.update('TaskSubmissions', id, { status, reviewedAt: status === 'under_review' ? new Date().toISOString() : undefined });
}

function calculateEarlyBonus(submittedAt, dueDate, dueTime, maxEarlyBonusXP, earlySubmissionDays) {
  if (!maxEarlyBonusXP || !earlySubmissionDays) return 0;
  const due = new Date(dueDate + 'T' + (dueTime || '23:59'));
  const sub = new Date(submittedAt);
  const daysEarly = (due - sub) / (1000 * 60 * 60 * 24);
  if (daysEarly <= 0) return 0;
  return Math.round(maxEarlyBonusXP * Math.min(daysEarly / earlySubmissionDays, 1));
}

export async function reviewSubmission(submissionId, reviewerId, reviewerName, scores, feedback, approve) {
  const submission = await getSubmission(submissionId);
  if (!submission) throw new Error('Submission not found');

  const task = await getTask(submission.taskId);
  if (!task) throw new Error('Task not found');

  const finalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const baseXPEarned = Math.round((finalScore / 100) * task.xpReward);
  const earlyBonusXP = calculateEarlyBonus(
    submission.submittedAt, task.dueDate, task.dueTime,
    task.maxEarlyBonusXP, task.earlySubmissionDays
  );
  const totalXPEarned = baseXPEarned + earlyBonusXP;

  let badgeEarned = null;
  if (finalScore >= 90 && task.badgeReward) {
    badgeEarned = {
      id: task.badgeIsCustom ? `custom_${task.id}` : task.badgeReward,
      name: task.badgeReward,
      icon: task.badgeIsCustom ? '⭐' : (SYSTEM_BADGES.find(b => b.id === task.badgeReward)?.icon || '⭐'),
      color: task.badgeIsCustom ? '#ffd700' : (SYSTEM_BADGES.find(b => b.id === task.badgeReward)?.color || '#ffd700'),
      earnedAt: new Date().toISOString(),
      custom: task.badgeIsCustom || false,
    };
  }

  const review = {
    submissionId,
    taskId: submission.taskId,
    taskTitle: submission.taskTitle,
    userId: submission.userId,
    reviewerId,
    reviewerName,
    scores,
    finalScore,
    maxScore: 100,
    xpEarned: totalXPEarned,
    earlyBonusXP,
    badgeEarned: badgeEarned?.id || null,
    feedback,
    reviewedAt: new Date().toISOString(),
  };

  const newStatus = approve ? 'approved' : 'rejected';
  await db.update('TaskSubmissions', submissionId, {
    status: newStatus,
    reviewedAt: new Date().toISOString(),
    xpAwardedAt: approve ? new Date().toISOString() : null,
  });

  const savedReview = await db.insert('TaskReviews', review);

  if (approve) {
    await awardXP(submission.userId, totalXPEarned, submission.id, submission.taskTitle);
    if (badgeEarned) {
      await grantBadge(submission.userId, badgeEarned, task.id);
    }
    await updateStreak(submission.userId);
  }

  return savedReview;
}

export async function awardXP(userId, xpAmount, submissionId, taskTitle) {
  const user = await db.findOne('Users', { id: userId });
  if (!user) return;

  const newXP = (user.xp || 0) + xpAmount;
  const newLevel = calculateLevel(newXP);
  const oldLevel = calculateLevel(user.xp || 0);

  await db.update('Users', userId, { xp: newXP });

  await db.insert('TaskXPHistory', {
    userId,
    userName: user.name,
    submissionId,
    taskTitle,
    xpAmount,
    source: 'task_review',
    timestamp: new Date().toISOString(),
  });

  if (newLevel > oldLevel) {
    await db.insert('Notifications', {
      userId,
      title: 'Level Up!',
      message: `Congratulations! You've reached Level ${newLevel}`,
      read: false,
      type: 'level_up',
      createdAt: new Date().toISOString(),
    });
  }
}

export async function grantBadge(userId, badge, taskId) {
  const user = await db.findOne('Users', { id: userId });
  if (!user) return;

  const existingBadges = user.taskBadges || [];
  const alreadyHas = existingBadges.some(b => {
    if (badge.custom) return b.name === badge.name;
    return b.id === badge.id;
  });
  if (alreadyHas) return;

  existingBadges.push(badge);
  await db.update('Users', userId, { taskBadges: existingBadges });

  await db.insert('Notifications', {
    userId,
    title: 'Badge Earned!',
    message: `You earned the "${badge.name}" badge!`,
    read: false,
    type: 'badge_earned',
    createdAt: new Date().toISOString(),
  });
}

export async function updateStreak(userId) {
  const user = await db.findOne('Users', { id: userId });
  if (!user) return;

  const now = new Date();
  const lastActivity = user.lastTaskActivity ? new Date(user.lastTaskActivity) : null;
  let streak = user.taskStreak || 0;

  if (lastActivity) {
    const weeksDiff = Math.floor((now - lastActivity) / (7 * 24 * 60 * 60 * 1000));
    if (weeksDiff === 0) return;
    if (weeksDiff === 1) {
      streak += 1;
    } else {
      streak = 1;
    }
  } else {
    streak = 1;
  }

  await db.update('Users', userId, {
    taskStreak: streak,
    lastTaskActivity: now.toISOString(),
  });
}

export async function getTaskLeaderboard() {
  const reviews = await db.find('TaskReviews');
  const users = await db.find('Users');
  const badges = SYSTEM_BADGES;

  const approvedReviews = reviews.filter(r => r.xpEarned > 0);
  const scoresByUser = {};

  for (const review of approvedReviews) {
    if (!scoresByUser[review.userId]) {
      scoresByUser[review.userId] = {
        totalXP: 0,
        totalEarlyBonus: 0,
        scores: [],
        tasksCompleted: 0,
      };
    }
    scoresByUser[review.userId].totalXP += review.xpEarned;
    scoresByUser[review.userId].totalEarlyBonus += review.earlyBonusXP || 0;
    scoresByUser[review.userId].scores.push(review.finalScore);
    scoresByUser[review.userId].tasksCompleted += 1;
  }

  const leaderboard = Object.entries(scoresByUser).map(([userId, data]) => {
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    const userBadges = user.taskBadges || [];
    const badgeBonus = userBadges.length * BADGE_BONUS_XP;
    const avgScore = data.scores.length > 0
      ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
      : 0;

    return {
      userId,
      name: user.name || 'Unknown',
      photo: user.photo || '',
      department: user.department || '',
      totalXP: data.totalXP,
      earlyBonusXP: data.totalEarlyBonus,
      badgeBonus,
      overallScore: data.totalXP + badgeBonus,
      avgScore,
      tasksCompleted: data.tasksCompleted,
      streak: user.taskStreak || 0,
      level: calculateLevel(data.totalXP),
      badges: userBadges,
    };
  }).filter(Boolean);

  leaderboard.sort((a, b) => {
    if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
    if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
    return b.tasksCompleted - a.tasksCompleted;
  });

  return leaderboard.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

export async function getUserRank(userId) {
  const leaderboard = await getTaskLeaderboard();
  const entry = leaderboard.find(e => e.userId === userId);
  return entry || null;
}

export async function getTaskAnalytics() {
  const tasks = await db.find('Tasks');
  const submissions = await db.find('TaskSubmissions');
  const reviews = await db.find('TaskReviews');
  const users = await db.find('Users');
  const xpHistory = await db.find('TaskXPHistory');

  const openTasks = tasks.filter(t => t.status === 'open').length;
  const closedTasks = tasks.filter(t => t.status === 'closed' || t.status === 'completed').length;
  const totalSubmissions = submissions.length;
  const pendingReviews = submissions.filter(s => s.status === 'submitted' || s.status === 'under_review').length;

  const approvedReviews = reviews.filter(r => r.finalScore >= 0);
  const avgScore = approvedReviews.length > 0
    ? Math.round(approvedReviews.reduce((sum, r) => sum + r.finalScore, 0) / approvedReviews.length)
    : 0;

  const approvedCount = submissions.filter(s => s.status === 'approved').length;
  const completionRate = totalSubmissions > 0 ? Math.round((approvedCount / totalSubmissions) * 100) : 0;

  const deptPerformance = {};
  for (const sub of submissions) {
    if (sub.status !== 'approved') continue;
    const review = reviews.find(r => r.submissionId === sub.id);
    if (!review) continue;
    const dept = sub.userDepartment || 'Unknown';
    if (!deptPerformance[dept]) deptPerformance[dept] = { count: 0, totalScore: 0 };
    deptPerformance[dept].count += 1;
    deptPerformance[dept].totalScore += review.finalScore;
  }
  const departmentPerformance = Object.entries(deptPerformance).map(([dept, data]) => ({
    department: dept,
    submissions: data.count,
    avgScore: Math.round(data.totalScore / data.count),
  })).sort((a, b) => b.avgScore - a.avgScore);

  const topContributors = await getTaskLeaderboard();

  const totalXPAwarded = xpHistory.reduce((sum, h) => sum + h.xpAmount, 0);

  return {
    openTasks,
    closedTasks,
    totalSubmissions,
    pendingReviews,
    avgScore,
    completionRate,
    departmentPerformance,
    topContributors: topContributors.slice(0, 10),
    totalXPAwarded,
    totalUsers: users.length,
  };
}

export async function duplicateTask(taskId) {
  const task = await getTask(taskId);
  if (!task) throw new Error('Task not found');

  const { id, createdAt, updatedAt, totalSubmissions, ...taskData } = task;
  return await createTask({
    ...taskData,
    title: `${task.title} (Copy)`,
    status: 'draft',
  });
}

export function subscribeToTask(taskId, callback) {
  return db.subscribe('Tasks', callback, taskId);
}

export function subscribeToUserSubmissions(userId, callback) {
  return db.subscribeQuery('TaskSubmissions', 'userId', '==', userId, callback);
}

export function subscribeToTaskSubmissions(taskId, callback) {
  return db.subscribeQuery('TaskSubmissions', 'taskId', '==', taskId, callback);
}

export function subscribeToSubmission(taskId, userId, callback) {
  return db.subscribeQuery('TaskSubmissions', 'taskId', '==', taskId, (all) => {
    const userSub = all.find(s => s.userId === userId) || null;
    callback(userSub, all);
  });
}

export async function getUserDashboard(userId) {
  const tasks = await db.find('Tasks');
  const submissions = await db.find('TaskSubmissions');
  const reviews = await db.find('TaskReviews');
  const userSubs = submissions.filter(s => s.userId === userId).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const activeTasks = tasks.filter(t => t.status === 'open');
  const upcomingDeadlines = tasks
    .filter(t => t.status === 'open' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const userReviews = reviews.filter(r => r.userId === userId);
  const recentFeedback = userReviews
    .sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt))
    .slice(0, 5)
    .map(r => ({
      taskTitle: r.taskTitle,
      finalScore: r.finalScore,
      feedback: r.feedback,
      reviewedAt: r.reviewedAt,
    }));

  const user = await db.findOne('Users', { id: userId });
  const rankEntry = await getUserRank(userId);

  return {
    activeTasks: activeTasks.length,
    upcomingDeadlines,
    xp: user?.xp || 0,
    level: calculateLevel(user?.xp || 0),
    rank: rankEntry?.rank || null,
    badges: user?.taskBadges || [],
    streak: user?.taskStreak || 0,
    recentFeedback,
    submissionHistory: userSubs.slice(0, 10).map(s => ({
      id: s.id,
      taskTitle: s.taskTitle,
      status: s.status,
      submittedAt: s.submittedAt,
    })),
  };
}
