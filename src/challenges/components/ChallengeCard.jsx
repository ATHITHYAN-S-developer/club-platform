import React from 'react';
import { DIFFICULTY, CHALLENGE_TYPES } from '../config/challengeConfig';

export default function ChallengeCard({ challenge, userSubmission }) {
  const diff = DIFFICULTY[challenge.difficulty] || DIFFICULTY.easy;
  const type = CHALLENGE_TYPES[challenge.challengeType] || CHALLENGE_TYPES.coding;

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl transition-all duration-300 hover:shadow-md hover:border-[var(--orange)]/40 group gap-4 shadow-sm">
      
      {/* Left side: Icon + Title, Description, and meta */}
      <div className="flex items-start gap-4 min-w-0 flex-1 w-full">
        
        {/* Round Icon Box with clear margins and padding */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--surface-2)] border border-[var(--border)]" style={{ color: diff.color }}>
          <i className={`fa-solid ${type.icon} text-lg`} />
        </div>
        
        {/* Text Area with clear vertical spacing */}
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-extrabold text-[var(--text)] group-hover:text-[var(--orange)] transition-colors truncate tracking-tight">
              {challenge.title}
            </h3>
            <span
              className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
              style={{ backgroundColor: `${diff.color}15`, color: diff.color }}
            >
              {diff.label}
            </span>
            {userSubmission && (
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                userSubmission.status === 'passed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {userSubmission.status === 'passed' ? '✓ Solved' : 'Tried'}
              </span>
            )}
          </div>
          
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed pr-2">
            {challenge.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] pt-1">
            <span className="flex items-center gap-1"><i className="fa-solid fa-star text-yellow-500" /> {challenge.xpReward} XP</span>
            <span>•</span>
            <span className="flex items-center gap-1"><i className="fa-solid fa-clock" /> {challenge.estimatedTime || `${diff.timeLimit}m limit`}</span>
            <span>•</span>
            <span className="text-blue-500 font-extrabold">Submissions Open</span>
          </div>
        </div>
      </div>

      {/* Right side: Challenger metrics */}
      <div className="w-full md:w-auto mt-4 md:mt-0 flex-shrink-0 text-left md:text-right pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-[var(--border-light)] md:pl-6 min-w-[140px] flex flex-row md:flex-col justify-between items-center md:items-end gap-2">
        <div>
          <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-wider">Challengers</p>
          <p className="text-xs font-black text-[var(--text)] mt-0.5">30 Active</p>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--orange)] group-hover:translate-x-1 transition-transform">
          Solve <i className="fa-solid fa-chevron-right text-[9px]" />
        </span>
      </div>

    </div>
  );
}
