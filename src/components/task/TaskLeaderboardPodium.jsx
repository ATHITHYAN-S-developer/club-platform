export default function TaskLeaderboardPodium({ entries }) {
  if (!entries || entries.length === 0) return null;

  const top3 = entries.slice(0, 3);
  const podiumOrder = top3.length >= 3
    ? [top3[1], top3[0], top3[2]]
    : top3.length === 2
      ? [top3[1], top3[0]]
      : [top3[0]];

  const podiumHeights = ['180px', '220px', '140px'];

  return (
    <div className="tlp-container">
      <div className="tlp-podium">
        {podiumOrder.map((entry, idx) => {
          const actualRank = entry.rank;
          const isGold = actualRank === 1;
          const isSilver = actualRank === 2;
          const isBronze = actualRank === 3;

          return (
            <div key={entry.userId} className={`tlp-item ${isGold ? 'gold' : isSilver ? 'silver' : 'bronze'}`}>
              <div className="tlp-avatar-wrapper">
                <img
                  className="tlp-avatar"
                  src={entry.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name)}&background=ff5500&color=fff`}
                  alt={entry.name}
                />
                <div className="tlp-rank-badge">
                  <i className={`fa-solid ${isGold ? 'fa-crown' : isSilver ? 'fa-medal' : 'fa-medal'}`} />
                  <span>#{actualRank}</span>
                </div>
              </div>
              <div className="tlp-name">{entry.name}</div>
              <div className="tlp-dept">{entry.department}</div>
              <div className="tlp-stats">
                <div className="tlp-stat">
                  <span className="tlp-stat-value">{entry.overallScore.toLocaleString()}</span>
                  <span className="tlp-stat-label">XP</span>
                </div>
                <div className="tlp-stat">
                  <span className="tlp-stat-value">{entry.level}</span>
                  <span className="tlp-stat-label">Level</span>
                </div>
                <div className="tlp-stat">
                  <span className="tlp-stat-value">{entry.tasksCompleted}</span>
                  <span className="tlp-stat-label">Tasks</span>
                </div>
              </div>
              <div className={`tlp-bar`} style={{ height: podiumHeights[idx] }} />
            </div>
          );
        })}
      </div>

      <style>{`
        .tlp-container { padding: 2rem 0; }
        .tlp-podium { display: flex; justify-content: center; align-items: flex-end; gap: 1.5rem; }
        .tlp-item { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; position: relative; width: 200px; }
        .tlp-avatar-wrapper { position: relative; z-index: 2; }
        .tlp-avatar { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 4px solid #e5e7eb; }
        .tlp-item.gold .tlp-avatar { border-color: #ffd700; box-shadow: 0 0 20px rgba(255,215,0,0.3); }
        .tlp-item.silver .tlp-avatar { border-color: #c0c0c0; box-shadow: 0 0 20px rgba(192,192,192,0.3); }
        .tlp-item.bronze .tlp-avatar { border-color: #cd7f32; box-shadow: 0 0 20px rgba(205,127,50,0.3); }
        .tlp-rank-badge { position: absolute; bottom: -8px; right: -8px; display: flex; align-items: center; gap: 0.2rem; padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.7rem; font-weight: 800; color: white; }
        .tlp-item.gold .tlp-rank-badge { background: linear-gradient(135deg, #ffd700, #f59e0b); }
        .tlp-item.silver .tlp-rank-badge { background: linear-gradient(135deg, #c0c0c0, #9ca3af); }
        .tlp-item.bronze .tlp-rank-badge { background: linear-gradient(135deg, #cd7f32, #b45309); }
        .tlp-name { font-weight: 700; font-size: 0.95rem; color: #0f1117; text-align: center; }
        .tlp-dept { font-size: 0.75rem; color: #6b7280; text-align: center; }
        .tlp-stats { display: flex; gap: 1rem; margin-top: 0.25rem; }
        .tlp-stat { display: flex; flex-direction: column; align-items: center; }
        .tlp-stat-value { font-weight: 800; font-size: 1rem; color: #0f1117; }
        .tlp-stat-label { font-size: 0.68rem; color: #9ca3af; text-transform: uppercase; font-weight: 600; }
        .tlp-bar { width: 60px; border-radius: 12px 12px 0 0; margin-top: 0.75rem; }
        .tlp-item.gold .tlp-bar { background: linear-gradient(180deg, #ffd700, #f59e0b); }
        .tlp-item.silver .tlp-bar { background: linear-gradient(180deg, #c0c0c0, #9ca3af); }
        .tlp-item.bronze .tlp-bar { background: linear-gradient(180deg, #cd7f32, #b45309); }
        @media (max-width: 768px) {
          .tlp-podium { gap: 0.75rem; }
          .tlp-item { width: 140px; }
          .tlp-avatar { width: 56px; height: 56px; }
          .tlp-bar { width: 40px; }
        }
      `}</style>
    </div>
  );
}
