import { useQuiz } from '../../contexts/QuizContext';

export default function ProgressHeader({ overallTime, questionTime }) {
  const { currentIndex, totalCount, answeredCount, lockedCount, remainingCount } = useQuiz();
  const progress = totalCount > 0 ? Math.round(((answeredCount + lockedCount) / totalCount) * 100) : 0;

  const formatT = (s) => {
    if (s == null || s < 0) return '--:--';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const barColor = progress < 50 ? 'var(--orange)' : progress < 80 ? 'var(--warning, #f59e0b)' : 'var(--success, #22c55e)';

  return (
    <div style={{
      background: 'var(--card)', borderBottom: '1px solid var(--border)',
      padding: '0.65rem 1rem',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)',
            background: 'rgba(255,85,0,0.1)', padding: '0.2rem 0.6rem',
            borderRadius: 8,
          }}>
            {currentIndex + 1} / {totalCount}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <i className="fas fa-clock" style={{ color: 'var(--orange)' }} />
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>{formatT(overallTime)}</span>
            <span style={{ color: 'var(--text-muted)' }}>Overall</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <i className="fas fa-hourglass-half" style={{ color: questionTime <= 10 ? '#ef4444' : 'var(--text-muted)' }} />
            <span style={{
              fontWeight: 700, color: questionTime <= 10 ? '#ef4444' : 'var(--text)',
              transition: 'color 0.3s',
            }}>{formatT(questionTime)}</span>
            <span style={{ color: 'var(--text-muted)' }}>Q</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem' }}>
          <span style={{ color: '#22c55e', fontWeight: 600 }}>A: {answeredCount}</span>
          <span style={{ color: '#ef4444', fontWeight: 600 }}>L: {lockedCount}</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>R: {remainingCount}</span>
        </div>
      </div>

      <div style={{
        marginTop: '0.4rem', height: 4, background: 'var(--border)',
        borderRadius: 4, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${progress}%`, background: barColor,
          borderRadius: 4, transition: 'width 0.5s ease, background 0.5s ease',
        }} />
      </div>
    </div>
  );
}
