import React from 'react';

export default function QuizTimer({ timeLeft, formatted, progress, isWarning, isDanger }) {
  let colorClass = 'timer-green';
  if (isDanger) colorClass = 'timer-danger';
  else if (isWarning) colorClass = 'timer-warning';
  else if (progress < 0.5) colorClass = 'timer-orange';

  return (
    <div className={`quiz-timer ${colorClass}`}>
      <div className="timer-display">
        <i className={`fas ${isDanger ? 'fa-exclamation-triangle' : isWarning ? 'fa-clock' : 'fa-hourglass-half'}`}></i>
        <span className="timer-text">{formatted}</span>
      </div>
      <div className="timer-bar-track">
        <div className="timer-bar-fill" style={{ width: `${Math.max(0, progress * 100)}%` }}></div>
      </div>
    </div>
  );
}
