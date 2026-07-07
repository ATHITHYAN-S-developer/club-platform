import React, { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import QuizDashboard from '../components/quiz/QuizDashboard';
import QuizPlayer from '../components/quiz/QuizPlayer';
import { QuizProvider } from '../contexts/QuizContext';

export default function QuizPage({ user }) {
  const [activeQuiz, setActiveQuiz] = useState(null);

  const handleStartQuiz = useCallback((quiz) => {
    setActiveQuiz(quiz);
  }, []);

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
