import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import db from '../../db.js';
import { QUIZ_CATEGORIES, QUIZ_DIFFICULTIES } from '../../data/quiz/badges.js';

const EMPTY_QUESTION = () => ({
  id: 'q_' + Date.now(),
  type: 'mcq',
  questionText: '',
  options: [
    { id: 'a', text: '', isCorrect: false },
    { id: 'b', text: '', isCorrect: false },
    { id: 'c', text: '', isCorrect: false },
    { id: 'd', text: '', isCorrect: false },
  ],
  difficulty: 'medium',
  marks: 1,
  negativeMarks: 0,
  timeLimit: 30,
  order: 1,
});

const EMPTY_QUIZ = () => ({
  title: '', description: '', category: 'General', difficulty: 'medium',
  timeLimit: 10, passMarks: 0, totalMarks: 0, maxAttempts: 1,
  shuffleQuestions: false, shuffleOptions: false,
  showResult: true, leaderboardVisibility: true,
  allowReview: true, allowBackNavigation: true,
  autoSubmit: true, negativeMarking: 0,
  scheduledAt: null, archived: false, published: false,
  security: { fullscreenRequired: true, tabSwitchDetection: true, copyPasteBlock: true, rightClickBlock: true, devToolsDetection: true, violationLimit: 3 },
  questions: [EMPTY_QUESTION()],
});

export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_QUIZ());
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const listRef = useRef(null);

  useEffect(() => { loadQuizzes(); }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const data = await db.find('Quiz');
      setQuizzes(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const resetForm = () => {
    setForm(EMPTY_QUIZ());
    setEditingId(null);
    setErrors({});
    setShowErrors(false);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (form.questions.length === 0) errs.questions = 'At least one question is required';
    form.questions.forEach((q, i) => {
      if (!q.questionText.trim()) errs[`q_${i}_text`] = 'Question text is required';
      if (q.type === 'mcq' || q.type === 'multiple-select' || q.type === 'true-false' || q.type === 'image') {
        const emptyOpts = q.options.filter(o => !o.text.trim());
        if (emptyOpts.length > 0) errs[`q_${i}_opts`] = 'All options must have text';
        const filled = q.options.filter(o => o.text.trim());
        if (filled.length < 2) errs[`q_${i}_count`] = 'At least 2 options required';
        if (!q.options.some(o => o.isCorrect)) errs[`q_${i}_correct`] = 'Select a correct answer';
      }
    });
    return errs;
  };

  const clearError = (key) => {
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
  };

  const handleStartEdit = (q) => {
    const cloned = JSON.parse(JSON.stringify(q));
    cloned.questions = (cloned.questions || []).map((oldQ, idx) => {
      if (oldQ.questionText) return { ...oldQ, order: idx + 1 };
      return {
        id: oldQ.id || `q_${Date.now()}_${idx}`,
        type: 'mcq',
        questionText: oldQ.question || '',
        options: (oldQ.options || []).map((opt, oi) => ({
          id: String.fromCharCode(97 + oi),
          text: typeof opt === 'string' ? opt : opt.text || '',
          isCorrect: oldQ.answerIndex === oi,
        })),
        correctAnswer: oldQ.correctAnswer || '',
        difficulty: oldQ.difficulty || 'medium',
        marks: oldQ.marks || 1,
        negativeMarks: oldQ.negativeMarks || 0,
        timeLimit: oldQ.timeLimit || 30,
        order: idx + 1,
      };
    });
    // Ensure old quizzes have new schema fields
    if (!cloned.category) cloned.category = 'General';
    if (!cloned.difficulty) cloned.difficulty = 'medium';
    if (!cloned.passMarks) cloned.passMarks = 0;
    if (!cloned.totalMarks) cloned.totalMarks = cloned.questions.reduce((s, qq) => s + (qq.marks || 1), 0);
    if (!cloned.maxAttempts) cloned.maxAttempts = 1;
    if (cloned.shuffleQuestions === undefined) cloned.shuffleQuestions = false;
    if (cloned.shuffleOptions === undefined) cloned.shuffleOptions = false;
    if (cloned.showResult === undefined) cloned.showResult = true;
    if (!cloned.security) cloned.security = { fullscreenRequired: true, tabSwitchDetection: true, copyPasteBlock: true, rightClickBlock: true, devToolsDetection: true, violationLimit: 3 };
    setForm(cloned);
    setEditingId(q.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    const errs = validate();
    setErrors(errs);
    setShowErrors(true);
    if (Object.keys(errs).length > 0) {
      window.showToast('Validation Error', 'Please fix the highlighted fields.', 'error');
      const firstErr = document.querySelector('.field-error');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSaving(true);
    try {
      const payload = JSON.parse(JSON.stringify(form));
      payload.questions = payload.questions.map((q, i) => ({ ...q, order: i + 1, timeLimit: Math.max(5, q.timeLimit || 30) }));
      payload.totalMarks = payload.questions.reduce((s, q) => s + (q.marks || 1), 0);
      payload.timeLimit = Math.max(1, payload.timeLimit || 1);

      if (editingId) {
        await db.update('Quiz', editingId, payload);
        window.showToast('Success', 'Quiz updated.', 'success');
      } else {
        await db.insert('Quiz', payload);
        window.showToast('Success', 'Quiz created.', 'success');
      }
      resetForm();
      await loadQuizzes();
    } catch (e) {
      window.showToast('Error', 'Failed to save quiz.', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz permanently?')) return;
    try {
      await db.delete('Quiz', id);
      if (editingId === id) resetForm();
      await loadQuizzes();
      window.showToast('Success', 'Quiz deleted.', 'success');
    } catch (e) {
      window.showToast('Error', 'Failed to delete.', 'error');
    }
  };

  const togglePublish = async (q) => {
    try {
      await db.update('Quiz', q.id, { published: !q.published });
      await loadQuizzes();
    } catch (e) {
      window.showToast('Error', 'Failed to toggle publish.', 'error');
    }
  };

  const addQuestion = () => {
    setForm(prev => ({ ...prev, questions: [...prev.questions, EMPTY_QUESTION()] }));
    setTimeout(() => {
      const container = document.querySelector('.quiz-questions-container');
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);
  };

  const removeQuestion = (idx) => {
    if (form.questions.length <= 1) { window.showToast('Info', 'Quiz must have at least one question.', 'info'); return; }
    setForm(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== idx) }));
  };

  const updateQuestion = (idx, field, value) => {
    setForm(prev => {
      const qs = [...prev.questions];
      qs[idx] = { ...qs[idx], [field]: value };
      return { ...prev, questions: qs };
    });
  };

  const updateOption = (qIdx, oId, field, value) => {
    setForm(prev => {
      const qs = [...prev.questions];
      const opts = qs[qIdx].options.map(o => o.id === oId ? { ...o, [field]: value } : o);
      qs[qIdx] = { ...qs[qIdx], options: opts };
      return { ...prev, questions: qs };
    });
  };

  const duplicateQuiz = async (q) => {
    try {
      const copy = JSON.parse(JSON.stringify(q));
      delete copy.id;
      copy.title = copy.title + ' (Copy)';
      copy.published = false;
      await db.insert('Quiz', copy);
      await loadQuizzes();
      window.showToast('Success', 'Quiz duplicated.', 'success');
    } catch {
      window.showToast('Error', 'Failed to duplicate.', 'error');
    }
  };

  if (loading) {
    return <div className="loading-dots"><span></span><span></span><span></span></div>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="page-tag"><i className="fas fa-question-circle"></i> Management</span>
          <h1 className="page-title">Quiz Management</h1>
        </div>
        {editingId && (
          <button className="btn btn-secondary btn-sm" onClick={resetForm}>
            <i className="fas fa-plus"></i> New Quiz
          </button>
        )}
      </div>

      <div className="admin-two-col">
        <div className="admin-form-panel">
          <div className="card">
            <div className="card-header">
              <i className="fas fa-pen"></i> {editingId ? 'Edit Quiz' : 'Create Quiz'}
            </div>
            <div className="card-body">
              {showErrors && Object.keys(errors).length > 0 && (
                <div className="form-error-banner">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>Please fix the highlighted errors before saving.</span>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className={`form-input ${errors.title && showErrors ? 'input-error' : ''}`} value={form.title} onChange={e => { setForm(prev => ({ ...prev, title: e.target.value })); clearError('title'); }} placeholder="Quiz title" />
                {errors.title && showErrors && <span className="field-error"><i className="fas fa-exclamation-circle"></i> {errors.title}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Quiz description" rows={3} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}>
                    {QUIZ_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select className="form-select" value={form.difficulty} onChange={e => setForm(prev => ({ ...prev, difficulty: e.target.value }))}>
                    {QUIZ_DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Time Limit (min)</label>
                  <input className="form-input" type="number" min={1} value={form.timeLimit} onChange={e => setForm(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 1 }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pass Marks</label>
                  <input className="form-input" type="number" min={0} value={form.passMarks} onChange={e => setForm(prev => ({ ...prev, passMarks: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Attempts</label>
                  <input className="form-input" type="number" min={0} value={form.maxAttempts} onChange={e => setForm(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.shuffleQuestions} onChange={e => setForm(prev => ({ ...prev, shuffleQuestions: e.target.checked }))} />
                  Shuffle Questions
                </label>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.shuffleOptions} onChange={e => setForm(prev => ({ ...prev, shuffleOptions: e.target.checked }))} />
                  Shuffle Options
                </label>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.showResult} onChange={e => setForm(prev => ({ ...prev, showResult: e.target.checked }))} />
                  Show Result
                </label>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.leaderboardVisibility} onChange={e => setForm(prev => ({ ...prev, leaderboardVisibility: e.target.checked }))} />
                  Leaderboard
                </label>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.published} onChange={e => setForm(prev => ({ ...prev, published: e.target.checked }))} />
                  Published
                </label>
              </div>

              <h3 style={{ margin: '1.5rem 0 1rem', fontSize: '1rem' }}>
                <i className="fas fa-list"></i> Questions ({form.questions.length})
              </h3>
              <div className="quiz-questions-container">
                {form.questions.map((q, qi) => (
                  <div key={q.id} className="question-editor-card">
                    <div className="question-editor-header">
                      <span>Question {qi + 1}</span>
                      <button className="btn btn-sm btn-outline" style={{ color: 'var(--badge-red, #ef4444)' }} onClick={() => removeQuestion(qi)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    <div className="form-group">
                      <input className={`form-input ${errors[`q_${qi}_text`] && showErrors ? 'input-error' : ''}`} value={q.questionText} onChange={e => { updateQuestion(qi, 'questionText', e.target.value); clearError(`q_${qi}_text`); }} placeholder="Enter question text..." />
                      {errors[`q_${qi}_text`] && showErrors && <span className="field-error"><i className="fas fa-exclamation-circle"></i> {errors[`q_${qi}_text`]}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <select className="form-select" style={{ width: 'auto' }} value={q.type} onChange={e => updateQuestion(qi, 'type', e.target.value)}>
                        <option value="mcq">Multiple Choice</option>
                        <option value="multiple-select">Multiple Select</option>
                        <option value="true-false">True / False</option>
                        <option value="short-answer">Short Answer</option>
                        <option value="fill-blank">Fill in the Blank</option>
                        <option value="image">Image Based</option>
                      </select>
                      <select className="form-select" style={{ width: 'auto' }} value={q.difficulty} onChange={e => updateQuestion(qi, 'difficulty', e.target.value)}>
                        {QUIZ_DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <input className="form-input" type="number" min={1} style={{ width: 80 }} value={q.marks} onChange={e => updateQuestion(qi, 'marks', parseInt(e.target.value) || 1)} placeholder="Marks" />
                      <input className="form-input" type="number" min={5} style={{ width: 100 }} value={q.timeLimit} onChange={e => updateQuestion(qi, 'timeLimit', parseInt(e.target.value) || 30)} placeholder="Time (s)" />
                    </div>
                    {(q.type === 'mcq' || q.type === 'multiple-select' || q.type === 'image') && (
                      <div>
                        <div className="options-grid">
                          {q.options.map(opt => (
                            <div key={opt.id} className="option-row">
                              <span className="option-letter-sm">{opt.id.toUpperCase()}</span>
                              <input className={`form-input ${showErrors && opt.text.trim() === '' && errors[`q_${qi}_opts`] ? 'input-error' : ''}`} value={opt.text} onChange={e => { updateOption(qi, opt.id, 'text', e.target.value); clearError(`q_${qi}_opts`); clearError(`q_${qi}_count`); clearError(`q_${qi}_correct`); }} placeholder={`Option ${opt.id.toUpperCase()}`} />
                              <label className="correct-toggle" title="Mark as correct answer">
                                <input type="radio" name={`correct_${q.id}`} checked={opt.isCorrect} onChange={() => {
                                  const newOpts = q.options.map(o => ({ ...o, isCorrect: o.id === opt.id }));
                                  setForm(prev => {
                                    const qs = [...prev.questions];
                                    qs[qi] = { ...qs[qi], options: newOpts };
                                    return { ...prev, questions: qs };
                                  });
                                  clearError(`q_${qi}_correct`);
                                }} />
                                <i className={`fas ${opt.isCorrect ? 'fa-check-circle' : 'fa-circle'}`} style={{ color: opt.isCorrect ? 'var(--badge-green, #22c55e)' : 'var(--text-muted)' }}></i>
                              </label>
                            </div>
                          ))}
                        </div>
                        {showErrors && (errors[`q_${qi}_opts`] || errors[`q_${qi}_count`] || errors[`q_${qi}_correct`]) && (
                          <div style={{ marginTop: '0.4rem' }}>
                            {errors[`q_${qi}_opts`] && <span className="field-error"><i className="fas fa-exclamation-circle"></i> {errors[`q_${qi}_opts`]}</span>}
                            {errors[`q_${qi}_count`] && <span className="field-error"><i className="fas fa-exclamation-circle"></i> {errors[`q_${qi}_count`]}</span>}
                            {errors[`q_${qi}_correct`] && <span className="field-error"><i className="fas fa-exclamation-circle"></i> {errors[`q_${qi}_correct`]}</span>}
                          </div>
                        )}
                      </div>
                    )}
                    {q.type === 'true-false' && (
                      <div className="options-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        {[{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }].map(opt => (
                          <div key={opt.id} className="option-row">
                            <span className="option-letter-sm">{opt.id.toUpperCase()}</span>
                            <input className="form-input" value={opt.text} readOnly />
                            <label className="correct-toggle">
                              <input type="radio" name={`correct_${q.id}`} checked={q.options.some(o => o.id === opt.id && o.isCorrect)} onChange={() => {
                                setForm(prev => {
                                  const qs = [...prev.questions];
                                  qs[qi] = { ...qs[qi], options: [{ id: 'true', text: 'True', isCorrect: opt.id === 'true' }, { id: 'false', text: 'False', isCorrect: opt.id === 'false' }] };
                                  return { ...prev, questions: qs };
                                });
                              }} />
                              <i className={`fas ${q.options.some(o => o.id === opt.id && o.isCorrect) ? 'fa-check-circle' : 'fa-circle'}`} style={{ color: q.options.some(o => o.id === opt.id && o.isCorrect) ? 'var(--badge-green, #22c55e)' : 'var(--text-muted)' }}></i>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    {q.type === 'short-answer' && (
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Correct Answer</label>
                        <input className="form-input" value={q.correctAnswer || ''} onChange={e => updateQuestion(qi, 'correctAnswer', e.target.value)} placeholder="Expected answer text" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary btn-sm" onClick={addQuestion} style={{ marginTop: '0.5rem' }}>
                <i className="fas fa-plus"></i> Add Question
              </button>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : <><i className="fas fa-save"></i> {editingId ? 'Update Quiz' : 'Save Quiz'}</>}
                </button>
                {editingId && (
                  <button className="btn btn-secondary" onClick={resetForm}>
                    <i className="fas fa-times"></i> Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-list-panel" ref={listRef}>
          <h3 style={{ marginBottom: '1rem' }}>All Quizzes ({quizzes.length})</h3>
          {quizzes.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon"><i className="fas fa-question-circle"></i></div><h3>No Quizzes</h3><p>Create your first quiz.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {quizzes.map(q => (
                <div key={q.id} className={`card quiz-list-item ${editingId === q.id ? 'editing' : ''}`} style={{ cursor: 'pointer' }} onClick={() => handleStartEdit(q)}>
                  <div className="card-body" style={{ padding: '1rem 1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong>{q.title}</strong>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                          <span className={`badge ${q.published ? 'badge-green' : 'badge-muted'}`}>{q.published ? 'Published' : 'Draft'}</span>
                          <span className="badge badge-orange">{q.questions?.length || 0} questions</span>
                          <span className="badge badge-muted">{q.timeLimit} min</span>
                          {q.difficulty && <span className={`badge ${q.difficulty === 'hard' ? 'badge-red' : q.difficulty === 'medium' ? 'badge-orange' : 'badge-green'}`}>{q.difficulty}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.3rem' }} onClick={e => e.stopPropagation()}>
                        <button className="btn btn-sm btn-outline" onClick={() => togglePublish(q)} title={q.published ? 'Unpublish' : 'Publish'}>
                          <i className={`fas fa-${q.published ? 'eye-slash' : 'eye'}`}></i>
                        </button>
                        <button className="btn btn-sm btn-outline" onClick={() => duplicateQuiz(q)} title="Duplicate">
                          <i className="fas fa-copy"></i>
                        </button>
                        <button className="btn btn-sm btn-outline" style={{ color: '#ef4444' }} onClick={() => handleDelete(q.id)} title="Delete">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
