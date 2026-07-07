import db from '../db';
import { QUIZ_CONFIG } from '../config/quizConfig';

export async function getQuiz(id) {
  return await db.findOne('Quiz', id);
}

export async function listQuizzes(filter = {}) {
  const all = await db.find('Quiz');
  return all.filter((q) => {
    if (filter.published !== undefined && q.published !== filter.published) return false;
    if (filter.archived !== undefined && q.archived !== filter.archived) return false;
    return true;
  });
}

export function calcOverallTime(questions, timePerQuestion) {
  const tp = timePerQuestion || QUIZ_CONFIG.DEFAULT_TIME_PER_QUESTION;
  return (questions?.length || 0) * tp;
}

export function formatOverallTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function saveSession(quizId, state) {
  try {
    localStorage.setItem(`quiz_session_${quizId}`, JSON.stringify({
      currentIndex: state.currentIndex,
      answers: state.answers,
      lockedQuestions: state.lockedQuestions,
      timeRemaining: state.timeRemaining,
      questionTimeRemaining: state.questionTimeRemaining,
      startedAt: state.startedAt,
      answeredAt: state.answeredAt,
    }));
  } catch (e) {
    console.error('Failed to save quiz session', e);
  }
}

export function loadSession(quizId) {
  try {
    const raw = localStorage.getItem(`quiz_session_${quizId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession(quizId) {
  try {
    localStorage.removeItem(`quiz_session_${quizId}`);
  } catch {}
}
