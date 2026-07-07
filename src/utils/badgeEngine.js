export function computeBadge(percentage, badgeRules) {
  if (!badgeRules || badgeRules.length === 0) return null;

  const sorted = [...badgeRules].sort((a, b) => b.minScore - a.minScore);

  for (const rule of sorted) {
    if (percentage >= rule.minScore && percentage <= rule.maxScore) {
      return {
        id: rule.id || rule.name?.toLowerCase().replace(/\s+/g, '_'),
        name: rule.name,
        icon: rule.icon || 'fa-medal',
        color: rule.color,
        rewardPoints: rule.rewardPoints || 0,
        description: rule.description || '',
      };
    }
  }

  return null;
}
