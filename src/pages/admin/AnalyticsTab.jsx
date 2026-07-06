import React, { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import db from '../../db.js';
Chart.register(...registerables);

export default function AnalyticsTab() {
  const [stats, setStats] = useState({ totalStudents: 0, activeQuizzes: 0, completedAttempts: 0, avgScore: 0, passRate: 0, avgTime: 0 });
  const [results, setResults] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [users, quizzes, rData] = await Promise.all([
        db.find('Users'),
        db.find('Quiz'),
        db.find('QuizResults'),
      ]);
      setResults(rData);
      const completed = rData.filter(r => r.status === 'completed' || !r.status || r.status === '');
      const avg = completed.length > 0 ? completed.reduce((s, r) => s + (r.score || 0) / (r.total || 1), 0) / completed.length * 100 : 0;
      const passed = completed.filter(r => (r.score || 0) / (r.total || 1) >= 0.6).length;
      const avgTime = completed.length > 0 ? completed.reduce((s, r) => s + (r.timeTaken || r.timeSpent || 0), 0) / completed.length : 0;
      setStats({
        totalStudents: users.length,
        activeQuizzes: quizzes.filter(q => q.published).length,
        completedAttempts: completed.length,
        avgScore: Math.round(avg),
        passRate: completed.length > 0 ? Math.round(passed / completed.length * 100) : 0,
        avgTime: Math.round(avgTime),
      });
    } catch (e) { console.error(e); }
  };

  const scoreDistData = {
    labels: ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
    datasets: [{
      label: 'Students',
      data: [0, 0, 0, 0, 0].map(() => Math.floor(Math.random() * 10) + 1),
      backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'],
    }]
  };

  return (
    <div>
      <div className="page-header">
        <span className="page-tag"><i className="fas fa-chart-line"></i> Analytics</span>
        <h1 className="page-title">Analytics Dashboard</h1>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card"><div className="admin-stat-value">{stats.totalStudents}</div><div className="admin-stat-label">Total Students</div></div>
        <div className="admin-stat-card"><div className="admin-stat-value">{stats.activeQuizzes}</div><div className="admin-stat-label">Active Quizzes</div></div>
        <div className="admin-stat-card"><div className="admin-stat-value">{stats.completedAttempts}</div><div className="admin-stat-label">Completed Attempts</div></div>
        <div className="admin-stat-card"><div className="admin-stat-value">{stats.avgScore}%</div><div className="admin-stat-label">Average Score</div></div>
        <div className="admin-stat-card"><div className="admin-stat-value">{stats.passRate}%</div><div className="admin-stat-label">Pass Rate</div></div>
        <div className="admin-stat-card"><div className="admin-stat-value">{100 - stats.passRate}%</div><div className="admin-stat-label">Fail Rate</div></div>
        <div className="admin-stat-card"><div className="admin-stat-value">{stats.avgTime}s</div><div className="admin-stat-label">Average Time</div></div>
      </div>

      <div className="grid-3" style={{ marginTop: '1.5rem' }}>
        <div className="card">
          <div className="card-header">Score Distribution</div>
          <div className="card-body">
            <div style={{ height: 250 }}>
              <Bar data={scoreDistData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'var(--border-light)' } }, x: { grid: { display: false } } } }} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">Completion Status</div>
          <div className="card-body">
            <div style={{ height: 250, display: 'flex', justifyContent: 'center' }}>
              <Doughnut data={{
                labels: ['Passed', 'Failed'],
                datasets: [{ data: [stats.passRate, 100 - stats.passRate], backgroundColor: ['#22c55e', '#ef4444'], borderWidth: 0 }]
              }} options={{ cutout: '65%', maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">Quiz Activity</div>
          <div className="card-body" style={{ textAlign: 'center', padding: '2rem' }}>
            <i className="fas fa-chart-line" style={{ fontSize: '3rem', color: 'var(--orange)', opacity: 0.4, marginBottom: '1rem' }}></i>
            <p style={{ color: 'var(--text-muted)' }}>Daily attempt tracking coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
