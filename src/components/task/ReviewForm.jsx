import { useState, useEffect } from 'react';
import { getScoringCriteria } from '../../config/taskConfig';

const STATUS_STEPS = [
  { value: 'submitted', label: 'Submitted', icon: 'fa-paper-plane' },
  { value: 'under_review', label: 'Under Review', icon: 'fa-eye' },
  { value: 'feedback_added', label: 'Feedback Added', icon: 'fa-comment' },
  { value: 'approved', label: 'Approved', icon: 'fa-check-circle' },
];

export default function ReviewForm({ task, submission, existingReview, onSubmit, loading, onStatusChange }) {
  const [scores, setScores] = useState({});
  const [feedback, setFeedback] = useState({
    overallComments: '',
    strengths: '',
    improvements: '',
    suggestions: '',
  });
  const [approve, setApprove] = useState(true);

  const criteria = getScoringCriteria(task.taskType);

  useEffect(() => {
    if (existingReview) {
      const scoreMap = {};
      existingReview.scores.forEach(s => { scoreMap[s.criteria] = s.score; });
      setScores(scoreMap);
      setFeedback(existingReview.feedback || {
        overallComments: '', strengths: '', improvements: '', suggestions: '',
      });
    }
  }, [existingReview]);

  const handleScoreChange = (key, value) => {
    const num = Math.min(25, Math.max(0, parseInt(value) || 0));
    setScores(prev => ({ ...prev, [key]: num }));
  };

  const handleSubmit = () => {
    const scoresArray = criteria.map(c => ({
      criteria: c.key,
      label: c.label,
      score: scores[c.key] || 0,
      maxScore: c.maxScore,
    }));

    onSubmit({
      scores: scoresArray,
      feedback,
      approve,
    });
  };

  const currentStatusIndex = STATUS_STEPS.findIndex(s => s.value === submission.status);
  const isReviewed = submission.status === 'approved' || submission.status === 'rejected';

  return (
    <div className="rf-container">
      <div className="rf-status-timeline">
        {STATUS_STEPS.map((step, idx) => {
          const isActive = idx <= currentStatusIndex;
          const isCurrent = idx === currentStatusIndex;
          return (
            <div key={step.value} className={`rf-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
              <div className="rf-step-icon">
                <i className={`fa-solid ${step.icon}`} />
              </div>
              <span className="rf-step-label">{step.label}</span>
              {idx < STATUS_STEPS.length - 1 && <div className="rf-step-line" />}
            </div>
          );
        })}
        <div className={`rf-step ${submission.status === 'rejected' ? 'active rejected' : ''}`}>
          <div className="rf-step-icon">
            <i className="fa-solid fa-xmark" />
          </div>
          <span className="rf-step-label">Rejected</span>
        </div>
      </div>

      <div className="rf-section">
        <h4 className="rf-section-title">
          <i className="fa-solid fa-star" /> Scoring
        </h4>
        <p className="rf-section-desc">Rate each criteria out of 25 (total: 100 max)</p>

        <div className="rf-scores">
          {criteria.map(c => (
            <div key={c.key} className="rf-score-item">
              <div className="rf-score-header">
                <span className="rf-score-label">{c.label}</span>
                <div className="rf-score-input-group">
                  <input
                    type="range"
                    min={0}
                    max={c.maxScore}
                    value={scores[c.key] || 0}
                    onChange={(e) => handleScoreChange(c.key, e.target.value)}
                    className="rf-range"
                  />
                  <span className="rf-score-value">{scores[c.key] || 0}</span>
                </div>
              </div>
              <div className="rf-score-bar-bg">
                <div className="rf-score-bar-fill" style={{ width: `${((scores[c.key] || 0) / c.maxScore) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="rf-total">
          <span>Total Score</span>
          <span className="rf-total-value">
            {criteria.reduce((sum, c) => sum + (scores[c.key] || 0), 0)} / 100
          </span>
        </div>
      </div>

      <div className="rf-section">
        <h4 className="rf-section-title">
          <i className="fa-solid fa-comment" /> Feedback
        </h4>

        {[
          { key: 'overallComments', label: 'Overall Comments', rows: 3 },
          { key: 'strengths', label: 'Strengths', rows: 2 },
          { key: 'improvements', label: 'Areas for Improvement', rows: 2 },
          { key: 'suggestions', label: 'Suggestions', rows: 2 },
        ].map(f => (
          <div key={f.key} className="rf-feedback-field">
            <label className="rf-feedback-label">{f.label}</label>
            <textarea
              className="rf-feedback-input"
              value={feedback[f.key]}
              onChange={(e) => setFeedback(prev => ({ ...prev, [f.key]: e.target.value }))}
              rows={f.rows}
              placeholder={`Enter ${f.label.toLowerCase()}...`}
            />
          </div>
        ))}
      </div>

      {!isReviewed && (
        <div className="rf-actions">
          {submission.status === 'feedback_added' && (
            <div className="rf-decision">
              <label className="rf-decision-label">
                <i className="fa-solid fa-gavel" /> Decision
              </label>
              <div className="rf-decision-buttons">
                <button
                  className={`rf-dec-btn ${approve ? 'active-approve' : ''}`}
                  onClick={() => setApprove(true)}
                >
                  <i className="fa-solid fa-check" /> Approve
                </button>
                <button
                  className={`rf-dec-btn ${!approve ? 'active-reject' : ''}`}
                  onClick={() => setApprove(false)}
                >
                  <i className="fa-solid fa-xmark" /> Reject
                </button>
              </div>
            </div>
          )}

          <button
            className="rf-submit-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <><i className="fa-solid fa-spinner fa-spin" /> Saving...</>
            ) : submission.status === 'feedback_added' ? (
              <><i className="fa-solid fa-check-circle" /> {approve ? 'Approve & Award XP' : 'Reject'}</>
            ) : (
              <><i className="fa-solid fa-save" /> Save Review & Mark Feedback Added</>
            )}
          </button>

          {submission.status === 'submitted' && (
            <button
              className="rf-start-btn"
              onClick={() => onStatusChange?.('under_review')}
              disabled={loading}
            >
              <i className="fa-solid fa-eye" /> Mark as Under Review
            </button>
          )}
        </div>
      )}

      {isReviewed && (
        <div className="rf-completed">
          <i className="fa-solid fa-check-circle" />
          <span>{submission.status === 'approved' ? 'Approved & XP Awarded' : 'Rejected'}</span>
        </div>
      )}

      <style>{`
        .rf-container { display: flex; flex-direction: column; gap: 1.5rem; }
        .rf-status-timeline { display: flex; align-items: center; gap: 0.5rem; padding: 1rem; background: #f9fafb; border-radius: 12px; flex-wrap: wrap; }
        .rf-step { display: flex; align-items: center; gap: 0.4rem; position: relative; }
        .rf-step-icon { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #e5e7eb; color: #9ca3af; font-size: 0.7rem; transition: all 0.3s; }
        .rf-step.active .rf-step-icon { background: #10b981; color: white; }
        .rf-step.active.rejected .rf-step-icon { background: #ef4444; color: white; }
        .rf-step.current .rf-step-icon { box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }
        .rf-step-label { font-size: 0.72rem; font-weight: 600; color: #6b7280; white-space: nowrap; }
        .rf-step.active .rf-step-label { color: #0f1117; }
        .rf-step-line { width: 20px; height: 2px; background: #e5e7eb; }
        .rf-section { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; }
        .rf-section-title { font-size: 1rem; font-weight: 700; margin: 0 0 0.25rem; display: flex; align-items: center; gap: 0.5rem; color: #0f1117; }
        .rf-section-desc { font-size: 0.8rem; color: #6b7280; margin: 0 0 1rem; }
        .rf-scores { display: flex; flex-direction: column; gap: 1rem; }
        .rf-score-item { display: flex; flex-direction: column; gap: 0.35rem; }
        .rf-score-header { display: flex; justify-content: space-between; align-items: center; }
        .rf-score-label { font-size: 0.85rem; font-weight: 600; color: #374151; }
        .rf-score-input-group { display: flex; align-items: center; gap: 0.5rem; }
        .rf-range { width: 140px; accent-color: var(--orange); }
        .rf-score-value { font-weight: 800; font-size: 0.9rem; color: var(--orange); min-width: 24px; text-align: right; }
        .rf-score-bar-bg { height: 4px; background: #f3f4f6; border-radius: 2px; overflow: hidden; }
        .rf-score-bar-fill { height: 100%; background: linear-gradient(90deg, var(--orange), #f97316); border-radius: 2px; transition: width 0.3s; }
        .rf-total { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f9fafb; border-radius: 10px; margin-top: 0.5rem; }
        .rf-total span { font-size: 0.85rem; font-weight: 600; color: #6b7280; }
        .rf-total-value { color: var(--orange) !important; font-size: 1.1rem !important; }
        .rf-feedback-field { margin-bottom: 1rem; }
        .rf-feedback-label { display: block; font-size: 0.85rem; font-weight: 600; color: #374151; margin-bottom: 0.35rem; }
        .rf-feedback-input { width: 100%; padding: 0.6rem 0.85rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.85rem; color: #0f1117; background: #f9fafb; font-family: inherit; resize: vertical; box-sizing: border-box; }
        .rf-feedback-input:focus { outline: none; border-color: var(--orange); }
        .rf-actions { display: flex; flex-direction: column; gap: 0.75rem; }
        .rf-decision { display: flex; flex-direction: column; gap: 0.5rem; }
        .rf-decision-label { font-size: 0.85rem; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 0.4rem; }
        .rf-decision-buttons { display: flex; gap: 0.5rem; }
        .rf-dec-btn { flex: 1; padding: 0.6rem; border-radius: 10px; border: 2px solid #e5e7eb; background: white; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
        .rf-dec-btn.active-approve { border-color: #10b981; background: #d1fae5; color: #065f46; }
        .rf-dec-btn.active-reject { border-color: #ef4444; background: #fee2e2; color: #991b1b; }
        .rf-submit-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; background: var(--orange); color: white; border: none; border-radius: 10px; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .rf-submit-btn:hover { background: var(--orange-dark); }
        .rf-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .rf-start-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.6rem; background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
        .rf-completed { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 1rem; border-radius: 10px; font-weight: 700; }
        .rf-completed { background: #d1fae5; color: #065f46; }
      `}</style>
    </div>
  );
}
