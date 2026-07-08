import db from '../db';

const DRAFT_PREFIX = 'task_draft_';

export function getDraftKey(taskId, userId) {
  return `${DRAFT_PREFIX}${taskId}_${userId}`;
}

export function saveDraft(taskId, userId, data) {
  const key = getDraftKey(taskId, userId);
  const draft = {
    data,
    savedAt: new Date().toISOString(),
    taskId,
    userId,
  };
  localStorage.setItem(key, JSON.stringify(draft));
  syncToFirestore(taskId, userId, data);
}

export function loadDraft(taskId, userId) {
  const key = getDraftKey(taskId, userId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearDraft(taskId, userId) {
  const key = getDraftKey(taskId, userId);
  localStorage.removeItem(key);
  clearFirestoreDraft(taskId, userId);
}

export function getLastSaved(taskId, userId) {
  const draft = loadDraft(taskId, userId);
  return draft?.savedAt || null;
}

export function hasUnsavedChanges(taskId, userId, currentFields) {
  const draft = loadDraft(taskId, userId);
  if (!draft || !draft.data) return false;
  return JSON.stringify(draft.data) !== JSON.stringify(currentFields);
}

async function syncToFirestore(taskId, userId, data) {
  if (!navigator.onLine) return;
  try {
    await db.insert('TaskDrafts', {
      id: getDraftKey(taskId, userId),
      taskId,
      userId,
      data,
      savedAt: new Date().toISOString(),
    });
  } catch {
    // Firestore sync failed — draft still safe in localStorage
  }
}

async function clearFirestoreDraft(taskId, userId) {
  if (!navigator.onLine) return;
  try {
    await db.delete('TaskDrafts', getDraftKey(taskId, userId));
  } catch {
    // Best-effort
  }
}

export async function restoreDraftFromFirestore(taskId, userId) {
  if (!navigator.onLine) return null;
  try {
    const doc = await db.findOne('TaskDrafts', { id: getDraftKey(taskId, userId) });
    if (!doc || !doc.data) return null;
    const local = loadDraft(taskId, userId);
    if (local && new Date(local.savedAt) >= new Date(doc.savedAt)) return local;
    return { data: doc.data, savedAt: doc.savedAt, taskId, userId };
  } catch {
    return null;
  }
}
