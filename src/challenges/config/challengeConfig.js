export const LANGUAGES = [
  { id: 'c', name: 'C', version: 'C11', monaco: 'c', judge0: 50 },
  { id: 'cpp', name: 'C++', version: 'C++17', monaco: 'cpp', judge0: 54 },
  { id: 'java', name: 'Java', version: '21', monaco: 'java', judge0: 62 },
  { id: 'python', name: 'Python', version: '3.12', monaco: 'python', judge0: 71 },
  { id: 'javascript', name: 'JavaScript', version: 'Node 18', monaco: 'javascript', judge0: 63 },
  { id: 'typescript', name: 'TypeScript', version: '5.3', monaco: 'typescript', judge0: 74 },
  { id: 'go', name: 'Go', version: '1.21', monaco: 'go', judge0: 60 },
  { id: 'rust', name: 'Rust', version: '1.75', monaco: 'rust', judge0: 73 },
  { id: 'php', name: 'PHP', version: '8.3', monaco: 'php', judge0: 68 },
  { id: 'csharp', name: 'C#', version: '12', monaco: 'csharp', judge0: 51 },
  { id: 'kotlin', name: 'Kotlin', version: '1.9', monaco: 'kotlin', judge0: 78 },
  { id: 'swift', name: 'Swift', version: '5.9', monaco: 'swift', judge0: 83 },
];

export const DIFFICULTY = {
  easy: { label: 'Easy', color: '#10b981', bg: '#d1fae5', timeLimit: 10, baseXp: 100 },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fef3c7', timeLimit: 20, baseXp: 250 },
  hard: { label: 'Hard', color: '#ef4444', bg: '#fee2e2', timeLimit: 30, baseXp: 500 },
};

export const CHALLENGE_TYPES = {
  coding: { label: 'Coding Challenge', icon: 'fa-code', needsEditor: true },
  github: { label: 'GitHub Project', icon: 'fa-github', needsEditor: false },
  upload: { label: 'File Upload', icon: 'fa-upload', needsEditor: false },
  design: { label: 'UI/UX Design', icon: 'fa-palette', needsEditor: false },
};

export const DIFFICULTIES = ['easy', 'medium', 'hard'];

export const LEVELS = [
  { name: 'Beginner', minXp: 0, icon: '🌱' },
  { name: 'Explorer', minXp: 500, icon: '🔍' },
  { name: 'Solver', minXp: 1500, icon: '⚡' },
  { name: 'Expert', minXp: 4000, icon: '🧠' },
  { name: 'Master', minXp: 10000, icon: '👑' },
  { name: 'Grandmaster', minXp: 25000, icon: '🏆' },
];

export function calculateLevel(xp) {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXp) level = l;
  }
  return level;
}

export const BADGE_DEFINITIONS = [
  { id: 'first_challenge', name: 'First Challenge', icon: '🎯', desc: 'Complete your first coding challenge', xpBonus: 50 },
  { id: 'streak_7', name: '7-Day Streak', icon: '🔥', desc: 'Complete challenges 7 days in a row', xpBonus: 100 },
  { id: 'streak_30', name: '30-Day Streak', icon: '💪', desc: 'Complete challenges 30 days in a row', xpBonus: 300 },
  { id: 'streak_100', name: '100-Day Streak', icon: '⚡', desc: 'Complete challenges 100 days in a row', xpBonus: 1000 },
  { id: 'streak_365', name: 'Legend Streak', icon: '👑', desc: 'Complete challenges 365 days in a row', xpBonus: 5000 },
  { id: 'fast_solver', name: 'Fast Solver', icon: '🚀', desc: 'Solve 3 challenges in under 5 minutes each', xpBonus: 200 },
  { id: 'perfect_score', name: 'Perfect Score', icon: '💎', desc: '100% accuracy on a hard challenge', xpBonus: 250 },
  { id: 'top_10', name: 'Top 10', icon: '🏅', desc: 'Reach top 10 on the leaderboard', xpBonus: 500 },
  { id: 'first_attempt', name: 'First Try', icon: '🎯', desc: 'Solve a challenge on your first attempt', xpBonus: 75 },
];

export const SCORING = {
  accuracyWeight: 0.70,
  speedWeight: 0.30,
  maxScore: 1000,
  maxAccuracy: 700,
  maxSpeed: 300,
  bonuses: {
    firstCorrect: 100,
    firstAttempt: 50,
    noCompileErrors: 25,
    perfectSolution: 50,
    maxTotal: 225,
  },
  penalties: {
    wrongSubmission: 5,
    compileError: 10,
    maxTotal: 100,
  },
};

export const DEFAULT_SECURITY = {
  exam: {
    fullscreenRequired: true,
    tabSwitchDetection: true,
    windowBlurDetection: true,
    minimizeDetection: true,
    disableRefreshWarning: true,
    disablePrint: true,
    disableSave: true,
  },
  keyboard: {
    disableCopy: true,
    disablePaste: true,
    disableCut: true,
    disableSelectAll: true,
    disableRightClick: true,
    disableDragDrop: true,
    disableTextSelection: true,
  },
  devtools: {
    detectDevTools: true,
    detectConsole: true,
    detectViewSource: true,
    detectDebugger: true,
  },
  submission: {
    autoSubmitOnFullscreenExit: true,
    autoSubmitAfterViolationLimit: true,
    autoSubmitOnTimerEnd: true,
    autoSaveInterval: 10,
    warnBeforeAutoSubmission: true,
  },
  violations: {
    maxViolations: 3,
    warnings: {
      first: 'Warning 1',
      second: 'Warning 2',
      third: 'Final Warning',
      submit: 'Auto Submit',
    },
  },
  idleDetection: {
    enabled: false,
    timeoutMinutes: 5,
    autoSubmitAfterMinutes: 10,
  },
};

export const SECURITY_PRESETS = {
  openPractice: {
    label: 'Open Practice',
    desc: 'Minimal restrictions for practice sessions',
    level: 'basic',
    config: {
      exam: {
        fullscreenRequired: false, tabSwitchDetection: false, windowBlurDetection: false,
        minimizeDetection: false, disableRefreshWarning: false, disablePrint: false, disableSave: false,
      },
      keyboard: {
        disableCopy: false, disablePaste: false, disableCut: false, disableSelectAll: false,
        disableRightClick: false, disableDragDrop: false, disableTextSelection: false,
      },
      devtools: {
        detectDevTools: false, detectConsole: false, detectViewSource: false, detectDebugger: false,
      },
      submission: {
        autoSubmitOnFullscreenExit: false, autoSubmitAfterViolationLimit: false, autoSubmitOnTimerEnd: true,
        autoSaveInterval: 10, warnBeforeAutoSubmission: false,
      },
      violations: { maxViolations: 5, warnings: { first: 'Warning 1', second: 'Warning 2', third: 'Final Warning', submit: 'Auto Submit' } },
      idleDetection: { enabled: false, timeoutMinutes: 10, autoSubmitAfterMinutes: 20 },
    },
  },
  interviewMode: {
    label: 'Interview Mode',
    desc: 'Standard proctoring for technical interviews',
    level: 'standard',
    config: {
      exam: {
        fullscreenRequired: true, tabSwitchDetection: true, windowBlurDetection: true,
        minimizeDetection: true, disableRefreshWarning: true, disablePrint: true, disableSave: true,
      },
      keyboard: {
        disableCopy: true, disablePaste: true, disableCut: true, disableSelectAll: true,
        disableRightClick: true, disableDragDrop: true, disableTextSelection: true,
      },
      devtools: {
        detectDevTools: true, detectConsole: true, detectViewSource: true, detectDebugger: true,
      },
      submission: {
        autoSubmitOnFullscreenExit: true, autoSubmitAfterViolationLimit: true, autoSubmitOnTimerEnd: true,
        autoSaveInterval: 10, warnBeforeAutoSubmission: true,
      },
      violations: { maxViolations: 3, warnings: { first: 'Warning 1', second: 'Warning 2', third: 'Final Warning', submit: 'Auto Submit' } },
      idleDetection: { enabled: false, timeoutMinutes: 5, autoSubmitAfterMinutes: 10 },
    },
  },
  collegeExam: {
    label: 'College Exam',
    desc: 'Strict proctoring for high-stakes exams',
    level: 'strict',
    config: {
      exam: {
        fullscreenRequired: true, tabSwitchDetection: true, windowBlurDetection: true,
        minimizeDetection: true, disableRefreshWarning: true, disablePrint: true, disableSave: true,
      },
      keyboard: {
        disableCopy: true, disablePaste: true, disableCut: true, disableSelectAll: true,
        disableRightClick: true, disableDragDrop: true, disableTextSelection: true,
      },
      devtools: {
        detectDevTools: true, detectConsole: true, detectViewSource: true, detectDebugger: true,
      },
      submission: {
        autoSubmitOnFullscreenExit: true, autoSubmitAfterViolationLimit: true, autoSubmitOnTimerEnd: true,
        autoSaveInterval: 5, warnBeforeAutoSubmission: true,
      },
      violations: { maxViolations: 2, warnings: { first: 'Warning 1', second: 'Final Warning', third: 'Auto Submit', submit: 'Auto Submit' } },
      idleDetection: { enabled: true, timeoutMinutes: 3, autoSubmitAfterMinutes: 5 },
    },
  },
  strictAssessment: {
    label: 'Strict Assessment',
    desc: 'Maximum security for certification exams',
    level: 'strict',
    config: {
      exam: {
        fullscreenRequired: true, tabSwitchDetection: true, windowBlurDetection: true,
        minimizeDetection: true, disableRefreshWarning: true, disablePrint: true, disableSave: true,
      },
      keyboard: {
        disableCopy: true, disablePaste: true, disableCut: true, disableSelectAll: true,
        disableRightClick: true, disableDragDrop: true, disableTextSelection: true,
      },
      devtools: {
        detectDevTools: true, detectConsole: true, detectViewSource: true, detectDebugger: true,
      },
      submission: {
        autoSubmitOnFullscreenExit: true, autoSubmitAfterViolationLimit: true, autoSubmitOnTimerEnd: true,
        autoSaveInterval: 5, warnBeforeAutoSubmission: true,
      },
      violations: { maxViolations: 2, warnings: { first: 'Warning 1', second: 'Auto Submit', third: 'Auto Submit', submit: 'Auto Submit' } },
      idleDetection: { enabled: true, timeoutMinutes: 3, autoSubmitAfterMinutes: 5 },
    },
  },
  enterpriseProctoring: {
    label: 'Enterprise Proctoring',
    desc: 'Full lockdown for enterprise certifications',
    level: 'enterprise',
    config: {
      exam: {
        fullscreenRequired: true, tabSwitchDetection: true, windowBlurDetection: true,
        minimizeDetection: true, disableRefreshWarning: true, disablePrint: true, disableSave: true,
      },
      keyboard: {
        disableCopy: true, disablePaste: true, disableCut: true, disableSelectAll: true,
        disableRightClick: true, disableDragDrop: true, disableTextSelection: true,
      },
      devtools: {
        detectDevTools: true, detectConsole: true, detectViewSource: true, detectDebugger: true,
      },
      submission: {
        autoSubmitOnFullscreenExit: true, autoSubmitAfterViolationLimit: true, autoSubmitOnTimerEnd: true,
        autoSaveInterval: 3, warnBeforeAutoSubmission: true,
      },
      violations: { maxViolations: 1, warnings: { first: 'Auto Submit', second: 'Auto Submit', third: 'Auto Submit', submit: 'Auto Submit' } },
      idleDetection: { enabled: true, timeoutMinutes: 2, autoSubmitAfterMinutes: 3 },
    },
  },
};

export function getSecurityLevel(config) {
  if (!config) return { label: 'Basic', color: '#10b981', icon: '🟢' };
  const { exam, keyboard, devtools, submission, violations } = config;
  const countEnabled = (obj) => obj ? Object.values(obj).filter(v => v === true).length : 0;
  const score = countEnabled(exam) + countEnabled(keyboard) + countEnabled(devtools) +
    countEnabled(submission) + (violations?.maxViolations <= 2 ? 2 : violations?.maxViolations <= 3 ? 1 : 0) +
    (config.idleDetection?.enabled ? 2 : 0);
  if (score >= 25) return { label: 'Enterprise', color: '#7c3aed', icon: '🔒' };
  if (score >= 18) return { label: 'Strict', color: '#dc2626', icon: '🔴' };
  if (score >= 10) return { label: 'Standard', color: '#f59e0b', icon: '🟡' };
  return { label: 'Basic', color: '#10b981', icon: '🟢' };
}
