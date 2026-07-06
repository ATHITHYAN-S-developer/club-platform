const BADGES = [
  { id: 'perfect', label: 'Perfect Score', icon: 'fa-crown', desc: 'Scored 100% on a quiz', threshold: { scorePct: 100 } },
  { id: 'fast', label: 'Speed Demon', icon: 'fa-bolt', desc: 'Completed in under 30% of time limit', threshold: { timePct: 0.3 } },
  { id: 'streak', label: 'On Fire', icon: 'fa-fire', desc: 'Answered 5+ questions correctly in a row', threshold: { streak: 5 } },
  { id: 'accuracy', label: 'Sharpshooter', icon: 'fa-bullseye', desc: 'Achieved 90%+ accuracy', threshold: { accuracy: 90 } },
  { id: 'persistent', label: 'Never Give Up', icon: 'fa-shield', desc: 'Completed quiz despite violations', threshold: { violations: 1 } },
  { id: 'top10', label: 'Top 10', icon: 'fa-medal', desc: 'Finished in top 10 on leaderboard', threshold: { rank: 10 } },
  { id: 'comeback', label: 'Comeback King', icon: 'fa-rotate', desc: 'Got last 3 questions right after getting first 2 wrong', threshold: { comeback: true } },
  { id: 'scholar', label: 'Quiz Scholar', icon: 'fa-graduation-cap', desc: 'Completed 10+ quizzes', threshold: { quizzes: 10 } },
  { id: 'nightowl', label: 'Night Owl', icon: 'fa-moon', desc: 'Took a quiz past midnight', threshold: { nightOwl: true } },
  { id: 'first', label: 'First Attempt', icon: 'fa-star', desc: 'Passed on the first try', threshold: { firstTry: true } },
  { id: 'streak10', label: 'Unstoppable', icon: 'fa-rocket', desc: '10+ correct answers in a row', threshold: { streak: 10 } },
  { id: 'perfectTime', label: 'Efficient', icon: 'fa-clock', desc: 'Finished with more than half time remaining', threshold: { timeRemainingPct: 0.5 } },
];

export function computeBadges(result, userResults) {
  const earned = [];
  const pct = result.percentage || (result.score / result.total * 100);
  const timePct = result.totalTime ? result.timeTaken / result.totalTime : 1;

  if (pct === 100) earned.push(BADGES.find(b => b.id === 'perfect'));
  if (timePct <= 0.3) earned.push(BADGES.find(b => b.id === 'fast'));
  if (result.longestStreak >= 5) earned.push(BADGES.find(b => b.id === 'streak'));
  if (result.longestStreak >= 10) earned.push(BADGES.find(b => b.id === 'streak10'));
  if (result.accuracy >= 90) earned.push(BADGES.find(b => b.id === 'accuracy'));
  if ((result.violationCount || 0) > 0) earned.push(BADGES.find(b => b.id === 'persistent'));
  if (timePct <= 0.5) earned.push(BADGES.find(b => b.id === 'perfectTime'));
  if (result.rank && result.rank <= 10) earned.push(BADGES.find(b => b.id === 'top10'));
  if (result.firstTry) earned.push(BADGES.find(b => b.id === 'first'));

  const quizCount = userResults ? userResults.length : 0;
  if (quizCount >= 10) earned.push(BADGES.find(b => b.id === 'scholar'));

  const hour = result.submittedAt ? new Date(result.submittedAt).getHours() : 0;
  if (hour >= 0 && hour < 5) earned.push(BADGES.find(b => b.id === 'nightowl'));

  return earned.filter(Boolean);
}

export const QUIZ_CATEGORIES = [
  'Programming', 'CSS', 'JavaScript', 'Python', 'Data Structures',
  'Algorithms', 'Machine Learning', 'AI', 'Database', 'Networking',
  'Operating Systems', 'Web Development', 'Mobile Development',
  'Cloud Computing', 'Cyber Security', 'DevOps', 'General Knowledge',
];

export const QUIZ_DIFFICULTIES = ['easy', 'medium', 'hard'];

export default BADGES;
