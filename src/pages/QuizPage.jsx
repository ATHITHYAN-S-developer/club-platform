import React, { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import db from '../db.js';
import QuizDashboard from '../components/quiz/QuizDashboard';
import QuizPlayer from '../components/quiz/QuizPlayer';
import { QuizProvider } from '../contexts/QuizContext';

export default function QuizPage({ user }) {
  const [activeQuiz, setActiveQuiz] = useState(null);

  const handleStartQuiz = useCallback(async (quiz) => {
    if (quiz.maxAttempts > 0) {
      const allResults = await db.find('QuizResults');
      const userAttempts = allResults.filter(r => r.userId === user?.id && r.quizId === quiz.id).length;
      if (userAttempts >= quiz.maxAttempts) {
        window.showToast?.('Limit Reached', `You have used all ${quiz.maxAttempts} attempt${quiz.maxAttempts > 1 ? 's' : ''} for this quiz.`, 'warning');
        return;
      }
    }
    setActiveQuiz(quiz);
  }, [user?.id]);

  const handleFinish = useCallback(() => {
    setActiveQuiz(null);
  }, []);

  return (
    <div className="quiz-page">
      <div className="quiz-content">
        <AnimatePresence mode="wait">
          {activeQuiz ? (
            <QuizProvider>
              <QuizPlayer
                key={`player-${activeQuiz.id}`}
                quiz={activeQuiz}
                user={user}
                onFinish={handleFinish}
              />
            </QuizProvider>
          ) : (
            <QuizDashboard
              key="dashboard"
              user={user}
              onStartQuiz={handleStartQuiz}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
