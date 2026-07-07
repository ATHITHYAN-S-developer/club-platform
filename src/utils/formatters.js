export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function timeAgo(dateStr) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
}

export function calculateScore(questions, answers) {
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  let score = 0;
  let totalMarks = 0;

  questions.forEach((q) => {
    const marks = q.marks || 1;
    const negMarks = q.negativeMarks || 0;
    totalMarks += marks;
    const ans = answers[q.id];

    if (ans === undefined || ans === null || ans === '') {
      skipped++;
      return;
    }

    let isCorrect = false;
    if (q.type === 'multiple-select') {
      const selected = Array.isArray(ans) ? ans : [];
      const correctIds = q.options.filter(o => o.isCorrect).map(o => o.id);
      isCorrect = selected.length === correctIds.length && selected.every(id => correctIds.includes(id));
    } else if (q.type === 'short-answer' || q.type === 'fill-blank') {
      isCorrect = (ans || '').toLowerCase().trim() === (q.correctAnswer || '').toLowerCase().trim();
    } else {
      isCorrect = q.options?.find(o => o.id === ans)?.isCorrect || false;
    }

    if (isCorrect) {
      correct++;
      score += marks;
    } else {
      wrong++;
      score -= negMarks;
    }
  });

  return { correct, wrong, skipped, score: Math.max(0, score), totalMarks };
}

export function getStatusColor(status) {
  const map = {
    completed: '#22c55e',
    'auto-submitted': '#ef4444',
    expired: '#ef4444',
    'in-progress': '#f97316',
    published: '#22c55e',
    draft: '#6b7280',
    archived: '#6b7280',
  };
  return map[status] || '#6b7280';
}

export function downloadCSV(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => `"${(r[h] ?? '').toString().replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
