import { useState, useEffect, useMemo } from 'react';
import db from '../../../db';
import { DIFFICULTY, DIFFICULTIES, LANGUAGES, DEFAULT_SECURITY, SECURITY_PRESETS, getSecurityLevel } from '../../config/challengeConfig';
import { getChallenges, createChallenge, updateChallenge } from '../../services/challengeService';
import { validateChallenge } from '../../../utils/challengeValidators';
import { getSecurityReport } from '../../services/activityLogService';

const P = '#4f46e5';
const Bg = '#f8fafc';
const Card = '#fff';
const Border = '#e5e7eb';
const Text = '#111827';
const TextSec = '#6b7280';
const TextMuted = '#9ca3af';
const Radius = '16px';
const RadiusSm = '10px';

const sidebarItems = [
  { step: 0, label: 'All Challenges', icon: 'fa-list' },
  { type: 'divider' },
  { step: 1, label: 'Basic Details', icon: 'fa-info-circle' },
  { step: 2, label: 'Problem Statement', icon: 'fa-file-lines' },
  { step: 3, label: 'Technical Specs', icon: 'fa-sliders' },
  { step: 4, label: 'Test Cases', icon: 'fa-vial' },
  { step: 5, label: 'Starter Code', icon: 'fa-code' },
  { step: 6, label: 'Scoring', icon: 'fa-trophy' },
  { step: 7, label: 'Security', icon: 'fa-shield-halved' },
  { step: 8, label: 'Publish', icon: 'fa-rocket' },
  { type: 'divider' },
  { step: 9, label: 'Manual Reviews', icon: 'fa-clipboard-check' },
];

function inpStyle(wide) {
  return {
    width: wide || '100%',
    height: 48,
    padding: '0 14px',
    border: `1px solid ${Border}`,
    borderRadius: RadiusSm,
    fontSize: 14,
    color: Text,
    background: Card,
    outline: 'none',
    boxSizing: 'border-box',
  };
}

function labelStyle() {
  return { display: 'block', fontSize: 13, fontWeight: 600, color: TextSec, marginBottom: 6 };
}

export default function ChallengeManagement() {
  const [challenges, setChallenges] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [editingId, setEditingId] = useState(null);

  const [activeLangTab, setActiveLangTab] = useState('python');

  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    category: 'Coding',
    tags: '',
    constraints: '',
    inputFormat: '',
    outputFormat: '',
    sampleTestCases: [{ input: '', output: '', explanation: '' }],
    hiddenTestCases: [{ input: '', expectedOutput: '' }],
    starterCode: { python: '', javascript: '', cpp: '', java: '', go: '', rust: '' },
    solutionCode: { python: '', javascript: '', cpp: '', java: '', go: '', rust: '' },
    supportedLanguages: ['python', 'javascript', 'cpp', 'java', 'go', 'rust'],
    timeLimit: 10,
    memoryLimit: 256,
    xpReward: 100,
    maxAttempts: 0,
    isDailyChallenge: false,
    challengeDate: '',
    status: 'draft',
  });

  const [selectedSub, setSelectedSub] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    status: 'Approved',
    score: 80,
    comments: '',
    strengths: '',
    improvements: '',
    suggestions: '',
  });

  const [tcTab, setTcTab] = useState('sample');
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [chals, subs] = await Promise.all([
        getChallenges(),
        db.find('ChallengeSubmissions'),
      ]);
      setChallenges(chals || []);
      setSubmissions(subs || []);
    } catch (err) {
      console.error('Failed to load admin challenge dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setErrors({});
    setShowErrors(false);
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      difficulty: 'easy',
      category: 'Coding',
      tags: '',
      constraints: '',
      inputFormat: '',
      outputFormat: '',
      sampleTestCases: [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: [{ input: '', expectedOutput: '' }],
      starterCode: { python: '', javascript: '', cpp: '', java: '', go: '', rust: '' },
      solutionCode: { python: '', javascript: '', cpp: '', java: '', go: '', rust: '' },
      supportedLanguages: ['python', 'javascript', 'cpp', 'java', 'go', 'rust'],
      timeLimit: 10,
      memoryLimit: 256,
      xpReward: 100,
      isDailyChallenge: false,
      challengeDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      security: JSON.parse(JSON.stringify(DEFAULT_SECURITY)),
    });
    setActiveLangTab('python');
    setStep(1);
  };

  const handleEdit = (c) => {
    setErrors({});
    setShowErrors(false);
    setEditingId(c.id);
    setForm({
      ...c,
      tags: Array.isArray(c.tags) ? c.tags.join(', ') : c.tags || '',
      sampleTestCases: c.sampleTestCases || [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: c.hiddenTestCases || [{ input: '', expectedOutput: '' }],
      starterCode: c.starterCode || { python: '', javascript: '' },
      solutionCode: c.solutionCode || { python: '', javascript: '' },
      supportedLanguages: c.supportedLanguages || ['python', 'javascript'],
      security: c.security || JSON.parse(JSON.stringify(DEFAULT_SECURITY)),
    });
    setActiveLangTab('python');
    setStep(1);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete challenge "${title}"?`)) return;
    try {
      await db.delete('Challenges', id);
      window.showToast('Deleted', 'Challenge deleted successfully.', 'info');
      loadData();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const handleToggleStatus = async (c) => {
    const nextStatus = c.status === 'published' ? 'draft' : 'published';
    try {
      await updateChallenge(c.id, { status: nextStatus });
      window.showToast('Status Updated', `Challenge set to ${nextStatus}.`, 'success');
      loadData();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const handleDuplicate = async (c) => {
    try {
      const newId = 'chal_' + Date.now();
      const payload = { ...c, id: newId, title: `${c.title} (Copy)`, status: 'draft', createdAt: new Date().toISOString() };
      await db.insert('Challenges', payload);
      window.showToast('Duplicated', 'Challenge duplicated successfully.', 'success');
      loadData();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    const errs = validateChallenge(form);
    setErrors(errs);
    setShowErrors(true);
    if (Object.keys(errs).length > 0) {
      window.showToast('Validation Error', 'Please fix the highlighted fields before publishing.', 'error');
      return;
    }
    try {
      const tagsArray = form.tags.split(',').map(t => t.trim()).filter(t => t !== '');
      const payload = {
        ...form,
        tags: tagsArray,
        xpReward: Number(form.xpReward),
        timeLimit: Number(form.timeLimit),
        memoryLimit: Number(form.memoryLimit),
      };
      if (editingId) {
        await updateChallenge(editingId, payload);
        window.showToast('Updated', 'Challenge updated successfully.', 'success');
      } else {
        const newId = 'chal_' + Date.now();
        await createChallenge({ id: newId, ...payload });
        window.showToast('Created', 'Challenge created successfully.', 'success');
      }
      setErrors({});
      setShowErrors(false);
      setStep(0);
      loadData();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    try {
      const challengeObj = challenges.find(c => c.id === selectedSub.challengeId);
      const baseXP = challengeObj?.xpReward || 100;
      const xpEarned = reviewForm.status === 'Approved' ? baseXP : 0;
      const subUpdates = {
        status: reviewForm.status === 'Approved' ? 'passed' : 'failed',
        score: {
          accuracyScore: reviewForm.status === 'Approved' ? 700 : 0,
          speedScore: 0,
          bonusPoints: 0,
          penaltyPoints: 0,
          finalScore: reviewForm.score,
        },
        xpEarned,
        feedback: {
          comments: reviewForm.comments,
          strengths: reviewForm.strengths,
          improvements: reviewForm.improvements,
          suggestions: reviewForm.suggestions,
        },
        reviewedAt: new Date().toISOString(),
      };
      await db.update('ChallengeSubmissions', selectedSub.id, subUpdates);
      await db.insert('Notifications', {
        id: 'nt_chal_' + Date.now(),
        userId: selectedSub.userId,
        title: reviewForm.status === 'Approved' ? 'Submission Approved!' : 'Submission Rejected',
        message: `Your project solution for "${selectedSub.taskTitle || 'Challenge'}" has been reviewed. Score: ${reviewForm.score}.`,
        read: false,
        createdAt: new Date().toISOString(),
      });
      if (reviewForm.status === 'Approved') {
        await db.insert('TaskXPHistory', {
          id: 'xp_' + Date.now(),
          userId: selectedSub.userId,
          challengeId: selectedSub.challengeId,
          xpEarned,
          earnedAt: new Date().toISOString(),
        });
        const allUsers = await db.find('Users');
        const student = allUsers.find(u => u.id === selectedSub.userId);
        if (student) {
          const currentXP = Number(student.xp || 0) + xpEarned;
          const challengeXP = Number(student.challengeXp || 0) + xpEarned;
          await db.update('Users', student.id, { xp: currentXP, challengeXp: challengeXP });
        }
      }
      window.showToast('Evaluated', 'Submission graded successfully.', 'success');
      setSelectedSub(null);
      loadData();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const pendingReviews = useMemo(() => {
    return submissions.filter(s => s.status === 'pending_review');
  }, [submissions]);

  const isFormStep = step >= 1 && step <= 8;

  const thStyle = { padding: '12px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: TextMuted, textAlign: 'left' };
  const tdStyle = { padding: '14px 16px', fontSize: 13 };

  /* ──── RENDERERS ──── */

  function renderChallengeList() {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: Text, margin: 0 }}>All Challenges</h2>
            <p style={{ fontSize: 14, color: TextSec, margin: '4px 0 0' }}>{challenges.length} total</p>
          </div>
          <button onClick={handleCreateNew} style={{ height: 40, padding: '0 20px', background: P, color: '#fff', border: 'none', borderRadius: RadiusSm, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-plus" /> New Challenge
          </button>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 64 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #e5e7eb', borderTopColor: P, borderRadius: '50%', animation: 'spin .65s linear infinite', margin: '0 auto' }}></div>
          </div>
        ) : challenges.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 64, color: TextMuted }}>
            <i className="fa-solid fa-inbox" style={{ fontSize: 28, opacity: 0.4, marginBottom: 12 }}></i>
            <p style={{ fontSize: 14 }}>No challenges yet. Create your first one.</p>
          </div>
        ) : (
          <div style={{ background: Card, border: `1px solid ${Border}`, borderRadius: Radius, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${Border}`, background: Bg }}>
                    <th style={thStyle}>Challenge</th>
                    <th style={thStyle}>Difficulty</th>
                    <th style={thStyle}>Category</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>XP</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Daily</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                    <th style={{ ...thStyle, textAlign: 'center', width: 160 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {challenges.map(c => {
                    const diff = DIFFICULTY[c.difficulty] || DIFFICULTY.easy;
                    return (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${Border}` }}>
                        <td style={tdStyle}><span style={{ fontWeight: 600, color: Text }}>{c.title}</span></td>
                        <td style={tdStyle}>
                          <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 999, background: `${diff.color}15`, color: diff.color }}>
                            {diff.label}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: TextSec, fontSize: 13 }}>{c.category}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600, color: Text }}>{c.xpReward}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontSize: 12 }}>
                          {c.isDailyChallenge ? <span style={{ color: '#d97706' }}>{c.challengeDate}</span> : <span style={{ color: TextMuted }}>—</span>}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase', background: c.status === 'published' ? '#d1fae5' : '#f3f4f6', color: c.status === 'published' ? '#059669' : TextSec }}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                            <IconBtn icon={c.status === 'published' ? 'fa-eye-slash' : 'fa-eye'} title="Toggle status" onClick={() => handleToggleStatus(c)} />
                            <IconBtn icon="fa-pen" title="Edit" onClick={() => handleEdit(c)} />
                            <IconBtn icon="fa-copy" title="Duplicate" onClick={() => handleDuplicate(c)} />
                            <IconBtn icon="fa-trash" title="Delete" onClick={() => handleDelete(c.id, c.title)} danger />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderFormStep() {
    return (
      <div>
        {/* Error banner */}
        {showErrors && Object.keys(errors).length > 0 && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: RadiusSm, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-exclamation-triangle" style={{ color: '#dc2626', fontSize: 14 }} />
            <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>Please fix the highlighted errors before saving.</span>
          </div>
        )}

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 32 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: s <= step ? P : Border, color: s <= step ? '#fff' : TextMuted, cursor: 'pointer' }} onClick={() => setStep(s)}>
                {s}
              </div>
              {s < 8 && <div style={{ width: 20, height: 2, background: s < step ? P : Border }} />}
            </div>
          ))}
        </div>

        {/* Step content */}
        {step === 1 && renderBasicInfo()}
        {step === 2 && renderProblemStatement()}
        {step === 3 && renderTechSpecs()}
        {step === 4 && renderTestCases()}
        {step === 5 && renderStarterCode()}
        {step === 6 && renderScoring()}
        {step === 7 && renderSecurity()}
        {step === 8 && renderPublishing()}
      </div>
    );
  }

  function renderBasicInfo() {
    const fieldStyle = (key) => ({
      ...inpStyle(),
      borderColor: errors[key] && showErrors ? '#dc2626' : Border,
    });
    return (
      <Section title="Basic Details" desc="Name your challenge and set the difficulty level.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle()}>Challenge Title *</label>
            <input style={fieldStyle('title')} placeholder="e.g. Two Sum Challenge" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            {errors.title && showErrors && <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><i className="fa-solid fa-exclamation-circle"></i>{errors.title}</span>}
          </div>
          <div>
            <label style={labelStyle()}>Difficulty *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {DIFFICULTIES.map(d => {
                const diff = DIFFICULTY[d];
                const active = form.difficulty === d;
                return (
                  <button key={d} onClick={() => setForm(p => ({ ...p, difficulty: d }))} style={{
                    flex: 1, height: 48, borderRadius: RadiusSm, border: `2px solid ${active ? diff.color : Border}`,
                    background: active ? `${diff.color}10` : Card, color: active ? diff.color : TextSec,
                    fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    {diff.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label style={labelStyle()}>Category *</label>
            <input style={inpStyle()} placeholder="e.g. Algorithms" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} required />
          </div>
          <div>
            <label style={labelStyle()}>XP Reward *</label>
            <input style={inpStyle()} type="number" placeholder="100" value={form.xpReward} onChange={e => setForm(p => ({ ...p, xpReward: e.target.value }))} required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle()}>Tags (comma-separated)</label>
            <input style={inpStyle()} placeholder="arrays, hashmap, strings" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: Bg, borderRadius: RadiusSm, border: `1px solid ${Border}` }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: Text, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isDailyChallenge} onChange={e => setForm(p => ({ ...p, isDailyChallenge: e.target.checked }))} style={{ accentColor: P }} />
              Schedule as Daily Challenge
            </label>
            {form.isDailyChallenge && (
              <input type="date" style={inpStyle('auto')} value={form.challengeDate} onChange={e => setForm(p => ({ ...p, challengeDate: e.target.value }))} required />
            )}
          </div>
        </div>
      </Section>
    );
  }

  function renderProblemStatement() {
    return (
      <Section title="Problem Statement" desc="Write the challenge description. Supports Markdown syntax.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, minHeight: 400 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: TextSec }}>Editor</span>
              <button onClick={() => setPreview(!preview)} style={{ height: 32, padding: '0 12px', background: preview ? P : Bg, color: preview ? '#fff' : TextSec, border: `1px solid ${Border}`, borderRadius: RadiusSm, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {preview ? 'Edit' : 'Preview'}
              </button>
            </div>
            {preview ? (
              <div style={{ padding: 16, background: Bg, borderRadius: RadiusSm, border: `1px solid ${Border}`, minHeight: 220, fontSize: 14, color: Text, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {form.description || 'Nothing to preview yet.'}
              </div>
            ) : (
              <textarea style={{ width: '100%', minHeight: 280, padding: 16, border: `1px solid ${Border}`, borderRadius: RadiusSm, fontSize: 14, color: Text, background: Card, outline: 'none', resize: 'vertical', fontFamily: "'Inter', sans-serif", lineHeight: 1.6, boxSizing: 'border-box' }}
                placeholder="Describe the challenge in detail. Use markdown for formatting..."
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
            )}
          </div>
          <div style={{ padding: 16, background: Bg, borderRadius: RadiusSm, border: `1px solid ${Border}`, minHeight: 280 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: TextMuted, marginBottom: 12 }}>Student Preview</p>
            <div style={{ fontSize: 14, color: Text, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {form.description || 'Students will see the challenge description here.'}
            </div>
          </div>
        </div>
      </Section>
    );
  }

  function renderTechSpecs() {
    return (
      <Section title="Technical Specifications" desc="Define time, memory, and format constraints.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <SpecCard label="Time Limit (minutes)" value={form.timeLimit} onChange={v => setForm(p => ({ ...p, timeLimit: v }))} icon="fa-clock" unit="min" />
          <SpecCard label="Memory Limit (MB)" value={form.memoryLimit} onChange={v => setForm(p => ({ ...p, memoryLimit: v }))} icon="fa-microchip" unit="MB" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginTop: 24 }}>
          <TextAreaCard label="Constraints" value={form.constraints} onChange={v => setForm(p => ({ ...p, constraints: v }))} placeholder="2 <= nums.length <= 10^4" />
          <TextAreaCard label="Input Format" value={form.inputFormat} onChange={v => setForm(p => ({ ...p, inputFormat: v }))} placeholder="Describe input structure..." />
          <TextAreaCard label="Output Format" value={form.outputFormat} onChange={v => setForm(p => ({ ...p, outputFormat: v }))} placeholder="Describe expected output..." />
        </div>
      </Section>
    );
  }

  function renderTestCases() {
    const items = tcTab === 'sample' ? form.sampleTestCases : form.hiddenTestCases;
    const setItems = (arr) => {
      if (tcTab === 'sample') setForm(p => ({ ...p, sampleTestCases: arr }));
      else setForm(p => ({ ...p, hiddenTestCases: arr }));
    };
    const addItem = () => {
      const def = tcTab === 'sample' ? { input: '', output: '', explanation: '' } : { input: '', expectedOutput: '' };
      setItems([...items, def]);
    };
    const duplicateItem = (i) => {
      const copy = { ...items[i] };
      const arr = [...items];
      arr.splice(i + 1, 0, copy);
      setItems(arr);
    };
    const removeItem = (i) => {
      if (items.length <= 1) return;
      setItems(items.filter((_, idx) => idx !== i));
    };
    return (
      <Section title="Test Cases" desc="Define sample (visible) and hidden (private) test cases for grading.">
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: Bg, padding: 4, borderRadius: RadiusSm, width: 'fit-content' }}>
          <button onClick={() => setTcTab('sample')} style={{ height: 36, padding: '0 16px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tcTab === 'sample' ? Card : 'transparent', color: tcTab === 'sample' ? Text : TextSec, boxShadow: tcTab === 'sample' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all .15s' }}>
            Sample ({form.sampleTestCases.length})
          </button>
          <button onClick={() => setTcTab('hidden')} style={{ height: 36, padding: '0 16px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tcTab === 'hidden' ? Card : 'transparent', color: tcTab === 'hidden' ? Text : TextSec, boxShadow: tcTab === 'hidden' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all .15s' }}>
            Hidden ({form.hiddenTestCases.length})
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map((tc, i) => (
            <div key={i} style={{ background: Card, border: `1px solid ${Border}`, borderRadius: Radius, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: Text }}>{tcTab === 'sample' ? 'Sample' : 'Hidden'} Test #{i + 1}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <IconBtn icon="fa-copy" title="Duplicate" onClick={() => duplicateItem(i)} />
                  <IconBtn icon="fa-trash" title="Delete" onClick={() => removeItem(i)} danger />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle()}>Input</label>
                  <textarea style={{ width: '100%', minHeight: 80, padding: 12, border: `1px solid ${Border}`, borderRadius: RadiusSm, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: Text, background: Card, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                    placeholder="Test input..." value={tc.input} onChange={e => {
                      const copy = [...items]; copy[i] = { ...copy[i], input: e.target.value }; setItems(copy);
                    }} />
                </div>
                <div>
                  <label style={labelStyle()}>{tcTab === 'sample' ? 'Expected Output' : 'Expected Output'}</label>
                  <textarea style={{ width: '100%', minHeight: 80, padding: 12, border: `1px solid ${Border}`, borderRadius: RadiusSm, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: Text, background: Card, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                    placeholder="Expected output..." value={tc.output || tc.expectedOutput || ''} onChange={e => {
                      const copy = [...items]; const key = tcTab === 'sample' ? 'output' : 'expectedOutput'; copy[i] = { ...copy[i], [key]: e.target.value }; setItems(copy);
                    }} />
                </div>
              </div>
              {tcTab === 'sample' && (
                <div style={{ marginTop: 12 }}>
                  <label style={labelStyle()}>Explanation (optional)</label>
                  <input style={inpStyle()} placeholder="Explain this test case..." value={tc.explanation || ''} onChange={e => {
                    const copy = [...items]; copy[i] = { ...copy[i], explanation: e.target.value }; setItems(copy);
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={addItem} style={{ marginTop: 16, height: 44, padding: '0 24px', background: Card, color: P, border: `2px dashed ${Border}`, borderRadius: RadiusSm, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center' }}>
          <i className="fa-solid fa-plus" /> Add Test Case
        </button>
      </Section>
    );
  }

  function renderStarterCode() {
    return (
      <Section title="Starter Code" desc="Enable languages and provide starter templates for each.">
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle()}>Supported Languages</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {LANGUAGES.map(l => {
              const enabled = form.supportedLanguages.includes(l.id);
              return (
                <button key={l.id} onClick={() => {
                  const updated = enabled ? form.supportedLanguages.filter(id => id !== l.id) : [...form.supportedLanguages, l.id];
                  setForm(p => ({ ...p, supportedLanguages: updated }));
                }} style={{
                  height: 36, padding: '0 16px', borderRadius: 999, border: `2px solid ${enabled ? P : Border}`,
                  background: enabled ? `${P}10` : Card, color: enabled ? P : TextSec, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s',
                }}>
                  {enabled && <i className="fa-solid fa-check" style={{ fontSize: 11 }} />}
                  {l.name}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ background: Card, border: `1px solid ${Border}`, borderRadius: Radius, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${Border}`, background: Bg }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: Text }}>Starter Code Template</span>
            <select value={activeLangTab} onChange={e => setActiveLangTab(e.target.value)} style={{ height: 34, padding: '0 12px', border: `1px solid ${Border}`, borderRadius: 8, fontSize: 12, color: Text, background: Card, outline: 'none', fontWeight: 600 }}>
              {form.supportedLanguages.map(id => (
                <option key={id} value={id}>{LANGUAGES.find(l => l.id === id)?.name || id}</option>
              ))}
            </select>
          </div>
          <textarea style={{ width: '100%', minHeight: 220, padding: 16, border: 'none', fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: Text, background: Card, outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
            value={form.starterCode?.[activeLangTab] || ''} onChange={e => setForm(p => ({ ...p, starterCode: { ...p.starterCode, [activeLangTab]: e.target.value } }))}
            placeholder={`Write starter code for ${activeLangTab}...`} />
        </div>
      </Section>
    );
  }

  function renderScoring() {
    return (
      <Section title="Scoring" desc="Configure XP rewards, penalties, and limits.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <SpecCard label="XP Reward" value={form.xpReward} onChange={v => setForm(p => ({ ...p, xpReward: v }))} icon="fa-star" unit="XP" />
          <SpecCard label="Time Limit (minutes)" value={form.timeLimit} onChange={v => setForm(p => ({ ...p, timeLimit: v }))} icon="fa-clock" unit="min" />
          <SpecCard label="Memory Limit (MB)" value={form.memoryLimit} onChange={v => setForm(p => ({ ...p, memoryLimit: v }))} icon="fa-microchip" unit="MB" />
          <SpecCard label="Max Attempts (0 = Unlimited)" value={form.maxAttempts} onChange={v => setForm(p => ({ ...p, maxAttempts: v }))} icon="fa-rotate" unit="tries" />
          <div style={{ background: Card, border: `1px solid ${Border}`, borderRadius: Radius, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${P}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: P, fontSize: 14 }}><i className="fa-solid fa-eye"></i></div>
              <span style={{ fontWeight: 600, fontSize: 14, color: TextSec }}>Visibility</span>
            </div>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={inpStyle()}>
              <option value="draft">Draft (Hidden)</option>
              <option value="published">Published (Visible)</option>
            </select>
          </div>
        </div>
      </Section>
    );
  }

  function renderSecurity() {
    const sec = form.security || DEFAULT_SECURITY;
    const setSec = (updater) => setForm(p => ({ ...p, security: { ...p.security, ...updater } }));
    const setGroup = (group, key, value) => setForm(p => ({
      ...p,
      security: { ...p.security, [group]: { ...p.security?.[group], [key]: value } },
    }));
    const applyPreset = (presetKey) => {
      const preset = SECURITY_PRESETS[presetKey];
      if (preset) setForm(p => ({ ...p, security: JSON.parse(JSON.stringify(preset.config)) }));
    };

    function ToggleSec({ group, field, label }) {
      const checked = sec?.[group]?.[field] ?? DEFAULT_SECURITY[group]?.[field] ?? false;
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', padding: '6px 0' }}>
          <div style={{ width: 36, height: 20, borderRadius: 12, position: 'relative', background: checked ? P : Border, transition: 'background 0.2s', flexShrink: 0 }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: checked ? 18 : 2, transition: 'left 0.2s' }} />
            <input type="checkbox" checked={checked} onChange={e => setGroup(group, field, e.target.checked)} style={{ display: 'none' }} />
          </div>
          <span style={{ fontSize: 13, color: TextSec, fontWeight: 500 }}>{label}</span>
        </label>
      );
    }

    const secLevel = getSecurityLevel(sec);

    return (
      <Section title="Security" desc="Configure proctoring and anti-cheat settings for this challenge.">
        {/* Preset selector */}
        <div style={{ marginBottom: 24, padding: 16, background: Bg, borderRadius: RadiusSm, border: `1px solid ${Border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: TextSec }}>Security Preset:</label>
            <select onChange={e => { if (e.target.value) applyPreset(e.target.value); e.target.value = ''; }}
              style={{ height: 36, padding: '0 12px', border: `1px solid ${Border}`, borderRadius: 8, fontSize: 13, color: Text, background: Card, outline: 'none' }}>
              <option value="">-- Select Preset --</option>
              {Object.entries(SECURITY_PRESETS).map(([key, p]) => (
                <option key={key} value={key}>{p.label} — {p.desc}</option>
              ))}
            </select>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 999, background: `${secLevel.color}15` }}>
              <span>{secLevel.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: secLevel.color }}>Level: {secLevel.label}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          {/* Exam Security */}
          <div style={{ background: Card, border: `1px solid ${Border}`, borderRadius: Radius, padding: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: Text, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-shield" style={{ color: P, fontSize: 13 }} /> Exam Security
            </h4>
            <p style={{ fontSize: 11, color: TextMuted, margin: '0 0 12px' }}>Browser and window controls</p>
            <ToggleSec group="exam" field="fullscreenRequired" label="Require Fullscreen" />
            <ToggleSec group="exam" field="tabSwitchDetection" label="Detect Tab Switching" />
            <ToggleSec group="exam" field="windowBlurDetection" label="Detect Window Blur" />
            <ToggleSec group="exam" field="minimizeDetection" label="Detect Minimize Window" />
            <ToggleSec group="exam" field="disableRefreshWarning" label="Disable Refresh Warning" />
            <ToggleSec group="exam" field="disablePrint" label="Disable Print (Ctrl+P)" />
            <ToggleSec group="exam" field="disableSave" label="Disable Save (Ctrl+S)" />
          </div>

          {/* Keyboard Restrictions */}
          <div style={{ background: Card, border: `1px solid ${Border}`, borderRadius: Radius, padding: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: Text, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-keyboard" style={{ color: P, fontSize: 13 }} /> Keyboard Restrictions
            </h4>
            <p style={{ fontSize: 11, color: TextMuted, margin: '0 0 12px' }}>Input and interaction controls</p>
            <ToggleSec group="keyboard" field="disableCopy" label="Disable Copy" />
            <ToggleSec group="keyboard" field="disablePaste" label="Disable Paste" />
            <ToggleSec group="keyboard" field="disableCut" label="Disable Cut" />
            <ToggleSec group="keyboard" field="disableSelectAll" label="Disable Select All" />
            <ToggleSec group="keyboard" field="disableRightClick" label="Disable Right Click" />
            <ToggleSec group="keyboard" field="disableDragDrop" label="Disable Drag & Drop" />
            <ToggleSec group="keyboard" field="disableTextSelection" label="Disable Text Selection" />
          </div>

          {/* DevTools Protection */}
          <div style={{ background: Card, border: `1px solid ${Border}`, borderRadius: Radius, padding: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: Text, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-code" style={{ color: P, fontSize: 13 }} /> DevTools Protection
            </h4>
            <p style={{ fontSize: 11, color: TextMuted, margin: '0 0 12px' }}>Developer tool detection</p>
            <ToggleSec group="devtools" field="detectDevTools" label="Detect DevTools Opening" />
            <ToggleSec group="devtools" field="detectConsole" label="Detect Console Inspection" />
            <ToggleSec group="devtools" field="detectViewSource" label="Detect View Source" />
            <ToggleSec group="devtools" field="detectDebugger" label="Detect Debugger Pause" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
          {/* Submission Rules */}
          <div style={{ background: Card, border: `1px solid ${Border}`, borderRadius: Radius, padding: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: Text, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-paper-plane" style={{ color: P, fontSize: 13 }} /> Submission Rules
            </h4>
            <p style={{ fontSize: 11, color: TextMuted, margin: '0 0 12px' }}>Auto-submission and save behavior</p>
            <ToggleSec group="submission" field="autoSubmitOnFullscreenExit" label="Auto Submit on Fullscreen Exit" />
            <ToggleSec group="submission" field="autoSubmitAfterViolationLimit" label="Auto Submit After Violation Limit" />
            <ToggleSec group="submission" field="autoSubmitOnTimerEnd" label="Auto Submit on Timer End" />
            <ToggleSec group="submission" field="warnBeforeAutoSubmission" label="Warn Before Auto Submission" />
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: TextSec, display: 'block', marginBottom: 4 }}>Autosave Interval (seconds)</label>
              <input type="number" min="3" max="60" value={sec?.submission?.autoSaveInterval ?? 10}
                onChange={e => setGroup('submission', 'autoSaveInterval', Number(e.target.value))}
                style={{ width: '100%', height: 36, padding: '0 10px', border: `1px solid ${Border}`, borderRadius: 8, fontSize: 13, color: Text, background: Card, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Violation & Idle */}
          <div style={{ background: Card, border: `1px solid ${Border}`, borderRadius: Radius, padding: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: Text, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-gavel" style={{ color: P, fontSize: 13 }} /> Violation Configuration
            </h4>
            <p style={{ fontSize: 11, color: TextMuted, margin: '0 0 12px' }}>Violation limits and idle detection</p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: TextSec, display: 'block', marginBottom: 4 }}>Maximum Violations</label>
              <input type="number" min="1" max="10" value={sec?.violations?.maxViolations ?? 3}
                onChange={e => setGroup('violations', 'maxViolations', Number(e.target.value))}
                style={{ width: '100%', height: 36, padding: '0 10px', border: `1px solid ${Border}`, borderRadius: 8, fontSize: 13, color: Text, background: Card, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {['first', 'second', 'third', 'submit'].map((key, i) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: TextMuted, display: 'block', marginBottom: 2 }}>
                    {i < 3 ? `Warning ${i + 1}` : 'Auto Submit Label'}
                  </label>
                  <input value={sec?.violations?.warnings?.[key] ?? ''}
                    onChange={e => setForm(p => ({ ...p, security: { ...p.security, violations: { ...p.security?.violations, warnings: { ...p.security?.violations?.warnings, [key]: e.target.value } } } }))}
                    style={{ width: '100%', height: 30, padding: '0 8px', border: `1px solid ${Border}`, borderRadius: 6, fontSize: 11, color: Text, background: Card, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${Border}` }}>
              <h5 style={{ fontSize: 12, fontWeight: 700, color: Text, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="fa-solid fa-clock" style={{ color: TextMuted }} /> Idle Detection
              </h5>
              <ToggleSec group="idleDetection" field="enabled" label="Enable Idle Detection" />
              {sec?.idleDetection?.enabled && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: TextMuted, display: 'block', marginBottom: 2 }}>Idle Timeout (min)</label>
                    <input type="number" min="1" max="30" value={sec?.idleDetection?.timeoutMinutes ?? 5}
                      onChange={e => setGroup('idleDetection', 'timeoutMinutes', Number(e.target.value))}
                      style={{ width: '100%', height: 30, padding: '0 8px', border: `1px solid ${Border}`, borderRadius: 6, fontSize: 11, color: Text, background: Card, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: TextMuted, display: 'block', marginBottom: 2 }}>Auto Submit After (min)</label>
                    <input type="number" min="1" max="60" value={sec?.idleDetection?.autoSubmitAfterMinutes ?? 10}
                      onChange={e => setGroup('idleDetection', 'autoSubmitAfterMinutes', Number(e.target.value))}
                      style={{ width: '100%', height: 30, padding: '0 8px', border: `1px solid ${Border}`, borderRadius: 6, fontSize: 11, color: Text, background: Card, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>
    );
  }

  function renderPublishing() {
    const diff = DIFFICULTY[form.difficulty] || DIFFICULTY.easy;
    const secLevel = getSecurityLevel(form.security);
    const valErrors = validateChallenge(form);
    const hasErrors = Object.keys(valErrors).length > 0;
    const publishReady = !hasErrors;

    const checklist = [
      { key: 'title', label: 'Title provided', pass: !!form.title?.trim() },
      { key: 'description', label: 'Description provided', pass: !!form.description?.trim() },
      { key: 'constraints', label: 'Constraints provided', pass: !!form.constraints?.trim() },
      { key: 'inputFormat', label: 'Input format provided', pass: !!form.inputFormat?.trim() },
      { key: 'outputFormat', label: 'Output format provided', pass: !!form.outputFormat?.trim() },
      { key: 'hiddenTestCases', label: 'At least 1 hidden test case', pass: (form.hiddenTestCases?.length || 0) > 0 },
      { key: 'sampleTestCases', label: 'At least 1 sample test case', pass: (form.sampleTestCases?.length || 0) > 0 },
      { key: 'supportedLanguages', label: 'At least 1 language supported', pass: (form.supportedLanguages?.length || 0) > 0 },
      { key: 'security', label: 'Security configured', pass: !!form.security },
      { key: 'timeLimit', label: 'Time limit valid (>= 1 min)', pass: Number(form.timeLimit) >= 1 },
      { key: 'memoryLimit', label: 'Memory limit valid (>= 16 MB)', pass: Number(form.memoryLimit) >= 16 },
    ];
    return (
      <Section title="Publish" desc="Review and publish your challenge.">
        {/* Publish Checklist */}
        <div style={{ background: Card, border: `1px solid ${Border}`, borderRadius: Radius, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: Text, marginBottom: 12 }}>Publish Checklist</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {checklist.map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: item.pass ? '#f0fdf4' : '#fef2f2', borderRadius: 8 }}>
                <i className={`fa-solid ${item.pass ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ color: item.pass ? '#059669' : '#dc2626', fontSize: 13 }} />
                <span style={{ fontSize: 13, color: item.pass ? '#065f46' : '#991b1b' }}>{item.label}</span>
              </div>
            ))}
          </div>
          {publishReady && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #d1fae5', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-check-circle" style={{ color: '#059669' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#065f46' }}>All checks passed. Ready to publish.</span>
            </div>
          )}
          {hasErrors && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-times-circle" style={{ color: '#dc2626' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#991b1b' }}>{Object.keys(valErrors).length} issue(s) must be fixed before publishing.</span>
            </div>
          )}
        </div>

        {/* Security Summary */}
        <div style={{ background: Card, border: `1px solid ${Border}`, borderRadius: Radius, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: Text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-shield-halved" style={{ color: P }} /> Security Summary
          </h3>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 999, background: `${secLevel.color}15`, marginBottom: 12 }}>
            <span>{secLevel.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: secLevel.color }}>Level: {secLevel.label}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { label: 'Fullscreen', pass: form.security?.exam?.fullscreenRequired },
              { label: 'Tab Switch', pass: form.security?.exam?.tabSwitchDetection },
              { label: 'Copy Blocked', pass: form.security?.keyboard?.disableCopy },
              { label: 'Paste Blocked', pass: form.security?.keyboard?.disablePaste },
              { label: 'Right Click', pass: form.security?.keyboard?.disableRightClick },
              { label: 'DevTools', pass: form.security?.devtools?.detectDevTools },
              { label: 'Auto Submit', pass: form.security?.submission?.autoSubmitAfterViolationLimit },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                <i className={`fa-solid ${item.pass ? 'fa-check-circle' : 'fa-circle'}`} style={{ color: item.pass ? '#059669' : '#d1d5db', fontSize: 11 }} />
                <span style={{ fontSize: 12, color: item.pass ? '#374151' : '#9ca3af' }}>{item.label}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: TextSec }}>
            Violation Limit: <strong style={{ color: Text }}>{form.security?.violations?.maxViolations || 3}</strong>
          </div>
        </div>

        <div style={{ background: Card, border: `1px solid ${Border}`, borderRadius: Radius, padding: 32, marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: Text, marginBottom: 24 }}>Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <SummaryRow label="Title" value={form.title || 'Not set'} />
            <SummaryRow label="Difficulty" value={diff.label} color={diff.color} />
            <SummaryRow label="Category" value={form.category} />
            <SummaryRow label="Supported Languages" value={form.supportedLanguages.length > 0 ? `${form.supportedLanguages.length} languages` : 'None'} />
            <SummaryRow label="Test Cases" value={`${form.sampleTestCases.length} sample, ${form.hiddenTestCases.length} hidden`} />
            <SummaryRow label="XP Reward" value={`${form.xpReward} XP`} />
            <SummaryRow label="Time Limit" value={`${form.timeLimit} min`} />
            <SummaryRow label="Status" value={form.status === 'published' ? 'Published' : 'Draft'} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
          <button onClick={() => setStep(0)} style={{ height: 44, padding: '0 24px', background: Card, color: TextSec, border: `1px solid ${Border}`, borderRadius: RadiusSm, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          {editingId && (
            <button onClick={() => handleDelete(editingId, form.title)} style={{ height: 44, padding: '0 24px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: RadiusSm, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <i className="fa-solid fa-trash" style={{ marginRight: 6 }} /> Delete
            </button>
          )}
          <button onClick={handleSave} disabled={!publishReady} style={{ height: 44, padding: '0 32px', background: publishReady ? P : '#d1d5db', color: publishReady ? '#fff' : '#9ca3af', border: 'none', borderRadius: RadiusSm, fontSize: 13, fontWeight: 600, cursor: publishReady ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className={`fa-solid ${form.status === 'published' ? 'fa-paper-plane' : 'fa-save'}`} />
            {form.status === 'published' ? 'Publish' : 'Save Draft'}
          </button>
        </div>
      </Section>
    );
  }

  function renderReviews() {
    return (
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: Text, marginBottom: 4 }}>Manual Reviews</h2>
        <p style={{ fontSize: 14, color: TextSec, marginBottom: 24 }}>Grade project submissions that require manual evaluation.</p>

        <div style={{ display: 'grid', gridTemplateColumns: selectedSub ? '1fr 360px' : '1fr', gap: 24, alignItems: 'start' }}>
          <div style={{ background: Card, border: `1px solid ${Border}`, borderRadius: Radius, overflow: 'hidden' }}>
            {pendingReviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 64, color: TextMuted }}>
                <i className="fa-solid fa-clipboard" style={{ fontSize: 28, opacity: 0.4, marginBottom: 12 }}></i>
                <p style={{ fontSize: 14 }}>No submissions pending review.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${Border}`, background: Bg }}>
                    <th style={thStyle}>Student</th>
                    <th style={thStyle}>Challenge</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Submitted</th>
                    <th style={{ ...thStyle, textAlign: 'center', width: 100 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingReviews.map(s => (
                    <tr key={s.id} style={{ borderBottom: `1px solid ${Border}` }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: Text }}>{s.userName}</div>
                        <div style={{ fontSize: 12, color: TextMuted }}>{s.userEmail}</div>
                      </td>
                      <td style={{ ...tdStyle, color: TextSec, fontSize: 13 }}>{s.taskTitle || 'Coding Solution'}</td>
                      <td style={{ ...tdStyle, textAlign: 'center', color: TextMuted, fontSize: 13 }}>{new Date(s.submittedAt).toLocaleDateString()}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <button onClick={() => { setSelectedSub(s); setReviewForm({ status: 'Approved', score: 80, comments: '', strengths: '', improvements: '', suggestions: '' }); }}
                          style={{ height: 32, padding: '0 14px', background: P, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          Grade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {selectedSub && (
            <div style={{ background: Card, border: `1px solid ${Border}`, borderRadius: Radius, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: Text, margin: 0 }}>Grade Panel</h3>
                <button onClick={() => setSelectedSub(null)} style={{ border: 'none', background: 'none', color: TextMuted, cursor: 'pointer', fontSize: 16 }}><i className="fa-solid fa-xmark"></i></button>
              </div>
              <div style={{ fontSize: 13, color: TextSec, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <p style={{ margin: 0 }}><strong style={{ color: Text }}>Student:</strong> {selectedSub.userName}</p>
                <p style={{ margin: 0 }}><strong style={{ color: Text }}>Date:</strong> {new Date(selectedSub.submittedAt).toLocaleString()}</p>
                {selectedSub.githubUrl && <p style={{ margin: 0 }}><strong style={{ color: Text }}>Repo:</strong> <a href={selectedSub.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: P }}>View</a></p>}
                {selectedSub.demoUrl && <p style={{ margin: 0 }}><strong style={{ color: Text }}>Demo:</strong> <a href={selectedSub.demoUrl} target="_blank" rel="noopener noreferrer" style={{ color: P }}>View</a></p>}
              </div>

              {/* Security Report */}
              {selectedSub.securityLog && selectedSub.securityLog.length > 0 && (
                <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: Text, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fa-solid fa-shield-halved" style={{ color: P }} /> Security Report
                  </h4>
                  {(() => {
                    const report = getSecurityReport(selectedSub.securityLog);
                    const rows = [
                      { label: 'Violations', value: report.violations },
                      { label: 'Tab Switches', value: report.tabSwitches },
                      { label: 'Fullscreen Exits', value: report.fullscreenExits },
                      { label: 'Copy Attempts', value: report.copyAttempts },
                      { label: 'Paste Attempts', value: report.pasteAttempts },
                      { label: 'DevTools', value: report.devtoolsOpened },
                      { label: 'Auto Submitted', value: report.autoSubmitted ? 'Yes' : 'No' },
                    ];
                    if (report.totalTime > 0) {
                      const min = Math.floor(report.totalTime / 60);
                      const sec = report.totalTime % 60;
                      rows.push({ label: 'Total Time', value: `${min}m ${sec}s` });
                    }
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                        {rows.map((r, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #f3f4f6' }}>
                            <span style={{ fontSize: 11, color: '#6b7280' }}>{r.label}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: r.value === 'Yes' || (typeof r.value === 'number' && r.value > 0) ? '#dc2626' : '#111827' }}>{r.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={labelStyle()}>Decision</label>
                  <select value={reviewForm.status} onChange={e => setReviewForm(p => ({ ...p, status: e.target.value }))} style={inpStyle()}>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle()}>Score (0–1000)</label>
                  <input type="number" min="0" max="1000" value={reviewForm.score} onChange={e => setReviewForm(p => ({ ...p, score: Number(e.target.value) }))} style={inpStyle()} required />
                </div>
                <div>
                  <label style={labelStyle()}>Comments</label>
                  <textarea style={{ width: '100%', minHeight: 70, padding: 12, border: `1px solid ${Border}`, borderRadius: RadiusSm, fontSize: 13, color: Text, background: Card, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                    value={reviewForm.comments} onChange={e => setReviewForm(p => ({ ...p, comments: e.target.value }))} placeholder="Grade summary..." />
                </div>
                <div>
                  <label style={labelStyle()}>Strengths</label>
                  <input style={inpStyle()} value={reviewForm.strengths} onChange={e => setReviewForm(p => ({ ...p, strengths: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle()}>Improvements</label>
                  <input style={inpStyle()} value={reviewForm.improvements} onChange={e => setReviewForm(p => ({ ...p, improvements: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle()}>Suggestions</label>
                  <input style={inpStyle()} value={reviewForm.suggestions} onChange={e => setReviewForm(p => ({ ...p, suggestions: e.target.value }))} />
                </div>
                <button type="submit" style={{ height: 44, background: P, color: '#fff', border: 'none', borderRadius: RadiusSm, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Submit Grade
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ──── MAIN RENDER ──── */

  return (
    <div style={{ minHeight: '60vh' }}>
      {/* Top bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: Text, margin: 0 }}>Challenge Studio</h1>
            <p style={{ fontSize: 14, color: TextSec, margin: '4px 0 0' }}>Create and manage coding challenges</p>
          </div>
          {isFormStep && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, fontWeight: 600, background: form.status === 'published' ? '#d1fae5' : '#f3f4f6', color: form.status === 'published' ? '#059669' : TextMuted }}>
                {form.status === 'published' ? 'Published' : 'Draft'}
              </span>
              <button onClick={() => setStep(0)} style={{ height: 36, padding: '0 14px', background: Card, color: TextSec, border: `1px solid ${Border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <i className="fa-solid fa-xmark" style={{ marginRight: 4 }} /> Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Layout */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <div style={{ width: 220, flexShrink: 0, background: Card, border: `1px solid ${Border}`, borderRadius: Radius, padding: 8, position: 'sticky', top: 80 }}>
          {sidebarItems.map((item, i) => {
            if (item.type === 'divider') {
              return <div key={'sep-' + i} style={{ height: 1, background: Border, margin: '8px 0' }} />;
            }
            const active = step === item.step;
            return (
              <button key={item.step} onClick={() => setStep(item.step)} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px',
                border: 'none', borderRadius: 10, fontSize: 13, fontWeight: active ? 700 : 500,
                background: active ? `${P}10` : 'transparent', color: active ? P : TextSec, cursor: 'pointer',
                textAlign: 'left', transition: 'all .15s',
              }}>
                <i className={`fa-solid ${item.icon}`} style={{ width: 16, textAlign: 'center', fontSize: 12 }} />
                {item.label}
                {item.step === 9 && pendingReviews.length > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#dc2626', color: '#fff', borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                    {pendingReviews.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {step === 0 && renderChallengeList()}
          {isFormStep && renderFormStep()}
          {step === 9 && renderReviews()}
        </div>
      </div>
    </div>
  );

}

function Section({ title, desc, children }) {
  return (
    <div style={{ background: Card, border: `1px solid ${Border}`, borderRadius: Radius, padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h2>
        {desc && <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function SpecCard({ label, value, onChange, icon, unit }) {
  return (
    <div style={{ background: '#fff', border: `1px solid #e5e7eb`, borderRadius: '16px', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#4f46e512', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontSize: 14 }}>
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#6b7280' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="number" style={{ flex: 1, height: 48, padding: '0 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 16, fontWeight: 700, color: '#111827', background: '#fff', outline: 'none' }}
          value={value} onChange={e => onChange(e.target.value)} />
        <span style={{ fontSize: 14, fontWeight: 600, color: '#9ca3af' }}>{unit}</span>
      </div>
    </div>
  );
}

function TextAreaCard({ label, value, onChange, placeholder }) {
  return (
    <div style={{ background: '#fff', border: `1px solid #e5e7eb`, borderRadius: '16px', padding: 24 }}>
      <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>{label}</span>
      <textarea style={{ width: '100%', minHeight: 100, padding: 12, border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#111827', background: '#fff', outline: 'none', resize: 'vertical', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' }}
        placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function IconBtn({ icon, title, onClick, danger }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 32, height: 32, borderRadius: 8, border: `1px solid #e5e7eb`,
      background: danger ? '#fef2f2' : '#fff', color: danger ? '#dc2626' : '#6b7280',
      fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all .15s',
    }}>
      <i className={`fa-solid ${icon}`} />
    </button>
  );
}

function SummaryRow({ label, value, color }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ display: 'block', fontSize: 12, color: '#9ca3af', fontWeight: 600, marginBottom: 2 }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: 14, color: color || '#111827' }}>{value}</span>
    </div>
  );
}
