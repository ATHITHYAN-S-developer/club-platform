export const DEFAULT_BADGE_RULES = [
  { name: 'Bronze Quiz Master', minScore: 40, maxScore: 59, rewardPoints: 10, color: '#cd7f32', icon: 'fa-medal', description: 'Scored between 40-59%' },
  { name: 'Silver Quiz Master', minScore: 60, maxScore: 74, rewardPoints: 25, color: '#c0c0c0', icon: 'fa-medal', description: 'Scored between 60-74%' },
  { name: 'Gold Quiz Master', minScore: 75, maxScore: 89, rewardPoints: 50, color: '#ffd700', icon: 'fa-trophy', description: 'Scored between 75-89%' },
  { name: 'Diamond Quiz Master', minScore: 90, maxScore: 99, rewardPoints: 100, color: '#b9f2ff', icon: 'fa-gem', description: 'Scored between 90-99%' },
  { name: 'Legend', minScore: 100, maxScore: 100, rewardPoints: 200, color: '#ff4500', icon: 'fa-crown', description: 'Perfect score!' },
];

export const BADGE_COLORS = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  diamond: '#b9f2ff',
  legend: '#ff4500',
};
