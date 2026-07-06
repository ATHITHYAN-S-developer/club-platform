import React from 'react';
import { motion } from 'framer-motion';

export default function QuestionCard({ question, index, selectedAnswer, onAnswer, showResult }) {
  const q = question;

  const handleSelect = (optionId) => {
    if (showResult) return;
    if (q.type === 'multiple-select') {
      const current = Array.isArray(selectedAnswer) ? selectedAnswer : [];
      const next = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      onAnswer(next);
    } else {
      onAnswer(optionId);
    }
  };

  const renderOptions = () => {
    switch (q.type) {
      case 'true-false':
        return (
          <div className="question-true-false">
            {[{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }].map(opt => {
              const isSelected = selectedAnswer === opt.id;
              const isCorrect = showResult && q.options?.[0]?.isCorrect === (opt.id === 'true');
              return (
                <button
                  key={opt.id}
                  className={`tf-btn ${isSelected ? 'selected' : ''} ${showResult && isCorrect ? 'correct' : ''} ${showResult && isSelected && !isCorrect ? 'wrong' : ''}`}
                  onClick={() => handleSelect(opt.id)}
                  disabled={showResult}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>
        );

      case 'short-answer':
      case 'fill-blank':
        return (
          <div className="question-input">
            {q.type === 'fill-blank' && q.questionText.includes('___') ? (
              <p className="fill-blank-text">
                {q.questionText.split('___').map((part, i) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < q.questionText.split('___').length - 1 && (
                      <input
                        type="text"
                        className="form-input fill-input"
                        value={selectedAnswer || ''}
                        onChange={(e) => onAnswer(e.target.value)}
                        disabled={showResult}
                        placeholder="..."
                      />
                    )}
                  </React.Fragment>
                ))}
              </p>
            ) : (
              <input
                type="text"
                className="form-input"
                value={selectedAnswer || ''}
                onChange={(e) => onAnswer(e.target.value)}
                disabled={showResult}
                placeholder="Type your answer here..."
              />
            )}
          </div>
        );

      case 'multiple-select':
        return (
          <div className="question-options">
            {q.options?.map(opt => {
              const isSelected = Array.isArray(selectedAnswer) && selectedAnswer.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  className={`option-btn multi ${isSelected ? 'selected' : ''} ${showResult && opt.isCorrect ? 'correct' : ''} ${showResult && isSelected && !opt.isCorrect ? 'wrong' : ''}`}
                  onClick={() => handleSelect(opt.id)}
                  disabled={showResult}
                >
                  <span className="option-check">{isSelected ? <i className="fas fa-check-square"></i> : <i className="fas fa-square"></i>}</span>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>
        );

      case 'image':
        return (
          <div className="question-image-block">
            {q.imageUrl && <img src={q.imageUrl} alt="Question" className="question-image" />}
            <div className="question-options">
              {q.options?.map(opt => {
                const isSelected = selectedAnswer === opt.id;
                return (
                  <button
                    key={opt.id}
                    className={`option-btn ${isSelected ? 'selected' : ''} ${showResult && opt.isCorrect ? 'correct' : ''} ${showResult && isSelected && !opt.isCorrect ? 'wrong' : ''}`}
                    onClick={() => handleSelect(opt.id)}
                    disabled={showResult}
                  >
                    <span className="option-letter">{opt.id.toUpperCase()}</span>
                    <span>{opt.text}</span>
                    {showResult && opt.isCorrect && <i className="fas fa-check result-icon"></i>}
                    {showResult && isSelected && !opt.isCorrect && <i className="fas fa-times result-icon"></i>}
                  </button>
                );
              })}
            </div>
          </div>
        );

      default: // mcq
        return (
          <div className="question-options">
            {q.options?.map(opt => {
              const isSelected = selectedAnswer === opt.id;
              return (
                <button
                  key={opt.id}
                  className={`option-btn ${isSelected ? 'selected' : ''} ${showResult && opt.isCorrect ? 'correct' : ''} ${showResult && isSelected && !opt.isCorrect ? 'wrong' : ''}`}
                  onClick={() => handleSelect(opt.id)}
                  disabled={showResult}
                >
                  <span className="option-letter">{opt.id.toUpperCase()}</span>
                  <span>{opt.text}</span>
                  {showResult && opt.isCorrect && <i className="fas fa-check result-icon"></i>}
                  {showResult && isSelected && !opt.isCorrect && <i className="fas fa-times result-icon"></i>}
                </button>
              );
            })}
          </div>
        );
    }
  };

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25 }}
      className="question-card"
    >
      <div className="question-header">
        <span className="question-number">Question {index + 1}</span>
        {q.difficulty && (
          <span className={`badge badge-${q.difficulty === 'hard' ? 'red' : q.difficulty === 'medium' ? 'orange' : 'green'}`}>
            {q.difficulty}
          </span>
        )}
        <span className="question-marks">{q.marks || 1} mark{q.marks !== 1 ? 's' : ''}</span>
      </div>

      <div className="question-text">
        <p>{q.questionText}</p>
      </div>

      {renderOptions()}
    </motion.div>
  );
}
