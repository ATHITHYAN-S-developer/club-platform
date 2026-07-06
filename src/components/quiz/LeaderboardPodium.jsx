import React from 'react';
import { motion } from 'framer-motion';

export default function LeaderboardPodium({ topThree }) {
  const positions = [
    { rank: 2, label: '2nd', icon: 'fa-medal', color: '#a0a0a0', delay: 0.2 },
    { rank: 1, label: '1st', icon: 'fa-crown', color: '#ffd700', delay: 0 },
    { rank: 3, label: '3rd', icon: 'fa-medal', color: '#cd7f32', delay: 0.4 },
  ];

  return (
    <div className="lb-podium">
      {positions.map((pos) => {
        const player = topThree.find(p => p.rank === pos.rank);
        return (
          <motion.div
            key={pos.rank}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pos.delay, type: 'spring', stiffness: 100 }}
            className={`podium-item rank-${pos.rank}`}
          >
            <div className="podium-avatar-wrap">
              <div className="podium-rank-badge" style={{ background: pos.color }}>
                <i className={`fas ${pos.icon}`}></i>
              </div>
              <div className="podium-avatar">
                {player ? (
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(player.userName || player.name)}&background=ff5500&color=fff`} alt="" />
                ) : (
                  <i className="fas fa-user"></i>
                )}
              </div>
            </div>
            <div className="podium-info">
              <strong>{player?.userName || player?.name || '---'}</strong>
              <span className="podium-score">{player?.score || 0}/{player?.total || 0}</span>
              <span className="podium-accuracy">{player?.accuracy || Math.round((player?.score || 0) / (player?.total || 1) * 100)}% accuracy</span>
            </div>
            <div className="podium-bar" style={{ background: pos.color, opacity: 0.3, height: pos.rank === 1 ? '120px' : pos.rank === 2 ? '90px' : '60px' }}></div>
          </motion.div>
        );
      })}
    </div>
  );
}
