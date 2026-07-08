import { SCORING } from '../config/challengeConfig';

export function calculateScore({ passedTests, totalTests, timeTaken, maxTime, isFirstCorrect, isFirstAttempt, hasCompilationError, wrongSubmissions }) {
  const { maxAccuracy, maxSpeed, bonuses, penalties } = SCORING;

  // 1. Accuracy Score (700 Points max)
  const accuracyScore = totalTests > 0 ? (passedTests / totalTests) * maxAccuracy : 0;

  // 2. Speed Score (300 Points max)
  const speedRatio = Math.max(0, (maxTime - timeTaken) / maxTime);
  const speedScore = speedRatio * maxSpeed;

  // 3. Bonuses (optional, capped)
  let bonusPoints = 0;
  if (isFirstCorrect) bonusPoints += bonuses.firstCorrect;
  if (isFirstAttempt) bonusPoints += bonuses.firstAttempt;
  if (!hasCompilationError) bonusPoints += bonuses.noCompileErrors;
  if (passedTests === totalTests) bonusPoints += bonuses.perfectSolution;
  bonusPoints = Math.min(bonusPoints, bonuses.maxTotal);

  // 4. Penalties (capped at maxTotal)
  let penaltyPoints = 0;
  if (hasCompilationError) penaltyPoints += penalties.compileError;
  penaltyPoints += (wrongSubmissions || 0) * penalties.wrongSubmission;
  penaltyPoints = Math.min(penaltyPoints, penalties.maxTotal);

  // 5. Final Score
  const finalScore = Math.max(0, Math.round(accuracyScore + speedScore + bonusPoints - penaltyPoints));

  return {
    accuracyScore: Math.round(accuracyScore),
    speedScore: Math.round(speedScore),
    bonusPoints,
    penaltyPoints,
    finalScore,
    details: {
      passedTests,
      totalTests,
      timeTaken,
      maxTime,
      accuracyPercent: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
      speedPercent: Math.round(speedRatio * 100),
    },
  };
}

export function formatScore(score) {
  return score?.toLocaleString() || '0';
}
