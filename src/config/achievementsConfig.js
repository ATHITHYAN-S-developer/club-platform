export const ACHIEVEMENTS = [
  {
    id: 'daily_streak_3',
    name: 'Daily Grind',
    icon: '🔥',
    color: '#ef4444',
    description: 'Complete submissions 3 days in a row',
    condition: (stats) => (stats.dailyStreak || 0) >= 3,
    xp: 25,
  },
  {
    id: 'daily_streak_7',
    name: 'Week Warrior',
    icon: '🔥',
    color: '#f97316',
    description: 'Complete submissions 7 days in a row',
    condition: (stats) => (stats.dailyStreak || 0) >= 7,
    xp: 75,
  },
  {
    id: 'weekly_streak_4',
    name: 'Monthly Regular',
    icon: '📅',
    color: '#8b5cf6',
    description: 'Maintain a weekly streak for 4 consecutive weeks',
    condition: (stats) => (stats.weeklyStreak || 0) >= 4,
    xp: 100,
  },
  {
    id: 'monthly_champion',
    name: 'Monthly Champion',
    icon: '👑',
    color: '#ffd700',
    description: 'Rank #1 in the monthly leaderboard',
    condition: (stats) => (stats.monthlyRank || 999) === 1,
    xp: 500,
  },
  {
    id: 'task_champion',
    name: 'Task Champion',
    icon: '🏆',
    color: '#ffd700',
    description: 'Complete 20 tasks successfully',
    condition: (stats) => (stats.completedTasks || 0) >= 20,
    xp: 300,
  },
  {
    id: 'innovation_award',
    name: 'Innovation Award',
    icon: '💡',
    color: '#f59e0b',
    description: 'Score ≥90 on an innovation task',
    condition: (stats) => (stats.innovationScore || 0) >= 90,
    xp: 150,
  },
  {
    id: 'coding_champion',
    name: 'Coding Champion',
    icon: '💻',
    color: '#6366f1',
    description: 'Score ≥90 on a coding task',
    condition: (stats) => (stats.codingScore || 0) >= 90,
    xp: 150,
  },
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    icon: '⭐',
    color: '#10b981',
    description: 'Score 100% on any task submission',
    condition: (stats) => (stats.perfectScores || 0) >= 1,
    xp: 200,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    icon: '🐦',
    color: '#06b6d4',
    description: 'Submit 3 tasks at least 2 days before deadline',
    condition: (stats) => (stats.earlySubmissions || 0) >= 3,
    xp: 100,
  },
  {
    id: 'jack_of_all_trades',
    name: 'Jack of All Trades',
    icon: '🛠️',
    color: '#ec4899',
    description: 'Submit tasks in 5 different categories',
    condition: (stats) => (stats.categoriesAttempted || 0) >= 5,
    xp: 250,
  },
];

export function checkAchievements(stats, existingAchievements = []) {
  const existingIds = new Set(existingAchievements.map((a) => a.id));
  return ACHIEVEMENTS.filter(
    (achievement) => !existingIds.has(achievement.id) && achievement.condition(stats)
  );
}
