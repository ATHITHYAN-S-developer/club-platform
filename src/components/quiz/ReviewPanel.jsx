import { useQuiz } from '../../contexts/QuizContext';

export default function ReviewPanel({ questions: propQuestions, answers: propAnswers, lockedQuestions: propLocked }) {
  const ctx = useQuiz();
  const questions = propQuestions || ctx.questions;
  const answers = propAnswers || ctx.answers;
  const lockedQuestions = propLocked || ctx.lockedQuestions;
  const result = ctx.result;

  return (
    <div style={{ maxWidth: 560, margin: '1rem auto' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>
        <i className="fas fa-list" style={{ marginRight: '0.35rem', color: 'var(--orange)' }} />
        Answer Review
      </h3>
      {questions.map((q, i) => {
        const userAnswer = answers[q.id];
        const isLocked = lockedQuestions.includes(q.id);
        const correctOpt = q.options?.find((o) => o.isCorrect);
        const selectedOpt = q.options?.find((o) => o.id === userAnswer);

        let isCorrect = false;
        if (q.type === 'multiple-select' && Array.isArray(userAnswer)) {
          const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id).sort();
          const selectedIds = [...userAnswer].sort();
          isCorrect = correctIds.length === selectedIds.length && correctIds.every((id, i2) => id === selectedIds[i2]);
        } else if (q.options) {
          isCorrect = selectedOpt?.isCorrect || false;
        } else {
          isCorrect = String(userAnswer || '').trim().toLowerCase() === String(q.correctAnswer || '').trim().toLowerCase();
        }

        const hasAnswer = userAnswer !== undefined && userAnswer !== null && userAnswer !== '';

        return (
          <div key={q.id} style={{
            background: 'var(--card)', border: `1px solid ${isCorrect ? '#22c55e' : hasAnswer ? '#ef4444' : 'var(--border)'}`,
            borderRadius: 12, padding: '0.85rem', marginBottom: '0.65rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.72rem',
                background: isCorrect ? '#dcfce7' : hasAnswer ? '#fee2e2' : 'var(--surface)',
                color: isCorrect ? '#15803d' : hasAnswer ? '#dc2626' : 'var(--text-muted)',
              }}>{i + 1}</span>
              <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text)', flex: 1 }}>
                {q.questionText}
              </span>
              {isLocked && <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 600 }}>⏱ Expired</span>}
            </div>

            {q.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.35rem' }}>
                {q.options.map((opt) => {
                  const isSelected = userAnswer === opt.id || (Array.isArray(userAnswer) && userAnswer.includes(opt.id));
                  return (
                    <div key={opt.id} style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.6rem',
                      borderRadius: 8, fontSize: '0.8rem',
                      background: opt.isCorrect ? '#dcfce7' : isSelected ? '#fee2e2' : 'transparent',
                      border: `1px solid ${opt.isCorrect ? '#22c55e' : isSelected ? '#ef4444' : 'transparent'}`,
                    }}>
                      <span style={{
                        fontWeight: 700, fontSize: '0.7rem', width: 16, textAlign: 'center',
                        color: opt.isCorrect ? '#15803d' : 'var(--text-muted)',
                      }}>{opt.id.toUpperCase()}</span>
                      <span style={{ flex: 1, color: 'var(--text)' }}>{opt.text}</span>
                      {opt.isCorrect && <i className="fas fa-check-circle" style={{ color: '#22c55e', fontSize: '0.75rem' }} />}
                      {isSelected && !opt.isCorrect && <i className="fas fa-times-circle" style={{ color: '#ef4444', fontSize: '0.75rem' }} />}
                    </div>
                  );
                })}
              </div>
            )}

            {!q.options && (
              <div style={{ marginTop: '0.35rem', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Your answer: </span>
                <span style={{
                  fontWeight: 600,
                  color: isCorrect ? '#22c55e' : '#ef4444',
                }}>{hasAnswer ? userAnswer : '(skipped)'}</span>
                {!isCorrect && q.correctAnswer && (
                  <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                    (correct: <span style={{ color: '#22c55e' }}>{q.correctAnswer}</span>)
                  </span>
                )}
              </div>
            )}

            {q.explanation && (
              <div style={{
                marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)',
                padding: '0.4rem', background: 'var(--surface)', borderRadius: 8,
                borderLeft: '3px solid var(--orange)',
              }}>
                <i className="fas fa-info-circle" style={{ color: 'var(--orange)', marginRight: '0.3rem' }} />
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
