import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
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
  where
} from "firebase/firestore";
import { createClient } from "@supabase/supabase-js";

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
  Quiz: [
    {
      id: 'qz_1', title: 'Weekly JavaScript Quiz: Scopes & Closures',
      description: 'Test your understanding of lexical scoping, hoisting, closures, and the event loop.',
      category: 'Programming', difficulty: 'medium',
      timeLimit: 10, passMarks: 2, totalMarks: 3, maxAttempts: 2,
      shuffleQuestions: false, shuffleOptions: false,
      showResult: true, leaderboardVisibility: true,
      allowReview: true, allowBackNavigation: true,
      autoSubmit: true, negativeMarking: 0,
      scheduledAt: null, archived: false, published: true,
      security: { fullscreenRequired: true, tabSwitchDetection: true, copyPasteBlock: true, rightClickBlock: true, devToolsDetection: true, violationLimit: 3 },
      createdAt: '2026-06-20T08:00:00Z', updatedAt: '2026-06-20T08:00:00Z',
      questions: [
        { id: 'q1_1', type: 'mcq', questionText: 'What will be logged: console.log(typeof NaN)?', options: [{ id: 'a', text: '"number"', isCorrect: true }, { id: 'b', text: '"nan"', isCorrect: false }, { id: 'c', text: '"undefined"', isCorrect: false }, { id: 'd', text: '"object"', isCorrect: false }], difficulty: 'easy', marks: 1, negativeMarks: 0, timeLimit: 30, order: 1 },
        { id: 'q1_2', type: 'mcq', questionText: 'Which keyword creates a block-scoped variable?', options: [{ id: 'a', text: 'var', isCorrect: false }, { id: 'b', text: 'let', isCorrect: true }, { id: 'c', text: 'function', isCorrect: false }, { id: 'd', text: 'define', isCorrect: false }], difficulty: 'easy', marks: 1, negativeMarks: 0, timeLimit: 20, order: 2 },
        { id: 'q1_3', type: 'mcq', questionText: 'What is the output: (function(){ var a = b = 3; })(); console.log(typeof a, typeof b);', options: [{ id: 'a', text: '"undefined" "number"', isCorrect: true }, { id: 'b', text: '"number" "undefined"', isCorrect: false }, { id: 'c', text: '"number" "number"', isCorrect: false }, { id: 'd', text: '"undefined" "undefined"', isCorrect: false }], difficulty: 'hard', marks: 1, negativeMarks: 0, timeLimit: 35, order: 3 },
      ]
    },
    {
      id: 'qz_2', title: 'Weekly CSS Grid & Layout Masterclass',
      description: 'Evaluate your layout strategies, centering techniques, and grid constraints.',
      category: 'CSS', difficulty: 'medium',
      timeLimit: 5, passMarks: 1, totalMarks: 2, maxAttempts: 3,
      shuffleQuestions: false, shuffleOptions: false,
      showResult: true, leaderboardVisibility: true,
      allowReview: true, allowBackNavigation: true,
      autoSubmit: true, negativeMarking: 0,
      scheduledAt: null, archived: false, published: true,
      security: { fullscreenRequired: true, tabSwitchDetection: true, copyPasteBlock: true, rightClickBlock: true, devToolsDetection: true, violationLimit: 3 },
      createdAt: '2026-06-21T10:00:00Z', updatedAt: '2026-06-21T10:00:00Z',
      questions: [
        { id: 'q2_1', type: 'mcq', questionText: 'Which value of justify-content aligns items with equal space around them, but half-spaces on edges?', options: [{ id: 'a', text: 'space-between', isCorrect: false }, { id: 'b', text: 'space-around', isCorrect: true }, { id: 'c', text: 'space-evenly', isCorrect: false }, { id: 'd', text: 'stretch', isCorrect: false }], difficulty: 'medium', marks: 1, negativeMarks: 0, timeLimit: 25, order: 1 },
        { id: 'q2_2', type: 'mcq', questionText: 'How do you define a grid column to take twice the space of another?', options: [{ id: 'a', text: 'width: 2fr', isCorrect: false }, { id: 'b', text: 'grid-template-columns: 2fr 1fr', isCorrect: true }, { id: 'c', text: 'flex: 2', isCorrect: false }, { id: 'd', text: 'column-span: 2', isCorrect: false }], difficulty: 'medium', marks: 1, negativeMarks: 0, timeLimit: 20, order: 2 },
      ]
    },
  ],
  QuizResults: [],
  QuizAttempt: [],
  Violations: [],
  Notifications: [],
  EventRegistrations: [],
  WeeklyTasks: [
    { id: 'tsk_1', title: 'Glassmorphic Card Re-creation', description: 'Design and build a gorgeous glassmorphic product card using custom CSS shadows, dynamic HSL colors, and blur backdrops. Submit a single HTML file containing styles.', deadline: '2026-07-02T23:59:00Z', active: true },
    { id: 'tsk_2', title: 'Algorithm Optimization: Array Deduplication', description: 'Write an optimized JavaScript algorithm to deduplicate arrays with over 10,000 coordinates. Measure execution time and document benchmarks.', deadline: '2026-06-20T23:59:00Z', active: false },
  ],
  TaskSubmissions: [
    { id: 'sub_1', taskId: 'tsk_1', taskTitle: 'Glassmorphic Card Re-creation', userId: 'usr_2', userName: 'Jane Doe', fileName: 'jane-doe-card.html', submittedAt: '2026-06-26T14:20:00Z', status: 'Pending' },
    { id: 'sub_2', taskId: 'tsk_2', taskTitle: 'Algorithm Optimization', userId: 'usr_2', userName: 'Jane Doe', fileName: 'jane-dedupe-bench.js', submittedAt: '2026-06-19T10:10:00Z', status: 'Approved' },
  ],
  Announcements: [
    { id: 'ann_1', title: 'Club Recruitment 2026 Active!', content: 'We are officially open for new applications. Share the link with friends across departments who are passionate about design & engineering.', date: '2026-06-24', important: true },
    { id: 'ann_2', title: 'Vite & Frontend Ecosystem Seminar next Wednesday', content: 'Make sure to download files in the Resources panel before attending. We will construct a build pipeline from scratch.', date: '2026-06-22', important: false },
  ],
  JoinRequests: [
    { id: 'req_1', name: 'Bob Miller', department: 'Computer Science', college: 'Tech Institute of Technology', year: '2', phone: '+1 555-0199', email: 'bob@example.com', skills: 'Python, Basic HTML', interests: 'Backend Web Dev, Cyber Security', resume: 'bob-resume.pdf', status: 'Pending', submittedAt: '2026-06-25T16:00:00Z' },
    { id: 'req_2', name: 'Diana Prince', department: 'Computer Science', college: 'State University', year: '3', phone: '+1 555-0188', email: 'diana@example.com', skills: 'C++, Circuit Design, Microcontrollers', interests: 'Embedded Development, IoT systems', resume: 'diana-eng.pdf', status: 'Pending', submittedAt: '2026-06-26T09:40:00Z' },
  ],
  WeeklyWinners: [
    { id: 'win_1', name: 'Jane Doe', department: 'Computer Science', achievement: 'Winner of Glassmorphic Card Layout challenge (Task #1)', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', certificate: 'https://example.com/cert/glassmorphic-challenge' },
    { id: 'win_2', name: 'Alice Johnson', department: 'Computer Science', achievement: 'Fastest Deduplication Algorithm optimization (Task #2)', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', certificate: 'https://example.com/cert/deduplication-opt' },
  ],
  ContactMessages: [],
  CoreMembers: [
    { id: 'core_1', name: 'Athi', role: 'President', department: 'Computer Science', year: '4', email: 'Athi9080@.com', github: 'https://github.com', linkedin: 'https://www.linkedin.com/company/mindcraft-ai-vcet', photo: 'https://ui-avatars.com/api/?name=Athi&background=ff5500&color=fff' },
  ],
  JoinFormFields: [],
  Settings: {
    siteName: 'Mindcraft AI Club',
    academicYear: '2026-2027',
    registrationStatus: 'Open',
    adminEmail: 'admin@club.com',
    announcementBanner: 'Welcome to Mindcraft AI. Check upcoming events for registrations.',
    projectsCount: 40,
    eventsCount: 18,
    awardsCount: 6
  }
};

const ADMIN_EMAILS = ['mindcraftaiclub@gmail.com', 'admin@club.com', 'athi9080@.com'];

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

const DB_PREFIX = 'mindcraft_fb_fallback_v5_';

const getLocalStorageCollection = (collectionName) => {
  try {
    const data = localStorage.getItem(DB_PREFIX + collectionName);
    if (data) return JSON.parse(data);
  } catch { /* ignore */ }
  if (initialCollections[collectionName]) {
    return JSON.parse(JSON.stringify(initialCollections[collectionName]));
  }
  return [];
};

const setLocalStorageCollection = (collectionName, data) => {
  try {
    localStorage.setItem(DB_PREFIX + collectionName, JSON.stringify(data));
  } catch { /* ignore */ }
};

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
            await setDoc(doc(firestore, 'Settings', 'global_settings'), list);
          } else {
            const colRef = collection(firestore, key);
            for (const item of list) {
              await setDoc(doc(colRef, item.id), item);
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
            if (userProfile) {
              const oldId = userProfile.id;
              userProfile.id = firebaseUser.uid;
              try {
                await setDoc(doc(firestore, 'Users', firebaseUser.uid), userProfile);
                try {
                  await deleteDoc(doc(firestore, 'Users', oldId));
                } catch (delErr) {
                  console.warn("Could not delete old user doc:", delErr);
                }
              } catch (e) {
                console.warn("Firestore link failed, updating locally:", e);
                const localData = getLocalStorageCollection('Users');
                const filtered = localData.filter(u => u.id !== oldId && u.id !== firebaseUser.uid);
                filtered.push(userProfile);
                setLocalStorageCollection('Users', filtered);
              }
            } else {
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

  async find(collectionName) {
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
        if (deletedIds.includes(item.id) || item.isDeleted === true) return false;
        if (collectionName === 'Users' && item.email && deletedEmails.includes(item.email.toLowerCase().trim())) {
          return false;
        }
        return true;
      });
      if (collectionName === 'QuizResults') {
        const dummyIds = ['qr_1', 'qr_2', 'qr_3'];
        return deduplicateUsers(filtered.filter(item => !dummyIds.includes(item.id)));
      }
      return deduplicateUsers(filtered);
    } catch (error) {
      console.warn(`find(${collectionName}) failed, using fallback:`, error.message);
      const localData = getLocalStorageCollection(collectionName);
      const deletedIds = getDeletedIds();
      const deletedEmails = getDeletedEmails();
      const filtered = localData.filter(item => {
        if (deletedIds.includes(item.id) || item.isDeleted === true) return false;
        if (collectionName === 'Users' && item.email && deletedEmails.includes(item.email.toLowerCase().trim())) {
          return false;
        }
        return true;
      });
      if (collectionName === 'QuizResults') {
        const dummyIds = ['qr_1', 'qr_2', 'qr_3'];
        return deduplicateUsers(filtered.filter(item => !dummyIds.includes(item.id)));
      }
      return deduplicateUsers(filtered);
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
    try {
      await setDoc(doc(firestore, collectionName, record.id), record);
      return record;
    } catch (error) {
      console.warn(`insert(${collectionName}) failed, using fallback:`, error.message);
      const items = getLocalStorageCollection(collectionName);
      items.push(record);
      setLocalStorageCollection(collectionName, items);
      return record;
    }
  }

  async update(collectionName, id, updates) {
    try {
      const docRef = doc(firestore, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error(`Record ${id} not found in ${collectionName}`);
      const updatedData = { ...updates, updatedAt: new Date().toISOString() };
      await updateDoc(docRef, updatedData);
      const finalDoc = { ...docSnap.data(), ...updatedData, id };
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === id) {
        localStorage.setItem('aether_user_session', JSON.stringify(finalDoc));
        this.authListeners.forEach(listener => listener(finalDoc, auth.currentUser));
      }
      return finalDoc;
    } catch (error) {
      console.warn(`update(${collectionName}, ${id}) failed, using fallback:`, error.message);
      const items = getLocalStorageCollection(collectionName);
      const idx = items.findIndex(item => item.id === id);
      if (idx === -1) throw new Error(`Record ${id} not found in fallback`);
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
        } catch { throw new Error('Could not create account. Please try again.'); }
      }

      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') throw new Error('Invalid email or password.');
      if (err.code === 'auth/too-many-requests') throw new Error('Too many attempts. Please try again later.');
      throw new Error(err.message || 'Login failed.');
    }
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      let userProfile = await this.findOne('Users', { id: firebaseUser.uid });
      if (!userProfile) {
        userProfile = await this.findOne('Users', { email: firebaseUser.email });
        if (userProfile) {
          const oldId = userProfile.id;
          userProfile.id = firebaseUser.uid;
          try {
            await setDoc(doc(firestore, 'Users', firebaseUser.uid), userProfile);
            try {
              await deleteDoc(doc(firestore, 'Users', oldId));
            } catch (delErr) {
              console.warn("Could not delete old user doc:", delErr);
            }
          } catch (e) {
            console.warn("Firestore link failed, updating locally:", e);
            const localData = getLocalStorageCollection('Users');
            const filtered = localData.filter(u => u.id !== oldId && u.id !== firebaseUser.uid);
            filtered.push(userProfile);
            setLocalStorageCollection('Users', filtered);
          }
        } else {
          await signOut(auth);
          throw new Error('NOT_REGISTERED');
        }
      }
      if (firebaseUser.photoURL && userProfile.photo !== firebaseUser.photoURL) {
        userProfile.photo = firebaseUser.photoURL;
        try {
          await setDoc(doc(firestore, 'Users', userProfile.id), { photo: firebaseUser.photoURL }, { merge: true });
        } catch {
          const localData = getLocalStorageCollection('Users');
          const idx = localData.findIndex(u => u.id === userProfile.id);
          if (idx !== -1) { localData[idx].photo = firebaseUser.photoURL; setLocalStorageCollection('Users', localData); }
        }
      }
      localStorage.setItem('aether_user_session', JSON.stringify(userProfile));
      localStorage.setItem('aether_jwt_token', `firebase.${btoa(JSON.stringify(userProfile))}.signature`);
      return { user: userProfile };
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') throw new Error('Sign-in popup was closed.');
      throw new Error(error.message || 'Google sign-in failed.');
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
      } catch {}
      return initialCollections.Settings;
    }
  }

  async updateSettings(updates) {
    try {
      const docRef = doc(firestore, 'Settings', 'global_settings');
      await setDoc(docRef, updates, { merge: true });
      try {
        localStorage.setItem('mindcraft_settings', JSON.stringify(updates));
      } catch {}
      return updates;
    } catch (e) {
      console.warn("updateSettings failed, using local fallback:", e.message);
      try {
        localStorage.setItem('mindcraft_settings', JSON.stringify(updates));
      } catch {}
      return updates;
    }
  }
}

const db = new FirebaseDatabase();
window.db = db;
export default db;
