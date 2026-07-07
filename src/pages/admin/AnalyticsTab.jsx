import { useState, useEffect, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import db from '../../db';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';

Chart.register(...registerables);

export default function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState('all');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [quizzes, rData, users] = await Promise.all([
        db.find('Quiz'),
        db.find('QuizResults'),
        db.find('Users'),
      ]);

      const quizMap = {};
      quizzes.forEach(q => { quizMap[q.id] = q; });

      const enriched = rData.map(r => {
        const q = quizMap[r.quizId];
        return {
          ...r,
          percentage: r.total ? Math.round((r.score || 0) / r.total * 100) : 0,
          quizTitle: r.quizTitle || q?.title || 'Unknown',
          questions: q?.questions || [],
        };
      });

      const completed = enriched.filter(r => r.status === 'completed' || !r.status);

      const avgScore = completed.length > 0
        ? Math.round(completed.reduce((s, r) => s + r.percentage, 0) / completed.length)
        : 0;

      const highest = completed.length > 0 ? Math.max(...completed.map(r => r.percentage)) : 0;
      const lowest = completed.length > 0 ? Math.min(...completed.map(r => r.percentage)) : 0;

      const passed = completed.filter(r => r.percentage >= 60).length;
      const passRate = completed.length > 0 ? Math.round((passed / completed.length) * 100) : 0;

      const avgTime = completed.length > 0
        ? Math.round(completed.reduce((s, r) => s + (r.timeTaken || r.timeSpent || 0), 0) / completed.length)
        : 0;

      const dailyMap = {};
      completed.forEach(r => {
        const d = (r.submittedAt || r.date || '').slice(0, 10);
        if (d) dailyMap[d] = (dailyMap[d] || 0) + 1;
      });
      const dailyLabels = Object.keys(dailyMap).sort();
      const dailyData = dailyLabels.map(d => dailyMap[d]);

      const qAccuracyMap = {};
      quizzes.forEach(q => {
        (q.questions || []).forEach(qq => {
          qAccuracyMap[qq.id] = { text: qq.questionText?.slice(0, 60) || '', correct: 0, wrong: 0, skipped: 0, total: 0, quizTitle: q.title };
        });
      });
      enriched.forEach(r => {
        if (r.questions?.length && r.answers) {
          r.questions.forEach(qq => {
            if (qAccuracyMap[qq.id]) {
              const ans = r.answers[qq.id];
              if (ans === undefined || ans === null || ans === '') {
                qAccuracyMap[qq.id].skipped++;
              } else {
                const isCorrect = qq.options?.find(o => o.id === ans)?.isCorrect || false;
                if (isCorrect) qAccuracyMap[qq.id].correct++;
                else qAccuracyMap[qq.id].wrong++;
              }
              qAccuracyMap[qq.id].total++;
            }
          });
        }
      });

      const questionStats = Object.entries(qAccuracyMap)
        .filter(([_, v]) => v.total > 0)
        .map(([id, v]) => ({
          id, ...v,
          accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
        }));

      const mostSkipped = [...questionStats].sort((a, b) => b.skipped - a.skipped).slice(0, 10);
      const mostFailed = [...questionStats].sort((a, b) => b.wrong - a.wrong).slice(0, 10);

      setData({
        quizzes, enriched, completed,
        stats: { avgScore, highest, lowest, passRate, avgTime, totalAttempts: rData.length, totalStudents: users.length, totalQuizzes: quizzes.length, passed, failed: completed.length - passed },
        dailyLabels, dailyData, questionStats, mostSkipped, mostFailed,
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filteredData = useMemo(() => {
    if (!data) return null;
    if (selectedQuiz === 'all') return data;
    const filtered = data.enriched.filter(r => r.quizId === selectedQuiz);
    const completed = filtered.filter(r => r.status === 'completed' || !r.status);
    const avg = completed.length > 0 ? Math.round(completed.reduce((s, r) => s + r.percentage, 0) / completed.length) : 0;
    return {
      ...data,
      enriched: filtered,
      completed,
      stats: {
        ...data.stats,
        avgScore: avg,
        totalAttempts: filtered.length,
        passRate: completed.length > 0 ? Math.round((completed.filter(r => r.percentage >= 60).length / completed.length) * 100) : 0,
      },
    };
  }, [data, selectedQuiz]);

  const scoreDistData = useMemo(() => {
    if (!filteredData) return null;
    const buckets = [0, 0, 0, 0, 0];
    filteredData.completed.forEach(r => {
      if (r.percentage <= 20) buckets[0]++;
      else if (r.percentage <= 40) buckets[1]++;
      else if (r.percentage <= 60) buckets[2]++;
      else if (r.percentage <= 80) buckets[3]++;
      else buckets[4]++;
    });
    return {
      labels: ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
      datasets: [{
        label: 'Students',
        data: buckets,
        backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'],
        borderRadius: 6,
      }],
    };
  }, [filteredData]);

  const dailyChartData = useMemo(() => {
    if (!filteredData?.dailyLabels?.length) return null;
    return {
      labels: filteredData.dailyLabels,
      datasets: [{
        label: 'Attempts',
        data: filteredData.dailyData,
        borderColor: '#ff5500',
        backgroundColor: 'rgba(255,85,0,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ff5500',
        pointRadius: 3,
      }],
    };
  }, [filteredData]);

  if (loading) return <Loading />;
  if (!filteredData) return <EmptyState icon="fa-chart-line" title="No Data" message="No quiz data available yet." />;

  const { stats, mostSkipped, mostFailed, quizzes } = filteredData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="page-tag"><i className="fas fa-chart-line" /> Analytics</span>
          <h1 className="page-title">Analytics Dashboard</h1>
        </div>
        <select className="form-select" style={{ width: 'auto' }}
          value={selectedQuiz} onChange={e => setSelectedQuiz(e.target.value)}>
          <option value="all">All Quizzes</option>
          {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Highest Score', value: `${stats.highest}%`, icon: 'fa-arrow-up', color: '#22c55e' },
          { label: 'Lowest Score', value: `${stats.lowest}%`, icon: 'fa-arrow-down', color: '#ef4444' },
          { label: 'Average Score', value: `${stats.avgScore}%`, icon: 'fa-chart-line', color: '#3b82f6' },
          { label: 'Total Attempts', value: stats.totalAttempts, icon: 'fa-pen', color: '#8b5cf6' },
          { label: 'Pass Rate', value: `${stats.passRate}%`, icon: 'fa-check-circle', color: '#22c55e' },
          { label: 'Failed', value: stats.failed, icon: 'fa-times-circle', color: '#ef4444' },
          { label: 'Avg Time', value: `${stats.avgTime}s`, icon: 'fa-clock', color: '#f97316' },
          { label: 'Quizzes', value: stats.totalQuizzes, icon: 'fa-layer-group', color: '#06b6d4' },
        ].map((s, i) => (
          <Card key={i} style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
              <i className={`fas ${s.icon}`} style={{ fontSize: '0.65rem' }} /> {s.label}
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="admin-grid-layout">
        <Card header={<><i className="fas fa-chart-bar" style={{ color: 'var(--orange)' }} /> Score Distribution</>}>
          {scoreDistData && (
            <div style={{ height: 250 }}>
              <Bar data={scoreDistData} options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: 'var(--border-light)' }, ticks: { stepSize: 1 } },
                  x: { grid: { display: false } },
                },
              }} />
            </div>
          )}
        </Card>

        <Card header={<><i className="fas fa-chart-pie" style={{ color: 'var(--orange)' }} /> Pass / Fail Ratio</>}>
          <div style={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Doughnut data={{
              labels: ['Passed', 'Failed'],
              datasets: [{ data: [stats.passed, stats.failed], backgroundColor: ['#22c55e', '#ef4444'], borderWidth: 0 }],
            }} options={{
              cutout: '65%', maintainAspectRatio: false,
              plugins: {
                legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } },
              },
            }} />
          </div>
        </Card>

        <Card header={<><i className="fas fa-chart-line" style={{ color: 'var(--orange)' }} /> Daily Attempts</>}>
          {dailyChartData ? (
            <div style={{ height: 250 }}>
              <Line data={dailyChartData} options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: 'var(--border-light)' }, ticks: { stepSize: 1 } },
                  x: { grid: { display: false } },
                },
              }} />
            </div>
          ) : (
            <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No daily data yet
            </div>
          )}
        </Card>

        <Card header={<><i className="fas fa-question-circle" style={{ color: 'var(--orange)' }} /> Most Failed Questions</>}>
          {mostFailed.length > 0 ? (
            <div style={{ maxHeight: 250, overflowY: 'auto' }}>
              {mostFailed.map((q, i) => (
                <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, width: 20 }}>{i + 1}.</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.text}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{q.quizTitle}</div>
                  </div>
                  <Badge color="red">{q.wrong} wrong</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No data yet</div>
          )}
        </Card>

        <Card header={<><i className="fas fa-forward" style={{ color: 'var(--orange)' }} /> Most Skipped Questions</>}>
          {mostSkipped.length > 0 ? (
            <div style={{ maxHeight: 250, overflowY: 'auto' }}>
              {mostSkipped.map((q, i) => (
                <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, width: 20 }}>{i + 1}.</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.text}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{q.quizTitle}</div>
                  </div>
                  <Badge color="yellow">{q.skipped} skipped</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No data yet</div>
          )}
        </Card>

        <Card header={<><i className="fas fa-chart-simple" style={{ color: 'var(--orange)' }} /> Question-wise Accuracy</>}>
          {filteredData.questionStats.length > 0 ? (
            <div style={{ maxHeight: 250, overflowY: 'auto' }}>
              {filteredData.questionStats.slice(0, 20).map((q, i) => (
                <div key={q.id} style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.15rem' }}>
                    <span style={{ color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{q.text}</span>
                    <span style={{ fontWeight: 700, color: q.accuracy >= 60 ? '#22c55e' : q.accuracy >= 40 ? '#f97316' : '#ef4444' }}>{q.accuracy}%</span>
                  </div>
                  <div style={{ width: '100%', height: 4, background: 'var(--surface)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      width: `${q.accuracy}%`, height: '100%',
                      background: q.accuracy >= 60 ? '#22c55e' : q.accuracy >= 40 ? '#f97316' : '#ef4444',
                      borderRadius: 2, transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No data yet</div>
          )}
        </Card>
      </div>
    </div>
  );
}
