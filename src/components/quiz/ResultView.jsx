import { useState, useEffect } from 'react';
import { useQuiz } from '../../contexts/QuizContext';
import { getUserRank } from '../../services/leaderboardService';
import ReviewPanel from './ReviewPanel';

export default function ResultView() {
  const { result, quiz, questions, answers, lockedQuestions } = useQuiz();
  const [showReview, setShowReview] = useState(false);
  const [rank, setRank] = useState(null);
  const [totalParticipants, setTotalParticipants] = useState(0);

  useEffect(() => {
    if (!result?.quizId || !result?.userId) return;
    getUserRank(result.userId, result.quizId).then(data => {
      if (data) {
        setRank(data.rank);
        setTotalParticipants(data.total);
      }
    }).catch(() => {});
  }, [result]);

  if (!result) return null;

  const { score, total, percentage, correct, wrong, skipped, timeTaken, badge, pass } = result;
  const passed = pass ?? percentage >= (quiz?.passPercentage || 40);

  return (
    <div style={{ maxWidth: 560, margin: '2rem auto', padding: '1rem' }}>
      {passed && (
        <div style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '0.5rem' }}>
          🎉
        </div>
      )}

      <div style={{
        background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)',
        overflow: 'hidden',
      }}>
        <div style={{
          textAlign: 'center', padding: '2rem 1.5rem 1.5rem',
          background: passed
            ? 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))'
            : 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 0.75rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: passed ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            fontSize: '1.8rem',
          }}>
            {passed ? '✅' : '❌'}
          </div>
          <h2 style={{
            fontSize: '1.4rem', fontWeight: 800, margin: 0,
            color: passed ? '#22c55e' : '#ef4444',
          }}>
            {passed ? 'Congratulations! 🎉' : 'Better luck next time!'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            {passed ? 'You passed the quiz!' : 'You did not pass this time.'}
          </p>
        </div>

        <div style={{ padding: '1.25rem' }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%', margin: '0 auto 1rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: `conic-gradient(${passed ? '#22c55e' : '#ef4444'} ${percentage * 3.6}deg, var(--border) ${percentage * 3.6}deg)`,
            position: 'relative',
          }}>
            <div style={{
              width: 104, height: 104, borderRadius: '50%',
              background: 'var(--card)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>{percentage}%</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{score}/{total}</span>
            </div>
          </div>

          {rank !== null && totalParticipants > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              padding: '0.7rem 1rem', marginBottom: '0.75rem',
              background: 'rgba(255,85,0,0.06)', borderRadius: 12,
              border: '1px solid rgba(255,85,0,0.2)',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(255,85,0,0.12)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="fas fa-trophy" style={{ color: 'var(--orange)', fontSize: '1.1rem' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>Your Rank</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--orange)' }}>
                  #{rank} <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-muted)' }}>of {totalParticipants}</span>
                </div>
              </div>
            </div>
          )}

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1rem',
          }}>
            {[
              { label: 'Correct', value: correct, color: '#22c55e', icon: 'fa-check' },
              { label: 'Wrong', value: wrong, color: '#ef4444', icon: 'fa-times' },
              { label: 'Skipped', value: skipped, color: 'var(--text-muted)', icon: 'fa-forward' },
              { label: 'Time Taken', value: timeTaken ? `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s` : '--', color: 'var(--text)', icon: 'fa-clock' },
            ].map((s) => (
              <div key={s.label} style={{
                background: 'var(--surface)', borderRadius: 10, padding: '0.65rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `${s.color}15`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <i className={`fas ${s.icon}`} style={{ color: s.color, fontSize: '0.8rem' }} />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{s.value}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {badge && (
            <div style={{
              textAlign: 'center', padding: '0.75rem', marginBottom: '0.75rem',
              background: `${badge.color}12`, borderRadius: 12,
              border: `1px solid ${badge.color}30`,
            }}>
              <i className={`fas ${badge.icon || 'fa-medal'}`} style={{ fontSize: '1.8rem', color: badge.color }} />
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: badge.color, marginTop: '0.25rem' }}>
                {badge.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                +{badge.rewardPoints || 0} points
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setShowReview(!showReview)} style={{
            flex: 1, padding: '0.6rem', borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text)', fontWeight: 600,
            cursor: 'pointer', fontSize: '0.82rem',
          }}>
            <i className={`fas ${showReview ? 'fa-eye-slash' : 'fa-eye'}`} style={{ marginRight: '0.3rem' }} />
            {showReview ? 'Hide Review' : 'Review Answers'}
          </button>
          <a href="/quiz" style={{
            flex: 1, padding: '0.6rem', borderRadius: 10, border: 'none',
            background: 'var(--orange)', color: '#fff', fontWeight: 600,
            cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="fas fa-arrow-left" style={{ marginRight: '0.3rem' }} />
            Back to Quizzes
          </a>
        </div>
      </div>

      {showReview && (
        <ReviewPanel questions={questions} answers={answers} lockedQuestions={lockedQuestions} />
      )}
    </div>
  );
}
