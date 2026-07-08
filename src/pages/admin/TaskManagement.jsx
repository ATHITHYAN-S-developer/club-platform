import { useState, useEffect } from 'react';
import { TASK_TYPES, TASK_STATUSES, VISIBILITY_OPTIONS, DEPARTMENTS, SYSTEM_BADGES } from '../../config/taskConfig';
import {
  listTasks, createTask, updateTask, deleteTask, duplicateTask,
  getTaskSubmissions, getTaskAnalytics, getPendingReviews,
  reviewSubmission, updateSubmissionStatus, getSubmission,
  getTaskLeaderboard,
} from '../../services/taskService';
import ReviewForm from '../../components/task/ReviewForm';

const TABS = [
  { id: 'overview',    label: 'Overview',     icon: 'fa-gauge-high' },
  { id: 'create',      label: 'Create Task',  icon: 'fa-plus-circle' },
  { id: 'manage',      label: 'Manage Tasks', icon: 'fa-list' },
  { id: 'submissions', label: 'Submissions',  icon: 'fa-inbox' },
  { id: 'reviews',     label: 'Reviews',      icon: 'fa-clipboard-check' },
  { id: 'leaderboard', label: 'Leaderboard',  icon: 'fa-trophy' },
  { id: 'analytics',   label: 'Analytics',    icon: 'fa-chart-simple' },
  { id: 'settings',    label: 'Settings',     icon: 'fa-gear' },
];

function getDefaultForm() {
  return {
    title: '', description: '', category: '', taskType: 'coding', difficulty: 'easy',
    tags: [], tagsInput: '', visibility: 'all', selectedDepartments: [],
    publishDate: '', dueDate: '', dueTime: '23:59', estimatedTime: '',
    xpReward: 100, maxEarlyBonusXP: 0, earlySubmissionDays: 3,
    badgeReward: '', badgeIsCustom: false,
    allowMultipleSubmissions: false, maxAttempts: 1,
    lateSubmissionAllowed: false, showLeaderboard: true,
    showScoresImmediately: true, anonymousReview: false,
    instructions: '', githubRepo: '', docLink: '', youtubeVideo: '', driveLink: '',
    objectives: '', requirements: '',
    status: 'draft',
  };
}

const WIZARD_STEPS = [
  'Basic Information', 'Description & Resources', 'Submission Config',
  'Review Rubric', 'Rewards', 'Schedule', 'Security & Visibility', 'Preview', 'Publish',
];

export default function TaskManagement({ user }) {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskForm, setTaskForm] = useState(getDefaultForm());
  const [wizardStep, setWizardStep] = useState(0);

  const [selectedSub, setSelectedSub] = useState(null);
  const [selectedSubTask, setSelectedSubTask] = useState(null);
  const [reviewing, setReviewing] = useState(false);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState([]);

  const [settings, setSettings] = useState({
    defaultXPReward: 100, defaultEarlyBonus: 20, defaultMaxAttempts: 1,
    dailyStreakBonus: 25, weeklyStreakBonus: 100,
    badgeBonusXP: 50, allowLateSubmissions: false,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [tList, sList, pending] = await Promise.all([
        listTasks(), getTaskSubmissions(''), getPendingReviews(),
      ]);
      setTasks(tList);
      setSubmissions(sList);
      setPendingReviews(pending);
    } catch (err) {
      window.showToast('Error', 'Failed to load data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const data = await getTaskAnalytics();
      setAnalytics(data);
    } catch (err) {
      window.showToast('Error', 'Failed to load analytics', 'error');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await getTaskLeaderboard();
      setLeaderboardEntries(data);
    } catch (err) {
      window.showToast('Error', 'Failed to load leaderboard', 'error');
    }
  };

  useEffect(() => {
    if (tab === 'analytics') loadAnalytics();
    if (tab === 'leaderboard') loadLeaderboard();
  }, [tab]);

  /* ── Task CRUD ── */
  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...taskForm,
        tags: taskForm.tagsInput ? taskForm.tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [],
        badgeReward: taskForm.badgeReward || null,
        objectives: taskForm.objectives ? taskForm.objectives.split('\n').filter(Boolean) : [],
        requirements: taskForm.requirements ? taskForm.requirements.split('\n').filter(Boolean) : [],
        resources: { githubRepo: taskForm.githubRepo, docLink: taskForm.docLink, youtubeVideo: taskForm.youtubeVideo, driveLink: taskForm.driveLink },
      };
      delete payload.tagsInput;
      if (editingId) {
        await updateTask(editingId, payload);
        window.showToast('Updated', 'Task updated successfully.', 'success');
      } else {
        await createTask(payload);
        window.showToast('Created', 'Task created successfully.', 'success');
      }
      setIsFormOpen(false);
      setWizardStep(0);
      loadData();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setTaskForm(getDefaultForm());
    setWizardStep(0);
    setIsFormOpen(true);
    setTab('create');
  };

  const handleEditTask = (t) => {
    setEditingId(t.id);
    setTaskForm({
      ...t,
      tagsInput: (t.tags || []).join(', '),
      objectives: (t.objectives || []).join('\n'),
      requirements: (t.requirements || []).join('\n'),
      githubRepo: t.resources?.githubRepo || '',
      docLink: t.resources?.docLink || '',
      youtubeVideo: t.resources?.youtubeVideo || '',
      driveLink: t.resources?.driveLink || '',
    });
    setWizardStep(0);
    setIsFormOpen(true);
    setTab('create');
  };

  const handleDeleteTask = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This will also delete all submissions.`)) return;
    try {
      await deleteTask(id);
      window.showToast('Deleted', 'Task deleted.', 'info');
      loadData();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const handleToggleStatus = async (t, status) => {
    try {
      await updateTask(t.id, { status });
      window.showToast('Status Updated', `Status changed to ${status}.`, 'success');
      loadData();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const handleDuplicate = async (t) => {
    try {
      await duplicateTask(t.id);
      window.showToast('Duplicated', 'Task duplicated as draft.', 'success');
      loadData();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  /* ── Reviews ── */
  const handleOpenReview = async (sub) => {
    const fullSub = await getSubmission(sub.id);
    const task = tasks.find(t => t.id === sub.taskId);
    setSelectedSub(fullSub);
    setSelectedSubTask(task);
  };

  const handleReviewSubmit = async ({ scores, feedback, approve }) => {
    if (!selectedSub) return;
    setReviewing(true);
    try {
      await reviewSubmission(selectedSub.id, user?.id || 'admin', user?.name || 'Admin', scores, feedback, approve);
      window.showToast('Reviewed!', approve ? 'Approved & XP awarded.' : 'Submission rejected.', 'success');
      setSelectedSub(null);
      setSelectedSubTask(null);
      loadData();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    } finally {
      setReviewing(false);
    }
  };

  const handleStatusChange = async (status) => {
    if (!selectedSub) return;
    try {
      await updateSubmissionStatus(selectedSub.id, status);
      setSelectedSub(prev => ({ ...prev, status }));
      window.showToast('Updated', `Status changed to ${status}`, 'success');
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  /* ── Wizard Navigation ── */
  const nextStep = () => setWizardStep(p => Math.min(p + 1, WIZARD_STEPS.length - 1));
  const prevStep = () => setWizardStep(p => Math.max(p - 1, 0));
  const wizardProgress = `${wizardStep + 1} / ${WIZARD_STEPS.length}`;

  const updateForm = (key, value) => setTaskForm(p => ({ ...p, [key]: value }));

  /* ── Render: Wizard Form ── */
  const renderWizardForm = () => {
    const renderField = (label, children, fullWidth) => (
      <div style={{ gridColumn: fullWidth ? '1 / -1' : undefined }}>
        <label style={{ fontWeight: 700, fontSize: '0.82rem', display: 'block', marginBottom: '0.3rem' }}>{label}</label>
        {children}
      </div>
    );

    const input = (key, opts = {}) => (
      <input className="form-input form-input-sm"
        type={opts.type || 'text'} value={taskForm[key] || ''}
        onChange={e => updateForm(key, opts.parse ? opts.parse(e.target.value) : e.target.value)}
        placeholder={opts.placeholder} required={opts.required} min={opts.min}
        style={opts.style} rows={opts.rows}
      />
    );

    const textarea = (key, opts = {}) => (
      <textarea className="form-input form-input-sm"
        value={taskForm[key] || ''}
        onChange={e => updateForm(key, e.target.value)}
        placeholder={opts.placeholder} rows={opts.rows || 4}
        style={{ width: '100%', resize: 'vertical', ...opts.style }}
      />
    );

    const select = (key, options, opts = {}) => (
      <select className="form-input form-input-sm" value={taskForm[key]} onChange={e => updateForm(key, e.target.value)} style={opts.style}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );

    const checkbox = (key, label) => (
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem' }}>
        <input type="checkbox" checked={taskForm[key]} onChange={e => updateForm(key, e.target.checked)} />
        {label}
      </label>
    );

    const steps = [
      /* Step 0: Basic Information */
      <div key="step0" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {renderField('Title *', input('title', { required: true }), true)}
        {renderField('Task Type', select('taskType', Object.entries(TASK_TYPES).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }))))}
        {renderField('Difficulty', select('difficulty', ['easy', 'medium', 'hard'].map(d => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) }))))}
        {renderField('Category', input('category', { placeholder: 'e.g. Web Development, AI' }))}
        {renderField('Tags (comma separated)', input('tagsInput', { placeholder: 'React, CSS, Portfolio' }), true)}
        {renderField('Description (Markdown)', textarea('description', { rows: 5, placeholder: 'Task description in markdown...' }), true)}
      </div>,

      /* Step 1: Description & Resources */
      <div key="step1" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {renderField('Instructions (Markdown)', textarea('instructions', { rows: 6, placeholder: 'Detailed instructions in markdown...' }))}
        {renderField('Objectives (one per line)', textarea('objectives', { rows: 4, placeholder: 'Build a responsive layout\nIntegrate with Firebase API\nImplement dark mode toggle' }))}
        {renderField('Requirements Checklist (one per line)', textarea('requirements', { rows: 4, placeholder: 'Must use React hooks\nMust be responsive\nMust include unit tests' }))}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '1rem' }}>
          <span style={{ fontWeight: 800, fontSize: '0.82rem' }}>Resource Links</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
            {input('githubRepo', { placeholder: 'GitHub URL' })}
            {input('docLink', { placeholder: 'Documentation URL' })}
            {input('youtubeVideo', { placeholder: 'YouTube URL' })}
            {input('driveLink', { placeholder: 'Google Drive URL' })}
          </div>
        </div>
      </div>,

      /* Step 2: Submission Config */
      <div key="step2" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '1rem' }}>
          <span style={{ fontWeight: 800, fontSize: '0.82rem', display: 'block', marginBottom: '0.5rem' }}>Submission Settings</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.78rem' }}>
            {checkbox('allowMultipleSubmissions', 'Multiple Submissions')}
            {checkbox('lateSubmissionAllowed', 'Late Submission Allowed')}
            {checkbox('showLeaderboard', 'Show in Leaderboard')}
            {checkbox('showScoresImmediately', 'Show Scores Immediately')}
            {checkbox('anonymousReview', 'Anonymous Review')}
          </div>
          {taskForm.allowMultipleSubmissions && (
            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Max Attempts</label>
              {input('maxAttempts', { type: 'number', min: 1, parse: Number })}
            </div>
          )}
        </div>
        {renderField('Required Fields (mark fields as required in taskConfig)', <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Configured per task type in taskConfig.js</div>)}
      </div>,

      /* Step 3: Review Rubric */
      <div key="step3" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Scoring Criteria for {TASK_TYPES[taskForm.taskType]?.label}</span>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 10, overflow: 'hidden' }}>
          {TASK_TYPES[taskForm.taskType]?.scoring.map(c => (
            <div key={c.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{c.label}</span>
              <span style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--orange)' }}>{c.maxScore} pts</span>
            </div>
          ))}
        </div>
      </div>,

      /* Step 4: Rewards */
      <div key="step4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {renderField('XP Reward', input('xpReward', { type: 'number', min: 0, parse: Number }))}
          {renderField('Status', select('status', TASK_STATUSES.map(s => ({ value: s.value, label: s.label }))))}
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '1rem' }}>
          <span style={{ fontWeight: 800, fontSize: '0.82rem', display: 'block', marginBottom: '0.5rem' }}>Early Submission Bonus</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Max Bonus XP</label>
              {input('maxEarlyBonusXP', { type: 'number', min: 0, parse: Number })}
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Days Before Deadline</label>
              {input('earlySubmissionDays', { type: 'number', min: 1, parse: Number })}
            </div>
          </div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '1rem' }}>
          <span style={{ fontWeight: 800, fontSize: '0.82rem', display: 'block', marginBottom: '0.5rem' }}>Badge Reward</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select className="form-input form-input-sm" style={{ flex: 1 }}
              value={taskForm.badgeIsCustom ? 'custom' : taskForm.badgeReward || ''}
              onChange={e => {
                if (e.target.value === 'custom') updateForm('badgeIsCustom', true); updateForm('badgeReward', '');
                if (e.target.value === '') updateForm('badgeReward', null); updateForm('badgeIsCustom', false);
                if (!['', 'custom'].includes(e.target.value)) updateForm('badgeReward', e.target.value); updateForm('badgeIsCustom', false);
              }}>
              <option value="">No badge</option>
              {SYSTEM_BADGES.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
              <option value="custom">✨ Custom badge</option>
            </select>
          </div>
          {taskForm.badgeIsCustom && input('badgeReward', { placeholder: 'Enter custom badge name...' })}
        </div>
      </div>,

      /* Step 5: Schedule */
      <div key="step5" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {renderField('Publish Date', input('publishDate', { type: 'datetime-local' }))}
          {renderField('Visibility', select('visibility', VISIBILITY_OPTIONS.map(o => ({ value: o.value, label: o.label }))))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {renderField('Due Date', input('dueDate', { type: 'date' }))}
          {renderField('Due Time', input('dueTime', { type: 'time' }))}
        </div>
        {renderField('Estimated Time', input('estimatedTime', { placeholder: 'e.g. 2-3 hours' }))}
        {taskForm.visibility === 'departments' && (
          <div>
            <label style={{ fontWeight: 700, fontSize: '0.82rem', display: 'block', marginBottom: '0.3rem' }}>Selected Departments</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {DEPARTMENTS.map(d => (
                <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={taskForm.selectedDepartments?.includes(d)}
                    onChange={e => {
                      const deps = taskForm.selectedDepartments || [];
                      updateForm('selectedDepartments', e.target.checked ? [...deps, d] : deps.filter(x => x !== d));
                    }}
                  />
                  {d}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>,

      /* Step 6: Security & Visibility */
      <div key="step6" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '1rem' }}>
          <span style={{ fontWeight: 800, fontSize: '0.82rem', display: 'block', marginBottom: '0.5rem' }}>Security Options</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.78rem' }}>
            {checkbox('anonymousReview', 'Anonymous Review')}
            {checkbox('showScoresImmediately', 'Show Scores Immediately')}
          </div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '1rem' }}>
          <span style={{ fontWeight: 800, fontSize: '0.82rem', display: 'block', marginBottom: '0.5rem' }}>Plagiarism Check</span>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-info-circle" /> Plagiarism checking is planned for a future update.
          </div>
        </div>
      </div>,

      /* Step 7: Preview */
      <div key="step7" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Task Preview</span>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, background: `${TASK_TYPES[taskForm.taskType]?.color}15`, color: TASK_TYPES[taskForm.taskType]?.color }}>{TASK_TYPES[taskForm.taskType]?.icon} {TASK_TYPES[taskForm.taskType]?.label}</span>
            <span style={{ padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, background: taskForm.difficulty === 'easy' ? '#d1fae5' : taskForm.difficulty === 'medium' ? '#fef3c7' : '#fee2e2', color: taskForm.difficulty === 'easy' ? '#10b981' : taskForm.difficulty === 'medium' ? '#f59e0b' : '#ef4444' }}>{taskForm.difficulty}</span>
            {taskForm.category && <span style={{ padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>{taskForm.category}</span>}
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{taskForm.title || 'Untitled Task'}</span>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {taskForm.xpReward > 0 && <span>🏆 {taskForm.xpReward} XP</span>}
            {taskForm.dueDate && <span>📅 Due: {new Date(taskForm.dueDate + 'T' + (taskForm.dueTime || '23:59')).toLocaleDateString()}</span>}
            {taskForm.estimatedTime && <span>⏱ {taskForm.estimatedTime}</span>}
            {taskForm.status && <span>📌 {TASK_STATUSES.find(s => s.value === taskForm.status)?.label}</span>}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxHeight: 200, overflow: 'hidden', position: 'relative' }}>
            <div style={{ maxHeight: 120, overflow: 'hidden' }}>{taskForm.description ? taskForm.description.slice(0, 300) + (taskForm.description.length > 300 ? '...' : '') : 'No description'}</div>
            {taskForm.description?.length > 300 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(transparent, var(--surface))' }} />}
          </div>
        </div>
      </div>,

      /* Step 8: Publish */
      <div key="step8" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center', padding: '2rem 0' }}>
        <i className="fa-solid fa-rocket" style={{ fontSize: '3rem', color: 'var(--orange)' }} />
        <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Ready to {editingId ? 'Update' : 'Publish'}?</span>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 400 }}>
          Review all the information above. Once published, students will be able to see and submit this task.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={prevStep}>Back</button>
          <button type="submit" className="btn btn-primary" style={{ background: 'var(--orange)', borderColor: 'var(--orange)' }}>
            <i className="fa-solid fa-check" /> {editingId ? 'Update Task' : 'Create & Publish'}
          </button>
        </div>
      </div>,
    ];

    return (
      <form onSubmit={handleSaveTask} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '0.94rem', fontWeight: 800, margin: 0 }}>{editingId ? 'Edit Task' : 'Create New Task'}</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Step {wizardProgress}</span>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setIsFormOpen(false); setWizardStep(0); }}>Cancel</button>
        </div>

        {/* Progress indicator */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', overflow: 'hidden' }}>
          {WIZARD_STEPS.map((step, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= wizardStep ? 'var(--orange)' : 'var(--border)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* Step labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {WIZARD_STEPS.map((step, i) => (
            <span key={i} style={{
              textAlign: 'center', flex: 1,
              color: i === wizardStep ? 'var(--orange)' : i < wizardStep ? 'var(--text-secondary)' : 'var(--text-muted)',
              fontWeight: i === wizardStep ? 800 : 600,
              cursor: 'pointer',
            }} onClick={() => setWizardStep(i)}>{step}</span>
          ))}
        </div>

        {steps[wizardStep]}

        {/* Bottom navigation */}
        {wizardStep < 8 && (
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={prevStep} disabled={wizardStep === 0}>
              <i className="fa-solid fa-chevron-left" /> Previous
            </button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => { saveDraft(); window.showToast('Draft Saved', 'Task draft saved.', 'success'); }}>
                <i className="fa-solid fa-floppy-disk" /> Save Draft
              </button>
              {wizardStep < 7 && (
                <button type="button" className="btn btn-primary btn-sm" onClick={nextStep}>
                  Next <i className="fa-solid fa-chevron-right" />
                </button>
              )}
              {wizardStep === 7 && (
                <button type="submit" className="btn btn-primary btn-sm" style={{ background: 'var(--orange)', borderColor: 'var(--orange)' }}>
                  <i className="fa-solid fa-check" /> {editingId ? 'Update' : 'Create'}
                </button>
              )}
            </div>
          </div>
        )}
      </form>
    );

    function saveDraft() {
      try {
        localStorage.setItem(`task_draft_${editingId || 'new'}`, JSON.stringify(taskForm));
      } catch {}
    }
  };

  /* ── Render: Overview ── */
  const renderOverview = () => {
    const stats = [
      { label: 'Total Tasks', value: tasks.length, icon: 'fa-code', color: '#6366f1' },
      { label: 'Pending Reviews', value: pendingReviews.length, icon: 'fa-clock', color: '#f59e0b' },
      { label: 'Open Tasks', value: tasks.filter(t => t.status === 'open').length, icon: 'fa-book-open', color: '#10b981' },
      { label: 'Total Submissions', value: submissions.length, icon: 'fa-paper-plane', color: '#06b6d4' },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontSize: '1rem' }}>
                <i className={`fa-solid ${s.icon}`} />
              </div>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0 0 0.75rem', color: 'var(--text)' }}><i className="fa-solid fa-clock" style={{ color: 'var(--orange)' }} /> Recent Activity</h3>
          {submissions.slice(0, 10).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center' }}>No recent activity.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {submissions.slice(0, 10).map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.45rem 0.65rem', borderRadius: 8, background: 'var(--surface)', fontSize: '0.78rem' }}>
                  <span style={{ fontWeight: 600, flex: 1 }}>{s.userName}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{s.taskTitle}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{new Date(s.submittedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ── Render: Manage Tasks ── */
  const renderManage = () => (
    <div style={{ overflowX: 'auto', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14 }}>
      <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>All Tasks</span>
        <button className="btn btn-primary btn-sm" onClick={handleCreateNew} style={{ background: 'var(--orange)', borderColor: 'var(--orange)', color: '#fff' }}>
          <i className="fa-solid fa-plus" /> New Task
        </button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.72rem' }}>Task</th>
            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.72rem' }}>Type</th>
            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.72rem' }}>Due</th>
            <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontSize: '0.72rem' }}>XP</th>
            <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontSize: '0.72rem' }}>Subs</th>
            <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontSize: '0.72rem' }}>Status</th>
            <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontSize: '0.72rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No tasks yet.</td></tr>
          ) : tasks.map(t => {
            const statusConfig = TASK_STATUSES.find(s => s.value === t.status);
            return (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.85rem' }}>{t.title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.difficulty} · {t.category}</div>
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem' }}>{TASK_TYPES[t.taskType]?.icon} {TASK_TYPES[t.taskType]?.label || t.taskType}</td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.dueDate ? new Date(t.dueDate + 'T' + (t.dueTime || '23:59')).toLocaleDateString() : '—'}</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700 }}>{t.xpReward}</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{t.totalSubmissions || 0}</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                  <span style={{ padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, background: statusConfig ? `${statusConfig.color}15` : '#f3f4f6', color: statusConfig?.color || '#6b7280' }}>{statusConfig?.label || t.status}</span>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => handleEditTask(t)} title="Edit"><i className="fa-solid fa-pen" /></button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleDuplicate(t)} title="Duplicate"><i className="fa-solid fa-copy" /></button>
                    <select className="form-input form-input-sm" value={t.status} onChange={e => handleToggleStatus(t, e.target.value)} style={{ width: 90, fontSize: '0.7rem', padding: '0.2rem 0.3rem' }}>
                      {TASK_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <button className="btn btn-sm" onClick={() => handleDeleteTask(t.id, t.title)} style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '0.25rem 0.4rem' }} title="Delete"><i className="fa-solid fa-trash" /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  /* ── Render: Submissions ── */
  const renderSubmissions = () => (
    <div style={{ overflowX: 'auto', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14 }}>
      <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>All Submissions</span>
        <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: 10, background: 'rgba(255,85,0,0.1)', color: 'var(--orange)', fontWeight: 700 }}>{submissions.length} total</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Student', 'Task', 'Submitted', 'Attempt', 'Score', 'Status'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.72rem' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {submissions.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No submissions yet.</td></tr>
          ) : submissions.map(s => (
            <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
              <td style={{ padding: '0.75rem 1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.userName}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.userDepartment}</div>
              </td>
              <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem' }}>{s.taskTitle}</td>
              <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(s.submittedAt).toLocaleDateString()}</td>
              <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', textAlign: 'center' }}>{s.attemptNumber || 1}</td>
              <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{s.finalScore != null ? `${s.finalScore}%` : '—'}</td>
              <td style={{ padding: '0.75rem 1rem' }}>
                <span style={{ padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, background: s.status === 'approved' ? '#d1fae5' : s.status === 'rejected' ? '#fee2e2' : '#fef3c7', color: s.status === 'approved' ? '#065f46' : s.status === 'rejected' ? '#991b1b' : '#92400e' }}>{s.status.replace('_', ' ')}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  /* ── Render: Reviews (split-view) ── */
  const renderReviews = () => (
    <div style={{ display: 'grid', gridTemplateColumns: selectedSub ? '1fr 460px' : '1fr', gap: '1.25rem', alignItems: 'start' }}>
      <div style={{ overflowX: 'auto', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14 }}>
        <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Pending Reviews</span>
          <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: 10, background: 'rgba(255,85,0,0.1)', color: 'var(--orange)', fontWeight: 700 }}>{pendingReviews.length} pending</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Student', 'Task', 'Submitted', 'Attempt', 'Status', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.72rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pendingReviews.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No pending reviews.</td></tr>
            ) : pendingReviews.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)', background: selectedSub?.id === s.id ? 'rgba(255,85,0,0.02)' : 'transparent' }}>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.userName}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.userDepartment}</div>
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem' }}>{s.taskTitle}</td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(s.submittedAt).toLocaleDateString()}</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.78rem' }}>{s.attemptNumber || 1}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, background: s.status === 'submitted' ? 'rgba(245,158,11,0.1)' : 'rgba(139,92,246,0.1)', color: s.status === 'submitted' ? '#f59e0b' : '#8b5cf6' }}>{s.status.replace('_', ' ')}</span>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => handleOpenReview(s)}><i className="fa-solid fa-magnifying-glass-chart" /> Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedSub && selectedSubTask && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', position: 'sticky', top: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontWeight: 800, fontSize: '0.9rem', margin: 0 }}>{selectedSub.userName}'s Submission</h4>
            <button onClick={() => { setSelectedSub(null); setSelectedSubTask(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}><i className="fa-solid fa-xmark" /></button>
          </div>
          <div style={{ fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div><strong>Task:</strong> {selectedSub.taskTitle}</div>
            <div><strong>Submitted:</strong> {new Date(selectedSub.submittedAt).toLocaleString()}</div>
            {selectedSub.attemptNumber > 1 && <div><strong>Attempt:</strong> #{selectedSub.attemptNumber}</div>}
            {Object.entries(selectedSub).filter(([k]) => !['id', 'taskId', 'taskTitle', 'userId', 'userName', 'userEmail', 'userPhoto', 'userDepartment', 'attemptNumber', 'status', 'submittedAt', 'reviewedAt', 'xpAwardedAt'].includes(k)).filter(([, v]) => v && typeof v === 'string').map(([k, v]) => (
              <div key={k}>
                <strong>{k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}:</strong>{' '}
                {k.toLowerCase().includes('link') || k.toLowerCase().includes('url') || v.startsWith('http') ? (
                  <a href={v} target="_blank" rel="noreferrer" style={{ color: 'var(--orange)', wordBreak: 'break-all' }}>{v.substring(0, 50)}{v.length > 50 ? '...' : ''} <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.65rem' }} /></a>
                ) : <span style={{ color: 'var(--text-secondary)' }}>{v}</span>}
              </div>
            ))}
          </div>
          <ReviewForm task={selectedSubTask} submission={selectedSub} onSubmit={handleReviewSubmit} loading={reviewing} onStatusChange={handleStatusChange} />
        </div>
      )}
    </div>
  );

  /* ── Render: Leaderboard ── */
  const renderLeaderboard = () => (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Leaderboard Rankings</span>
        <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: 10, background: 'rgba(255,85,0,0.1)', color: 'var(--orange)', fontWeight: 700 }}>{leaderboardEntries.length} ranked</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Rank', 'Name', 'Department', 'XP', 'Level', 'Tasks', 'Avg Score', 'Streak'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.72rem' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leaderboardEntries.length === 0 ? (
            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No leaderboard data.</td></tr>
          ) : leaderboardEntries.slice(0, 50).map((e, i) => (
            <tr key={e.userId} style={{ borderBottom: '1px solid var(--border-light)' }}>
              <td style={{ padding: '0.75rem 1rem', fontWeight: 800, fontSize: '0.85rem', color: i < 3 ? ['#ffd700', '#c0c0c0', '#cd7f32'][i] : 'var(--text)' }}>#{e.rank}</td>
              <td style={{ padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img src={e.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(e.name)}&background=ff5500&color=fff`} alt={e.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{e.name}</span>
                </div>
              </td>
              <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{e.department}</td>
              <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#f59e0b' }}>{e.overallScore.toLocaleString()}</td>
              <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem' }}>{e.level}</td>
              <td style={{ padding: '0.75rem 1rem' }}>{e.tasksCompleted}</td>
              <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{e.avgScore}%</td>
              <td style={{ padding: '0.75rem 1rem' }}>{e.streak > 0 ? `🔥 ${e.streak}w` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  /* ── Render: Analytics (enhanced) ── */
  const renderAnalytics = () => {
    if (analyticsLoading) return <div className="loading-spinner" />;
    if (!analytics) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No analytics data available.</div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Open Tasks', value: analytics.openTasks, icon: 'fa-book-open', color: '#10b981' },
            { label: 'Closed Tasks', value: analytics.closedTasks, icon: 'fa-book', color: '#6b7280' },
            { label: 'Total Submissions', value: analytics.totalSubmissions, icon: 'fa-paper-plane', color: '#6366f1' },
            { label: 'Pending Reviews', value: analytics.pendingReviews, icon: 'fa-clock', color: '#f59e0b' },
            { label: 'Average Score', value: `${analytics.avgScore}%`, icon: 'fa-star', color: '#f59e0b' },
            { label: 'Completion Rate', value: `${analytics.completionRate}%`, icon: 'fa-check-circle', color: '#10b981' },
            { label: 'Total XP Awarded', value: analytics.totalXPAwarded.toLocaleString(), icon: 'fa-bolt', color: '#8b5cf6' },
            { label: 'Active Users', value: analytics.totalUsers, icon: 'fa-users', color: '#3b82f6' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${stat.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, fontSize: '1rem' }}>
                <i className={`fa-solid ${stat.icon}`} />
              </div>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{stat.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="admin-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem' }}><i className="fa-solid fa-building" style={{ color: 'var(--orange)' }} /> Department Performance</h3>
            {analytics.departmentPerformance.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center' }}>No department data yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {analytics.departmentPerformance.map((d, i) => (
                  <div key={d.department} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--surface)', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', width: 24 }}>#{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text)' }}>{d.department}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.submissions} submissions</div>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: d.avgScore >= 80 ? '#10b981' : d.avgScore >= 60 ? '#f59e0b' : '#ef4444' }}>{d.avgScore}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem' }}><i className="fa-solid fa-crown" style={{ color: '#f59e0b' }} /> Top Contributors</h3>
            {analytics.topContributors.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center' }}>No contributors yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {analytics.topContributors.map((c, i) => (
                  <div key={c.userId || i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--surface)', borderRadius: 8 }}>
                    <img src={c.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=ff5500&color=fff`} alt={c.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Level {c.level} · {c.tasksCompleted} tasks</div>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--orange)' }}>{c.overallScore.toLocaleString()} XP</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ── Render: Settings ── */
  const renderSettings = () => (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', maxWidth: 600 }}>
      <h3 style={{ fontSize: '0.94rem', fontWeight: 800, margin: '0 0 1.25rem', color: 'var(--text)' }}><i className="fa-solid fa-gear" style={{ color: 'var(--orange)' }} /> Task Settings</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[
            { key: 'defaultXPReward', label: 'Default XP Reward', type: 'number', min: 0 },
            { key: 'defaultEarlyBonus', label: 'Default Early Bonus XP', type: 'number', min: 0 },
            { key: 'defaultMaxAttempts', label: 'Default Max Attempts', type: 'number', min: 1 },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontWeight: 700, fontSize: '0.82rem', display: 'block', marginBottom: '0.3rem' }}>{f.label}</label>
              <input type={f.type} className="form-input form-input-sm" value={settings[f.key]} min={f.min}
                onChange={e => setSettings(p => ({ ...p, [f.key]: Number(e.target.value) }))} />
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '1rem' }}>
          <span style={{ fontWeight: 800, fontSize: '0.82rem', display: 'block', marginBottom: '0.5rem' }}>Gamification</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {[
              { key: 'dailyStreakBonus', label: 'Daily Streak Bonus XP' },
              { key: 'weeklyStreakBonus', label: 'Weekly Streak Bonus XP' },
              { key: 'badgeBonusXP', label: 'Badge Bonus XP' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{f.label}</label>
                <input type="number" className="form-input form-input-sm" value={settings[f.key]} min={0}
                  onChange={e => setSettings(p => ({ ...p, [f.key]: Number(e.target.value) }))} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
            <input type="checkbox" checked={settings.allowLateSubmissions} onChange={e => setSettings(p => ({ ...p, allowLateSubmissions: e.target.checked }))} />
            Allow Late Submissions (global)
          </label>
        </div>
        <button className="btn btn-primary" style={{ alignSelf: 'flex-start', background: 'var(--orange)', borderColor: 'var(--orange)' }}
          onClick={() => window.showToast('Settings Saved', 'Task settings updated.', 'success')}>
          <i className="fa-solid fa-check" /> Save Settings
        </button>
      </div>
    </div>
  );

  /* ── Main Render ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 14, padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Task Management</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>Create, manage, review, and analyze tasks.</p>
        </div>
        {tab !== 'create' && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {TABS.filter(t => t.id !== 'create').map(t => (
              <button key={t.id} className={`btn btn-sm ${tab === t.id ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t.id)}>
                <i className={`fa-solid ${t.icon}`} style={{ marginRight: '0.3rem' }} /> {t.label}
              </button>
            ))}
            <button className="btn btn-primary btn-sm" onClick={handleCreateNew} style={{ background: 'var(--orange)', borderColor: 'var(--orange)', color: '#fff' }}>
              <i className="fa-solid fa-plus" /> New Task
            </button>
          </div>
        )}
      </div>

      {loading && tab !== 'create' ? <div className="loading-spinner" />
        : tab === 'create' || isFormOpen ? renderWizardForm()
        : tab === 'overview' ? renderOverview()
        : tab === 'manage' ? renderManage()
        : tab === 'submissions' ? renderSubmissions()
        : tab === 'reviews' ? renderReviews()
        : tab === 'leaderboard' ? renderLeaderboard()
        : tab === 'analytics' ? renderAnalytics()
        : tab === 'settings' ? renderSettings()
        : null}
    </div>
  );
}
