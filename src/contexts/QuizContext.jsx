import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

const QuizContext = createContext();

const initialState = {
  phase: 'confirm',
  quiz: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  lockedQuestions: [],
  result: null,
  startedAt: null,
  timeRemaining: 0,
  questionTimeRemaining: 0,
  submittedAt: null,
};

function quizReducer(state, action) {
  switch (action.type) {
    case 'INIT_QUIZ':
      return {
        ...initialState,
        phase: 'confirm',
        quiz: action.quiz,
        questions: action.questions,
        timeRemaining: action.overallTime,
        questionTimeRemaining: action.timePerQuestion,
      };

    case 'START':
      return { ...state, phase: 'active', startedAt: action.now || new Date().toISOString() };

    case 'SET_PHASE':
      return { ...state, phase: action.phase };

    case 'ANSWER_QUESTION':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answer },
      };

    case 'LOCK_QUESTION':
      if (state.lockedQuestions.includes(action.questionId)) return state;
      return {
        ...state,
        lockedQuestions: [...state.lockedQuestions, action.questionId],
      };

    case 'GO_TO_QUESTION':
      return { ...state, currentIndex: Math.min(action.index, state.questions.length - 1) };

    case 'UPDATE_TIMER':
      return { ...state, timeRemaining: action.timeRemaining };

    case 'UPDATE_QUESTION_TIMER':
      return { ...state, questionTimeRemaining: action.timeRemaining };

    case 'SET_RESULT':
      return { ...state, result: action.result, phase: 'submitting' };

    case 'SET_SUBMITTED':
      return { ...state, phase: 'result', submittedAt: action.now || new Date().toISOString() };

    case 'RESET':
      return { ...initialState };

    case 'RESUME_SESSION':
      return {
        ...state,
        currentIndex: action.data.currentIndex || 0,
        answers: action.data.answers || {},
        lockedQuestions: action.data.lockedQuestions || [],
        timeRemaining: action.data.timeRemaining || state.timeRemaining,
        questionTimeRemaining: action.data.questionTimeRemaining || state.questionTimeRemaining,
        startedAt: action.data.startedAt || state.startedAt,
      };

    default:
      return state;
  }
}

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const initQuiz = useCallback((quiz, questions, overallTime, timePerQuestion) => {
    dispatch({ type: 'INIT_QUIZ', quiz, questions, overallTime, timePerQuestion });
  }, []);

  const startQuiz = useCallback(() => {
    dispatch({ type: 'START', now: new Date().toISOString() });
  }, []);

  const setPhase = useCallback((phase) => {
    dispatch({ type: 'SET_PHASE', phase });
  }, []);

  const answerQuestion = useCallback((questionId, answer) => {
    dispatch({ type: 'ANSWER_QUESTION', questionId, answer });
  }, []);

  const lockQuestion = useCallback((questionId) => {
    dispatch({ type: 'LOCK_QUESTION', questionId });
  }, []);

  const goToQuestion = useCallback((index) => {
    dispatch({ type: 'GO_TO_QUESTION', index });
  }, []);

  const updateTimer = useCallback((timeRemaining) => {
    dispatch({ type: 'UPDATE_TIMER', timeRemaining });
  }, []);

  const updateQuestionTimer = useCallback((timeRemaining) => {
    dispatch({ type: 'UPDATE_QUESTION_TIMER', timeRemaining });
  }, []);

  const setResult = useCallback((result) => {
    dispatch({ type: 'SET_RESULT', result });
  }, []);

  const setSubmitted = useCallback(() => {
    dispatch({ type: 'SET_SUBMITTED', now: new Date().toISOString() });
  }, []);

  const resetQuiz = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const resumeSession = useCallback((data) => {
    dispatch({ type: 'RESUME_SESSION', data });
  }, []);

  const getQuestionStatus = useCallback((qId, index) => {
    const isLocked = state.lockedQuestions.includes(qId);
    const hasAnswer = state.answers[qId] !== undefined && state.answers[qId] !== null && state.answers[qId] !== '';

    if (isLocked) return 'locked';
    if (index === state.currentIndex) return 'current';
    if (hasAnswer) return 'answered';
    if (index < state.currentIndex) return 'skipped';
    return 'unanswered';
  }, [state.lockedQuestions, state.answers, state.currentIndex]);

  const answeredCount = useMemo(
    () => state.questions.filter((q) => {
      const ans = state.answers[q.id];
      return ans !== undefined && ans !== null && ans !== '';
    }).length,
    [state.questions, state.answers]
  );

  const lockedCount = useMemo(() => state.lockedQuestions.length, [state.lockedQuestions]);
  const totalCount = state.questions.length;
  const remainingCount = totalCount - answeredCount - lockedCount;

  const value = useMemo(() => ({
    ...state,
    answeredCount,
    lockedCount,
    remainingCount,
    totalCount,
    initQuiz,
    startQuiz,
    setPhase,
    answerQuestion,
    lockQuestion,
    goToQuestion,
    updateTimer,
    updateQuestionTimer,
    setResult,
    setSubmitted,
    resetQuiz,
    resumeSession,
    getQuestionStatus,
  }), [state, answeredCount, lockedCount, remainingCount, totalCount, initQuiz, startQuiz, setPhase, answerQuestion, lockQuestion, goToQuestion, updateTimer, updateQuestionTimer, setResult, setSubmitted, resetQuiz, resumeSession, getQuestionStatus]);

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider');
  return ctx;
}
