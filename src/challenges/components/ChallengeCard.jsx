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
      className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--orange)]/5 hover:border-[var(--orange)]/30 group relative overflow-hidden text-none"
      style={{ textDecoration: 'none' }}
    >
      {/* Brand left accent border bar */}
      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: diff.color }} />

      <div className="flex items-center justify-between mb-4 pl-1">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
            style={{ background: `${diff.color}15`, color: diff.color }}
          >
            {diff.label}
          </span>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black text-[var(--text-muted)] bg-[var(--surface)] uppercase tracking-wider"
          >
            <i className={`fa-solid ${type.icon} text-[10px]`} />
            {type.label}
          </span>
        </div>
        
        {userSubmission && (
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
            userSubmission.status === 'passed' ? 'bg-[#d1fae5] text-[#065f46]' :
            userSubmission.status === 'failed' ? 'bg-[#fee2e2] text-[#991b1b]' :
            'bg-[#fef3c7] text-[#92400e]'
          }`}>
            {userSubmission.status === 'passed' ? '✓ Solved' : userSubmission.status === 'failed' ? '✗ Failed' : '🕐 Tried'}
          </span>
        )}
      </div>

      <h3 className="text-base font-extrabold text-[var(--text)] mb-2 pl-1 group-hover:text-[var(--orange)] transition-colors tracking-tight">
        {challenge.title}
      </h3>

      <p className="text-xs text-[var(--text-secondary)] line-clamp-3 mb-4 pl-1 leading-relaxed">
        {challenge.description}
      </p>

      {challenge.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4 pl-1">
          {challenge.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--surface-2)] border border-[var(--border)] px-2 py-0.5 rounded-md">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-3.5 border-t border-[var(--border-light)] pl-1">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[var(--text)]">
            <i className="fa-solid fa-star text-yellow-500 mr-1" />
            {challenge.xpReward || diff.baseXp} XP
          </span>
          <span>
            <i className="fa-solid fa-clock mr-1" />
            {challenge.estimatedTime || `${diff.timeLimit}m limit`}
          </span>
        </div>
        {daysLeft !== null && (
          <span className={`font-medium ${isOverdue ? 'text-red-500' : ''}`}>
            {isOverdue ? 'Overdue' : `${daysLeft}d left`}
          </span>
        )}
      </div>
    </Link>
  );
}
