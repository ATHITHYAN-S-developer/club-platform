import { Link } from 'react-router-dom';
import { DIFFICULTY, CHALLENGE_TYPES } from '../config/challengeConfig';

export default function ChallengeCard({ challenge, userSubmission }) {
  const diff = DIFFICULTY[challenge.difficulty] || DIFFICULTY.easy;
  const type = CHALLENGE_TYPES[challenge.challengeType] || CHALLENGE_TYPES.coding;

  const dueDate = challenge.dueDate ? new Date(challenge.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date();
  const daysLeft = dueDate ? Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <Link
      to={`/challenges/${challenge.id}`}
      className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--orange)]/5 hover:border-[var(--orange)]/20 group relative overflow-hidden"
      style={{ textDecoration: 'none' }}
    >
      <div className="absolute top-0 left-0 w-full h-1" style={{ background: diff.color }} />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
            style={{ background: `${diff.color}15`, color: diff.color }}
          >
            <i className={`fa-solid fa-bolt text-[10px]`} />
            {diff.label}
          </span>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[var(--text-muted)] bg-[var(--surface)]"
          >
            <i className={`fa-solid ${type.icon} text-[10px]`} />
            {type.label}
          </span>
        </div>
        {userSubmission && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            userSubmission.status === 'passed' ? 'bg-[#d1fae5] text-[#065f46]' :
            userSubmission.status === 'failed' ? 'bg-[#fee2e2] text-[#991b1b]' :
            'bg-[#fef3c7] text-[#92400e]'
          }`}>
            {userSubmission.status === 'passed' ? '✅ Solved' : userSubmission.status === 'failed' ? '❌ Failed' : '🕐 Pending'}
          </span>
        )}
      </div>

      <h3 className="text-base font-bold text-[var(--text)] mb-1.5 group-hover:text-[var(--orange)] transition-colors">
        {challenge.title}
      </h3>

      <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-3 leading-relaxed">
        {challenge.description}
      </p>

      {challenge.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {challenge.tags.slice(0, 4).map(tag => (
            <span key={tag} className="text-[11px] font-medium text-[var(--text-muted)] bg-[var(--surface)] px-2 py-0.5 rounded-md">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-3 border-t border-[var(--border-light)]">
        <div className="flex items-center gap-3">
          <span><i className="fa-solid fa-star text-yellow-500 mr-1" />{challenge.xpReward || diff.baseXp} XP</span>
          <span><i className="fa-solid fa-clock mr-1" />{challenge.estimatedTime || `${diff.timeLimit} min`}</span>
        </div>
        {daysLeft !== null && (
          <span className={isOverdue ? 'text-red-500' : ''}>
            {isOverdue ? 'Overdue' : `${daysLeft}d left`}
          </span>
        )}
      </div>
    </Link>
  );
}
