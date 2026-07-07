export const QUIZ_CATEGORIES = [
  'Programming', 'CSS', 'JavaScript', 'Python', 'Data Structures',
  'Algorithms', 'Machine Learning', 'AI', 'Database', 'Networking',
  'Operating Systems', 'Web Development', 'Mobile Development',
  'Cloud Computing', 'Cyber Security', 'DevOps', 'General Knowledge',
];

export const QUIZ_DIFFICULTIES = ['easy', 'medium', 'hard'];

export const QUESTION_TYPES = [
  { id: 'mcq', label: 'Multiple Choice' },
  { id: 'multiple-select', label: 'Multiple Answer' },
  { id: 'true-false', label: 'True / False' },
  { id: 'image', label: 'Image Question' },
  { id: 'code', label: 'Code Snippet' },
  { id: 'short-answer', label: 'Short Answer' },
];

export const ATTEMPT_STATUS = {
  IN_PROGRIS: 'in-progress',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  AUTO_SUBMITTED: 'auto-submitted',
};

export const PALETTE_COLORS = {
  unvisited: '#e2e5ec',
  answered: '#ff5500',
  current: '#0f1117',
  review: '#eab308',
  skipped: '#ef4444',
  locked: '#6b7280',
};
