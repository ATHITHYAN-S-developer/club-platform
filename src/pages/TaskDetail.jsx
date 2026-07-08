import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getTask, submitTask, getUserSubmissions, listTasks, subscribeToSubmission, subscribeToTask } from '../services/taskService';
import { TASK_TYPES, TASK_STATUSES } from '../config/taskConfig';
import { loadDraft, getLastSaved } from '../utils/autosave';

import TaskLayout from '../components/task/TaskLayout';
import TaskTopBar from '../components/task/TaskTopBar';
import TaskLeftSidebar from '../components/task/TaskLeftSidebar';
import TaskStatusBar from '../components/task/TaskStatusBar';
import SubmissionForm from '../components/task/SubmissionForm';
import TaskMarkdown from '../components/task/TaskMarkdown';
import TaskChecklist from '../components/task/TaskChecklist';

const DIFFICULTY_STYLE = {
  easy: { color: '#10b981', bg: '#d1fae5' },
  medium: { color: '#f59e0b', bg: '#fef3c7' },
  hard: { color: '#ef4444', bg: '#fee2e2' },
};

export default function TaskDetail({ user }) {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [userSubmission, setUserSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState('draft');
  const submitRef = useRef(null);

  const loadTask = useCallback(async () => {
    try {
      const [t, tasks, subs] = await Promise.all([
        getTask(id),
        listTasks(),
        user ? getUserSubmissions(user.id) : Promise.resolve([]),
      ]);
      setTask(t);
      setAllTasks(tasks);
      setAllSubmissions(subs);
      const mySub = subs.find(s => s.taskId === id);
      setUserSubmission(mySub || null);
      if (mySub) {
        setSubmissionStatus(mySub.status);
      }
      if (user && !mySub) {
        const saved = getLastSaved(id, user.id);
        if (saved) setLastSaved(saved);
      }
    } catch (e) {
      console.error('Task detail load error', e);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  useEffect(() => {
    if (!id || !user) return;
    const unsubSubmission = subscribeToSubmission(id, user.id, (sub, all) => {
      setUserSubmission(sub);
      if (sub) setSubmissionStatus(sub.status);
    });
    const unsubTask = subscribeToTask(id, (data) => {
      if (data && data.length > 0) setTask(data[0]);
    });
    return () => { unsubSubmission(); unsubTask(); };
  }, [id, user]);

  const handleSubmit = async (fields) => {
    setSubmitting(true);
    try {
      await submitTask(
        task.id, user.id, user.name, user.email,
        user.photo || '', user.department || '', fields
      );
      window.showToast('Submitted!', 'Your task has been submitted for review.', 'success');
      const subs = await getUserSubmissions(user.id);
      setUserSubmission(subs.find(s => s.taskId === id) || null);
      setSubmissionStatus('submitted');
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const draftBtn = document.querySelector('.sf-draft-btn');
        if (draftBtn) draftBtn.click();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const submitBtn = document.querySelector('.sf-submit');
        if (submitBtn) submitBtn.click();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!task) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Task not found.</div>;
  }

  const typeConfig = TASK_TYPES[task.taskType];
  const difficultyStyle = DIFFICULTY_STYLE[task.difficulty] || DIFFICULTY_STYLE.easy;
  const canSubmit = task.status === 'open' && user && !userSubmission;

  const topBarContent = ({ leftOpen, rightOpen, onToggleLeft, onToggleRight }) => (
    <TaskTopBar
      task={task}
      user={user}
      onSubmit={canSubmit ? () => { const s = document.querySelector('.sf-submit'); if (s) s.click(); } : null}
      isSubmitting={submitting}
      leftOpen={leftOpen}
      rightOpen={rightOpen}
      onToggleLeft={onToggleLeft}
      onToggleRight={onToggleRight}
      onDraftStatus={lastSaved ? `Saved ${new Date(lastSaved).toLocaleTimeString()}` : ''}
    />
  );

  const leftSidebarContent = ({ isOpen }) => (
    <TaskLeftSidebar
      tasks={allTasks}
      currentTaskId={id}
      userSubmissions={allSubmissions}
      isOpen={isOpen}
    />
  );

  const statusBarContent = () => (
    <TaskStatusBar
      lastSaved={lastSaved}
      isOnline={navigator.onLine}
      submissionStatus={submissionStatus}
    />
  );

  const rightPanelContent = () => {
    if (userSubmission) {
      return (
        <div className="td-sub-status-panel">
          <div className="td-sub-status-card">
            <h3><i className="fa-solid fa-circle-check" style={{ color: '#10b981' }} /> Your Submission</h3>
            <span className={`td-sub-badge ${userSubmission.status}`}>
              {userSubmission.status === 'approved' ? '✅ Approved' :
               userSubmission.status === 'rejected' ? '❌ Rejected' : '🕐 Under Review'}
            </span>
            <p className="td-sub-date-label">
              Submitted: {new Date(userSubmission.submittedAt).toLocaleString()}
            </p>
            {userSubmission.attemptNumber > 1 && (
              <p className="td-sub-attempt">Attempt #{userSubmission.attemptNumber}</p>
            )}
            <a href="/my-submissions" className="td-sub-view-link" onClick={e => { e.preventDefault(); window.location.href = '/my-submissions'; }}>
              <i className="fa-solid fa-list" /> View All Submissions
            </a>
          </div>
        </div>
      );
    }
    if (canSubmit) {
      return (
        <div style={{ padding: '1.25rem' }}>
          <SubmissionForm
            task={task}
            user={user}
            onSubmit={handleSubmit}
            loading={submitting}
          />
        </div>
      );
    }
    if (!user) {
      return (
        <div className="td-sub-status-panel">
          <div className="td-sub-empty-card">
            <i className="fa-solid fa-right-to-bracket" />
            <p>Sign in to submit this task</p>
            <a href="/auth" className="td-auth-btn" onClick={e => { e.preventDefault(); window.location.href = '/auth'; }}>Sign In</a>
          </div>
        </div>
      );
    }
    return (
      <div className="td-sub-status-panel">
        <div className="td-sub-empty-card">
          <i className="fa-solid fa-lock" />
          <p>This task is not accepting submissions</p>
        </div>
      </div>
    );
  };

  return (
    <TaskLayout
      topBar={topBarContent}
      leftSidebar={leftSidebarContent}
      rightPanel={rightPanelContent}
      statusBar={statusBarContent}
    >
      <div className="td-center">
        <div className="td-header">
          <div className="td-badges">
            {typeConfig && (
              <span className="td-badge td-type-badge" style={{ background: `${typeConfig.color}15`, color: typeConfig.color }}>
                <i className={`fa-solid ${typeConfig.icon}`} /> {typeConfig.label}
              </span>
            )}
            <span className="td-badge td-diff-badge" style={{ background: difficultyStyle.bg, color: difficultyStyle.color }}>
              {task.difficulty}
            </span>
            <span className="td-badge td-cat-badge">{task.category}</span>
          </div>
          <h1 className="td-title">{task.title}</h1>
        </div>

        {task.tags?.length > 0 && (
          <div className="td-tags">
            {task.tags.map(tag => <span key={tag} className="td-tag">{tag}</span>)}
          </div>
        )}

        <div className="td-meta-grid">
          <div className="td-meta-item"><i className="fa-solid fa-star" style={{ color: '#f59e0b' }} /> <strong>{task.xpReward} XP</strong> reward</div>
          {task.maxEarlyBonusXP > 0 && <div className="td-meta-item"><i className="fa-solid fa-clock" style={{ color: '#10b981' }} /> Early bonus: up to <strong>{task.maxEarlyBonusXP} XP</strong></div>}
          {task.estimatedTime && <div className="td-meta-item"><i className="fa-solid fa-hourglass" style={{ color: '#6366f1' }} /> Est: {task.estimatedTime}</div>}
          {task.dueDate && <div className="td-meta-item"><i className="fa-solid fa-calendar" style={{ color: '#ef4444' }} /> Due: {new Date(task.dueDate + 'T' + (task.dueTime || '23:59')).toLocaleString()}</div>}
        </div>

        <section className="td-section">
          <h2 className="td-section-title"><i className="fa-solid fa-info-circle" /> Description</h2>
          <TaskMarkdown content={task.description} />
        </section>

        {task.instructions && (
          <section className="td-section">
            <h2 className="td-section-title"><i className="fa-solid fa-book" /> Instructions</h2>
            <TaskMarkdown content={task.instructions} />
          </section>
        )}

        {task.objectives?.length > 0 && (
          <section className="td-section">
            <h2 className="td-section-title"><i className="fa-solid fa-bullseye" /> Objectives</h2>
            <ul className="td-objectives">
              {task.objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </section>
        )}

        {task.requirements?.length > 0 && (
          <section className="td-section">
            <TaskChecklist items={task.requirements} title="Requirements Checklist" />
          </section>
        )}

        {task.resources && Object.values(task.resources).some(v => v) && (
          <section className="td-section">
            <h2 className="td-section-title"><i className="fa-solid fa-link" /> Resources</h2>
            <div className="td-resources">
              {task.resources.githubRepo && (
                <a href={task.resources.githubRepo} target="_blank" rel="noreferrer" className="td-resource-link">
                  <i className="fa-brands fa-github" /> GitHub Repository
                </a>
              )}
              {task.resources.docLink && (
                <a href={task.resources.docLink} target="_blank" rel="noreferrer" className="td-resource-link">
                  <i className="fa-solid fa-file-lines" /> Documentation
                </a>
              )}
              {task.resources.youtubeVideo && (
                <a href={task.resources.youtubeVideo} target="_blank" rel="noreferrer" className="td-resource-link">
                  <i className="fa-brands fa-youtube" /> Video Tutorial
                </a>
              )}
              {task.resources.driveLink && (
                <a href={task.resources.driveLink} target="_blank" rel="noreferrer" className="td-resource-link">
                  <i className="fa-brands fa-google-drive" /> Drive Files
                </a>
              )}
            </div>
          </section>
        )}

        <section className="td-section">
          <h2 className="td-section-title"><i className="fa-solid fa-list-check" /> Evaluation Criteria</h2>
          <div className="td-criteria">
            {typeConfig?.scoring.map(c => (
              <div key={c.key} className="td-criterion">
                <span className="td-criterion-name">{c.label}</span>
                <span className="td-criterion-max">{c.maxScore} pts</span>
              </div>
            ))}
          </div>
          {task.badgeReward && (
            <div className="td-badge-note">
              <i className="fa-solid fa-medal" style={{ color: '#f59e0b' }} />
              Score ≥90 to earn the <strong>{task.badgeReward}</strong> badge!
            </div>
          )}
        </section>
      </div>

      <style>{`
        .td-center { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; width: 100%; }
        .td-header { display: flex; flex-direction: column; gap: 0.6rem; }
        .td-badges { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .td-badge { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.55rem; border-radius: 8px; font-size: 0.72rem; font-weight: 600; }
        .td-cat-badge { background: var(--surface-2); color: var(--text-secondary); }
        .td-title { font-size: 1.6rem; font-weight: 800; color: var(--text); margin: 0; line-height: 1.3; }
        .td-tags { display: flex; flex-wrap: wrap; gap: 0.3rem; }
        .td-tag { font-size: 0.7rem; font-weight: 600; color: var(--text-muted); background: var(--surface); padding: 0.15rem 0.5rem; border-radius: 6px; border: 1px solid var(--border-light); }
        .td-meta-grid { display: flex; flex-wrap: wrap; gap: 0.6rem; padding: 0.85rem 1rem; background: var(--surface); border-radius: var(--radius-md); border: 1px solid var(--border-light); }
        .td-meta-item { display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; color: var(--text-secondary); }
        .td-section { display: flex; flex-direction: column; gap: 0.6rem; }
        .td-section-title { font-size: 1rem; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 0.45rem; color: var(--text); }
        .td-objectives { padding-left: 1.25rem; margin: 0; display: flex; flex-direction: column; gap: 0.35rem; }
        .td-objectives li { font-size: 0.88rem; color: var(--text); line-height: 1.6; }
        .td-resources { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .td-resource-link { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.8rem; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; text-decoration: none; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); transition: all 0.2s; }
        .td-resource-link:hover { background: var(--surface-2); border-color: var(--border-hover); color: var(--text); }
        .td-criteria { display: flex; flex-direction: column; gap: 0.35rem; }
        .td-criterion { display: flex; justify-content: space-between; align-items: center; padding: 0.55rem 0.85rem; background: var(--surface); border-radius: 8px; border: 1px solid var(--border-light); }
        .td-criterion-name { font-size: 0.82rem; font-weight: 600; color: var(--text); }
        .td-criterion-max { font-size: 0.75rem; font-weight: 700; color: var(--orange); }
        .td-badge-note { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 0.85rem; background: #fefce8; border: 1px solid #fde68a; border-radius: 10px; font-size: 0.8rem; color: #92400e; margin-top: 0.5rem; }
        [data-theme="dark"] .td-badge-note { background: #422006; border-color: #78350f; color: #fde68a; }
        .td-sub-status-panel { padding: 1.25rem; }
        .td-sub-status-card, .td-sub-empty-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .td-sub-status-card h3 { font-size: 0.95rem; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 0.45rem; color: var(--text); }
        .td-sub-badge { font-size: 0.9rem; font-weight: 700; padding: 0.4rem 0.85rem; border-radius: 8px; text-align: center; }
        .td-sub-badge.approved { background: #d1fae5; color: #065f46; }
        .td-sub-badge.rejected { background: #fee2e2; color: #991b1b; }
        .td-sub-badge.submitted, .td-sub-badge.under_review { background: #fef3c7; color: #92400e; }
        .td-sub-date-label { font-size: 0.75rem; color: var(--text-muted); margin: 0; }
        .td-sub-attempt { font-size: 0.72rem; font-weight: 600; color: #8b5cf6; margin: 0; }
        .td-sub-view-link { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; font-weight: 600; color: var(--orange); text-decoration: none; }
        .td-sub-empty-card { text-align: center; align-items: center; }
        .td-sub-empty-card i { font-size: 1.75rem; color: var(--text-muted); }
        .td-sub-empty-card p { font-size: 0.85rem; color: var(--text-secondary); margin: 0; }
        .td-auth-btn { display: inline-flex; padding: 0.45rem 1.1rem; background: var(--orange); color: white; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 0.85rem; }
        .td-auth-btn:hover { background: var(--orange-dark); }
      `}</style>
    </TaskLayout>
  );
}
