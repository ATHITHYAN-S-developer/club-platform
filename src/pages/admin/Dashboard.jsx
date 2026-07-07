import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import db from '../../db';
import { timeAgo } from '../../utils/formatters';

function StatCard({ icon, value, label, color, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: accent || 'rgba(255,85,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color || 'var(--orange)', fontSize: '1.2rem', flexShrink: 0,
      }}>
        <i className={`fas ${icon}`} />
      </div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: 2 }}>{label}</div>
      </div>
    </motion.div>
  );
}

function ActivityItem({ activity }) {
  const icons = {
    quiz_created: 'fa-plus-circle',
    quiz_updated: 'fa-pen',
    quiz_deleted: 'fa-trash',
    quiz_published: 'fa-eye',
    quiz_unpublished: 'fa-eye-slash',
    quiz_duplicated: 'fa-copy',
    attempt_completed: 'fa-check-circle',
    attempt_expired: 'fa-clock',
    attempt_violation: 'fa-shield-halved',
    user_joined: 'fa-user-plus',
  };

  const colors = {
    quiz_created: '#22c55e',
    quiz_updated: '#3b82f6',
    quiz_deleted: '#ef4444',
    quiz_published: '#22c55e',
    quiz_unpublished: '#f97316',
    attempt_completed: '#22c55e',
    attempt_expired: '#ef4444',
    attempt_violation: '#ef4444',
    user_joined: '#8b5cf6',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.6rem 0', borderBottom: '1px solid var(--border-light)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: `${colors[activity.type] || 'var(--surface)'}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: colors[activity.type] || 'var(--text-muted)',
        fontSize: '0.75rem', flexShrink: 0,
      }}>
        <i className={`fas ${icons[activity.type] || 'fa-circle'}`} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {activity.message}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{timeAgo(activity.timestamp)}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [quizzes, results, users, violations] = await Promise.all([
        db.find('Quiz'),
        db.find('QuizResults'),
        db.find('Users'),
        db.find('Violations'),
      ]);

      const published = quizzes.filter(q => q.published && !q.archived);
      const totalQuestions = quizzes.reduce((s, q) => s + (q.questions?.length || 0), 0);
      const completedAttempts = results.filter(r => r.status === 'completed');
      const avgScore = completedAttempts.length > 0
        ? Math.round(completedAttempts.reduce((s, r) => s + ((r.score || 0) / (r.total || 1)) * 100, 0) / completedAttempts.length)
        : 0;
      const completionRate = results.length > 0
        ? Math.round((completedAttempts.length / results.length) * 100)
        : 0;

      const userScores = {};
      results.forEach(r => {
        const pct = (r.score || 0) / (r.total || 1) * 100;
        if (!userScores[r.userId] || pct > userScores[r.userId].pct) {
          userScores[r.userId] = { pct, name: r.userName, userId: r.userId, score: r.score, total: r.total };
        }
      });
      const topPerformer = Object.values(userScores).sort((a, b) => b.pct - a.pct)[0] || null;

      const recentActivity = [
        ...results.slice(-10).map(r => ({
          type: r.status === 'expired' ? 'attempt_expired' : r.status === 'auto-submitted' ? 'attempt_violation' : 'attempt_completed',
          message: `${r.userName} ${r.status === 'expired' ? 'timed out on' : r.status === 'auto-submitted' ? 'had auto-submitted' : 'completed'} ${r.quizTitle}`,
          timestamp: r.submittedAt || r.date,
        })),
        ...quizzes.slice(-5).map(q => ({
          type: q.published ? 'quiz_published' : 'quiz_created',
          message: q.published ? `Published "${q.title}"` : `Created "${q.title}"`,
          timestamp: q.updatedAt || q.createdAt,
        })),
        ...violations.slice(-5).map(v => ({
          type: 'attempt_violation',
          message: `Violation: ${v.type} on quiz`,
          timestamp: v.timestamp,
        })),
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 12);

      const liveParticipants = results.filter(r => r.status === 'in-progress').length;

      setData({
        totalQuizzes: quizzes.length,
        activeQuizzes: published.length,
        totalQuestions,
        totalParticipants: results.length,
        avgScore,
        completionRate,
        liveParticipants,
        topPerformer,
        recentActivity,
        totalUsers: users.length,
        passCount: completedAttempts.filter(r => ((r.score || 0) / (r.total || 1)) >= 0.6).length,
      });
    } catch (e) {
      console.error('Dashboard load error:', e);
    }
    setLoading(false);
  };

  const stats = useMemo(() => {
    if (!data) return [];
    return [
      { icon: 'fa-layer-group', value: data.totalQuizzes, label: 'Total Quizzes', color: '#3b82f6', accent: 'rgba(59,130,246,0.08)' },
      { icon: 'fa-play-circle', value: data.activeQuizzes, label: 'Active Quizzes', color: '#22c55e', accent: 'rgba(34,197,94,0.08)' },
      { icon: 'fa-list-check', value: data.totalQuestions, label: 'Total Questions', color: '#8b5cf6', accent: 'rgba(139,92,246,0.08)' },
      { icon: 'fa-users', value: data.totalParticipants, label: 'Total Participants', color: '#f97316', accent: 'rgba(249,115,22,0.08)' },
      { icon: 'fa-chart-line', value: `${data.avgScore}%`, label: 'Average Score', color: '#06b6d4', accent: 'rgba(6,182,212,0.08)' },
      { icon: 'fa-percentage', value: `${data.completionRate}%`, label: 'Completion Rate', color: '#10b981', accent: 'rgba(16,185,129,0.08)' },
      { icon: 'fa-user-clock', value: data.liveParticipants, label: 'Live Participants', color: '#f59e0b', accent: 'rgba(245,158,11,0.08)' },
      { icon: 'fa-trophy', value: data.passCount, label: 'Passed', color: '#22c55e', accent: 'rgba(34,197,94,0.08)' },
    ];
  }, [data]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <span className="page-tag"><i className="fas fa-chart-pie" /> Dashboard</span>
        <h1 className="page-title" style={{ marginTop: '0.25rem' }}>Admin Dashboard</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {stats.map((s, i) => (
          <StatCard key={i} icon={s.icon} value={s.value} label={s.label} color={s.color} accent={s.accent} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem' }} className="admin-grid-layout">
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{
            padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)',
            fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <i className="fas fa-bolt" style={{ color: 'var(--orange)' }} />
            Recent Activity
          </div>
          <div style={{ padding: '0.5rem 1rem', maxHeight: 400, overflowY: 'auto' }}>
            {data.recentActivity.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No recent activity
              </div>
            ) : data.recentActivity.map((a, i) => (
              <ActivityItem key={i} activity={a} />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {data.topPerformer && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                <i className="fas fa-crown" style={{ color: '#f59e0b', marginRight: '0.4rem' }} />
                Top Performer
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(data.topPerformer.name || 'U')}&background=ff5500&color=fff`}
                  alt=""
                  style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--orange)' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{data.topPerformer.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Score: {data.topPerformer.score}/{data.topPerformer.total} ({Math.round(data.topPerformer.pct)}%)
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              <i className="fas fa-users" style={{ color: 'var(--orange)', marginRight: '0.4rem' }} />
              Quick Stats
            </div>
            {[
              { label: 'Total Members', value: data.totalUsers, icon: 'fa-user' },
              { label: 'Quiz Attempts', value: data.totalParticipants, icon: 'fa-pen' },
              { label: 'Pass Rate', value: data.totalParticipants > 0 ? `${Math.round((data.passCount / data.totalParticipants) * 100)}%` : '0%', icon: 'fa-check-circle' },
              { label: 'Avg Score', value: `${data.avgScore}%`, icon: 'fa-chart-simple' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.5rem 0', borderBottom: i < 3 ? '1px solid var(--border-light)' : 'none',
              }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <i className={`fas ${item.icon}`} style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }} />
                  {item.label}
                </span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
