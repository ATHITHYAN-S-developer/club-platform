import React from 'react';
import { motion } from 'framer-motion';

export default function StartConfirmation({ quiz, onStart, onBack, savedSession }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="quiz-confirmation"
    >
      <div className="quiz-confirmation-card">
        <div className="quiz-confirmation-header">
          <i className="fas fa-file-pen"></i>
          <h2>{quiz.title}</h2>
        </div>

        <div className="quiz-confirmation-details">
          <div className="detail-row">
            <span><i className="fas fa-clock"></i> Duration</span>
            <strong>{quiz.timeLimit} minutes</strong>
          </div>
          <div className="detail-row">
            <span><i className="fas fa-list-ol"></i> Total Questions</span>
            <strong>{quiz.questions?.length || 0}</strong>
          </div>
          <div className="detail-row">
            <span><i className="fas fa-star"></i> Total Marks</span>
            <strong>{quiz.totalMarks || quiz.questions?.length || 0}</strong>
          </div>
          <div className="detail-row">
            <span><i className="fas fa-check-circle"></i> Passing Marks</span>
            <strong>{quiz.passMarks || 0}</strong>
          </div>
        </div>

        <div className="quiz-confirmation-rules">
          <h3><i className="fas fa-shield-halved"></i> Rules & Guidelines</h3>
          <ul>
            <li>Fullscreen mode is mandatory throughout the assessment.</li>
            <li>Do not switch tabs or open other windows.</li>
            <li>Do not use copy/paste functionality.</li>
            <li>Right-click is disabled during the assessment.</li>
            <li>Any violation will result in immediate submission.</li>
            <li>The quiz auto-submits when the timer reaches zero.</li>
            <li>You can mark questions for review and navigate back.</li>
            {quiz.maxAttempts > 0 && <li>Maximum attempts allowed: {quiz.maxAttempts}</li>}
          </ul>
        </div>

        <div className="quiz-confirmation-actions">
          <button className="btn btn-secondary" onClick={onBack}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
          {savedSession ? (
            <button className="btn btn-primary" onClick={() => onStart(true)}>
              <i className="fas fa-play"></i> Resume Quiz
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => onStart(false)}>
              <i className="fas fa-play"></i> Start Quiz
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
