import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../../contexts/QuizContext';
import useQuizTimer from '../../hooks/useQuizTimer';
import useQuestionTimer from '../../hooks/useQuestionTimer';
import useSecurity from '../../hooks/useSecurity';
import { calcScore } from '../../utils/scoreCalculator';
import { computeBadge } from '../../utils/badgeEngine';
import { saveResult } from '../../services/resultService';
import { saveSession, clearSession, loadSession, calcOverallTime } from '../../services/quizService';
import { updateUserBadges, getBadgeDefinitions } from '../../services/badgeService';
import { QUIZ_CONFIG } from '../../config/quizConfig';
import StartConfirmation from './StartConfirmation';
import QuestionCard from './QuestionCard';
import QuestionPalette from './QuestionPalette';
import ProgressHeader from './ProgressHeader';
import ResultView from './ResultView';
import ConfirmationDialog from './ConfirmationDialog';

export default function QuizPlayer({ quiz, user, onFinish, badgeRules: propBadgeRules }) {
  const ctx = useQuiz();
  const {
    phase, currentIndex, questions, answers, lockedQuestions,
    startQuiz, answerQuestion, lockQuestion, goToQuestion,
    updateTimer, updateQuestionTimer, setResult, setSubmitted, resetQuiz, getQuestionStatus,
  } = ctx;

  const [showConfirm, setShowConfirm] = useState(false);
  const [badgeRules, setBadgeRules] = useState(propBadgeRules || []);
  const [savedSession, setSavedSession] = useState(null);
  const submitTriggeredRef = useRef(false);
  const lastAnswerRef = useRef({});

  useEffect(() => {
    const session = loadSession(quiz.id);
    if (session) setSavedSession(session);
  }, []);

  useEffect(() => {
    if (!propBadgeRules || propBadgeRules.length === 0) {
      getBadgeDefinitions().then(setBadgeRules).catch(() => {});
    }
  }, []);

  const timePerQuestion = quiz?.timePerQuestion || QUIZ_CONFIG.DEFAULT_TIME_PER_QUESTION;
  const overallTime = calcOverallTime(questions, timePerQuestion);
  const currentQuestion = questions[currentIndex];
  const isLocked = currentQuestion ? lockedQuestions.includes(currentQuestion.id) : false;

  // ─── Overall Timer ───
  const overallTimer = useQuizTimer(overallTime, {
    onTimeUp: () => { if (!submitTriggeredRef.current) handleAutoSubmit('time_up'); },
  });

  // ─── Question Timer ───
  const questionTimer = useQuestionTimer();

  useEffect(() => {
    if (phase !== 'active' || !currentQuestion || isLocked) return;
    questionTimer.start(timePerQuestion, () => {
      if (submitTriggeredRef.current) return;
      handleQuestionTimeUp();
    });
    return () => questionTimer.stop();
  }, [phase, currentIndex, isLocked]);

  // ─── Sync timers to context ───
  useEffect(() => {
    if (phase === 'active') {
      updateTimer(overallTimer.timeLeft);
      updateQuestionTimer(questionTimer.timeLeft);
    }
  }, [overallTimer.timeLeft, questionTimer.timeLeft, phase]);

  // ─── Save session periodically ───
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (phase !== 'active') return;
    saveTimerRef.current = setInterval(() => {
      saveSession(quiz.id, {
        currentIndex,
        answers,
        lockedQuestions,
        timeRemaining: overallTimer.timeLeft,
        questionTimeRemaining: questionTimer.timeLeft,
        startedAt: ctx.startedAt,
      });
    }, 7000);
    return () => { if (saveTimerRef.current) clearInterval(saveTimerRef.current); };
  }, [phase, currentIndex, answers, lockedQuestions, overallTimer.timeLeft, questionTimer.timeLeft]);

  // Save on answer change
  useEffect(() => {
    if (phase !== 'active') return;
    if (JSON.stringify(answers) !== JSON.stringify(lastAnswerRef.current)) {
      lastAnswerRef.current = answers;
      saveSession(quiz.id, {
        currentIndex, answers, lockedQuestions,
        timeRemaining: overallTimer.timeLeft,
        questionTimeRemaining: questionTimer.timeLeft,
        startedAt: ctx.startedAt,
      });
    }
  }, [answers]);

  // ─── Body class for isolation ───
  useEffect(() => {
    if (phase === 'active') {
      document.body.classList.add('quiz-active');
    } else {
      document.body.classList.remove('quiz-active');
    }
    return () => document.body.classList.remove('quiz-active');
  }, [phase]);

  // ─── Security ───
  const handleViolation = useCallback((reason) => {
    if (submitTriggeredRef.current) return;
    handleAutoSubmit(reason);
  }, []);

  const security = useSecurity({ onViolation: handleViolation });

  useEffect(() => {
    if (phase === 'active') {
      security.start();
      security.requestFullscreen();
      overallTimer.start();
    }
    return () => security.stop();
  }, [phase]);

  // ─── Question Time Up Handler ───
  const handleQuestionTimeUp = useCallback(() => {
    const qid = currentQuestion?.id;
    if (!qid || lockedQuestions.includes(qid)) return;

    lockQuestion(qid);
    if (!answers[qid]) {
      answerQuestion(qid, '');
    }

    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    } else {
      handleAutoSubmit('last_question');
    }
  }, [currentQuestion, currentIndex, questions.length, lockedQuestions, answers]);

  // ─── Submission Pipeline ───
  const handleAutoSubmit = useCallback(async (reason) => {
    if (submitTriggeredRef.current) return;
    submitTriggeredRef.current = true;
    overallTimer.pause();
    questionTimer.stop();
    security.stop();

    try {
      const scored = calcScore(answers, questions);
      const timeTaken = Math.max(1, overallTime - overallTimer.timeLeft);
      const pass = scored.percentage >= (quiz.passPercentage || 40);

      const badge = computeBadge(scored.percentage, badgeRules || []);

      const resultData = {
        userId: user?.id,
        userName: user?.name || 'Anonymous',
        userEmail: user?.email || '',
        quizId: quiz.id,
        quizTitle: quiz.title,
        quizCategory: quiz.category || 'General',
        score: scored.score,
        total: scored.total,
        percentage: scored.percentage,
        correct: scored.correct,
        wrong: scored.wrong,
        skipped: scored.skipped,
        timeTaken,
        totalTime: overallTime,
        pass,
        badge,
        points: badge?.rewardPoints || 0,
        answers,
        status: reason === 'time_up' ? 'expired' : reason === 'manual' ? 'completed' : 'auto_submitted',
        autoSubmitted: reason !== 'manual',
        submittedAt: new Date().toISOString(),
      };

      await saveResult(resultData);

      if (badge && user?.id) {
        await updateUserBadges(user.id, badge, scored.percentage, badge.rewardPoints || 0);
      }

      clearSession(quiz.id);
      setResult(resultData);
      setSubmitted();
    } catch (e) {
      console.error('Submit failed', e);
      submitTriggeredRef.current = false;
    }
  }, [answers, questions, overallTime, overallTimer.timeLeft, quiz, user, badgeRules]);

  // ─── Answer Handler ───
  const handleAnswer = useCallback((value) => {
    if (!currentQuestion || lockedQuestions.includes(currentQuestion.id)) return;
    answerQuestion(currentQuestion.id, value);
  }, [currentQuestion, lockedQuestions, answerQuestion]);

  // ─── Navigation ───
  const navigateTo = useCallback((idx) => {
    if (idx < 0 || idx >= questions.length) return;
    const targetQ = questions[idx];
    if (lockedQuestions.includes(targetQ.id)) return;
    goToQuestion(idx);
  }, [questions, lockedQuestions, goToQuestion]);

  // ─── Start Quiz ───
  const handleStart = useCallback(async (isResume) => {
    const qs = quiz.shuffleQuestions && !isResume
      ? [...(quiz.questions || [])].sort(() => Math.random() - 0.5)
      : (quiz.questions || []);

    ctx.initQuiz(quiz, qs, overallTime, timePerQuestion);

    if (isResume && savedSession) {
      ctx.resumeSession(savedSession);
      setSavedSession(null);
    }

    try {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
    } catch {}

    ctx.startQuiz();
  }, [quiz, overallTime, timePerQuestion, savedSession]);

  // ─── Manual Submit ───
  const handleManualSubmit = useCallback(() => {
    handleAutoSubmit('manual');
  }, [handleAutoSubmit]);

  // ─── Render States ───

  if (phase === 'confirm') {
    return (
      <StartConfirmation
        quiz={quiz}
        onStart={handleStart}
        onBack={onFinish}
        savedSession={savedSession}
      />
    );
  }

  if (phase === 'active') {
    const isReadOnly = currentQuestion ? lockedQuestions.includes(currentQuestion.id) : false;

    return (
      <div className="quiz-player-active">
        <ProgressHeader overallTime={overallTimer.timeLeft} questionTime={questionTimer.timeLeft} />

        <div className="quiz-player-body">
          <div className="quiz-player-main">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <QuestionCard
                  question={currentQuestion}
                  index={currentIndex}
                  selectedAnswer={answers[currentQuestion?.id]}
                  onAnswer={handleAnswer}
                  readOnly={isReadOnly}
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="question-nav">
              <button className="btn btn-secondary btn-sm"
                onClick={() => navigateTo(currentIndex - 1)}
                disabled={currentIndex === 0}>
                <i className="fas fa-arrow-left" /> Previous
              </button>

              <div className="question-nav-center">
                <span className="question-nav-info">
                  {currentIndex + 1} / {questions.length}
                </span>
              </div>

              {currentIndex === questions.length - 1 ? (
                <button className="btn btn-primary btn-sm"
                  onClick={() => setShowConfirm(true)}
                  disabled={submitTriggeredRef.current}>
                  {submitTriggeredRef.current ? 'Submitting...' : <><i className="fas fa-check" /> Submit</>}
                </button>
              ) : (
                <button className="btn btn-primary btn-sm"
                  onClick={() => navigateTo(currentIndex + 1)}
                  disabled={submitTriggeredRef.current}>
                  Next <i className="fas fa-arrow-right" />
                </button>
              )}
            </div>
          </div>

          <QuestionPalette
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            lockedQuestions={lockedQuestions}
            getStatus={getQuestionStatus}
            onNavigate={navigateTo}
          />
        </div>

        <ConfirmationDialog
          open={showConfirm}
          onConfirm={handleManualSubmit}
          onCancel={() => setShowConfirm(false)}
          submitting={submitTriggeredRef.current}
        />
      </div>
    );
  }

  if (phase === 'submitting' || phase === 'result') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {phase === 'submitting' && (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: '50vh', flexDirection: 'column', gap: '1rem',
          }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--orange)' }} />
            <p style={{ color: 'var(--text-muted)' }}>Submitting your quiz...</p>
          </div>
        )}
        {phase === 'result' && <ResultView />}
      </motion.div>
    );
  }

  return null;
}
