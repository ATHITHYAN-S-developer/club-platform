export const QUIZ_CONFIG = {
  DEFAULT_TIME_PER_QUESTION: 30,
  MIN_TIME_PER_QUESTION: 5,
  MAX_TIME_PER_QUESTION: 600,
  DEFAULT_PASS_PERCENTAGE: 40,
  DEFAULT_MAX_ATTEMPTS: 1,
  MAX_QUESTIONS: 100,
  MIN_QUESTIONS: 1,
};

export const QUIZ_PHASES = {
  CONFIRM: 'confirm',
  FULLSCREEN: 'fullscreen',
  ACTIVE: 'active',
  SUBMITTING: 'submitting',
  RESULT: 'result',
};

export const QUESTION_STATUS = {
  UNANSWERED: 'unanswered',
  ANSWERED: 'answered',
  CURRENT: 'current',
  LOCKED: 'locked',
  REVIEW: 'review',
  SKIPPED: 'skipped',
};
