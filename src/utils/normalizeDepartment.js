// Canonical department names used across the application
export const DEPARTMENTS = [
  'CSE',
  'CSE (AI & ML)',
  'AI & DS',
  'IT',
  'ECE',
  'EEE',
  'Mechanical',
  'Civil',
  'CSBS',
  'MCA',
  'MBA',
  'Other'
];

// Mapping of common variations to canonical names (lowercase keys)
const ALIAS_MAP = {
  'cse': 'CSE',
  'computer science': 'CSE',
  'computer science engineering': 'CSE',
  'computer science & engineering': 'CSE',
  'computer science and engineering': 'CSE',
  'c.s.e': 'CSE',
  'c. s. e': 'CSE',
  'cse ai ml': 'CSE (AI & ML)',
  'cse (ai & ml)': 'CSE (AI & ML)',
  'cse ai&ml': 'CSE (AI & ML)',
  'ai & ml': 'CSE (AI & ML)',
  'artificial intelligence and machine learning': 'CSE (AI & ML)',
  'ai and ml': 'CSE (AI & ML)',
  'ai&ml': 'CSE (AI & ML)',
  'ai ml': 'CSE (AI & ML)',

  'ai & ds': 'AI & DS',
  'ai&ds': 'AI & DS',
  'aids': 'AI & DS',
  'ai ds': 'AI & DS',
  'artificial intelligence and data science': 'AI & DS',
  'artificial intelligence & data science': 'AI & DS',
  'ai and ds': 'AI & DS',
  'artificial intelligence': 'AI & DS',

  'it': 'IT',
  'information technology': 'IT',
  'info tech': 'IT',

  'ece': 'ECE',
  'electronics and communication': 'ECE',
  'electronics & communication': 'ECE',
  'electronics and communication engineering': 'ECE',
  'e.c.e': 'ECE',
  'e & c': 'ECE',

  'eee': 'EEE',
  'electrical and electronics': 'EEE',
  'electrical & electronics': 'EEE',
  'electrical and electronics engineering': 'EEE',
  'e.e.e': 'EEE',

  'mechanical': 'Mechanical',
  'mech': 'Mechanical',
  'mechanical engineering': 'Mechanical',

  'civil': 'Civil',
  'civil engineering': 'Civil',

  'csbs': 'CSBS',
  'computer science and business systems': 'CSBS',
  'computer science & business systems': 'CSBS',

  'mca': 'MCA',
  'master of computer applications': 'MCA',

  'mba': 'MBA',
  'master of business administration': 'MBA',
};

/**
 * Normalize a department string to its canonical form.
 * Returns 'Other' if no match is found.
 * 
 * Examples:
 *   normalizeDepartment('cse')              → 'CSE'
 *   normalizeDepartment('Computer Science') → 'CSE'
 *   normalizeDepartment('C.S.E.')           → 'CSE'
 *   normalizeDepartment('xyz')              → 'Other'
 *   normalizeDepartment('')                 → 'Other'
 *   normalizeDepartment(null)               → 'Other'
 */
export function normalizeDepartment(value) {
  if (!value || typeof value !== 'string') return 'Other';
  const trimmed = value.trim();
  if (!trimmed) return 'Other';
  const lower = trimmed.toLowerCase().replace(/[\s.]+/g, ' ').trim();
  if (ALIAS_MAP[lower]) return ALIAS_MAP[lower];
  // Fuzzy: strip all spaces/punctuation and try again
  const stripped = lower.replace(/[^a-z0-9]/g, '');
  for (const [alias, canonical] of Object.entries(ALIAS_MAP)) {
    if (alias.replace(/[^a-z0-9]/g, '') === stripped) return canonical;
  }
  // Exact match against canonical names (case-insensitive)
  const canonicalMatch = DEPARTMENTS.find(d => d.toLowerCase() === lower);
  if (canonicalMatch) return canonicalMatch;
  return 'Other';
}
