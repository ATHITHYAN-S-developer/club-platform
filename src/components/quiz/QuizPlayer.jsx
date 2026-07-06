import React, { useState, useEffect, useCallback, useRef } from 'react';
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

export default function QuizPlayer({ quiz, user, onFinish }) {
  const [phase, setPhase] = useState('confirm'); // confirm | fullscreen | active | result
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const submitTriggeredRef = useRef(false);

  const questions = React.useMemo(() => {
    const qs = quiz.questions || [];
    if (quiz.shuffleQuestions) {
      const shuffled = [...qs].sort(() => Math.random() - 0.5);
      return shuffled;
    }
    return qs;
  }, [quiz]);

  const totalTime = React.useMemo(() => {
    const timerSeconds = questions.reduce((sum, q) => sum + (q.timeLimit || 30), 0);
    return Math.max(timerSeconds, quiz.timeLimit * 60 || 300);
  }, [questions, quiz.timeLimit]);

  const { isFullscreen, isLoading: fsLoading, request: requestFullscreen } = useFullscreen({
    onExit: () => {
      if (phase === 'active') antiCheat.addViolation('fullscreen-exit');
    }
  });

  const antiCheat = useAntiCheat({
    enabled: phase === 'active',
    violationLimit: quiz.security?.violationLimit || 3,
    quizId: quiz.id,
    userId: user?.id,
    onAutoSubmit: (reason) => handleSubmit(reason),
    tabSwitchDetection: quiz.security?.tabSwitchDetection !== false,
    copyPasteBlock: quiz.security?.copyPasteBlock !== false,
    rightClickBlock: quiz.security?.rightClickBlock !== false,
    devToolsDetection: quiz.security?.devToolsDetection !== false,
  });

  const timer = useQuizTimer(totalTime, {
    onTimeUp: () => {
      if (!submitTriggeredRef.current) handleSubmit('Time Up');
    }
  });

  useAutoSave(quiz.id, user?.id, answers, { interval: 10000 });

  const handleSubmit = useCallback(async (reason) => {
    if (submitTriggeredRef.current) return;
    submitTriggeredRef.current = true;
    setSubmitting(true);
    timer.pause();

    try {
      let correct = 0;
      let wrong = 0;
      let skipped = 0;
      let longestStreak = 0;
      let currentStreak = 0;
      let fastestAnswerMs = Infinity;
      let fastestQIdx = -1;

      questions.forEach((q, i) => {
        const ans = answers[q.id];
        if (ans === undefined || ans === null || ans === '') {
          skipped++;
          currentStreak = 0;
          return;
        }
        let isCorrect = false;
        if (q.type === 'multiple-select') {
          const selected = Array.isArray(ans) ? ans : [];
          const correctIds = q.options.filter(o => o.isCorrect).map(o => o.id);
          isCorrect = selected.length === correctIds.length && selected.every(id => correctIds.includes(id));
        } else if (q.type === 'short-answer' || q.type === 'fill-blank') {
          const correctAns = q.correctAnswer?.toLowerCase().trim() || '';
          isCorrect = (ans || '').toLowerCase().trim() === correctAns;
        } else {
          isCorrect = q.options?.find(o => o.id === ans)?.isCorrect || false;
        }
        if (isCorrect) {
          correct++;
          currentStreak++;
          if (currentStreak > longestStreak) longestStreak = currentStreak;
        } else {
          wrong++;
          currentStreak = 0;
        }
      });

      const timeTaken = totalTime - timer.timeLeft;
      const total = questions.length;
      const score = correct;
      const accuracy = total > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;

      const resultData = {
        userId: user?.id,
        userName: user?.name || 'Anonymous',
        quizId: quiz.id,
        quizTitle: quiz.title,
        score,
        total,
        percentage: total > 0 ? Math.round((score / total) * 100) : 0,
        correct,
        wrong,
        skipped,
        accuracy,
        timeTaken: Math.max(1, timeTaken),
        totalTime,
        longestStreak,
        fastestAnswerMs: fastestAnswerMs === Infinity ? 0 : fastestAnswerMs,
        violationCount: antiCheat.warningCount || 0,
        autoSubmitted: reason !== 'manual',
        status: reason === 'Time Up' ? 'expired' : reason === 'Auto Submitted - Rule Violation' ? 'auto-submitted' : 'completed',
        submittedAt: new Date().toISOString(),
      };

      await db.insert('QuizAttempt', resultData);
      // Also insert into old QuizResults for backward compat
      await db.insert('QuizResults', {
        userId: user?.id,
        userName: user?.name || 'Anonymous',
        quizId: quiz.id,
        quizTitle: quiz.title,
        score,
        total,
        timeTaken: Math.max(1, timeTaken),
        date: new Date().toISOString(),
        status: resultData.status,
      });

      setResult(resultData);
      setPhase('result');
    } catch (e) {
      window.showToast('Error', 'Failed to submit quiz. Please try again.', 'error');
      submitTriggeredRef.current = false;
    }
    setSubmitting(false);
  }, [questions, answers, timer, totalTime, quiz, user?.id, user?.name, antiCheat.warningCount]);

  const handleStart = () => {
    timer.start();
    setPhase('active');
  };

  const handleAnswer = (value) => {
    setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: value }));
  };

  const handleMarkForReview = () => {
    const qid = questions[currentIndex].id;
    setMarkedForReview(prev =>
      prev.includes(qid) ? prev.filter(id => id !== qid) : [...prev, qid]
    );
  };

  const navigateTo = (idx) => {
    if (idx >= 0 && idx < questions.length) {
      setCurrentIndex(idx);
    }
  };

  const q = questions[currentIndex];
  const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== null && answers[k] !== '').length;
  const skippedCount = currentIndex + 1 - answeredCount - (markedForReview.includes(q?.id) ? 0 : 0);
  const remainingCount = questions.length - currentIndex - 1;

  if (phase === 'confirm') {
    return <StartConfirmation quiz={quiz} onStart={() => setPhase('fullscreen')} onBack={onFinish} />;
  }

  if (phase === 'fullscreen') {
    if (isFullscreen) {
      setTimeout(() => setPhase('active'), 100);
    }
    return <FullScreenGate onFullscreen={requestFullscreen} isLoading={fsLoading} />;
  }

  if (phase === 'result') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="quiz-result-container">
        <div className="quiz-result-card">
          <div className={`result-banner ${result.percentage >= 60 ? 'pass' : 'fail'}`}>
            <i className={`fas ${result.percentage >= 60 ? 'fa-trophy' : 'fa-book'} result-banner-icon`}></i>
            <h2>{result.percentage >= 60 ? 'Congratulations!' : 'Better Luck Next Time'}</h2>
            <p>{result.percentage >= 60 ? 'You passed the quiz!' : 'Keep practicing, you\'ll get better!'}</p>
          </div>

          <div className="result-stats-grid">
            <div className="result-stat"><span className="stat-value">{result.score}/{result.total}</span><span className="stat-label">Score</span></div>
            <div className="result-stat"><span className="stat-value">{result.percentage}%</span><span className="stat-label">Percentage</span></div>
            <div className="result-stat"><span className="stat-value">{result.accuracy}%</span><span className="stat-label">Accuracy</span></div>
            <div className="result-stat"><span className="stat-value">{result.correct}</span><span className="stat-label correct-label">Correct</span></div>
            <div className="result-stat"><span className="stat-value">{result.wrong}</span><span className="stat-label wrong-label">Wrong</span></div>
            <div className="result-stat"><span className="stat-value">{result.skipped}</span><span className="stat-label">Skipped</span></div>
            <div className="result-stat"><span className="stat-value">{Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s</span><span className="stat-label">Time Taken</span></div>
            <div className="result-stat"><span className="stat-value">{result.longestStreak}</span><span className="stat-label">Longest Streak</span></div>
          </div>

          {result.autoSubmitted && (
            <div className="auto-submit-notice">
              <i className="fas fa-shield-halved"></i>
              <span>Quiz was auto-submitted due to {result.status === 'expired' ? 'time expiry' : 'rule violations'}.</span>
            </div>
          )}

          <div className="result-actions">
            <button className="btn btn-primary" onClick={() => onFinish()}>
              <i className="fas fa-arrow-left"></i> Back to Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="quiz-player-layout">
      <QuizTimer
        timeLeft={timer.timeLeft}
        formatted={timer.formatted}
        progress={timer.progress}
        isWarning={timer.isWarning}
        isDanger={timer.isDanger}
      />

      {antiCheat.warningCount > 0 && (
        <div className={`violation-banner ${antiCheat.warningCount >= antiCheat.violationLimit - 1 ? 'critical' : ''}`}>
          <i className="fas fa-exclamation-triangle"></i>
          <span>Warning #{antiCheat.warningCount}: {antiCheat.warningCount >= antiCheat.violationLimit - 1 ? 'One more violation will submit your quiz automatically.' : 'Please avoid rule violations.'}</span>
        </div>
      )}

      <div className="quiz-player-main">
        <div className="quiz-player-content">
          <AnimatePresence mode="wait">
            <QuestionCard
              key={currentIndex}
              question={q}
              index={currentIndex}
              selectedAnswer={answers[q?.id]}
              onAnswer={handleAnswer}
            />
          </AnimatePresence>

          <div className="question-nav">
            <button className="btn btn-secondary btn-sm" onClick={() => navigateTo(currentIndex - 1)} disabled={currentIndex === 0}>
              <i className="fas fa-arrow-left"></i> Previous
            </button>

            <div className="question-nav-center">
              <button className="btn btn-outline btn-sm" onClick={handleMarkForReview}>
                <i className={`fas ${markedForReview.includes(q?.id) ? 'fa-bookmark' : 'fa-bookmark-o'}`}></i>
                {markedForReview.includes(q?.id) ? 'Reviewed' : 'Mark for Review'}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => navigateTo(currentIndex + 1)}>
                Skip <i className="fas fa-forward"></i>
              </button>
            </div>

            {currentIndex === questions.length - 1 ? (
              <button className="btn btn-primary btn-sm" onClick={() => {
                if (window.confirm('Are you sure you want to submit?')) {
                  handleSubmit('manual');
                }
              }} disabled={submitting}>
                {submitting ? 'Submitting...' : <><i className="fas fa-check"></i> Submit</>}
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => navigateTo(currentIndex + 1)}>
                Next <i className="fas fa-arrow-right"></i>
              </button>
            )}
          </div>

          <div className="quiz-progress-bar">
            <div className="progress-item"><span className="progress-count">{answeredCount}</span> Answered</div>
            <div className="progress-item"><span className="progress-count">{remainingCount < 0 ? 0 : remainingCount}</span> Remaining</div>
          </div>
        </div>

        <QuestionPalette
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          markedForReview={markedForReview}
          onNavigate={navigateTo}
        />
      </div>
    </div>
  );
}
