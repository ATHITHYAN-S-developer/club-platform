import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuizDashboard from '../components/quiz/QuizDashboard';
import QuizPlayer from '../components/quiz/QuizPlayer';

export default function QuizPage({ user }) {
  const [activeQuiz, setActiveQuiz] = useState(null);

  const handleStartQuiz = useCallback((quiz) => {
    setActiveQuiz(quiz);
  }, []);

  const handleFinish = useCallback(() => {
    setActiveQuiz(null);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="quiz-page">
      <AnimatePresence mode="wait">
        {activeQuiz ? (
          <QuizPlayer
            key={`player-${activeQuiz.id}`}
            quiz={activeQuiz}
            user={user}
            onFinish={handleFinish}
          />
        ) : (
          <QuizDashboard
            key="dashboard"
            user={user}
            onStartQuiz={handleStartQuiz}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
