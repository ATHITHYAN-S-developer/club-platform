import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../../db.js';
import useFullscreen from '../../hooks/useFullscreen';
import useAntiCheat from '../../hooks/useAntiCheat';
import useQuizTimer from '../../hooks/useQuizTimer';
import useAutoSave from '../../hooks/useAutoSave';
import StartConfirmation from './StartConfirmation';
import FullScreenGate from './FullScreenGate';
import QuestionCard from './QuestionCard';
import QuestionPalette from './QuestionPalette';
import QuizTimer from './QuizTimer';
import ConfirmationDialog from './ConfirmationDialog';

export default function QuizPlayer({ quiz, user, onFinish }) {
  const [phase, setPhase] = useState('confirm');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [lockedQuestions, setLockedQuestions] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const submitTriggeredRef = useRef(false);

  const questions = useMemo(() => {
    const qs = quiz.questions || [];
    if (quiz.shuffleQuestions) return [...qs].sort(() => Math.random() - 0.5);
    return qs;
  }, [quiz]);

  const currentQuestion = questions[currentIndex];
  const questionTimeLimit = currentQuestion?.timeLimit || 0;

  const totalTime = useMemo(() => {
    const timerSeconds = questions.reduce((sum, q) => sum + (q.timeLimit || 30), 0);
    return Math.max(timerSeconds, quiz.timeLimit * 60 || 300);
  }, [questions, quiz.timeLimit]);

  const { isFullscreen, isLoading: fsLoading, request: requestFullscreen } = useFullscreen({
    onExit: () => { if (phase === 'active') antiCheat.addViolation('fullscreen-exit'); }
  });

  const antiCheat = useAntiCheat({
    enabled: phase === 'active',
    violationLimit: 2,
    quizId: quiz.id,
    userId: user?.id,
    onAutoSubmit: (reason) => handleSubmit(reason),
    tabSwitchDetection: quiz.security?.tabSwitchDetection !== false,
    copyPasteBlock: quiz.security?.copyPasteBlock !== false,
    rightClickBlock: quiz.security?.rightClickBlock !== false,
    devToolsDetection: quiz.security?.devToolsDetection !== false,
  });

  const timer = useQuizTimer(totalTime, {
    onTimeUp: () => { if (!submitTriggeredRef.current) handleSubmit('Time Up'); }
  });

  const [qTimerLeft, setQTimerLeft] = useState(questionTimeLimit);
  const qTimerInterval = useRef(null);

  useEffect(() => {
    if (phase !== 'active') return;
    if (!questionTimeLimit || questionTimeLimit <= 0) {
      setQTimerLeft(0);
      if (qTimerInterval.current) { clearInterval(qTimerInterval.current); qTimerInterval.current = null; }
      return;
    }
    setQTimerLeft(questionTimeLimit);
    if (qTimerInterval.current) clearInterval(qTimerInterval.current);
    qTimerInterval.current = setInterval(() => {
      setQTimerLeft(prev => {
        if (prev <= 1) {
          clearInterval(qTimerInterval.current);
          qTimerInterval.current = null;
          handleQuestionTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (qTimerInterval.current) { clearInterval(qTimerInterval.current); qTimerInterval.current = null; } };
  }, [phase, currentIndex, questionTimeLimit]);

  const handleQuestionTimeUp = useCallback(() => {
    const qid = currentQuestion?.id;
    if (!qid) return;
    setLockedQuestions(prev => {
      if (prev.includes(qid)) return prev;
      const next = [...prev, qid];
      if (questions.length > currentIndex + 1) {
        setCurrentIndex(currentIndex + 1);
      }
      return next;
    });
    window.showToast?.('Time Up', 'Question time expired. Auto-advancing.', 'warning');
  }, [currentQuestion, currentIndex, questions.length]);

  useAutoSave(quiz.id, user?.id, answers, { interval: 5000 });

  const handleSubmit = useCallback(async (reason) => {
    if (submitTriggeredRef.current) return;
    submitTriggeredRef.current = true;
    setSubmitting(true);
    setShowConfirm(false);
    timer.pause();

    try {
      let correct = 0, wrong = 0, skipped = 0;
      let longestStreak = 0, currentStreak = 0;

      questions.forEach((q) => {
        const ans = answers[q.id];
        if (ans === undefined || ans === null || ans === '') { skipped++; currentStreak = 0; return; }
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
        if (isCorrect) { correct++; currentStreak++; if (currentStreak > longestStreak) longestStreak = currentStreak; }
        else { wrong++; currentStreak = 0; }
      });

      const timeTaken = Math.max(1, totalTime - timer.timeLeft);
      const total = questions.length;
      const score = correct;
      const accuracy = (correct + wrong) > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;

      const resultData = {
        userId: user?.id, userName: user?.name || 'Anonymous',
        quizId: quiz.id, quizTitle: quiz.title,
        score, total, percentage: total > 0 ? Math.round((score / total) * 100) : 0,
        correct, wrong, skipped, accuracy, timeTaken, totalTime, longestStreak,
        violationCount: antiCheat.warningCount || 0,
        autoSubmitted: reason !== 'manual',
        status: reason === 'Time Up' ? 'expired' : reason === 'Auto Submitted - Rule Violation' ? 'auto-submitted' : 'completed',
        submittedAt: new Date().toISOString(),
      };

      await db.insert('QuizAttempt', resultData);
      await db.insert('QuizResults', {
        userId: user?.id, userName: user?.name || 'Anonymous',
        quizId: quiz.id, quizTitle: quiz.title,
        score, total, timeTaken, date: new Date().toISOString(), status: resultData.status,
      });

      setResult(resultData);
      setPhase('result');
    } catch (e) {
      window.showToast('Error', 'Failed to submit quiz. Please try again.', 'error');
      submitTriggeredRef.current = false;
    }
    setSubmitting(false);
  }, [questions, answers, timer, totalTime, quiz, user, antiCheat.warningCount]);

  const handleStart = () => { timer.start(); setPhase('active'); };
  const handleAnswer = (value) => { setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: value })); };

  const handleMarkForReview = () => {
    const qid = questions[currentIndex].id;
    setMarkedForReview(prev => prev.includes(qid) ? prev.filter(id => id !== qid) : [...prev, qid]);
  };

  const navigateTo = (idx) => {
    if (idx >= 0 && idx < questions.length && !lockedQuestions.includes(questions[idx]?.id)) {
      setCurrentIndex(idx);
    }
  };

  const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== null && answers[k] !== '').length;
  const remainingCount = questions.length - answeredCount;

  const qTimerProgress = questionTimeLimit > 0 ? qTimerLeft / questionTimeLimit : 1;
  const qTimerWarning = questionTimeLimit > 0 && qTimerLeft <= Math.min(10, Math.round(questionTimeLimit * 0.2));
  const qTimerDanger = questionTimeLimit > 0 && qTimerLeft <= 5;

  if (phase === 'confirm') {
    return <StartConfirmation quiz={quiz} onStart={() => setPhase('fullscreen')} onBack={onFinish} />;
  }

  if (phase === 'fullscreen') {
    if (isFullscreen) setTimeout(() => setPhase('active'), 100);
    return <FullScreenGate onFullscreen={requestFullscreen} isLoading={fsLoading} />;
  }

  if (phase === 'result') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="quiz-result-container">
        <div className={`quiz-result-card ${result.percentage >= 60 ? 'pass' : 'fail'}`}>
          <div className="quiz-result-banner">
            <div className="quiz-result-banner-icon">
              <i className={`fas ${result.percentage >= 60 ? 'fa-trophy' : 'fa-book'}`} />
            </div>
            <h2>{result.percentage >= 60 ? 'Congratulations!' : 'Better Luck Next Time'}</h2>
            <p>{result.percentage >= 60 ? 'You passed the quiz!' : 'Keep practicing!'}</p>
          </div>

          <div className="quiz-result-stats">
            <div className="quiz-result-stat"><span className="quiz-result-stat-val">{result.score}/{result.total}</span><span className="quiz-result-stat-lbl">Score</span></div>
            <div className="quiz-result-stat"><span className="quiz-result-stat-val">{result.percentage}%</span><span className="quiz-result-stat-lbl">Percentage</span></div>
            <div className="quiz-result-stat"><span className="quiz-result-stat-val">{result.accuracy}%</span><span className="quiz-result-stat-lbl">Accuracy</span></div>
            <div className="quiz-result-stat"><span className="quiz-result-stat-val">{result.correct}</span><span className="quiz-result-stat-lbl">Correct</span></div>
            <div className="quiz-result-stat"><span className="quiz-result-stat-val">{result.wrong}</span><span className="quiz-result-stat-lbl">Wrong</span></div>
            <div className="quiz-result-stat"><span className="quiz-result-stat-val">{result.skipped}</span><span className="quiz-result-stat-lbl">Skipped</span></div>
            <div className="quiz-result-stat"><span className="quiz-result-stat-val">{Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s</span><span className="quiz-result-stat-lbl">Time Taken</span></div>
            <div className="quiz-result-stat"><span className="quiz-result-stat-val">{result.longestStreak}</span><span className="quiz-result-stat-lbl">Longest Streak</span></div>
          </div>

          {result.autoSubmitted && (
            <div className="quiz-result-notice">
              <i className="fas fa-shield-halved" />
              <span>Quiz was auto-submitted due to {result.status === 'expired' ? 'time expiry' : 'rule violations'}.</span>
            </div>
          )}

          <div className="quiz-result-actions">
            <button className="btn btn-outline" onClick={() => setPhase('review')}>
              <i className="fas fa-list" /> Review Answers
            </button>
            <button className="btn btn-primary" onClick={onFinish}>
              <i className="fas fa-arrow-left" /> Back to Dashboard
            </button>
          </div>
        </div>

        {result.percentage >= 60 && (
          <div className="confetti-container">
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} className="confetti-piece" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                background: ['#ff5500','#ffd700','#22c55e','#3b82f6','#a855f7','#ef4444'][i % 6],
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }} />
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="quiz-player-layout">
      <div className="quiz-player-header">
        <QuizTimer
          timeLeft={timer.timeLeft}
          formatted={timer.formatted}
          progress={timer.progress}
          isWarning={timer.isWarning}
          isDanger={timer.isDanger}
        />

        {questionTimeLimit > 0 && (
          <div className={`q-timer ${qTimerDanger ? 'danger' : qTimerWarning ? 'warning' : ''}`}>
            <div className="q-timer-inner">
              <i className="fas fa-hourglass-half" />
              <span className="q-timer-text">
                {String(Math.floor(qTimerLeft / 60)).padStart(2, '0')}:{String(qTimerLeft % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="q-timer-bar">
              <div className="q-timer-fill" style={{ width: `${qTimerProgress * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      {antiCheat.warningCount > 0 && (
        <div className={`violation-banner ${antiCheat.warningCount >= 2 ? 'critical' : ''}`}>
          <i className="fas fa-exclamation-triangle" />
          <span>Warning #{antiCheat.warningCount}: {antiCheat.warningCount >= 1 ? 'One more violation will submit your quiz automatically.' : 'Please avoid rule violations.'}</span>
        </div>
      )}

      <div className="quiz-player-main">
        <div className="quiz-player-content">
          <AnimatePresence mode="wait">
            <QuestionCard
              key={currentIndex}
              question={currentQuestion}
              index={currentIndex}
              selectedAnswer={answers[currentQuestion?.id]}
              onAnswer={handleAnswer}
            />
          </AnimatePresence>

          <div className="question-nav">
            <button className="btn btn-secondary btn-sm" onClick={() => navigateTo(currentIndex - 1)}
              disabled={currentIndex === 0}>
              <i className="fas fa-arrow-left" /> Previous
            </button>

            <div className="question-nav-center">
              <button className="btn btn-outline btn-sm" onClick={handleMarkForReview}>
                <i className={`fas ${markedForReview.includes(currentQuestion?.id) ? 'fa-bookmark' : 'fa-regular fa-bookmark'}`} />
                {markedForReview.includes(currentQuestion?.id) ? 'Marked' : 'Review'}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => navigateTo(currentIndex + 1)}
                disabled={currentIndex === questions.length - 1}>
                Skip <i className="fas fa-forward" />
              </button>
            </div>

            {currentIndex === questions.length - 1 ? (
              <button className="btn btn-primary btn-sm" onClick={() => setShowConfirm(true)} disabled={submitting}>
                {submitting ? 'Submitting...' : <><i className="fas fa-check" /> Submit</>}
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => navigateTo(currentIndex + 1)}>
                Next <i className="fas fa-arrow-right" />
              </button>
            )}
          </div>

          <div className="quiz-progress-bar">
            <div className="progress-item"><span className="progress-count">{answeredCount}</span> Answered</div>
            <div className="progress-item"><span className="progress-count">{remainingCount}</span> Remaining</div>
            <div className="progress-item"><span className="progress-count">{lockedQuestions.length}</span> Locked</div>
          </div>
        </div>

        <QuestionPalette
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          markedForReview={markedForReview}
          lockedQuestions={lockedQuestions}
          onNavigate={navigateTo}
        />
      </div>

      <ConfirmationDialog
        open={showConfirm}
        onConfirm={() => handleSubmit('manual')}
        onCancel={() => setShowConfirm(false)}
        submitting={submitting}
      />
    </div>
  );
}
