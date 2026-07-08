import { useState } from 'react';

export default function TaskLeaderboardTable({ entries }) {
  const [search, setSearch] = useState('');

  const filtered = entries.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="tlt-container">
      <div className="tlt-search">
        <i className="fa-solid fa-magnifying-glass" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or department..."
        />
      </div>

      <div className="tlt-table-wrapper">
        <table className="tlt-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Member</th>
              <th>Department</th>
              <th>Level</th>
              <th>Total XP</th>
              <th>Avg Score</th>
              <th>Tasks</th>
              <th>Streak</th>
              <th>Badges</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="tlt-empty">No entries found</td>
              </tr>
            ) : filtered.map((entry) => (
              <tr key={entry.userId} className={`tlt-row ${entry.rank <= 3 ? `tlt-rank-${entry.rank}` : ''}`}>
                <td>
                  <span className="tlt-rank">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                  </span>
                </td>
                <td>
                  <div className="tlt-member">
                    <img
                      src={entry.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name)}&background=ff5500&color=fff`}
                      alt={entry.name}
                      className="tlt-avatar"
                    />
                    <span className="tlt-name">{entry.name}</span>
                  </div>
                </td>
                <td className="tlt-dept">{entry.department}</td>
                <td>
                  <span className="tlt-level">Lv.{entry.level}</span>
                </td>
                <td className="tlt-xp">{entry.overallScore.toLocaleString()}</td>
                <td>
                  <div className="tlt-score-bar">
                    <div className="tlt-score-fill" style={{ width: `${entry.avgScore}%` }} />
                    <span>{entry.avgScore}%</span>
                  </div>
                </td>
                <td className="tlt-tasks">{entry.tasksCompleted}</td>
                <td>
                  {entry.streak > 0 ? (
                    <span className="tlt-streak">🔥 {entry.streak}w</span>
                  ) : (
                    <span className="tlt-streak-none">—</span>
                  )}
                </td>
                <td>
                  <div className="tlt-badges">
                    {entry.badges?.slice(0, 3).map((b, i) => (
                      <span key={i} className="tlt-badge" title={b.name}>{b.icon}</span>
                    ))}
                    {entry.badges?.length > 3 && (
                      <span className="tlt-badge-more">+{entry.badges.length - 3}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .tlt-container { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; }
        .tlt-search { display: flex; align-items: center; gap: 0.6rem; padding: 1rem 1.25rem; border-bottom: 1px solid #f3f4f6; }
        .tlt-search input { border: none; background: none; font-size: 0.88rem; color: #0f1117; width: 100%; outline: none; }
        .tlt-search i { color: #9ca3af; font-size: 0.82rem; }
        .tlt-table-wrapper { overflow-x: auto; }
        .tlt-table { width: 100%; border-collapse: collapse; }
        .tlt-table th { text-align: left; padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #f3f4f6; background: #fafafa; }
        .tlt-table td { padding: 0.75rem 1rem; font-size: 0.85rem; color: #374151; border-bottom: 1px solid #f3f4f6; }
        .tlt-row:hover { background: #f9fafb; }
        .tlt-rank-1 { background: #fffbeb !important; }
        .tlt-rank-2 { background: #f9fafb !important; }
        .tlt-rank-3 { background: #fff7ed !important; }
        .tlt-rank { font-weight: 700; font-size: 0.9rem; }
        .tlt-member { display: flex; align-items: center; gap: 0.6rem; }
        .tlt-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
        .tlt-name { font-weight: 600; color: #0f1117; }
        .tlt-dept { color: #6b7280; font-size: 0.8rem; }
        .tlt-level { font-weight: 700; color: var(--orange); font-size: 0.82rem; }
        .tlt-xp { font-weight: 700; color: #0f1117; }
        .tlt-score-bar { display: flex; align-items: center; gap: 0.5rem; }
        .tlt-score-fill { height: 6px; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 3px; max-width: 80px; min-width: 4px; }
        .tlt-score-bar span { font-size: 0.78rem; font-weight: 600; color: #6b7280; }
        .tlt-tasks { font-weight: 600; text-align: center; }
        .tlt-streak { font-weight: 600; font-size: 0.82rem; }
        .tlt-streak-none { color: #d1d5db; }
        .tlt-badges { display: flex; gap: 0.2rem; align-items: center; }
        .tlt-badge { font-size: 1.1rem; cursor: default; }
        .tlt-badge-more { font-size: 0.7rem; font-weight: 600; color: #9ca3af; }
        .tlt-empty { text-align: center; padding: 2rem; color: #6b7280; }
        @media (max-width: 768px) {
          .tlt-table th, .tlt-table td { padding: 0.5rem 0.6rem; font-size: 0.78rem; }
        }
      `}</style>
    </div>
  );
}
