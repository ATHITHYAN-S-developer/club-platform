import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../../db';
import { validateQuiz } from '../../utils/validators';
import { QUIZ_CATEGORIES, QUIZ_DIFFICULTIES, QUESTION_TYPES } from '../../utils/constants';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';

const EMPTY_QUESTION = () => ({
  id: 'q_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
  type: 'mcq',
  questionText: '',
  options: [
    { id: 'a', text: '', isCorrect: false },
    { id: 'b', text: '', isCorrect: false },
    { id: 'c', text: '', isCorrect: false },
    { id: 'd', text: '', isCorrect: false },
  ],
  code: '',
  imageUrl: '',
  correctAnswer: '',
  explanation: '',
  difficulty: 'medium',
  marks: 1,
  negativeMarks: 0,
  timeLimit: 30,
  order: 1,
});

const EMPTY_QUIZ = () => ({
  title: '', description: '', instructions: '', category: 'General', difficulty: 'medium',
  passPercentage: 0, totalMarks: 0, negativeMarking: 0,
  startTime: '', endTime: '', timeLimit: 10, maxAttempts: 1,
  fullscreenRequired: true, shuffleQuestions: false, shuffleOptions: false,
  showResultImmediately: true, enableLeaderboard: true, enableReview: true,
  archived: false, published: false,
  security: { fullscreenRequired: true, tabSwitchDetection: true, copyPasteBlock: true, rightClickBlock: true, devToolsDetection: true, violationLimit: 2 },
  questions: [EMPTY_QUESTION()],
});

function SectionHeader({ icon, title, count, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.7rem 1rem', background: 'var(--surface)', borderRadius: '10px 10px 0 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'rgba(255,85,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className={`fas ${icon}`} style={{ color: 'var(--orange)', fontSize: '0.78rem' }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' }}>{title}</span>
        {count !== undefined && (
          <span style={{
            background: 'var(--orange)', color: '#fff', fontSize: '0.68rem', fontWeight: 800,
            padding: '0.1rem 0.45rem', borderRadius: 10, lineHeight: '1.4',
          }}>{count}</span>
        )}
      </div>
      {action}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
      padding: '0.35rem 0', userSelect: 'none',
    }}>
      <div style={{
        width: 36, height: 20, borderRadius: 12, position: 'relative',
        background: checked ? 'var(--orange)' : 'var(--border)',
        transition: 'background 0.2s', flexShrink: 0,
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 2, left: checked ? 18 : 2,
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }} />
        <input type="checkbox" checked={checked} onChange={onChange}
          style={{ display: 'none' }} />
      </div>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
    </label>
  );
}

function FormField({ label, required, error, showError, children }) {
  return (
    <div className="form-group" style={{ marginBottom: '0.65rem' }}>
      {label && (
        <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {label}
          {required && <span style={{ color: '#ef4444', fontSize: '0.7rem' }}>*</span>}
        </label>
      )}
      {children}
      {error && showError && (
        <span className="field-error" style={{ fontSize: '0.72rem', marginTop: '0.15rem' }}>
          <i className="fas fa-exclamation-circle" /> {error}
        </span>
      )}
    </div>
  );
}

const QuestionEditor = memo(({ question, index, onChange, onRemove, errors, showErrors }) => {
  const q = question;

  const update = useCallback((field, value) => {
    onChange(index, field, value);
  }, [index, onChange]);

  const updateOption = useCallback((optId, field, value) => {
    const newOpts = q.options.map(o => o.id === optId ? { ...o, [field]: value } : o);
    if (field === 'isCorrect' && value === true && q.type !== 'multiple-select') {
      newOpts.forEach(o => { if (o.id !== optId) o.isCorrect = false; });
    }
    update('options', newOpts);
  }, [q.options, q.type, update]);

  const addOption = useCallback(() => {
    const newId = String.fromCharCode(97 + (q.options?.length || 0));
    update('options', [...(q.options || []), { id: newId, text: '', isCorrect: false }]);
  }, [q.options, update]);

  const removeOption = useCallback((optId) => {
    if ((q.options?.length || 0) <= 2) return;
    update('options', q.options.filter(o => o.id !== optId));
  }, [q.options, update]);

  const typeColors = { mcq: '#3b82f6', 'multiple-select': '#8b5cf6', 'true-false': '#22c55e', 'short-answer': '#f97316', 'fill-blank': '#06b6d4', image: '#ec4899', code: '#6366f1' };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden', marginBottom: '0.65rem',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.55rem 0.85rem',
        background: 'var(--surface)', borderBottom: '1px solid var(--border-light)',
      }}>
        <span style={{
          width: 24, height: 24, borderRadius: 6,
          background: 'rgba(255,85,0,0.1)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '0.72rem', color: 'var(--orange)',
          flexShrink: 0,
        }}>{index + 1}</span>
        <select className="form-select" style={{
          width: 'auto', fontSize: '0.72rem', padding: '0.2rem 0.45rem',
          borderRadius: 6, fontWeight: 600,
          color: typeColors[q.type] || 'var(--text)',
          border: `1px solid ${typeColors[q.type] || 'var(--border)'}`,
        }}
          value={q.type} onChange={e => update('type', e.target.value)}>
          {QUESTION_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        {q.questionText && (
          <span style={{ flex: 1, fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
            {q.questionText}
          </span>
        )}
        <button onClick={() => onRemove(index)} style={{
          background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: 6,
          width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#dc2626', fontSize: '0.7rem', cursor: 'pointer', flexShrink: 0,
        }}>
          <i className="fas fa-trash" />
        </button>
      </div>

      <div style={{ padding: '0.75rem' }}>
        <input className={`form-input ${errors[`q_${index}_text`] && showErrors ? 'input-error' : ''}`}
          value={q.questionText} onChange={e => update('questionText', e.target.value)}
          placeholder="Enter question text..." style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }} />
        {errors[`q_${index}_text`] && showErrors && (
          <span className="field-error" style={{ fontSize: '0.72rem', display: 'block', marginBottom: '0.35rem' }}>
            <i className="fas fa-exclamation-circle" /> {errors[`q_${index}_text`]}
          </span>
        )}

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
          <select className="form-select" style={{ width: 'auto', fontSize: '0.72rem', padding: '0.3rem 0.5rem' }}
            value={q.difficulty} onChange={e => update('difficulty', e.target.value)}>
            {QUIZ_DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--surface-2)', borderRadius: 6, padding: '0.2rem 0.5rem' }}>
            <i className="fas fa-star" style={{ color: '#eab308', fontSize: '0.65rem' }} />
            <input className="form-input" type="number" min={0} style={{ width: 45, fontSize: '0.72rem', padding: '0.15rem', border: 'none', background: 'none' }}
              value={q.marks} onChange={e => update('marks', parseInt(e.target.value) || 1)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(239,68,68,0.06)', borderRadius: 6, padding: '0.2rem 0.5rem' }}>
            <i className="fas fa-minus-circle" style={{ color: '#ef4444', fontSize: '0.65rem' }} />
            <input className="form-input" type="number" min={0} style={{ width: 45, fontSize: '0.72rem', padding: '0.15rem', border: 'none', background: 'none' }}
              value={q.negativeMarks} onChange={e => update('negativeMarks', parseFloat(e.target.value) || 0)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(59,130,246,0.06)', borderRadius: 6, padding: '0.2rem 0.5rem' }}>
            <i className="fas fa-clock" style={{ color: '#3b82f6', fontSize: '0.65rem' }} />
            <input className="form-input" type="number" min={5} style={{ width: 45, fontSize: '0.72rem', padding: '0.15rem', border: 'none', background: 'none' }}
              value={q.timeLimit} onChange={e => update('timeLimit', parseInt(e.target.value) || 30)} />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>s</span>
          </div>
        </div>

        {q.type === 'image' && (
          <input className="form-input" value={q.imageUrl || ''} onChange={e => update('imageUrl', e.target.value)}
            placeholder="Image URL" style={{ fontSize: '0.78rem', marginBottom: '0.5rem' }} />
        )}

        {q.type === 'code' && (
          <textarea className="form-textarea" value={q.code || ''} onChange={e => update('code', e.target.value)}
            placeholder="Paste code snippet here..." rows={3}
            style={{ fontFamily: "'Courier New', monospace", fontSize: '0.75rem', marginBottom: '0.5rem' }} />
        )}

        {['mcq', 'multiple-select', 'true-false', 'image', 'code'].includes(q.type) && (
          <div style={{ marginBottom: '0.35rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Options {q.type === 'multiple-select' ? '(select all that apply)' : ''}
            </div>
            {(q.options || []).map((opt, oi) => (
              <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.7rem', color: opt.isCorrect ? '#22c55e' : 'var(--text-muted)', width: 16, textAlign: 'center', flexShrink: 0 }}>
                  {opt.id.toUpperCase()}
                </span>
                <input className="form-input" style={{ fontSize: '0.78rem', flex: 1 }}
                  value={opt.text} onChange={e => updateOption(opt.id, 'text', e.target.value)}
                  placeholder={`Option ${opt.id.toUpperCase()}`} />
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: opt.isCorrect ? '#22c55e' : 'var(--text-muted)', flexShrink: 0 }}>
                  <input type={q.type === 'multiple-select' ? 'checkbox' : 'radio'}
                    name={`correct_${q.id}`} checked={opt.isCorrect}
                    onChange={() => updateOption(opt.id, 'isCorrect', !opt.isCorrect)}
                    style={{ display: 'none' }} />
                  <i className={`fas ${opt.isCorrect ? 'fa-check-circle' : 'fa-circle'}`} style={{ fontSize: '1rem' }} />
                </label>
                {q.options.length > 2 && (
                  <button onClick={() => removeOption(opt.id)} style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '0.7rem', padding: '2px', flexShrink: 0,
                  }}>
                    <i className="fas fa-times" />
                  </button>
                )}
              </div>
            ))}
            {['mcq', 'image', 'code', 'multiple-select'].includes(q.type) && (
              <button onClick={addOption} style={{
                background: 'none', border: '1px dashed var(--border)', borderRadius: 6,
                padding: '0.2rem 0.6rem', fontSize: '0.7rem', color: 'var(--text-muted)',
                cursor: 'pointer', marginTop: '0.15rem',
              }}>
                <i className="fas fa-plus" /> Add Option
              </button>
            )}
          </div>
        )}

        {q.type === 'true-false' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem' }}>
            {['true', 'false'].map(val => {
              const isSelected = q.options?.some(o => o.id === val && o.isCorrect);
              return (
                <label key={val} style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  cursor: 'pointer', padding: '0.35rem 0.7rem',
                  background: isSelected ? '#dcfce7' : 'var(--surface-2)',
                  border: `1px solid ${isSelected ? '#22c55e' : 'var(--border)'}`,
                  borderRadius: 8, fontWeight: 600, fontSize: '0.78rem',
                }}>
                  <input type="radio" name={`tf_${q.id}`} checked={isSelected}
                    onChange={() => update('options', [
                      { id: 'true', text: 'True', isCorrect: val === 'true' },
                      { id: 'false', text: 'False', isCorrect: val === 'false' },
                    ])} style={{ display: 'none' }} />
                  <i className={`fas ${isSelected ? 'fa-check-circle' : 'fa-circle'}`}
                    style={{ color: isSelected ? '#22c55e' : 'var(--text-muted)', fontSize: '0.85rem' }} />
                  {val === 'true' ? 'True' : 'False'}
                </label>
              );
            })}
          </div>
        )}

        {q.type === 'short-answer' && (
          <input className="form-input" value={q.correctAnswer || ''}
            onChange={e => update('correctAnswer', e.target.value)}
            placeholder="Expected correct answer" style={{ fontSize: '0.78rem', marginBottom: '0.35rem' }} />
        )}

        <input className="form-input" value={q.explanation || ''}
          onChange={e => update('explanation', e.target.value)}
          placeholder="Explanation (shown after quiz)" style={{ fontSize: '0.75rem' }} />
      </div>
    </motion.div>
  );
});

export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_QUIZ());
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [previewQuiz, setPreviewQuiz] = useState(null);
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkData, setBulkData] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

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

  const handleStartEdit = (q) => {
    const cloned = JSON.parse(JSON.stringify(q));
    cloned.questions = (cloned.questions || []).map((oldQ, idx) => ({
      ...EMPTY_QUESTION(),
      ...oldQ,
      order: idx + 1,
    }));
    if (!cloned.category) cloned.category = 'General';
    if (!cloned.difficulty) cloned.difficulty = 'medium';
    if (!cloned.security) cloned.security = { ...EMPTY_QUIZ().security };
    setForm(cloned);
    setEditingId(q.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    const errs = validateQuiz(form);
    setErrors(errs);
    setShowErrors(true);
    if (Object.keys(errs).length > 0) {
      window.showToast('Validation Error', 'Please fix the highlighted fields.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = JSON.parse(JSON.stringify(form));
      payload.questions = payload.questions.map((q, i) => ({
        ...q, order: i + 1, timeLimit: Math.max(5, q.timeLimit || 30),
      }));
      payload.totalMarks = payload.questions.reduce((s, q) => s + (q.marks || 1), 0);
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
    } catch {
      window.showToast('Error', 'Failed to toggle publish.', 'error');
    }
  };

  const toggleArchive = async (q) => {
    try {
      await db.update('Quiz', q.id, { archived: !q.archived });
      await loadQuizzes();
    } catch {
      window.showToast('Error', 'Failed to toggle archive.', 'error');
    }
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

  const addQuestion = () => {
    setForm(prev => ({ ...prev, questions: [...prev.questions, EMPTY_QUESTION()] }));
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

  const handleBulkImport = () => {
    try {
      const lines = bulkData.trim().split('\n');
      if (lines.length < 2) { window.showToast('Error', 'CSV must have header + at least one question.', 'error'); return; }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const questions = lines.slice(1).filter(l => l.trim()).map((line, idx) => {
        const vals = line.split(',').map(v => v.trim());
        const q = { ...EMPTY_QUESTION(), id: 'q_bulk_' + Date.now() + '_' + idx };
        headers.forEach((h, i) => {
          if (h === 'question' || h === 'questiontext') q.questionText = vals[i] || '';
          if (h === 'type') q.type = vals[i] || 'mcq';
          if (h === 'difficulty') q.difficulty = vals[i] || 'medium';
          if (h === 'marks') q.marks = parseInt(vals[i]) || 1;
          if (h === 'negativemarks' || h === 'negative_marks') q.negativeMarks = parseFloat(vals[i]) || 0;
          if (h === 'timer' || h === 'timelimit') q.timeLimit = parseInt(vals[i]) || 30;
          if (h === 'explanation') q.explanation = vals[i] || '';
          if (h === 'optiona') q.options[0].text = vals[i] || '';
          if (h === 'optionb') q.options[1].text = vals[i] || '';
          if (h === 'optionc') q.options[2].text = vals[i] || '';
          if (h === 'optiond') q.options[3].text = vals[i] || '';
          if (h === 'correctanswer' || h === 'answer') {
            const ans = vals[i]?.toLowerCase() || '';
            q.options.forEach(o => { o.isCorrect = o.id === ans; });
          }
        });
        return q;
      });
      setForm(prev => ({ ...prev, questions: [...prev.questions, ...questions] }));
      setBulkModal(false);
      setBulkData('');
      window.showToast('Success', `${questions.length} questions imported.`, 'success');
    } catch {
      window.showToast('Error', 'Failed to parse CSV. Check format.', 'error');
    }
  };

  const filteredQuizzes = quizzes.filter(q => {
    const matchesSearch = !search || q.title?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'published' && q.published && !q.archived) ||
      (filter === 'draft' && !q.published && !q.archived) ||
      (filter === 'archived' && q.archived);
    return matchesSearch && matchesFilter;
  });

  if (loading) return <Loading />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <span className="page-tag"><i className="fas fa-question-circle" /> Management</span>
          <h1 className="page-title">Quiz Management</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" size="sm" icon="fa-upload" onClick={() => setBulkModal(true)}>Bulk Import</Button>
          {editingId && <Button variant="ghost" size="sm" onClick={resetForm} icon="fa-plus">New Quiz</Button>}
        </div>
      </div>

      <div className="admin-two-col" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.25rem', alignItems: 'flex-start' }}>

        {/* ─── FORM PANEL ─── */}
        <div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-header" style={{
              padding: '0.85rem 1rem',
              background: 'linear-gradient(135deg, rgba(255,85,0,0.06), rgba(255,85,0,0.02))',
              borderBottom: '1px solid var(--border)',
              fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,85,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fas ${editingId ? 'fa-pen' : 'fa-plus-circle'}`} style={{ color: 'var(--orange)', fontSize: '0.8rem' }} />
              </div>
              {editingId ? 'Edit Quiz' : 'Create Quiz'}
            </div>
            <div className="card-body" style={{ padding: '1rem' }}>
              {showErrors && Object.keys(errors).length > 0 && (
                <div className="form-error-banner" style={{ marginBottom: '0.75rem' }}>
                  <i className="fas fa-exclamation-triangle" /> Please fix the highlighted errors.
                </div>
              )}

              {/* ═══ Basic Settings ═══ */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 10, marginBottom: '0.75rem', overflow: 'hidden' }}>
                <SectionHeader icon="fa-gear" title="Basic Settings" />
                <div style={{ padding: '0.75rem' }}>
                  <FormField label="Quiz Title" required error={errors.title} showError={showErrors}>
                    <input className={`form-input ${errors.title ? 'input-error' : ''}`}
                      value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="Enter quiz title" style={{ fontSize: '0.85rem' }} />
                  </FormField>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    <FormField label="Description">
                      <textarea className="form-textarea" rows={3} value={form.description}
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Quiz description" style={{ fontSize: '0.82rem' }} />
                    </FormField>
                    <FormField label="Instructions">
                      <textarea className="form-textarea" rows={3} value={form.instructions}
                        onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))}
                        placeholder="Instructions for students" style={{ fontSize: '0.82rem' }} />
                    </FormField>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem' }}>
                    <FormField label="Category">
                      <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                        {QUIZ_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </FormField>
                    <FormField label="Difficulty">
                      <select className="form-select" value={form.difficulty} onChange={e => setForm(p => ({ ...p, difficulty: e.target.value }))}>
                        {QUIZ_DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                      </select>
                    </FormField>
                    <FormField label="Pass Percentage">
                      <input className="form-input" type="number" min={0} max={100}
                        value={form.passPercentage} onChange={e => setForm(p => ({ ...p, passPercentage: parseInt(e.target.value) || 0 }))} />
                    </FormField>
                  </div>
                </div>
              </div>

              {/* ═══ Timing & Access ═══ */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 10, marginBottom: '0.75rem', overflow: 'hidden' }}>
                <SectionHeader icon="fa-clock" title="Timing & Access" />
                <div style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.65rem' }}>
                    <FormField label="Duration (min)">
                      <input className="form-input" type="number" min={1}
                        value={form.timeLimit} onChange={e => setForm(p => ({ ...p, timeLimit: parseInt(e.target.value) || 1 }))} />
                    </FormField>
                    <FormField label="Max Attempts">
                      <input className="form-input" type="number" min={0}
                        value={form.maxAttempts} onChange={e => setForm(p => ({ ...p, maxAttempts: parseInt(e.target.value) || 0 }))} />
                    </FormField>
                    <FormField label="Start Time">
                      <input className="form-input" type="datetime-local"
                        value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
                    </FormField>
                    <FormField label="End Time">
                      <input className="form-input" type="datetime-local"
                        value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} />
                    </FormField>
                  </div>
                </div>
              </div>

              {/* ═══ Features ═══ */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 10, marginBottom: '0.75rem', overflow: 'hidden' }}>
                <SectionHeader icon="fa-toggle-on" title="Features" />
                <div style={{ padding: '0.65rem 0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.1rem' }}>
                  {[
                    { key: 'shuffleQuestions', label: 'Shuffle Questions' },
                    { key: 'shuffleOptions', label: 'Shuffle Options' },
                    { key: 'showResultImmediately', label: 'Show Result' },
                    { key: 'enableLeaderboard', label: 'Leaderboard' },
                    { key: 'enableReview', label: 'Review Answers' },
                    { key: 'fullscreenRequired', label: 'Fullscreen' },
                    { key: 'published', label: 'Published' },
                  ].map(t => (
                    <Toggle key={t.key}
                      checked={form[t.key]}
                      onChange={e => setForm(p => ({ ...p, [t.key]: e.target.checked }))}
                      label={t.label} />
                  ))}
                </div>
              </div>

              {/* ═══ Questions ═══ */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <SectionHeader icon="fa-list" title="Questions" count={form.questions.length}
                  action={<Button variant="outline" size="sm" icon="fa-plus" onClick={addQuestion} style={{ fontSize: '0.72rem' }}>Add</Button>} />
                <div style={{ padding: '0.65rem' }}>
                  {errors.questions && showErrors && (
                    <span className="field-error" style={{ fontSize: '0.72rem', marginBottom: '0.4rem', display: 'block' }}>
                      <i className="fas fa-exclamation-circle" /> {errors.questions}
                    </span>
                  )}
                  <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                    <AnimatePresence>
                      {form.questions.map((q, i) => (
                        <QuestionEditor
                          key={q.id}
                          question={q}
                          index={i}
                          onChange={updateQuestion}
                          onRemove={removeQuestion}
                          errors={errors}
                          showErrors={showErrors}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* ═══ Save / Cancel ═══ */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <Button onClick={handleSave} loading={saving} icon="fa-save" style={{ flex: 1, justifyContent: 'center' }}>
                  {editingId ? 'Update Quiz' : 'Save Quiz'}
                </Button>
                {editingId && <Button variant="secondary" onClick={resetForm} icon="fa-times" style={{ justifyContent: 'center' }}>Cancel</Button>}
              </div>
            </div>
          </div>
        </div>

        {/* ─── QUIZ LIST PANEL ─── */}
        <div>
          <div style={{
            marginBottom: '0.75rem', display: 'flex', gap: '0.5rem',
            alignItems: 'center', flexWrap: 'wrap',
          }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '0.35rem 0.7rem', minWidth: 160,
            }}>
              <i className="fas fa-search" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search quizzes..."
                style={{ border: 'none', background: 'none', fontSize: '0.82rem', color: 'var(--text)', width: '100%', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {['all', 'published', 'draft', 'archived'].map(f => (
                <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem', borderRadius: 8 }}
                  onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            background: 'var(--surface)', borderRadius: 10,
            padding: '0.5rem 0.75rem', marginBottom: '0.75rem',
            fontSize: '0.75rem', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '0.35rem',
          }}>
            <i className="fas fa-database" style={{ fontSize: '0.7rem' }} />
            {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'zes' : ''}
            {filter !== 'all' && ` (${filter})`}
          </div>

          {filteredQuizzes.length === 0 ? (
            <EmptyState icon="fa-question-circle" title="No Quizzes"
              message={search ? 'No quizzes match your search.' : 'Create your first quiz to get started.'} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredQuizzes.map(q => {
                const totalQ = q.questions?.length || 0;
                const isEditing = editingId === q.id;
                const statusColor = q.archived ? '#6b7280' : q.published ? '#22c55e' : '#f97316';
                return (
                  <motion.div
                    key={q.id} layout
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'var(--card)', borderRadius: 12, overflow: 'hidden',
                      border: `1px solid ${isEditing ? 'var(--orange)' : 'var(--border)'}`,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onClick={() => handleStartEdit(q)}
                    onMouseEnter={e => { if (!isEditing) e.currentTarget.style.borderColor = 'var(--orange)'; }}
                    onMouseLeave={e => { if (!isEditing) e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div style={{ display: 'flex', height: '100%' }}>
                      <div style={{
                        width: 4, flexShrink: 0, background: isEditing ? 'var(--orange)' : statusColor,
                      }} />
                      <div style={{ flex: 1, padding: '0.75rem 0.85rem', minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {q.title}
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                              <span style={{
                                fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem',
                                borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                                background: q.published ? '#dcfce7' : q.archived ? '#f3f4f6' : '#ffedd5',
                                color: q.published ? '#15803d' : q.archived ? '#6b7280' : '#c2410c',
                              }}>
                                <i className={`fas fa-${q.published ? 'globe' : q.archived ? 'archive' : 'pen'}`} style={{ fontSize: '0.6rem' }} />
                                {q.published ? 'Published' : q.archived ? 'Archived' : 'Draft'}
                              </span>
                              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0.1rem 0' }}>
                                {totalQ} Q · {q.timeLimit}m · {q.difficulty}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                            {[
                              { icon: 'fa-eye', title: 'Preview', onClick: () => setPreviewQuiz(q), color: 'var(--text-muted)' },
                              { icon: q.published ? 'fa-eye-slash' : 'fa-eye', title: q.published ? 'Unpublish' : 'Publish', onClick: () => togglePublish(q), color: 'var(--text-muted)' },
                              { icon: 'fa-copy', title: 'Duplicate', onClick: () => duplicateQuiz(q), color: 'var(--text-muted)' },
                              { icon: q.archived ? 'fa-box-open' : 'fa-archive', title: q.archived ? 'Unarchive' : 'Archive', onClick: () => toggleArchive(q), color: 'var(--text-muted)' },
                              { icon: 'fa-trash', title: 'Delete', onClick: () => handleDelete(q.id), color: '#ef4444' },
                            ].map((btn, bi) => (
                              <button key={bi} title={btn.title}
                                style={{
                                  background: 'none', border: 'none', borderRadius: 6,
                                  width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer', color: btn.color, fontSize: '0.7rem',
                                  opacity: 0, transition: 'opacity 0.15s',
                                }}
                                className="quiz-action-btn"
                                onClick={btn.onClick}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
                                <i className={`fas ${btn.icon}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .admin-two-col {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 1.25rem;
          align-items: flex-start;
        }
        @media (max-width: 900px) {
          .admin-two-col { grid-template-columns: 1fr !important; }
        }
        .quiz-list-item:hover .quiz-action-btn {
          opacity: 1 !important;
        }
      `}</style>

      {/* Preview Modal */}
      <Modal isOpen={!!previewQuiz} onClose={() => setPreviewQuiz(null)} title="Quiz Preview" size="xl">
        {previewQuiz && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{previewQuiz.title}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{previewQuiz.description}</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <Badge color="blue">{previewQuiz.questions?.length || 0} Questions</Badge>
              <Badge color="orange">{previewQuiz.timeLimit} min</Badge>
              <Badge color={previewQuiz.difficulty === 'hard' ? 'red' : 'green'}>{previewQuiz.difficulty}</Badge>
              <Badge color="grey">Pass: {previewQuiz.passPercentage || 0}%</Badge>
            </div>
            <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              {(previewQuiz.questions || []).map((q, i) => (
                <div key={q.id} style={{ padding: '1rem', marginBottom: '0.75rem', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.82rem' }}>
                    <strong>Q{i + 1}.</strong> <Badge color={q.difficulty}>{q.difficulty}</Badge>
                    <span style={{ color: 'var(--text-muted)' }}>[{q.marks} mark{q.marks !== 1 ? 's' : ''}]</span>
                    <span style={{ color: 'var(--orange)' }}>⏱ {q.timeLimit}s</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.5rem' }}>{q.questionText}</p>
                  {q.type === 'code' && q.code && (
                    <pre style={{ background: '#1a1d28', color: '#e8eaed', padding: '0.75rem', borderRadius: 8, fontSize: '0.78rem', overflowX: 'auto', marginBottom: '0.5rem' }}>{q.code}</pre>
                  )}
                  {q.type === 'image' && q.imageUrl && (
                    <img src={q.imageUrl} alt="Question" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginBottom: '0.5rem' }} />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {(q.options || []).map(opt => (
                      <div key={opt.id} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', borderRadius: 8,
                        border: `1px solid ${opt.isCorrect ? '#22c55e' : 'var(--border)'}`,
                        background: opt.isCorrect ? '#dcfce7' : 'transparent', fontSize: '0.85rem',
                      }}>
                        <span style={{ fontWeight: 700, color: opt.isCorrect ? '#15803d' : 'var(--text-muted)', width: 20, fontSize: '0.75rem' }}>{opt.id.toUpperCase()}</span>
                        <span>{opt.text}</span>
                        {opt.isCorrect && <i className="fas fa-check-circle" style={{ color: '#22c55e', marginLeft: 'auto' }} />}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Import Modal */}
      <Modal isOpen={bulkModal} onClose={() => { setBulkModal(false); setBulkData(''); }} title="Bulk Import Questions" size="lg">
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Paste CSV data with headers: question, type, difficulty, marks, negativemarks, timer, optionA, optionB, optionC, optionD, correctAnswer, explanation
          </p>
          <textarea className="form-textarea" rows={10}
            value={bulkData}
            onChange={e => setBulkData(e.target.value)}
            placeholder="question,type,difficulty,marks,negativemarks,timer,optionA,optionB,optionC,optionD,correctAnswer,explanation&#10;What is 2+2?,mcq,easy,1,0,30,3,4,5,6,b,Basic addition" />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button onClick={handleBulkImport} icon="fa-upload">Import</Button>
          <Button variant="secondary" onClick={() => { setBulkModal(false); setBulkData(''); }}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
