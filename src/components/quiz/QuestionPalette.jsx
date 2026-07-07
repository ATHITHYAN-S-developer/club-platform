export default function QuestionPalette({ questions, currentIndex, answers, markedForReview, lockedQuestions, onNavigate }) {
  return (
    <div className="question-palette">
      <h4 className="palette-title"><i className="fas fa-th" /> Question Palette</h4>
      <div className="palette-grid">
        {questions.map((q, i) => {
          const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '';
          const isCurrent = i === currentIndex;
          const isReviewed = markedForReview?.includes(q.id);
          const isLocked = lockedQuestions?.includes(q.id);
          let cls = 'palette-btn';
          if (isLocked) cls += ' locked';
          else if (isCurrent) cls += ' current';
          else if (isReviewed) cls += ' reviewed';
          else if (isAnswered) cls += ' answered';
          return (
            <button key={q.id} className={cls} onClick={() => onNavigate(i)}
              title={isLocked ? 'Locked - Time Expired' : `Question ${i + 1}`}>
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="palette-legend">
        <div className="legend-item"><span className="legend-dot answered" /> Answered</div>
        <div className="legend-item"><span className="legend-dot current" /> Current</div>
        <div className="legend-item"><span className="legend-dot reviewed" /> Review</div>
        <div className="legend-item"><span className="legend-dot locked" /> Locked</div>
        <div className="legend-item"><span className="legend-dot unanswered" /> Unanswered</div>
      </div>
    </div>
  );
}
