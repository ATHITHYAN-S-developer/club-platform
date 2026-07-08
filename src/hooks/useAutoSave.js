import { useRef, useCallback, useEffect } from 'react';
import { saveDraft, loadDraft } from '../challenges/services/challengeService';

export default function useAutosave({ userId, challengeId, code, language, cursorPosition, scrollPosition, interval = 10 }) {
  const timerRef = useRef(null);
  const lastSavedRef = useRef(null);
  const dirtyRef = useRef(false);
  const codeRef = useRef(code);
  const langRef = useRef(language);
  const cursorRef = useRef(cursorPosition);
  const scrollRef = useRef(scrollPosition);

  codeRef.current = code;
  langRef.current = language;
  cursorRef.current = cursorPosition;
  scrollRef.current = scrollPosition;

  const save = useCallback(async () => {
    if (!userId || !challengeId) return;
    dirtyRef.current = false;
    lastSavedRef.current = Date.now();
    try {
      await saveDraft(userId, challengeId, langRef.current, codeRef.current);
    } catch (err) {
      console.warn('Autosave failed:', err);
    }
  }, [userId, challengeId]);

  const restore = useCallback(async () => {
    if (!userId || !challengeId) return null;
    try {
      const draft = await loadDraft(userId, challengeId);
      return draft;
    } catch {
      return null;
    }
  }, [userId, challengeId]);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (dirtyRef.current) save();
    }, interval * 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [save, interval]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (dirtyRef.current) save();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [save]);

  return { save, restore, markDirty, lastSaved: lastSavedRef };
}
