import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import db from '../db';

export default function Tasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [expiredTasks, setExpiredTasks] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const fileInputsRef = useRef({});
  const heroRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setHeroVisible(true); obs.disconnect(); }
    }, { threshold: 0.05 });
    if (heroRef.current) obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, []);

  const fetchTasks = async () => {
    try {
      const list = await db.find('WeeklyTasks');
      setTasks(list);
      const subs = await db.find('TaskSubmissions');
      if (user) setMySubmissions(subs.filter(s => s.userId === user.id));
      const now = new Date();
      setActiveTasks(list.filter(t => new Date(t.deadline) > now));
      setExpiredTasks(list.filter(t => new Date(t.deadline) <= now));
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, [user]);

  const handleFileSelect = (taskId, file) => {
    if (file.size > 10 * 1024 * 1024) { window.showToast('File Too Large', 'Maximum file size is 10 MB.', 'error'); return; }
    setSelectedFiles(prev => ({ ...prev, [taskId]: file }));
  };

  const handleSubmit = async (taskId, taskTitle) => {
    const file = selectedFiles[taskId];
    if (!file) { window.showToast('No File', 'Please select a file to submit.', 'error'); return; }
    try {
      const fileUrl = await db.uploadFile(file, 'task-submissions');
      await db.insert('TaskSubmissions', {
        taskId, taskTitle, userId: user.id, userName: user.name,
        fileName: file.name, fileUrl, submittedAt: new Date().toISOString(), status: 'Pending',
      });
      window.showToast('Submitted!', 'Your task has been submitted for review.', 'success');
      setSelectedFiles(prev => { const copy = { ...prev }; delete copy[taskId]; return copy; });
      fetchTasks();
    } catch (err) { window.showToast('Error', err.message, 'error'); }
  };

  const isSubmitted = (taskId) => mySubmissions.some(s => s.taskId === taskId);
  const getSubmissionStatus = (taskId) => {
    const sub = mySubmissions.find(s => s.taskId === taskId);
    if (!sub) return null;
    return sub.status;
  };

  const reveal = (vis) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'none' : 'translateY(40px)',
    transition: 'opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)',
  });

  const TaskCard = ({ task, active = true }) => (
    <div className="rs-card" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f1117', marginBottom: '0.4rem' }}>{task.title}</h3>
      <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6, flex: 1, marginBottom: '1rem' }}>{task.description}</p>
      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '1rem' }}>
        ⏰ Deadline: {new Date(task.deadline).toLocaleDateString()} {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      {active && user ? (
        isSubmitted(task.id) ? (
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: getSubmissionStatus(task.id) === 'Approved' ? '#16a34a' : getSubmissionStatus(task.id) === 'Rejected' ? '#dc2626' : 'var(--orange)' }}>
              {getSubmissionStatus(task.id) === 'Approved' ? '✅ Approved' : getSubmissionStatus(task.id) === 'Rejected' ? '❌ Rejected' : '⏳ Submitted'}
            </span>
          </div>
        ) : (
          <div>
            <input type="file" ref={el => fileInputsRef.current[task.id] = el} onChange={(e) => handleFileSelect(task.id, e.target.files[0])} style={{ display: 'none' }} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="rs-btn rs-btn-outline" onClick={() => fileInputsRef.current[task.id]?.click()} style={{ flex: 1, fontSize: '0.78rem', padding: '0.4rem 0.9rem' }}>
                {selectedFiles[task.id] ? selectedFiles[task.id].name.substring(0, 20) : '📎 Choose File'}
              </button>
              <button className="rs-btn rs-btn-primary" onClick={() => handleSubmit(task.id, task.title)} disabled={!selectedFiles[task.id]} style={{ fontSize: '0.78rem', padding: '0.4rem 0.9rem', opacity: selectedFiles[task.id] ? 1 : 0.5 }}>
                Submit
              </button>
            </div>
          </div>
        )
      ) : active && !user ? (
        <Link to="/auth" className="rs-btn rs-btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem', padding: '0.4rem 0.9rem' }}>
          Sign In to Submit
        </Link>
      ) : (
        <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic' }}>Deadline passed</span>
      )}
    </div>
  );

  return (
    <div style={{ background: '#ffffff', color: '#0f1117', minHeight: '100vh', overflowX: 'hidden', position: 'relative', margin: '-2.5rem -3.5rem', padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        @keyframes marquee-ltr {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .sphere {
          position: absolute; border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #ffaa66 0%, var(--orange) 60%, var(--orange-dark) 100%);
          box-shadow: inset -12px -12px 30px rgba(0,0,0,0.35), inset 8px 8px 20px rgba(255,255,255,0.25), 0 25px 50px rgba(204,68,0,0.2);
          z-index: 0; pointer-events: none;
        }
        .sphere-tr { top: -40px; right: -40px; width: clamp(120px,18vw,260px); height: clamp(120px,18vw,260px); animation: float-tr 12s ease-in-out infinite; }
        .sphere-br { bottom: 60px; right: 3%; width: clamp(80px,10vw,150px); height: clamp(80px,10vw,150px); animation: float-br 10s ease-in-out infinite; animation-delay: 1.5s; }
        .sphere-bl { bottom: -50px; left: -40px; width: clamp(100px,14vw,200px); height: clamp(100px,14vw,200px); animation: float-bl 11s ease-in-out infinite; animation-delay: 3s; }
        @keyframes float-tr { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-10px,15px) rotate(3deg); } }
        @keyframes float-br { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-15px,-10px) rotate(-3deg); } }
        @keyframes float-bl { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(15px,-15px) rotate(2deg); } }
        .rs-hero-section {
          position: relative; min-height: 70vh; display: flex; align-items: center; justify-content: center;
          padding: 7rem 3.5rem 4rem 3.5rem; overflow: hidden; background: #ffffff;
        }
        .shard-tl {
          position: absolute; top: 0; left: 0; width: 320px; height: 320px;
          background: linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%);
          clip-path: polygon(0 0, 100% 0, 0 100%); z-index: 0;
        }
        .shard-br {
          position: absolute; bottom: 0; right: 0; width: 450px; height: 450px;
          background: linear-gradient(315deg, var(--orange) 0%, var(--orange-light) 100%);
          clip-path: polygon(100% 100%, 100% 0, 0 100%); z-index: 0;
        }
        .rs-card {
          background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 1.5rem;
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1); box-shadow: 0 4px 16px rgba(0,0,0,0.04);
          display: flex; flex-direction: column; height: 100%; position: relative; overflow: hidden;
        }
        .rs-card::before {
          content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px;
          background: linear-gradient(90deg, var(--orange), var(--orange-light));
          transform: scaleX(0); transform-origin: left; transition: transform 0.35s ease;
        }
        .rs-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(255,85,0,0.1); border-color: rgba(255,85,0,0.15); }
        .rs-card:hover::before { transform: scaleX(1); }
        .rs-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem;
          padding: 0.5rem 1.1rem; border-radius: 10px; font-size: 0.82rem; font-weight: 600;
          transition: all 0.2s ease; cursor: pointer; text-decoration: none; border: none;
        }
        .rs-btn-primary { background: var(--orange); color: #ffffff; box-shadow: 0 4px 12px rgba(255,85,0,0.3); }
        .rs-btn-primary:hover { background: var(--orange-dark); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,85,0,0.4); }
        .rs-btn-outline { background: transparent; color: #0f1117; border: 1px solid #e5e7eb; }
        .rs-btn-outline:hover { background: #f9fafb; border-color: var(--orange); color: var(--orange); }
        .rs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; margin-top: 1.25rem; }
        @media (max-width: 900px) {
          .rs-hero-section { padding: 6rem 1.5rem 3rem 1.5rem !important; }
          .rs-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
        }
        @media (max-width: 600px) {
          .rs-hero-section { padding: 5rem 1.2rem 2.5rem 1.2rem !important; min-height: auto !important; }
          .shard-tl { width: 180px !important; height: 180px !important; }
          .shard-br { width: 220px !important; height: 220px !important; }
          .rs-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="rs-hero-section">
        <div className="shard-tl" /><div className="shard-br" />
        <div className="sphere sphere-tr" /><div className="sphere sphere-br" /><div className="sphere sphere-bl" />
        <div ref={heroRef} style={{ maxWidth: '1000px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1, ...reveal(heroVisible) }}>
          <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.4rem', color: 'var(--orange)', margin: '0 0 0.2rem 0', lineHeight: 1.1, textShadow: '0 0 15px rgba(255,85,0,0.15)' }}>Sharpen Your Skills</p>
          <h1 style={{ fontSize: 'clamp(2.2rem,5vw,4rem)', fontFamily: 'var(--font-display)', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.02em', margin: '0 0 0.8rem 0', lineHeight: 1.05, color: '#0f1117' }}>Weekly Tasks</h1>
          <p style={{ fontSize: '1.02rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '640px', margin: '0 auto 1.75rem' }}>Sharpen your skills with weekly coding problems and design sprints. Submit your solutions for review.</p>
        </div>
      </section>

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 4rem', position: 'relative', zIndex: 2 }}>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="loading-spinner" /></div> : (
          <>
            {activeTasks.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f1117', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#16a34a' }}>●</span> Active Tasks ({activeTasks.length})
                </h3>
                <div className="rs-grid">
                  {activeTasks.map(task => <TaskCard key={task.id} task={task} active />)}
                </div>
              </div>
            )}

            {expiredTasks.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f1117', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#9ca3af' }}>●</span> Past Tasks ({expiredTasks.length})
                </h3>
                <div className="rs-grid">
                  {expiredTasks.map(task => <TaskCard key={task.id} task={task} active={false} />)}
                </div>
              </div>
            )}

            {!loading && tasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📝</div>
                <p>No tasks available yet. Check back soon!</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
