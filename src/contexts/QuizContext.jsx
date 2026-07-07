import { createContext, useContext, useReducer, useCallback, useRef } from 'react';

const QuizContext = createContext();

const initialState = {
  phase: 'dashboard',
  quiz: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  markedForReview: [],
  flaggedQuestions: [],
  lockedQuestions: [],
  result: null,
  isSubmitting: false,
  violationCount: 0,
  shuffledQuestions: [],
};

function quizReducer(state, action) {
  switch (action.type) {
    case 'START_QUIZ':
      return {
        ...initialState,
        phase: 'confirm',
        quiz: action.payload.quiz,
        questions: action.payload.questions,
        shuffledQuestions: action.payload.shuffledQuestions,
      };

    case 'SET_PHASE':
      return { ...state, phase: action.payload };

    case 'GO_TO_QUESTION':
      return { ...state, currentIndex: action.payload };

    case 'ANSWER_QUESTION':
      return {
        ...state,
        answers: { ...state.answers, [action.payload.questionId]: action.payload.answer },
      };

    case 'TOGGLE_REVIEW':
      return {
        ...state,
        markedForReview: state.markedForReview.includes(action.payload)
          ? state.markedForReview.filter(id => id !== action.payload)
          : [...state.markedForReview, action.payload],
      };

    case 'TOGGLE_FLAG':
      return {
        ...state,
        flaggedQuestions: state.flaggedQuestions.includes(action.payload)
          ? state.flaggedQuestions.filter(id => id !== action.payload)
          : [...state.flaggedQuestions, action.payload],
      };

    case 'LOCK_QUESTION':
      return {
        ...state,
        lockedQuestions: state.lockedQuestions.includes(action.payload)
          ? state.lockedQuestions
          : [...state.lockedQuestions, action.payload],
      };

    case 'ADD_VIOLATION':
      return { ...state, violationCount: state.violationCount + 1 };

    case 'SET_RESULT':
      return { ...state, result: action.payload, phase: 'result' };

    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const submitRef = useRef(false);

  const startQuiz = useCallback((quiz) => {
    const qs = quiz.questions || [];
    const shuffled = quiz.shuffleQuestions
      ? [...qs].sort(() => Math.random() - 0.5)
      : qs;
    dispatch({ type: 'START_QUIZ', payload: { quiz, questions: qs, shuffledQuestions: shuffled } });
  }, []);

  const setPhase = useCallback((phase) => {
    dispatch({ type: 'SET_PHASE', payload: phase });
  }, []);

  const goToQuestion = useCallback((index) => {
    dispatch({ type: 'GO_TO_QUESTION', payload: index });
  }, []);

  const answerQuestion = useCallback((questionId, answer) => {
    dispatch({ type: 'ANSWER_QUESTION', payload: { questionId, answer } });
  }, []);

  const toggleReview = useCallback((questionId) => {
    dispatch({ type: 'TOGGLE_REVIEW', payload: questionId });
  }, []);

  const toggleFlag = useCallback((questionId) => {
    dispatch({ type: 'TOGGLE_FLAG', payload: questionId });
  }, []);

  const lockQuestion = useCallback((questionId) => {
    dispatch({ type: 'LOCK_QUESTION', payload: questionId });
  }, []);

  const addViolation = useCallback(() => {
    dispatch({ type: 'ADD_VIOLATION' });
  }, []);

  const setResult = useCallback((result) => {
    dispatch({ type: 'SET_RESULT', payload: result });
  }, []);

  const setSubmitting = useCallback((val) => {
    dispatch({ type: 'SET_SUBMITTING', payload: val });
  }, []);

  const resetQuiz = useCallback(() => {
    submitRef.current = false;
    dispatch({ type: 'RESET' });
  }, []);

  const getQuestionStatus = useCallback((qId, index) => {
    const { answers, markedForReview, currentIndex, lockedQuestions } = state;
    const hasAnswer = answers[qId] !== undefined && answers[qId] !== null && answers[qId] !== '';

    if (lockedQuestions.includes(qId)) return 'locked';
    if (index === currentIndex) return 'current';
    if (markedForReview.includes(qId)) return 'review';
    if (hasAnswer) return 'answered';
    if (index < currentIndex && !hasAnswer) return 'skipped';
    return 'unvisited';
  }, [state]);

  return (
    <QuizContext.Provider value={{
      ...state,
      startQuiz, setPhase, goToQuestion, answerQuestion,
      toggleReview, toggleFlag, lockQuestion, addViolation,
      setResult, setSubmitting, resetQuiz, getQuestionStatus,
      submitRef,
    }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider');
  return ctx;
}
