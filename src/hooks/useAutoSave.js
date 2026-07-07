import { useEffect, useRef, useCallback } from 'react';
import db from '../db';

export default function useAutoSave(quizId, userId, answers, options = {}) {
  const { interval = 5000, onSaved, onError } = options;
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const lastSavedRef = useRef('');

  const save = useCallback(async () => {
    const current = answersRef.current;
    const key = JSON.stringify(current);
    if (key === lastSavedRef.current) return;
    try {
      const existing = await db.findOne('QuizAttempt', { quizId, userId, status: 'in-progress' });
      if (existing) {
        await db.update('QuizAttempt', existing.id, { answers: current, updatedAt: new Date().toISOString() });
      } else {
        await db.insert('QuizAttempt', {
          quizId, userId, answers: current, status: 'in-progress', startedAt: new Date().toISOString(),
        });
      }
      lastSavedRef.current = key;
      onSaved?.();
    } catch (err) {
      onError?.(err);
    }
  }, [quizId, userId, onSaved, onError]);

  useEffect(() => {
    if (!quizId || !userId) return;
    const timer = setInterval(save, interval);
    return () => clearInterval(timer);
  }, [quizId, userId, interval, save]);

  return { save };
}
