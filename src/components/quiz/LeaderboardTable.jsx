import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

export default function LeaderboardTable({ data, currentUserId }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 20;

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(p =>
      (p.userName || p.name || '').toLowerCase().includes(q) ||
      (p.college || '').toLowerCase().includes(q) ||
      (p.department || '').toLowerCase().includes(q)
    );
  }, [data, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  useMemo(() => {
    if (page > totalPages && totalPages > 0) setPage(totalPages);
  }, [filtered.length]);

  const getAccuracyColor = (acc) => {
    if (acc >= 80) return 'var(--badge-green, #22c55e)';
    if (acc >= 60) return 'var(--badge-orange, #ff5500)';
    return 'var(--badge-red, #ef4444)';
  };

  return (
    <div className="lb-table-wrapper">
      <div className="lb-table-header">
        <div className="lb-search">
          <i className="fas fa-search"></i>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, college..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <span className="lb-count">{filtered.length} participant{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="lb-table-container">
        <table className="lb-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>College</th>
              <th>Dept</th>
              <th>Score</th>
              <th>Accuracy</th>
              <th>Time</th>
              <th>Badges</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p, i) => {
              const isMe = p.userId === currentUserId;
              const rank = (page - 1) * perPage + i + 1;
              const accuracy = p.accuracy || Math.round((p.score || 0) / (p.total || 1) * 100);
              const badges = p.badges || [];
              return (
                <motion.tr
                  key={p.id || `${p.userId}-${p.quizId}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={isMe ? 'my-row' : ''}
                >
                  <td>
                    {rank <= 3 ? (
                      <span className={`rank-badge rank-${rank}`}>
                        <i className={`fas ${rank === 1 ? 'fa-trophy' : rank === 2 ? 'fa-medal' : 'fa-medal'}`}></i>
                      </span>
                    ) : (
                      <span className="rank-number">{rank}</span>
                    )}
                  </td>
                  <td>
                    <div className="lb-player-cell">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.userName || p.name)}&background=ff5500&color=fff`}
                        alt=""
                        className="lb-avatar"
                      />
                      <div>
                        <strong>{p.userName || p.name}</strong>
                      </div>
                    </div>
                  </td>
                  <td>{p.college || '-'}</td>
                  <td>{p.department || '-'}</td>
                  <td><strong>{p.score}/{p.total}</strong></td>
                  <td>
                    <span className="accuracy-dot" style={{ background: getAccuracyColor(accuracy) }}></span>
                    {accuracy}%
                  </td>
                  <td>{p.timeTaken || p.timeSpent || '-'}s</td>
                  <td>
                    <div className="lb-badges">
                      {badges.slice(0, 3).map((b, bi) => (
                        <span key={bi} className="badge badge-orange" title={b.desc || b.label}>
                          <i className={`fas ${b.icon || 'fa-star'}`}></i>
                        </span>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        {paginated.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><i className="fas fa-users"></i></div>
            <h3>No Results Found</h3>
            <p>Try adjusting your search.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="lb-pagination">
          <button className="btn btn-sm btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <i className="fas fa-chevron-left"></i>
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }
            return (
              <button
                key={pageNum}
                className={`btn btn-sm ${page === pageNum ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          <button className="btn btn-sm btn-outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}
