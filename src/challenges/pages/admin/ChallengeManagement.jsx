import React, { useState, useEffect, useMemo } from 'react';
import db from '../../../db';
import { DIFFICULTY, DIFFICULTIES, LANGUAGES } from '../../config/challengeConfig';
import { getChallenges, createChallenge, updateChallenge } from '../../services/challengeService';

export default function ChallengeManagement() {
  const [challenges, setChallenges] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('manage'); // 'manage' | 'reviews'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Selected language for editing starter code inside the form
  const [activeLangTab, setActiveLangTab] = useState('python');

  // Form states
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
    isDailyChallenge: false,
    challengeDate: '',
    status: 'draft'
  });

  // Manual Review variables
  const [selectedSub, setSelectedSub] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    status: 'Approved',
    score: 80,
    comments: '',
    strengths: '',
    improvements: '',
    suggestions: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [chals, subs] = await Promise.all([
        getChallenges(),
        db.find('ChallengeSubmissions')
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
      status: 'draft'
    });
    setActiveLangTab('python');
    setIsFormOpen(true);
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setForm({
      ...c,
      tags: Array.isArray(c.tags) ? c.tags.join(', ') : c.tags || '',
      sampleTestCases: c.sampleTestCases || [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: c.hiddenTestCases || [{ input: '', expectedOutput: '' }],
      starterCode: c.starterCode || { python: '', javascript: '' },
      solutionCode: c.solutionCode || { python: '', javascript: '' },
      supportedLanguages: c.supportedLanguages || ['python', 'javascript']
    });
    setIsFormOpen(true);
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
      const payload = {
        ...c,
        id: newId,
        title: `${c.title} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString()
      };
      await db.insert('Challenges', payload);
      window.showToast('Duplicated', 'Challenge duplicated successfully.', 'success');
      loadData();
    } catch (err) {
      window.showToast('Error', err.message, 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = form.tags.split(',').map(t => t.trim()).filter(t => t !== '');
      const payload = {
        ...form,
        tags: tagsArray,
        xpReward: Number(form.xpReward),
        timeLimit: Number(form.timeLimit),
        memoryLimit: Number(form.memoryLimit)
      };

      if (editingId) {
        await updateChallenge(editingId, payload);
        window.showToast('Updated', 'Challenge updated successfully.', 'success');
      } else {
        const newId = 'chal_' + Date.now();
        await createChallenge({ id: newId, ...payload });
        window.showToast('Created', 'Challenge created successfully.', 'success');
      }
      setIsFormOpen(false);
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
          finalScore: reviewForm.score
        },
        xpEarned,
        feedback: {
          comments: reviewForm.comments,
          strengths: reviewForm.strengths,
          improvements: reviewForm.improvements,
          suggestions: reviewForm.suggestions
        },
        reviewedAt: new Date().toISOString()
      };

      await db.update('ChallengeSubmissions', selectedSub.id, subUpdates);

      // Create notification for student
      await db.insert('Notifications', {
        id: 'nt_chal_' + Date.now(),
        userId: selectedSub.userId,
        title: reviewForm.status === 'Approved' ? '🎉 Challenge Submission Approved!' : '❌ Challenge Submission Rejected',
        message: `Your project solution for "${selectedSub.taskTitle || 'Challenge'}" has been reviewed. Score: ${reviewForm.score}.`,
        read: false,
        createdAt: new Date().toISOString()
      });

      // Update XP History if approved
      if (reviewForm.status === 'Approved') {
        await db.insert('TaskXPHistory', {
          id: 'xp_' + Date.now(),
          userId: selectedSub.userId,
          challengeId: selectedSub.challengeId,
          xpEarned,
          earnedAt: new Date().toISOString()
        });

        // Add to user XP
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

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header Cards & Tab Selectors */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--text)] tracking-tight">Coding Challenge Dashboard</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Configure test cases, publish tasks, and evaluate submissions</p>
        </div>
        {!isFormOpen && (
          <div className="flex items-center gap-2">
            <div className="flex bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)]">
              <button
                onClick={() => setTab('manage')}
                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                style={{
                  backgroundColor: tab === 'manage' ? 'var(--orange)' : 'transparent',
                  color: tab === 'manage' ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                Manage Tasks
              </button>
              <button
                onClick={() => setTab('reviews')}
                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer relative"
                style={{
                  backgroundColor: tab === 'reviews' ? 'var(--orange)' : 'transparent',
                  color: tab === 'reviews' ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                Manual Reviews
                {pendingReviews.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold">
                    {pendingReviews.length}
                  </span>
                )}
              </button>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 text-white rounded-xl text-xs font-extrabold cursor-pointer hover:brightness-110 transition-all flex items-center gap-1.5"
              style={{ backgroundColor: 'var(--orange)', border: 'none' }}
            >
              <i className="fa-solid fa-plus" />
              New Challenge
            </button>
          </div>
        )}
      </div>

      {isFormOpen ? (
        /* Create & Edit Challenge Form */
        <form onSubmit={handleSave} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-[var(--border-light)] pb-4">
            <h3 className="text-base font-black text-[var(--text)]">{editingId ? '✏️ Edit Coding Challenge' : '🚀 Create New Coding Challenge'}</h3>
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--text-secondary)]">Cancel</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Info Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Challenge Title *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)]"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Problem Description * (Supports Markdown)</label>
                <textarea
                  className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)] min-h-[140px]"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Difficulty *</label>
                  <select
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)] cursor-pointer"
                    value={form.difficulty}
                    onChange={e => setForm(p => ({ ...p, difficulty: e.target.value }))}
                  >
                    {DIFFICULTIES.map(d => (
                      <option key={d} value={d}>{DIFFICULTY[d].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Category *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)]"
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">XP Reward *</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)]"
                    value={form.xpReward}
                    onChange={e => setForm(p => ({ ...p, xpReward: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Time Limit (mins) *</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)]"
                    value={form.timeLimit}
                    onChange={e => setForm(p => ({ ...p, timeLimit: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Memory Limit (MB) *</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)]"
                    value={form.memoryLimit}
                    onChange={e => setForm(p => ({ ...p, memoryLimit: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)]"
                  value={form.tags}
                  onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                  placeholder="arrays, hashmap, strings"
                />
              </div>

              {/* Supported Languages Selector */}
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] mb-2 block">Supported Languages</label>
                <div className="grid grid-cols-3 gap-2 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                  {LANGUAGES.map(l => {
                    const isChecked = form.supportedLanguages.includes(l.id);
                    return (
                      <label key={l.id} className="flex items-center gap-1.5 text-xs text-[var(--text)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const updated = isChecked
                              ? form.supportedLanguages.filter(id => id !== l.id)
                              : [...form.supportedLanguages, l.id];
                            setForm(p => ({ ...p, supportedLanguages: updated }));
                          }}
                        />
                        {l.name}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                <label className="flex items-center gap-2 text-xs font-bold text-[var(--text)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isDailyChallenge}
                    onChange={e => setForm(p => ({ ...p, isDailyChallenge: e.target.checked }))}
                  />
                  Make Daily Challenge
                </label>
                {form.isDailyChallenge && (
                  <input
                    type="date"
                    className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] outline-none"
                    value={form.challengeDate}
                    onChange={e => setForm(p => ({ ...p, challengeDate: e.target.value }))}
                    required
                  />
                )}
              </div>
            </div>

            {/* Right Form Fields (Starter Code Tabs, Constraints & Test Cases) */}
            <div className="space-y-4">
              
              {/* Constraints, Input, Output Formats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Constraints</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)] font-mono"
                    value={form.constraints}
                    onChange={e => setForm(p => ({ ...p, constraints: e.target.value }))}
                    placeholder="e.g. 1 <= nums.length <= 10^5"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Input Format</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)]"
                    value={form.inputFormat}
                    onChange={e => setForm(p => ({ ...p, inputFormat: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Output Format</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)]"
                    value={form.outputFormat}
                    onChange={e => setForm(p => ({ ...p, outputFormat: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Publishing Status</label>
                  <select
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)] cursor-pointer font-bold text-green-600"
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  >
                    <option value="draft" style={{ color: 'var(--text)' }}>Draft</option>
                    <option value="published" style={{ color: '#10b981' }}>Published</option>
                  </select>
                </div>
              </div>

              {/* Starter Code Multi-Language Manager */}
              <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface)] space-y-3">
                <div className="flex justify-between items-center border-b border-[var(--border-light)] pb-2">
                  <span className="text-xs font-black text-[var(--text)]">Starter Code Template</span>
                  <select
                    value={activeLangTab}
                    onChange={e => setActiveLangTab(e.target.value)}
                    className="px-2.5 py-1 bg-[var(--card)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)]"
                  >
                    {form.supportedLanguages.map(langId => (
                      <option key={langId} value={langId}>{LANGUAGES.find(l => l.id === langId)?.name || langId}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] mb-1 block uppercase">Starter Code for {activeLangTab}</label>
                  <textarea
                    className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs font-mono outline-none text-[var(--text)] min-h-[100px]"
                    value={form.starterCode?.[activeLangTab] || ''}
                    onChange={e => setForm(p => ({
                      ...p,
                      starterCode: {
                        ...p.starterCode,
                        [activeLangTab]: e.target.value
                      }
                    }))}
                    placeholder={`Write starter code skeleton for ${activeLangTab} here...`}
                  />
                </div>
              </div>

              {/* Sample Test Case */}
              <div className="border border-[var(--border)] rounded-xl p-4 space-y-3 bg-[var(--surface)]">
                <span className="text-xs font-black text-[var(--text)]">Sample Test Case</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] mb-0.5 block">Input</label>
                    <textarea
                      className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs font-mono outline-none text-[var(--text)]"
                      value={form.sampleTestCases[0]?.input}
                      onChange={e => setForm(p => {
                        const copy = [...p.sampleTestCases];
                        copy[0] = { ...copy[0], input: e.target.value };
                        return { ...p, sampleTestCases: copy };
                      })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] mb-0.5 block">Output</label>
                    <textarea
                      className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs font-mono outline-none text-[var(--text)]"
                      value={form.sampleTestCases[0]?.output}
                      onChange={e => setForm(p => {
                        const copy = [...p.sampleTestCases];
                        copy[0] = { ...copy[0], output: e.target.value };
                        return { ...p, sampleTestCases: copy };
                      })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] mb-0.5 block">Explanation</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-xs outline-none text-[var(--text)]"
                    value={form.sampleTestCases[0]?.explanation || ''}
                    onChange={e => setForm(p => {
                      const copy = [...p.sampleTestCases];
                      copy[0] = { ...copy[0], explanation: e.target.value };
                      return { ...p, sampleTestCases: copy };
                    })}
                  />
                </div>
              </div>

              {/* Hidden Test Case */}
              <div className="border border-[var(--border)] rounded-xl p-4 space-y-3 bg-[var(--surface)]">
                <span className="text-xs font-black text-[var(--text)]">Hidden Test Case (For grading verification)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] mb-0.5 block">Input</label>
                    <textarea
                      className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs font-mono outline-none text-[var(--text)]"
                      value={form.hiddenTestCases[0]?.input}
                      onChange={e => setForm(p => {
                        const copy = [...p.hiddenTestCases];
                        copy[0] = { ...copy[0], input: e.target.value };
                        return { ...p, hiddenTestCases: copy };
                      })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] mb-0.5 block">Expected Output</label>
                    <textarea
                      className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs font-mono outline-none text-[var(--text)]"
                      value={form.hiddenTestCases[0]?.expectedOutput}
                      onChange={e => setForm(p => {
                        const copy = [...p.hiddenTestCases];
                        copy[0] = { ...copy[0], expectedOutput: e.target.value };
                        return { ...p, hiddenTestCases: copy };
                      })}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 border-t border-[var(--border-light)] pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--text-secondary)] cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2 text-white rounded-xl text-xs font-extrabold cursor-pointer" style={{ backgroundColor: 'var(--orange)', border: 'none' }}>Save Challenge</button>
          </div>
        </form>
      ) : tab === 'manage' ? (
        /* Challenges Manager List Table */
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-5">Challenge Name</th>
                  <th className="py-3 px-5">Difficulty</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5 text-center">Reward (XP)</th>
                  <th className="py-3 px-5 text-center font-semibold">Daily Challenge</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-center w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {challenges.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-[var(--text-muted)]">
                      No challenges found. Click "New Challenge" to create one.
                    </td>
                  </tr>
                ) : (
                  challenges.map((c) => {
                    const diffObj = DIFFICULTY[c.difficulty] || DIFFICULTY.easy;
                    return (
                      <tr key={c.id} className="hover:bg-[var(--surface)]">
                        <td className="py-3.5 px-5 font-bold text-sm text-[var(--text)]">
                          {c.title}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${diffObj.color}15`, color: diffObj.color }}>
                            {diffObj.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-xs text-[var(--text-secondary)]">
                          {c.category}
                        </td>
                        <td className="py-3.5 px-5 text-center text-sm font-semibold text-[var(--text)]">
                          {c.xpReward} XP
                        </td>
                        <td className="py-3.5 px-5 text-center text-xs">
                          {c.isDailyChallenge ? (
                            <span className="text-yellow-500 font-bold">⭐ {c.challengeDate}</span>
                          ) : 'No'}
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                            c.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {c.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex gap-1.5 justify-center">
                            <button
                              onClick={() => handleToggleStatus(c)}
                              className="w-7 h-7 bg-[var(--surface-2)] border border-[var(--border)] rounded-md flex items-center justify-center text-xs text-[var(--text-secondary)] hover:border-[var(--orange)] cursor-pointer"
                              title={c.status === 'published' ? 'Draft' : 'Publish'}
                            >
                              <i className={`fa-solid ${c.status === 'published' ? 'fa-eye-slash' : 'fa-eye'}`} />
                            </button>
                            <button
                              onClick={() => handleEdit(c)}
                              className="w-7 h-7 bg-[var(--surface-2)] border border-[var(--border)] rounded-md flex items-center justify-center text-xs text-[var(--text-secondary)] hover:border-[var(--orange)] cursor-pointer"
                              title="Edit"
                            >
                              <i className="fa-solid fa-pen" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(c)}
                              className="w-7 h-7 bg-[var(--surface-2)] border border-[var(--border)] rounded-md flex items-center justify-center text-xs text-[var(--text-secondary)] hover:border-[var(--orange)] cursor-pointer"
                              title="Duplicate"
                            >
                              <i className="fa-solid fa-copy" />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id, c.title)}
                              className="w-7 h-7 bg-red-50 border border-red-200 rounded-md flex items-center justify-center text-xs text-red-600 hover:bg-red-100 cursor-pointer"
                              title="Delete"
                            >
                              <i className="fa-solid fa-trash animate-pulse" style={{ color: '#ef4444' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Manual Review Panel Tab */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--surface)]">
              <h3 className="text-sm font-bold text-[var(--text)]">Submissions Pending Manual Grading</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-5">Student</th>
                    <th className="py-3 px-5">Task Details</th>
                    <th className="py-3 px-5 text-center">Submitted At</th>
                    <th className="py-3 px-5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {pendingReviews.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-[var(--text-muted)]">
                        No project submissions are currently awaiting manual grading.
                      </td>
                    </tr>
                  ) : (
                    pendingReviews.map((s) => (
                      <tr key={s.id} className="hover:bg-[var(--surface)]">
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-sm text-[var(--text)]">{s.userName}</div>
                          <div className="text-[11px] text-[var(--text-secondary)]">{s.userEmail}</div>
                        </td>
                        <td className="py-3.5 px-5 text-xs text-[var(--text-secondary)]">
                          {s.taskTitle || 'Coding Solution'}
                        </td>
                        <td className="py-3.5 px-5 text-center text-xs text-[var(--text-secondary)]">
                          {new Date(s.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <button
                            onClick={() => {
                              setSelectedSub(s);
                              setReviewForm({
                                status: 'Approved',
                                score: 80,
                                comments: '',
                                strengths: '',
                                improvements: '',
                                suggestions: ''
                              });
                            }}
                            className="px-3 py-1 bg-[var(--orange)] text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Grade
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grading Drawer Form */}
          {selectedSub && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4 h-fit">
              <div className="flex justify-between items-center border-b border-[var(--border-light)] pb-2">
                <h4 className="text-xs font-black text-[var(--text)]">Grade Panel</h4>
                <button onClick={() => setSelectedSub(null)} className="text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer">
                  <i className="fa-solid fa-xmark text-sm" />
                </button>
              </div>

              <div className="text-xs space-y-2 text-[var(--text-secondary)]">
                <p><strong>Student:</strong> {selectedSub.userName}</p>
                <p><strong>Sub Date:</strong> {new Date(selectedSub.submittedAt).toLocaleString()}</p>
                {selectedSub.githubUrl && (
                  <p>
                    <strong>Repo Link:</strong>{' '}
                    <a href={selectedSub.githubUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--orange)] hover:underline">
                      View GitHub <i className="fa-solid fa-arrow-up-right-from-square text-[9px]" />
                    </a>
                  </p>
                )}
                {selectedSub.demoUrl && (
                  <p>
                    <strong>Demo Link:</strong>{' '}
                    <a href={selectedSub.demoUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--orange)] hover:underline">
                      Live View <i className="fa-solid fa-arrow-up-right-from-square text-[9px]" />
                    </a>
                  </p>
                )}
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] mb-1 block">Decision</label>
                  <select className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)] cursor-pointer" value={reviewForm.status} onChange={e => setReviewForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] mb-1 block">Score (0 - 1000)</label>
                  <input type="number" min="0" max="1000" className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)]" value={reviewForm.score} onChange={e => setReviewForm(p => ({ ...p, score: Number(e.target.value) }))} required />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] mb-1 block">Review Comments</label>
                  <textarea className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)]" value={reviewForm.comments} onChange={e => setReviewForm(p => ({ ...p, comments: e.target.value }))} placeholder="Grade summary..." />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] mb-1 block">Strengths</label>
                  <input className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)]" value={reviewForm.strengths} onChange={e => setReviewForm(p => ({ ...p, strengths: e.target.value }))} />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] mb-1 block">Improvements</label>
                  <input className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)]" value={reviewForm.improvements} onChange={e => setReviewForm(p => ({ ...p, improvements: e.target.value }))} />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] mb-1 block">Suggestions</label>
                  <input className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)] text-[var(--text)]" value={reviewForm.suggestions} onChange={e => setReviewForm(p => ({ ...p, suggestions: e.target.value }))} />
                </div>

                <button type="submit" className="w-full py-2 text-white text-xs font-bold rounded-xl cursor-pointer" style={{ backgroundColor: 'var(--orange)', border: 'none' }}>
                  Submit Grade Evaluation
                </button>
              </form>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
