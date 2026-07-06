import React, { useState, useEffect } from 'react';
import db from '../../db.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ members: 0, quizzes: 0, attempts: 0, avgScore: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [users, quizzes, results] = await Promise.all([
        db.find('Users'),
        db.find('Quiz'),
        db.find('QuizResults'),
      ]);
      const avg = results.length > 0 ? results.reduce((s, r) => s + (r.score || 0) / (r.total || 1), 0) / results.length * 100 : 0;
      setStats({
        members: users.length,
        quizzes: quizzes.filter(q => q.published).length,
        attempts: results.length,
        avgScore: Math.round(avg),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const cards = [
    { label: 'Total Members', value: stats.members, icon: 'fa-users' },
    { label: 'Active Quizzes', value: stats.quizzes, icon: 'fa-question-circle' },
    { label: 'Completed Attempts', value: stats.attempts, icon: 'fa-check-circle' },
    { label: 'Average Score', value: `${stats.avgScore}%`, icon: 'fa-chart-simple' },
  ];

  return (
    <div>
      <div className="page-header">
        <span className="page-tag"><i className="fas fa-gauge-high"></i> Admin</span>
        <h1 className="page-title">Dashboard</h1>
      </div>
      <div className="admin-stats">
        {cards.map((card, i) => (
          <div key={i} className="admin-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
              <div>
                <div className="admin-stat-value">{card.value}</div>
                <div className="admin-stat-label">{card.label}</div>
              </div>
              <i className={`fas ${card.icon}`} style={{ fontSize: '2rem', color: 'var(--orange)', opacity: 0.3 }}></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
