import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  runTransaction
} from "firebase/firestore";
import { createClient } from "@supabase/supabase-js";
import logger from './utils/logger.js';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseServiceClient = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

const initialCollections = {
  Users: [],
  Gallery: [
    { id: 'gal_1', title: 'Mind of Machines Keynote', category: 'Workshops', image: 'https://dlsxedqjygnomttklvgx.supabase.co/storage/v1/object/public/posters/event1_poster.jpg', description: 'Technical Head Athithyan S demonstrating deep learning architectures.' },
    { id: 'gal_2', title: 'Collaborative AI Lab Session', category: 'Workshops', image: 'https://dlsxedqjygnomttklvgx.supabase.co/storage/v1/object/public/gallery/event1/1782747829450_ay6fuz7g.jpg', description: 'Students designing neural networks and comparing model parameters.' },
    { id: 'gal_3', title: 'Data Cleaning & Preprocessing Seminar', category: 'Seminars', image: 'https://dlsxedqjygnomttklvgx.supabase.co/storage/v1/object/public/posters/event2_poster.jpg', description: 'President Mithres P highlighting the importance of data preprocessing in AI pipelines.' },
    { id: 'gal_4', title: 'n8n Workflow Design Workshop', category: 'Workshops', image: 'https://dlsxedqjygnomttklvgx.supabase.co/storage/v1/object/public/posters/event3_poster.jpg', description: 'Eben Gorky S guiding members on workflow automation tools.' },
    { id: 'gal_5', title: 'Automation Flow Testing', category: 'Workshops', image: 'https://dlsxedqjygnomttklvgx.supabase.co/storage/v1/object/public/gallery/event3/1782747862795_3olaar4r.jpg', description: 'Real-time workflow execution and webhook integration demo.' },
    { id: 'gal_6', title: 'Plot to Bot Event Kickoff', category: 'Events', image: 'https://dlsxedqjygnomttklvgx.supabase.co/storage/v1/object/public/posters/event4_poster.jpg', description: 'Brainstorming session for custom chatbot implementation using analytic datasets.' },
    { id: 'gal_7', title: 'Speed Coding & UI Branding Sprint', category: 'Coding Sprints', image: 'https://dlsxedqjygnomttklvgx.supabase.co/storage/v1/object/public/posters/event5_poster.jpeg', description: 'Members working on rapid frontend coding under constraints.' },
    { id: 'gal_8', title: 'Vibe Coding & Design Presentation', category: 'Coding Sprints', image: 'https://dlsxedqjygnomttklvgx.supabase.co/storage/v1/object/public/gallery/event5/1782747888694_f67oyurt.jpeg', description: 'Sangamithra demonstrating design layouts and aesthetic components.' },
    { id: 'gal_9', title: 'API Alchemy Backend Dev', category: 'Workshops', image: 'https://dlsxedqjygnomttklvgx.supabase.co/storage/v1/object/public/posters/event6_poster.jpeg', description: 'Building Restful APIs using Django Rest Framework.' },
    { id: 'gal_10', title: 'Postman Integration Testing', category: 'Workshops', image: 'https://dlsxedqjygnomttklvgx.supabase.co/storage/v1/object/public/gallery/event6/1782747891850_2sdo7ys0.jpeg', description: 'Validating API endpoints and checking latency parameters.' },
    { id: 'gal_11', title: 'DeployX Virtual Seminar', category: 'Seminars', image: 'https://dlsxedqjygnomttklvgx.supabase.co/storage/v1/object/public/posters/event7_poster.jpeg', description: 'Deploying AI projects to production clouds in collaboration with HackerBay.' },
  ],
  Events: [
    { id: 'evt_1', title: 'Mind of Machines: Exploring AI Domains', description: 'An exploration of AI domains, Machine Learning, Deep Learning, and Automation. Led by technical speakers Athithyan S, Harthika S, and Afra Fathima H.', venue: '2nd Floor Conference Hall', date: '2025-09-02', time: '13:20', poster: 'https://dlsxedqjygnomttklvgx.supabase.co/storage/v1/object/public/posters/event1_poster.jpg', registeredUsers: [] },
    { id: 'evt_2', title: 'Data Preprocessing in AI Pipelines', description: 'Deep dive into critical data preparation techniques including data cleaning, normalization, feature engineering, and transformation for AI models. Led by President Mithres P and Technical Head Athithyan S.', venue: 'Main Block Dept. Library (3rd Floor)', date: '2025-10-17', time: '11:00', poster: 'https://dlsxedqjygnomttklvgx.supabase.co/storage/v1/object/public/posters/event2_poster.jpg', registeredUsers: [] },
    { id: 'evt_3', title: 'Build Smart Workflows with n8n', description: 'Hands-on training session on workflow automation using the open-source automation tool n8n, enabling students to construct automated AI agent flows. Led by Technical Head Eben Gorky S.', venue: 'Main Block Lab 1 (3rd Floor)', date: '2025-11-12', time: '13:20', poster: 'https://dlsxedqjygnomttklvgx.supabase.co/storage/v1/object/public/posters/event3_poster.jpg', registeredUsers: [] },
    { id: 'evt_4', title: 'Plot to Bot Event', description: 'An intensive event focusing on building bots from data plots and analytical models. Led by Technical Head Athithyan S and student coordinators.', venue: 'Core Space, Ground Floor', date: '2026-02-10', time: '13:20', poster: 'https://dlsxedqjygnomttklvgx.supabase.co/storage/v1/object/public/posters/event4_poster.jpg', registeredUsers: [] },
    { id: 'evt_5', title: 'Visionary Vibes & Vibe Coding', description: 'An innovative coding session focusing on speed coding and branding concepts. Led by Sangamithra (Design & Branding), Swathi Preetha Rajalingam (Innovation Lead), and Shobiya (Operations Manager).', venue: 'Final year CSE - A', date: '2026-03-13', time: '13:20', poster: 'https://dlsxedqjygnomttklvgx.supabase.co/storage/v1/object/public/posters/event5_poster.jpeg', registeredUsers: [] },
    { id: 'evt_6', title: 'API Alchemy: Django x Postman', description: 'In-depth session on developing backend APIs with Django and testing them with Postman. Organized in collaboration with Tech Crew Club. Led by President Mithres P, Kaarthika M, and Subasri S.', venue: 'Application Development Laboratory, CSE Dept.', date: '2026-04-08', time: '09:00', poster: 'https://dlsxedqjygnomttklvgx.supabase.co/storage/v1/object/public/posters/event6_poster.jpeg', registeredUsers: [] },
    { id: 'evt_7', title: 'DeployX Hybrid Seminar', description: 'An event focused on deploying AI applications and models, held in collaboration with HackerBay. Led by Shamruthya Gopal N (President, HackerBay) and Athithyan S (Technical Head, Club MindCraft AI).', venue: 'Google Meet', date: '2026-05-04', time: '18:00', poster: 'https://dlsxedqjygnomttklvgx.supabase.co/storage/v1/object/public/posters/event7_poster.jpeg', registeredUsers: [] },
  ],
  Resources: [
    { id: 'res_1', title: 'Advanced React Optimization Slides', category: 'PPT', description: 'Deck explaining React.memo, useMemo, useCallback, and React 19 concurrent features.', link: 'https://example.com/files/react-opt.pptx', size: '4.2 MB' },
    { id: 'res_2', title: 'Introduction to Rust Programming Guide', category: 'PDF', description: 'Comprehensive guide covering ownership, borrowing, lifetimes, and safety guarantees.', link: 'https://example.com/files/intro-rust.pdf', size: '2.8 MB' },
    { id: 'res_3', title: 'Full Stack Starter Kit Repository', category: 'GitHub Links', description: 'Template repository preloaded with Express, JWT authentication, and SQLite configuration.', link: 'https://github.com', size: 'External Link' },
    { id: 'res_4', title: 'Machine Learning Basics Workshop Recording', category: 'Videos', description: 'Full video walkthrough covering linear regression, gradient descent, and PyTorch.', link: 'https://youtube.com', size: 'Video Stream' },
  ],
  Quiz: [],
  QuizResults: [],
  QuizAttempt: [],
  Violations: [],
  Notifications: [],
  EventRegistrations: [],
  WeeklyTasks: [],
  TaskSubmissions: [],
  Announcements: [],
  JoinRequests: [],
  WeeklyWinners: [],
  Tasks: [],
  Challenges: [],
  ChallengeSubmissions: [],
  ChallengeLeaderboard: [  ],
  ContactMessages: [],
  CoreMembers: [],
  JoinFormFields: [],
  Settings: {
    siteName: 'Mindcraft AI Club',
    academicYear: '2026-2027',
    registrationStatus: 'Open',
    adminEmail: 'mindcraftaiclub@gmail.com',
    announcementBanner: 'Welcome to Mindcraft AI. Check upcoming events for registrations.',
    projectsCount: 40,
    eventsCount: 18,
    awardsCount: 6
  }
};

const ADMIN_EMAILS = ['mindcraftaiclub@gmail.com'];

const isAdminEmail = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};

const isPermissionError = (error) => {
  if (!error) return false;
  const msg = (error.message || "").toLowerCase();
  const code = (error.code || "").toLowerCase();
  return code === 'permission-denied' || msg.includes('permission') || msg.includes('insufficient');
};

const DELETED_IDS_KEY = 'mindcraft_deleted_ids';

const getDeletedIds = () => {
  try {
    const data = localStorage.getItem(DELETED_IDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const addDeletedId = (id) => {
  try {
    const ids = getDeletedIds();
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(ids));
    }
  } catch { /* ignore */ }
};

const DELETED_EMAILS_KEY = 'mindcraft_deleted_emails';

const getDeletedEmails = () => {
  try {
    const data = localStorage.getItem(DELETED_EMAILS_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const addDeletedEmail = (email) => {
  if (!email) return;
  try {
    const emails = getDeletedEmails();
    const cleanEmail = email.toLowerCase().trim();
    if (!emails.includes(cleanEmail)) {
      emails.push(cleanEmail);
      localStorage.setItem(DELETED_EMAILS_KEY, JSON.stringify(emails));
    }
  } catch { /* ignore */ }
};

const sanitizeForFirestore = (obj) => {
  if (obj === null || obj === undefined) return undefined;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item)).filter(item => item !== undefined);
  }
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value === null) { cleaned[key] = null; continue; }
    if (typeof value === 'object' && !(value instanceof Date)) {
      const nested = sanitizeForFirestore(value);
      if (nested !== undefined) cleaned[key] = nested;
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

const DB_PREFIX = 'mindcraft_fb_fallback_v5_';

const DUMMY_SAMPLE_IDS = [
  'qz_1', 'qz_2', 'qz_rag_1', 'qz_rag_2',
  'qr_1', 'qr_2', 'qr_3',
  'ann_1', 'ann_2',
  'win_1', 'win_2',
  'core_1',
  'chal_1', 'chal_2', 'chal_3', 'chal_rag_1', 'chal_rag_2', 'chal_rag_3', 'chal_rag_4', 'chal_rag_5', 'chal_rag_6', 'chal_rag_7', 'chal_rag_8', 'chal_rag_9'
];

const isDummyItem = (item) => {
  if (!item) return false;
  if (DUMMY_SAMPLE_IDS.includes(item.id) || DUMMY_SAMPLE_IDS.includes(item.quizId)) return true;
  const title = (item.title || item.quizTitle || item.name || item.achievement || '').toLowerCase().trim();
  const email = (item.email || '').toLowerCase().trim();
  const role = (item.role || item.position || '').toLowerCase().trim();

  if (
    title.includes('programming fundamentals') ||
    title.includes('aws fundamentals') ||
    title.includes('weekly javascript quiz') ||
    title.includes('weekly css grid')
  ) {
    return true;
  }

  // Sample core member Athi President
  if ((title === 'athi' && role === 'president') || email === 'athi9080@.com' || item.id === 'core_1') {
    return true;
  }

  return false;
};

const getLocalStorageCollection = (collectionName) => {
  try {
    const data = localStorage.getItem(DB_PREFIX + collectionName);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => !isDummyItem(item));
      }
      return parsed;
    }
  } catch { /* ignore */ }
  if (initialCollections[collectionName]) {
    const initial = JSON.parse(JSON.stringify(initialCollections[collectionName]));
    if (Array.isArray(initial)) {
      return initial.filter(item => !isDummyItem(item));
    }
    return initial;
  }
  return [];
};

const setLocalStorageCollection = (collectionName, data) => {
  try {
    localStorage.setItem(DB_PREFIX + collectionName, JSON.stringify(data));
  } catch { /* ignore */ }
};

function isOfflineError(error) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  if (error.code === 'unavailable') return true;
  if (error.message && /network|offline|internet|failed to fetch|fetch request/i.test(error.message)) return true;
  return false;
}

function classifyFirestoreError(error) {
  if (isOfflineError(error)) return 'offline';
  const code = error.code || '';
  if (code === 'permission-denied') return 'permission';
  if (code === 'unauthenticated') return 'auth';
  if (code === 'not-found') return 'not-found';
  if (code === 'invalid-argument' || code === 'failed-precondition') return 'validation';
  if (code === 'resource-exhausted') return 'quota';
  if (code === 'already-exists') return 'duplicate';
  return 'unknown';
}

async function retryFirestoreWrite(fn, maxRetries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isOfflineError(error)) throw error;
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 500 * attempt));
      }
    }
  }
  throw lastError;
}

class FirebaseDatabase {
  constructor() {
    this.authListeners = [];
    this._online = navigator.onLine;
    window.addEventListener('online', () => { this._online = true; });
    window.addEventListener('offline', () => { this._online = false; });
    this.initFirebaseSync();
    this.initFirestore();
  }

  isOnline() { return this._online; }

  async initFirestore() {
    try {
      const settingsRef = collection(firestore, 'Settings');
      const settingsSnap = await getDocs(settingsRef);
      if (settingsSnap.empty) {
        for (const [key, list] of Object.entries(initialCollections)) {
          if (key === 'Settings') {
            await setDoc(doc(firestore, 'Settings', 'global_settings'), sanitizeForFirestore(list));
          } else {
            const colRef = collection(firestore, key);
            for (const item of list) {
              await setDoc(doc(colRef, item.id), sanitizeForFirestore(item));
            }
          }
        }
      }
    } catch (e) {
      console.error('Firestore init error:', e);
    }
  }

  initFirebaseSync() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      let userProfile = null;
      if (firebaseUser) {
        try {
          userProfile = await this.findOne('Users', { id: firebaseUser.uid });
          if (!userProfile) {
            userProfile = await this.findOne('Users', { email: firebaseUser.email });
          }
          if (!userProfile) {
            userProfile = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              role: isAdminEmail(firebaseUser.email) ? 'admin' : 'member',
              department: 'Computer Science',
              year: '1',
              position: 'Member',
              skills: [],
              linkedin: 'https://www.linkedin.com/company/mindcraft-ai-vcet',
              github: 'https://github.com',
              photo: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || firebaseUser.email.split('@')[0])}&background=ff5500&color=fff`,
              verified: true
            };
            await this.insert('Users', userProfile);
          }
          localStorage.setItem('aether_user_session', JSON.stringify(userProfile));
          localStorage.setItem('aether_jwt_token', `firebase.${btoa(JSON.stringify(userProfile))}.signature`);
        } catch (e) {
          console.error('Auth sync error:', e);
        }
      } else {
        localStorage.removeItem('aether_user_session');
        localStorage.removeItem('aether_jwt_token');
      }
      this.authListeners.forEach(listener => listener(userProfile, firebaseUser));
    });
  }

  subscribeAuth(listener) {
    this.authListeners.push(listener);
    const currentUser = this.getCurrentUser();
    listener(currentUser, auth.currentUser);
    return () => {
      this.authListeners = this.authListeners.filter(l => l !== listener);
    };
  }

  getCurrentUser() {
    try {
      const session = localStorage.getItem('aether_user_session');
      return session ? JSON.parse(session) : null;
    } catch { return null; }
  }

  async find(collectionName, includeDeleted = false) {
    const deduplicateUsers = (list) => {
      if (collectionName !== 'Users') return list;
      const unique = {};
      list.forEach(u => {
        const email = (u.email || '').toLowerCase().trim();
        if (!email) {
          unique[u.id] = u;
        } else {
          const existing = unique[email];
          // Keep admin role, or keep whichever has the longer/valid UID structure
          if (!existing || u.role === 'admin' || (existing.role !== 'admin' && u.id.length > existing.id.length)) {
            unique[email] = u;
          }
        }
      });
      return Object.values(unique);
    };

    try {
      const colRef = collection(firestore, collectionName);
      const snapshot = await getDocs(colRef);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const deletedIds = getDeletedIds();
      const deletedEmails = getDeletedEmails();
      const filtered = data.filter(item => {
        if (isDummyItem(item)) return false;
        if (!includeDeleted) {
          if (deletedIds.includes(item.id) || item.isDeleted === true) return false;
          if ((collectionName === 'Users' || collectionName === 'CoreMembers') && item.email && deletedEmails.includes(item.email.toLowerCase().trim())) {
            return false;
          }
        }
        return true;
      });
      if (collectionName === 'QuizResults') {
        return deduplicateUsers(filtered.filter(item => !isDummyItem(item)));
      }
      // Merge local fallback data with Firestore data to ensure local registrations are found
      let merged = [...filtered];
      try {
        const localData = getLocalStorageCollection(collectionName);
        const localFiltered = localData.filter(item => {
          if (isDummyItem(item)) return false;
          if (!includeDeleted) {
            if (deletedIds.includes(item.id) || item.isDeleted === true) return false;
            if ((collectionName === 'Users' || collectionName === 'CoreMembers') && item.email && deletedEmails.includes(item.email.toLowerCase().trim())) {
              return false;
            }
          }
          return true;
        });
        localFiltered.forEach(localItem => {
          if (!merged.some(item => item.id === localItem.id)) {
            merged.push(localItem);
          }
        });
      } catch (localErr) {
        console.warn('Failed to load local data for merge:', localErr);
      }
      return deduplicateUsers(merged.filter(item => !isDummyItem(item)));
    } catch (error) {
      console.warn(`find(${collectionName}) failed, using fallback:`, error.message);
      const localData = getLocalStorageCollection(collectionName);
      const deletedIds = getDeletedIds();
      const deletedEmails = getDeletedEmails();
      const filtered = localData.filter(item => {
        if (isDummyItem(item)) return false;
        if (!includeDeleted) {
          if (deletedIds.includes(item.id) || item.isDeleted === true) return false;
          if ((collectionName === 'Users' || collectionName === 'CoreMembers') && item.email && deletedEmails.includes(item.email.toLowerCase().trim())) {
            return false;
          }
        }
        return true;
      });
      if (collectionName === 'QuizResults') {
        return deduplicateUsers(filtered.filter(item => !isDummyItem(item)));
      }
      return deduplicateUsers(filtered);
    }
  }

  subscribe(collectionName, callback, id) {
    try {
      const colRef = collection(firestore, collectionName);
      const q = id ? query(colRef, where('__name__', '==', id)) : colRef;
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(data);
      }, (error) => {
        console.warn(`subscribe(${collectionName}) error:`, error.message);
      });
      return unsubscribe;
    } catch (error) {
      console.warn(`subscribe(${collectionName}) failed:`, error.message);
      return () => { };
    }
  }

  subscribeQuery(collectionName, field, operator, value, callback) {
    try {
      const colRef = collection(firestore, collectionName);
      const q = query(colRef, where(field, operator, value));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(data);
      }, (error) => {
        console.warn(`subscribeQuery(${collectionName}) error:`, error.message);
      });
      return unsubscribe;
    } catch (error) {
      console.warn(`subscribeQuery(${collectionName}) failed:`, error.message);
      return () => { };
    }
  }

  async findOne(collectionName, queryObj) {
    try {
      const deletedIds = getDeletedIds();
      if (queryObj.id) {
        if (deletedIds.includes(queryObj.id)) return null;
        const docRef = doc(firestore, collectionName, queryObj.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.isDeleted === true) return null;
          return { id: docSnap.id, ...data };
        }
        return null;
      }
      const items = await this.find(collectionName);
      return items.find(item => Object.keys(queryObj).every(key => item[key] === queryObj[key])) || null;
    } catch (error) {
      console.warn(`findOne(${collectionName}) failed, using fallback:`, error.message);
      const items = getLocalStorageCollection(collectionName);
      const deletedIds = getDeletedIds();
      return items.filter(i => !deletedIds.includes(i.id) && i.isDeleted !== true).find(item => Object.keys(queryObj).every(key => item[key] === queryObj[key])) || null;
    }
  }

  async insert(collectionName, record) {
    if (!record.id) {
      record.id = collectionName.toLowerCase().substring(0, 3) + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }
    record.createdAt = new Date().toISOString();
    const cleanRecord = sanitizeForFirestore(record);

    try {
      await retryFirestoreWrite(() =>
        setDoc(doc(firestore, collectionName, cleanRecord.id), cleanRecord)
      );
      return { record: cleanRecord, persistedToFirestore: true };
    } catch (error) {
      const errorType = classifyFirestoreError(error);
      console.error(`insert(${collectionName}) failed [${errorType}]:`, error);

      if (errorType === 'offline') {
        const items = getLocalStorageCollection(collectionName);
        items.push(cleanRecord);
        setLocalStorageCollection(collectionName, items);
        return { record: cleanRecord, persistedToFirestore: false };
      }

      throw error;
    }
  }

  async insertWithCapacityCheck(collectionName, record, announcementId) {
    if (!record.id) {
      record.id = collectionName.toLowerCase().substring(0, 3) + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }
    record.createdAt = new Date().toISOString();

    try {
      const result = await retryFirestoreWrite(() =>
        runTransaction(firestore, async (transaction) => {
          const annDoc = await transaction.get(doc(firestore, 'Announcements', announcementId));
          if (!annDoc.exists()) throw new Error('Event not found.');

          const annData = annDoc.data();
          const seatsLimit = annData.seatsLimit || 100;
          const waitlistLimit = annData.waitlistLimit || 0;

          const regsQuery = query(
            collection(firestore, collectionName),
            where('announcementId', '==', announcementId),
            where('status', 'in', ['Registered', 'Waitlisted'])
          );
          const regsSnapshot = await getDocs(regsQuery);

          let registeredCount = 0;
          let waitlistedCount = 0;
          regsSnapshot.forEach((d) => {
            const data = d.data();
            if (data.status === 'Registered') registeredCount++;
            else if (data.status === 'Waitlisted') waitlistedCount++;
          });

          if (registeredCount < seatsLimit) {
            record.status = 'Registered';
          } else if (waitlistedCount < waitlistLimit) {
            record.status = 'Waitlisted';
          } else {
            throw new Error('Event is full. No more seats or waitlist slots available.');
          }

          const cleanRecord = sanitizeForFirestore(record);
          transaction.set(doc(firestore, collectionName, cleanRecord.id), cleanRecord);
          return { record: cleanRecord, status: record.status };
        })
      );

      return { record: result.record, persistedToFirestore: true, status: result.status };
    } catch (error) {
      const errorType = classifyFirestoreError(error);
      console.error(`insertWithCapacityCheck(${collectionName}) failed [${errorType}]:`, error);

      if (errorType === 'offline') {
        const cleanRecord = sanitizeForFirestore(record);
        const items = getLocalStorageCollection(collectionName);
        items.push(cleanRecord);
        setLocalStorageCollection(collectionName, items);
        return { record: cleanRecord, persistedToFirestore: false, status: record.status };
      }

      throw error;
    }
  }

  async update(collectionName, id, updates) {
    let docData = {};
    try {
      const docRef = doc(firestore, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        docData = docSnap.data();
      } else {
        const e = new Error(`Record ${id} not found in ${collectionName}`);
        e.code = 'NOT_FOUND';
        throw e;
      }
      const sanitizedUpdates = sanitizeForFirestore({ ...updates, updatedAt: new Date().toISOString() });
      await updateDoc(docRef, sanitizedUpdates);
      const finalDoc = { ...docData, ...sanitizedUpdates, id };
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === id) {
        localStorage.setItem('aether_user_session', JSON.stringify(finalDoc));
        this.authListeners.forEach(listener => listener(finalDoc, auth.currentUser));
      }
      return finalDoc;
    } catch (error) {
      console.warn(`update(${collectionName}, ${id}) failed, using fallback:`, error.message);
      const items = getLocalStorageCollection(collectionName);
      let idx = items.findIndex(item => item.id === id);
      if (idx === -1) {
        const fallbackItem = { id, ...docData, createdAt: new Date().toISOString() };
        items.push(fallbackItem);
        idx = items.length - 1;
      }
      const finalDoc = { ...items[idx], ...updates, id, updatedAt: new Date().toISOString() };
      items[idx] = finalDoc;
      setLocalStorageCollection(collectionName, items);
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === id) {
        localStorage.setItem('aether_user_session', JSON.stringify(finalDoc));
        this.authListeners.forEach(listener => listener(finalDoc, auth.currentUser));
      }
      return finalDoc;
    }
  }

  async delete(collectionName, id) {
    const items = getLocalStorageCollection(collectionName);
    let emailToBlacklist = null;

    if (collectionName === 'Users' || collectionName === 'CoreMembers') {
      const match = items.find(item => item.id === id);
      if (match && match.email) emailToBlacklist = match.email;
    }

    try {
      // 1. Attempt Firestore deletion
      const docRef = doc(firestore, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().email) {
        emailToBlacklist = docSnap.data().email;
      }
      await deleteDoc(docRef);

      if (emailToBlacklist && (collectionName === 'Users' || collectionName === 'CoreMembers')) {
        const cleanEmail = emailToBlacklist.toLowerCase().trim();
        addDeletedEmail(cleanEmail);

        const colRef = collection(firestore, collectionName);
        const q = query(colRef, where('email', '==', emailToBlacklist));
        const snap = await getDocs(q);
        await Promise.all(snap.docs.map(async (d) => {
          addDeletedId(d.id);
          await deleteDoc(d.ref);
        }));
      }
    } catch (error) {
      console.warn(`delete(${collectionName}, ${id}) failed in Firestore, falling back to local:`, error.message);
    }

    // 2. Local cache updates (always executed)
    addDeletedId(id);
    setLocalStorageCollection(collectionName, items.filter(item => item.id !== id));

    if (emailToBlacklist && (collectionName === 'Users' || collectionName === 'CoreMembers')) {
      const cleanEmail = emailToBlacklist.toLowerCase().trim();
      addDeletedEmail(cleanEmail);

      const filteredItems = items.filter(item => item.id !== id && (item.email || '').toLowerCase().trim() !== cleanEmail);
      setLocalStorageCollection(collectionName, filteredItems);
    }

    return { id };
  }

  async deleteFile(url) {
    if (!url || typeof url !== 'string') return;
    const storagePrefix = '/storage/v1/object/public/';
    const idx = url.indexOf(storagePrefix);
    if (idx === -1) return;
    const fullPath = url.substring(idx + storagePrefix.length);
    const slashIdx = fullPath.indexOf('/');
    if (slashIdx === -1) return;
    const bucket = fullPath.substring(0, slashIdx);
    const filePath = fullPath.substring(slashIdx + 1);
    if (!bucket || !filePath) return;
    try {
      const { error } = await supabaseServiceClient.storage.from(bucket).remove([filePath]);
      if (error) console.warn('deleteFile error:', error.message);
    } catch (e) {
      console.warn('deleteFile exception:', e.message);
    }
  }

  async uploadFile(file, bucket = 'uploads') {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const { data, error } = await supabaseServiceClient.storage.from(bucket).upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: publicUrlData } = supabaseServiceClient.storage.from(bucket).getPublicUrl(fileName);
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('File upload failed. Please try again.');
    }
  }

  async register(name, email, password, className, registerNumber, phone, interestedArea, codingStyle) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = {
        id: userCredential.user.uid, name, email,
        className: className || '',
        registerNumber: registerNumber || '',
        phone: phone || '',
        interestedArea: interestedArea || '',
        codingStyle: codingStyle || '',
        role: isAdminEmail(email) ? 'admin' : 'member',
        department: 'Computer Science', year: '1', position: 'Member',
        skills: [], linkedin: '', github: '',
        photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff5500&color=fff`,
        verified: true
      };
      await this.insert('Users', newUser);
      return newUser;
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') throw new Error('This email is already registered. Try signing in instead.');
      if (error.code === 'auth/weak-password') throw new Error('Password must be at least 6 characters.');
      throw new Error(error.message || 'Registration failed.');
    }
  }

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      let userProfile = await this.findOne('Users', { id: userCredential.user.uid });
      if (!userProfile) {
        userProfile = await this.findOne('Users', { email: userCredential.user.email });
      }
      if (!userProfile) {
        userProfile = {
          id: userCredential.user.uid,
          name: email.split('@')[0], email,
          role: isAdminEmail(email) ? 'admin' : 'member',
          department: 'Computer Science', year: '1', position: 'Member',
          skills: [], linkedin: '', github: '',
          photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=ff5500&color=fff`,
          verified: true
        };
        await this.insert('Users', userProfile);
      }
      localStorage.setItem('aether_user_session', JSON.stringify(userProfile));
      localStorage.setItem('aether_jwt_token', `firebase.${btoa(JSON.stringify(userProfile))}.signature`);
      return { user: userProfile };
    } catch (err) {
      try {
        const users = await this.find('Users');
        const userProfile = users.find(user => {
          const normEmail = email.toLowerCase().trim();
          const matchesEmail = (user.email || '').toLowerCase().trim() === normEmail;
          const normUserPhone = (user.phone || '').replace(/\D/g, '');
          const normInputPhone = email.replace(/\D/g, '');
          const matchesPhone = normInputPhone && normUserPhone && (normUserPhone.endsWith(normInputPhone) || normInputPhone.endsWith(normUserPhone));
          return matchesEmail || matchesPhone;
        });
        if (userProfile && userProfile.password === password) {
          localStorage.setItem('aether_user_session', JSON.stringify(userProfile));
          localStorage.setItem('aether_jwt_token', `firebase.${btoa(JSON.stringify(userProfile))}.signature`);
          this.authListeners.forEach(listener => listener(userProfile, null));
          return { user: userProfile };
        }
      } catch (fallbackErr) {
        console.warn('Fallback login check failed:', fallbackErr);
      }
      const isSpecialAdmin = ADMIN_EMAILS.includes(email.toLowerCase().trim()) && password === 'Mind2025@';
      const isUserNotFound = err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential';

      if (isSpecialAdmin && isUserNotFound) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const userProfile = {
            id: userCredential.user.uid,
            name: email === 'admin@club.com' ? 'System Administrator' : 'Mindcraft AI Admin',
            email, role: 'admin',
            department: 'Computer Science', year: '4', position: 'Administrator',
            skills: ['Firebase', 'React', 'Management'], linkedin: '', github: '',
            photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=ff5500&color=fff`,
            verified: true
          };
          await this.insert('Users', userProfile);
          localStorage.setItem('aether_user_session', JSON.stringify(userProfile));
          localStorage.setItem('aether_jwt_token', `firebase.${btoa(JSON.stringify(userProfile))}.signature`);
          return { user: userProfile };
        } catch (createErr) {
          if (createErr.code === 'auth/email-already-in-use') throw new Error('Account already exists. Please check your password.');
          throw new Error('Could not create account. Please try again.');
        }
      }

      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') throw new Error('Invalid email or password.');
      if (err.code === 'auth/too-many-requests') throw new Error('Too many attempts. Please try again later.');
      throw new Error(err.message || 'Login failed.');
    }
  }

  async logout() {
    await signOut(auth);
    localStorage.removeItem('aether_jwt_token');
    localStorage.removeItem('aether_user_session');
  }

  async forgotPassword(email) {
    await sendPasswordResetEmail(auth, email);
  }

  async resetUserPassword(email, newPassword) {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail) return;

    if (auth.currentUser && auth.currentUser.email && auth.currentUser.email.toLowerCase().trim() === cleanEmail) {
      try {
        await updatePassword(auth.currentUser, newPassword);
      } catch (e) {
        console.warn('Firebase Auth updatePassword note:', e.message);
      }
    }

    const users = await this.find('Users', true);
    const matchingUsers = users.filter(u => (u.email || '').toLowerCase().trim() === cleanEmail);
    for (const u of matchingUsers) {
      await this.update('Users', u.id, { password: newPassword });
    }

    const localUsers = getLocalStorageCollection('Users');
    let updatedLocal = false;
    localUsers.forEach(u => {
      if ((u.email || '').toLowerCase().trim() === cleanEmail) {
        u.password = newPassword;
        u.updatedAt = new Date().toISOString();
        updatedLocal = true;
      }
    });
    if (updatedLocal) {
      setLocalStorageCollection('Users', localUsers);
    }
  }

  async getSettings() {
    try {
      const docRef = doc(firestore, 'Settings', 'global_settings');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return initialCollections.Settings;
    } catch (e) {
      console.warn("getSettings failed, using local fallback:", e.message);
      try {
        const local = localStorage.getItem('mindcraft_settings');
        if (local) return JSON.parse(local);
      } catch { }
      return initialCollections.Settings;
    }
  }

  async updateSettings(updates) {
    try {
      const docRef = doc(firestore, 'Settings', 'global_settings');
      await setDoc(docRef, updates, { merge: true });
      try {
        localStorage.setItem('mindcraft_settings', JSON.stringify(updates));
      } catch { }
      return updates;
    } catch (e) {
      console.warn("updateSettings failed, using local fallback:", e.message);
      try {
        localStorage.setItem('mindcraft_settings', JSON.stringify(updates));
      } catch { }
      return updates;
    }
  }
}

const db = new FirebaseDatabase();
window.db = db;
export default db;
