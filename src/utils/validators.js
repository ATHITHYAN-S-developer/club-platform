export function validateQuiz(form) {
  const errors = {};
  if (!form.title?.trim()) errors.title = 'Title is required';
  if (!form.questions?.length) errors.questions = 'At least one question is required';
  if (!form.timePerQuestion || form.timePerQuestion < 5) errors.timePerQuestion = 'Time per question must be at least 5 seconds';
  if (form.timePerQuestion > 600) errors.timePerQuestion = 'Time per question cannot exceed 600 seconds';

  form.questions?.forEach((q, i) => {
    if (!q.questionText?.trim()) errors[`q_${i}_text`] = 'Question text is required';
    if (['mcq', 'multiple-select', 'true-false', 'image', 'code'].includes(q.type)) {
      const opts = q.options || [];
      const filled = opts.filter(o => o.text?.trim());
      if (filled.length < 2) errors[`q_${i}_count`] = 'At least 2 options required';
      if (!opts.some(o => o.isCorrect)) errors[`q_${i}_correct`] = 'Select a correct answer';
    }
    if (q.marks < 0) errors[`q_${i}_marks`] = 'Marks cannot be negative';
  });
  return errors;
}

export function validateBulkUpload(questions) {
  const errors = [];
  questions.forEach((q, i) => {
    if (!q.questionText?.trim()) errors.push(`Row ${i + 1}: Question text is required`);
    if (q.type === 'mcq' || q.type === 'multiple-select') {
      if (!q.options?.length || q.options.length < 2) errors.push(`Row ${i + 1}: At least 2 options required`);
      if (!q.options?.some(o => o.isCorrect)) errors.push(`Row ${i + 1}: Select a correct answer`);
    }
  });
  return errors;
}
