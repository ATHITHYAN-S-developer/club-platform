import React from 'react';

export default function QuestionPalette({ questions, currentIndex, answers, markedForReview, onNavigate }) {
  return (
    <div className="question-palette">
      <h4 className="palette-title"><i className="fas fa-th"></i> Question Palette</h4>
      <div className="palette-grid">
        {questions.map((q, i) => {
          const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '';
          const isCurrent = i === currentIndex;
          const isReviewed = markedForReview.includes(q.id);
          let cls = 'palette-btn';
          if (isCurrent) cls += ' current';
          if (isReviewed) cls += ' reviewed';
          else if (isAnswered) cls += ' answered';
          return (
            <button key={q.id} className={cls} onClick={() => onNavigate(i)} title={`Question ${i + 1}`}>
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="palette-legend">
        <div className="legend-item"><span className="legend-dot answered"></span> Answered</div>
        <div className="legend-item"><span className="legend-dot current"></span> Current</div>
        <div className="legend-item"><span className="legend-dot reviewed"></span> Review</div>
        <div className="legend-item"><span className="legend-dot unanswered"></span> Unanswered</div>
      </div>
    </div>
  );
}
