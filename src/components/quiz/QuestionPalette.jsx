export default function QuestionPalette({ questions, currentIndex, answers, lockedQuestions, getStatus, onNavigate }) {
  return (
    <div className="question-palette">
      <h4 className="palette-title"><i className="fas fa-th" /> Question Palette</h4>
      <div className="palette-grid">
        {questions.map((q, i) => {
          const status = getStatus ? getStatus(q.id, i) : null;
          const isLocked = lockedQuestions?.includes(q.id) || status === 'locked';
          const isAnswered = !isLocked && answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '';
          const isCurrent = i === currentIndex;
          const isSkipped = !isLocked && !isAnswered && i < currentIndex;
          const isFuture = !isLocked && !isCurrent && i > currentIndex;
          const isDisabled = isLocked || isFuture;

          let cls = 'palette-btn';
          if (isLocked) cls += ' locked';
          else if (isCurrent) cls += ' current';
          else if (isAnswered) cls += ' answered';
          else if (isSkipped) cls += ' skipped';

          return (
            <button key={q.id} className={cls}
              onClick={() => !isDisabled && onNavigate(i)}
              disabled={isDisabled}
              title={isLocked ? 'Locked - Time Expired' : isFuture ? 'Not reached yet' : `Question ${i + 1}`}>
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="palette-legend">
        <div className="legend-item"><span className="legend-dot answered" /> Answered</div>
        <div className="legend-item"><span className="legend-dot current" /> Current</div>
        <div className="legend-item"><span className="legend-dot locked" /> Locked</div>
        <div className="legend-item"><span className="legend-dot skipped" /> Skipped</div>
        <div className="legend-item"><span className="legend-dot unanswered" /> Unanswered</div>
      </div>
    </div>
  );
}
