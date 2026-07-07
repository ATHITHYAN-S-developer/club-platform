export function calcScore(answers, questions) {
  let score = 0;
  let total = 0;
  let correct = 0;
  let wrong = 0;
  let skipped = 0;

  questions.forEach((q) => {
    const marks = q.marks || 1;
    const negative = q.negativeMarks || 0;
    total += marks;
    const answer = answers[q.id];

    if (answer === undefined || answer === null || answer === '') {
      skipped++;
      return;
    }

    const isCorrect = checkAnswer(q, answer);
    if (isCorrect) {
      score += marks;
      correct++;
    } else {
      score -= negative;
      wrong++;
    }
  });

  const percentage = total > 0 ? Math.round((Math.max(0, score) / total) * 100) : 0;

  return {
    score: Math.max(0, score),
    total,
    percentage,
    correct,
    wrong,
    skipped,
  };
}

function checkAnswer(question, answer) {
  if (!question.options) {
    return String(answer).trim().toLowerCase() === String(question.correctAnswer || '').trim().toLowerCase();
  }

  if (question.type === 'multiple-select') {
    if (!Array.isArray(answer)) return false;
    const correctIds = question.options.filter((o) => o.isCorrect).map((o) => o.id).sort();
    const selectedIds = [...answer].sort();
    return correctIds.length === selectedIds.length && correctIds.every((id, i) => id === selectedIds[i]);
  }

  const selected = question.options.find((o) => o.id === answer);
  return selected ? selected.isCorrect : false;
}
