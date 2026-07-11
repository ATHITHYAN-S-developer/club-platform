import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
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
  onSnapshot
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
    {
      id: 'qz_rag_1', title: 'AI Foundations',
      description: 'Test your understanding of AI fundamentals, ML paradigms, and the Python ecosystem.',
      category: 'AI/ML', difficulty: 'easy',
      timeLimit: 10, passMarks: 3, totalMarks: 5, maxAttempts: 3,
      shuffleQuestions: true, shuffleOptions: true,
      showResult: true, leaderboardVisibility: true,
      allowReview: true, allowBackNavigation: true,
      autoSubmit: true, negativeMarking: 0,
      scheduledAt: null, archived: false, published: true,
      security: { fullscreenRequired: false, tabSwitchDetection: true, copyPasteBlock: true, rightClickBlock: true, devToolsDetection: true, violationLimit: 3 },
      createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z',
      questions: [
        { id: 'qa_1', type: 'mcq', questionText: 'What is the main goal of supervised learning?', options: [{ id: 'a', text: 'Learn hidden patterns without labels', isCorrect: false }, { id: 'b', text: 'Predict labels from labeled training data', isCorrect: true }, { id: 'c', text: 'Cluster data into groups', isCorrect: false }, { id: 'd', text: 'Reduce dimensionality', isCorrect: false }], difficulty: 'easy', marks: 1, negativeMarks: 0, timeLimit: 30, order: 1 },
        { id: 'qa_2', type: 'mcq', questionText: 'Which Python library is primarily used for numerical computing?', options: [{ id: 'a', text: 'Requests', isCorrect: false }, { id: 'b', text: 'NumPy', isCorrect: true }, { id: 'c', text: 'BeautifulSoup', isCorrect: false }, { id: 'd', text: 'Flask', isCorrect: false }], difficulty: 'easy', marks: 1, negativeMarks: 0, timeLimit: 20, order: 2 },
        { id: 'qa_3', type: 'mcq', questionText: 'What is the role of an activation function in a neural network?', options: [{ id: 'a', text: 'Initialize weights', isCorrect: false }, { id: 'b', text: 'Introduce non-linearity', isCorrect: true }, { id: 'c', text: 'Reduce overfitting', isCorrect: false }, { id: 'd', text: 'Normalize inputs', isCorrect: false }], difficulty: 'medium', marks: 1, negativeMarks: 0, timeLimit: 25, order: 3 },
        { id: 'qa_4', type: 'mcq', questionText: 'What does the term "overfitting" mean?', options: [{ id: 'a', text: 'Model performs well on new data', isCorrect: false }, { id: 'b', text: 'Model memorizes training data but fails on new data', isCorrect: true }, { id: 'c', text: 'Model is too simple', isCorrect: false }, { id: 'd', text: 'Model has too few parameters', isCorrect: false }], difficulty: 'easy', marks: 1, negativeMarks: 0, timeLimit: 20, order: 4 },
        { id: 'qa_5', type: 'mcq', questionText: 'Which metric is commonly used for classification model evaluation?', options: [{ id: 'a', text: 'Mean Squared Error', isCorrect: false }, { id: 'b', text: 'R-squared', isCorrect: false }, { id: 'c', text: 'F1 Score', isCorrect: true }, { id: 'd', text: 'Perplexity', isCorrect: false }], difficulty: 'medium', marks: 1, negativeMarks: 0, timeLimit: 25, order: 5 },
      ]
    },
    {
      id: 'qz_rag_2', title: 'LangChain & RAG',
      description: 'Evaluate your knowledge of LangChain framework and Retrieval-Augmented Generation systems.',
      category: 'RAG', difficulty: 'medium',
      timeLimit: 10, passMarks: 3, totalMarks: 5, maxAttempts: 3,
      shuffleQuestions: true, shuffleOptions: true,
      showResult: true, leaderboardVisibility: true,
      allowReview: true, allowBackNavigation: true,
      autoSubmit: true, negativeMarking: 0,
      scheduledAt: null, archived: false, published: true,
      security: { fullscreenRequired: false, tabSwitchDetection: true, copyPasteBlock: true, rightClickBlock: true, devToolsDetection: true, violationLimit: 3 },
      createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z',
      questions: [
        { id: 'qb_1', type: 'mcq', questionText: 'What does RAG stand for?', options: [{ id: 'a', text: 'Random Access Generation', isCorrect: false }, { id: 'b', text: 'Retrieval-Augmented Generation', isCorrect: true }, { id: 'c', text: 'Recurrent Analysis Gradient', isCorrect: false }, { id: 'd', text: 'Rapid Algorithm Generator', isCorrect: false }], difficulty: 'easy', marks: 1, negativeMarks: 0, timeLimit: 15, order: 1 },
        { id: 'qb_2', type: 'mcq', questionText: 'What is the primary purpose of a vector store in RAG?', options: [{ id: 'a', text: 'Store raw documents', isCorrect: false }, { id: 'b', text: 'Store and retrieve embeddings by similarity', isCorrect: true }, { id: 'c', text: 'Cache LLM responses', isCorrect: false }, { id: 'd', text: 'Tokenize input text', isCorrect: false }], difficulty: 'easy', marks: 1, negativeMarks: 0, timeLimit: 20, order: 2 },
        { id: 'qb_3', type: 'mcq', questionText: 'In LangChain, what is a "chain"?', options: [{ id: 'a', text: 'A sequence of LLM calls or operations', isCorrect: true }, { id: 'b', text: 'A data structure for vector search', isCorrect: false }, { id: 'c', text: 'A type of prompt template', isCorrect: false }, { id: 'd', text: 'A model fine-tuning method', isCorrect: false }], difficulty: 'medium', marks: 1, negativeMarks: 0, timeLimit: 25, order: 3 },
        { id: 'qb_4', type: 'mcq', questionText: 'Which embedding model property is most important for retrieval quality?', options: [{ id: 'a', text: 'Model size in parameters', isCorrect: false }, { id: 'b', text: 'Semantic similarity capture', isCorrect: true }, { id: 'c', text: 'Inference speed', isCorrect: false }, { id: 'd', text: 'Training data recency', isCorrect: false }], difficulty: 'medium', marks: 1, negativeMarks: 0, timeLimit: 25, order: 4 },
        { id: 'qb_5', type: 'mcq', questionText: 'What technique helps RAG handle queries beyond the context window?', options: [{ id: 'a', text: 'Model fine-tuning', isCorrect: false }, { id: 'b', text: 'Document chunking and retrieval', isCorrect: true }, { id: 'c', text: 'Prompt compression', isCorrect: false }, { id: 'd', text: 'Beam search', isCorrect: false }], difficulty: 'medium', marks: 1, negativeMarks: 0, timeLimit: 30, order: 5 },
      ]
    },
  ],
  QuizResults: [],
  QuizAttempt: [],
  Violations: [],
  Notifications: [],
  EventRegistrations: [],
  WeeklyTasks: [],
  TaskSubmissions: [],
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
  Tasks: [],
  Challenges: [
    {
      id: 'chal_1',
      title: 'Sum of Array',
      description: 'Given an integer N followed by N integers, compute and print the sum of all N integers.',
      difficulty: 'easy',
      category: 'Coding',
      tags: ['arrays', 'math', 'basics'],
      constraints: '1 <= N <= 1000\n-10^6 <= arr[i] <= 10^6',
      inputFormat: 'The first line contains a single integer N.\nThe second line contains N space-separated integers.',
      outputFormat: 'Print a single integer — the sum of all N integers.',
      sampleTestCases: [
        {
          input: '5\n1 2 3 4 5',
          output: '15',
          explanation: '1 + 2 + 3 + 4 + 5 = 15.'
        }
      ],
      hiddenTestCases: [
        {
          input: '3\n10 -5 8',
          expectedOutput: '13'
        },
        {
          input: '1\n42',
          expectedOutput: '42'
        }
      ],
      starterCode: {
        python: 'def solve(readline):\n    n = int(readline())\n    nums = list(map(int, readline().split()))\n    total = sum(nums)\n    print(total)\n',
        javascript: 'const n = parseInt(readline());\nconst nums = readline().split(\' \').map(Number);\nconst total = nums.reduce((a, b) => a + b, 0);\nconsole.log(total);\n'
      },
      supportedLanguages: ['python', 'javascript'],
      timeLimit: 5,
      memoryLimit: 128,
      xpReward: 30,
      isDailyChallenge: false,
      challengeDate: '',
      status: 'published',
      createdAt: '2026-07-08T00:00:00Z',
      updatedAt: '2026-07-08T00:00:00Z'
    },
    {
      id: 'chal_2',
      title: 'Reverse a String',
      description: 'Read a string from input and print it reversed.',
      difficulty: 'easy',
      category: 'Coding',
      tags: ['strings', 'basics'],
      constraints: '1 <= string length <= 1000\nThe string contains only printable ASCII characters.',
      inputFormat: 'A single line containing a string.',
      outputFormat: 'Print the reversed string.',
      sampleTestCases: [
        {
          input: 'hello',
          output: 'olleh',
          explanation: 'Reversing "hello" gives "olleh".'
        }
      ],
      hiddenTestCases: [
        {
          input: 'MindCraft AI',
          expectedOutput: 'IA tfarCidniM'
        },
        {
          input: 'a',
          expectedOutput: 'a'
        }
      ],
      starterCode: {
        python: 'def solve(readline):\n    s = readline()\n    print(s[::-1])\n',
        javascript: 'const s = readline();\nconsole.log(s.split(\'\').reverse().join(\'\'));\n'
      },
      supportedLanguages: ['python', 'javascript'],
      timeLimit: 5,
      memoryLimit: 128,
      xpReward: 30,
      isDailyChallenge: false,
      challengeDate: '',
      status: 'published',
      createdAt: '2026-07-08T00:00:00Z',
      updatedAt: '2026-07-08T00:00:00Z'
    },
    {
      id: 'chal_3',
      title: 'Find the Maximum',
      description: 'Given an integer N followed by N integers, find and print the maximum value.',
      difficulty: 'easy',
      category: 'Coding',
      tags: ['arrays', 'search', 'basics'],
      constraints: '1 <= N <= 1000\n-10^6 <= arr[i] <= 10^6',
      inputFormat: 'The first line contains a single integer N.\nThe second line contains N space-separated integers.',
      outputFormat: 'Print a single integer — the maximum value in the array.',
      sampleTestCases: [
        {
          input: '5\n3 7 2 9 1',
          output: '9',
          explanation: 'The largest number in [3, 7, 2, 9, 1] is 9.'
        }
      ],
      hiddenTestCases: [
        {
          input: '4\n-5 -2 -8 -1',
          expectedOutput: '-1'
        },
        {
          input: '1\n100',
          expectedOutput: '100'
        }
      ],
      starterCode: {
        python: 'def solve(readline):\n    n = int(readline())\n    nums = list(map(int, readline().split()))\n    print(max(nums))\n',
        javascript: 'const n = parseInt(readline());\nconst nums = readline().split(\' \').map(Number);\nconsole.log(Math.max(...nums));\n'
      },
      supportedLanguages: ['python', 'javascript'],
      timeLimit: 5,
      memoryLimit: 128,
      xpReward: 30,
      isDailyChallenge: false,
      challengeDate: '',
      status: 'published',
      createdAt: '2026-07-08T00:00:00Z',
      updatedAt: '2026-07-08T00:00:00Z'
    },
    {
      id: 'chal_rag_1',
      title: 'AI-Assisted API Development',
      description: 'Use AI coding assistants to build a REST API that performs text analysis using a pre-trained model. The API should accept text input and return sentiment analysis results.\n\nFocus on leveraging AI tools effectively while maintaining clean, production-quality code.',
      difficulty: 'easy',
      category: 'Coding',
      tags: ['ai', 'api', 'python', 'fastapi'],
      constraints: 'API must have at least 3 endpoints (health, analyze, batch)\nMust include error handling\nMust include request validation',
      inputFormat: 'POST /analyze with JSON body: {"text": "..."}\nPOST /batch with JSON body: {"texts": ["...", "..."]}',
      outputFormat: 'Return JSON with { sentiment: "positive"|"negative"|"neutral", confidence: 0.95, text: "..." }',
      sampleTestCases: [
        { input: 'POST /analyze {"text": "I love this product!"}', output: '{"sentiment": "positive", "confidence": 0.98}', explanation: 'Positive text should return positive sentiment with high confidence.' }
      ],
      hiddenTestCases: [
        { input: 'POST /analyze {"text": "This is terrible"}', expectedOutput: '{"sentiment": "negative", "confidence": 0.85}' },
        { input: 'GET /health', expectedOutput: '{"status": "ok"}' }
      ],
      starterCode: { python: 'from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass TextInput(BaseModel):\n    text: str\n\n\n@app.get("/health")\nasync def health_check():\n    return {"status": "ok"}\n', javascript: '// Express.js equivalent\nconst express = require("express");\nconst app = express();\napp.use(express.json());\n\napp.get("/health", (req, res) => {\n  res.json({ status: "ok" });\n});\n\nconst PORT = process.env.PORT || 3000;\napp.listen(PORT, () => console.log(`Running on ${PORT}`));\n' },
      supportedLanguages: ['python', 'javascript'],
      timeLimit: 20,
      memoryLimit: 256,
      xpReward: 100,
      isDailyChallenge: false,
      challengeDate: '',
      status: 'published',
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-01T00:00:00Z'
    },
    {
      id: 'chal_rag_2',
      title: 'AI-Powered Text Classification',
      description: 'Build a text classification system using HuggingFace Transformers. Your solution should load a pre-trained model, preprocess input text, and classify it into predefined categories.',
      difficulty: 'easy',
      category: 'Coding',
      tags: ['nlp', 'transformers', 'huggingface', 'classification'],
      constraints: 'Must use a model from HuggingFace hub\nMust support at least 3 categories\nMust return confidence scores',
      inputFormat: 'Read a line of text from stdin.\nThe text is a sentence to classify.',
      outputFormat: 'Print the predicted category and confidence score, separated by a space.',
      sampleTestCases: [
        { input: 'The weather today is beautiful', output: 'positive 0.96', explanation: 'Classify sentiment as positive with confidence score.' }
      ],
      hiddenTestCases: [
        { input: 'This movie was boring and predictable', expectedOutput: 'negative 0.91' },
        { input: 'The package arrived on time', expectedOutput: 'neutral 0.78' }
      ],
      starterCode: { python: 'from transformers import pipeline\n\ndef solve(readline):\n    text = readline()\n    classifier = pipeline("sentiment-analysis")\n    result = classifier(text)[0]\n    print(f\'{result["label"].lower()} {result["score"]:.2f}\')\n', javascript: '// Uses HuggingFace Inference API\nasync function solve(readline) {\n  const text = readline();\n  const response = await fetch(\n    "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",\n    {\n      headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },\n      method: "POST",\n      body: JSON.stringify({ inputs: text }),\n    }\n  );\n  const result = await response.json();\n  console.log(result[0][0].label.toLowerCase(), result[0][0].score.toFixed(2));\n}\n' },
      supportedLanguages: ['python', 'javascript'],
      timeLimit: 20,
      memoryLimit: 256,
      xpReward: 100,
      isDailyChallenge: false,
      challengeDate: '',
      status: 'published',
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-01T00:00:00Z'
    },
    {
      id: 'chal_rag_3',
      title: 'Build a RAG Pipeline',
      description: 'Build a complete Retrieval-Augmented Generation pipeline. Your solution should load documents, create embeddings, store them in a vector store, and answer questions based on the retrieved context.',
      difficulty: 'medium',
      category: 'Coding',
      tags: ['rag', 'langchain', 'embeddings', 'vectorstore'],
      constraints: 'Must support at least 3 source documents\nMust return answer with source citation\nMust handle out-of-scope queries gracefully',
      inputFormat: 'Read a query string from stdin.',
      outputFormat: 'Print the answer followed by the source document name in brackets.',
      sampleTestCases: [
        { input: 'What is RAG?', output: 'Retrieval-Augmented Generation is a technique that combines retrieval from a knowledge base with text generation. [ai_guide.txt]', explanation: 'Answer should include retrieved information and source citation.' }
      ],
      hiddenTestCases: [
        { input: 'Explain embeddings', expectedOutput: 'Embeddings are dense vector representations of text that capture semantic meaning. [embeddings_doc.txt]' },
        { input: 'Who invented transformers', expectedOutput: 'The transformer architecture was introduced in the paper "Attention is All You Need" by Vaswani et al. (2017). [architectures.txt]' }
      ],
      starterCode: { python: 'from langchain_community.vectorstores import FAISS\nfrom langchain_community.embeddings import HuggingFaceEmbeddings\n\ndef solve(readline):\n    query = readline()\n    # Load vector store and query\n    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")\n    # Implementation here\n    print("Answer [source.txt]")\n', javascript: '' },
      supportedLanguages: ['python'],
      timeLimit: 30,
      memoryLimit: 512,
      xpReward: 150,
      isDailyChallenge: false,
      challengeDate: '',
      status: 'published',
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-01T00:00:00Z'
    },
    {
      id: 'chal_rag_4',
      title: 'Deploy a RAG Application',
      description: 'Deploy the RAG pipeline you built as a web application. Containerize it with Docker, deploy to a cloud platform, and set up CI/CD.',
      difficulty: 'hard',
      category: 'GitHub',
      tags: ['deployment', 'docker', 'devops', 'rag'],
      constraints: 'Must include Dockerfile and docker-compose.yml\nMust include GitHub Actions CI/CD\nMust include health check endpoint\nApp must be publicly accessible',
      inputFormat: '',
      outputFormat: '',
      sampleTestCases: [],
      hiddenTestCases: [],
      starterCode: { python: '# Provide your Dockerfile and application code\n# The grader will check for:\n# 1. Dockerfile exists\n# 2. docker-compose.yml exists\n# 3. /health returns 200\n# 4. /query endpoint works\n', javascript: '' },
      supportedLanguages: ['python'],
      timeLimit: 60,
      memoryLimit: 512,
      xpReward: 150,
      isDailyChallenge: false,
      challengeDate: '',
      status: 'published',
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-01T00:00:00Z'
    },
    {
      id: 'chal_rag_5',
      title: 'Advanced RAG with Hybrid Search',
      description: 'Implement hybrid search combining dense embeddings and sparse (BM25) retrieval. Add re-ranking to improve result quality.',
      difficulty: 'medium',
      category: 'Coding',
      tags: ['rag', 'hybrid-search', 'bm25', 'reranking'],
      constraints: 'Must implement both dense and sparse retrieval\nMust implement a re-ranking step\nMust compare performance of hybrid vs pure dense',
      inputFormat: 'Read a search query and k (number of results).',
      outputFormat: 'Print k results with: document ID, score, and retrieval method marker [DENSE|SPARSE|HYBRID].',
      sampleTestCases: [
        { input: 'machine learning basics\n3', output: 'doc_003 0.92 [HYBRID]\ndoc_001 0.87 [HYBRID]\ndoc_005 0.76 [HYBRID]', explanation: 'Return top 3 results with hybrid search scores.' }
      ],
      hiddenTestCases: [
        { input: 'transformer architecture\n2', expectedOutput: 'doc_012 0.95 [HYBRID]\ndoc_008 0.89 [HYBRID]' }
      ],
      starterCode: { python: 'import numpy as np\nfrom rank_bm25 import BM25Okapi\n\ndef solve(readline):\n    query = readline()\n    k = int(readline())\n    # Implement hybrid search here\n    pass\n', javascript: '' },
      supportedLanguages: ['python'],
      timeLimit: 30,
      memoryLimit: 512,
      xpReward: 100,
      isDailyChallenge: false,
      challengeDate: '',
      status: 'published',
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-01T00:00:00Z'
    },
    {
      id: 'chal_rag_6',
      title: 'Build an AI Agent',
      description: 'Build an autonomous AI agent that can research topics, summarize findings, and answer questions using tools like web search, calculator, and document reader.',
      difficulty: 'hard',
      category: 'GitHub',
      tags: ['agents', 'langchain', 'tools', 'autonomous'],
      constraints: 'Agent must use at least 3 tools\nMust implement memory\nMust handle errors gracefully\nMust provide source attribution',
      inputFormat: '',
      outputFormat: '',
      sampleTestCases: [],
      hiddenTestCases: [],
      starterCode: { python: 'from langchain.agents import Tool, AgentExecutor, create_react_agent\nfrom langchain_openai import ChatOpenAI\n\n# Define tools and agent here\n', javascript: '' },
      supportedLanguages: ['python'],
      timeLimit: 45,
      memoryLimit: 512,
      xpReward: 150,
      isDailyChallenge: false,
      challengeDate: '',
      status: 'published',
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-01T00:00:00Z'
    },
    {
      id: 'chal_rag_7',
      title: 'MCP Workflow Automation',
      description: 'Build an automated workflow using n8n or LangGraph that connects multiple AI services and data sources. The workflow should process data, apply AI transformations, and produce a final output.',
      difficulty: 'hard',
      category: 'GitHub',
      tags: ['automation', 'mcp', 'n8n', 'workflow'],
      constraints: 'Workflow must have at least 5 nodes\nMust include an AI/LLM node\nMust include data transformation\nMust include conditional branching\nExport workflow as JSON',
      inputFormat: '',
      outputFormat: '',
      sampleTestCases: [],
      hiddenTestCases: [],
      starterCode: { python: '# Export your n8n workflow JSON\n# or implement a LangGraph workflow\nfrom langgraph.graph import StateGraph\n\n# Define your workflow graph here\n', javascript: '' },
      supportedLanguages: ['python'],
      timeLimit: 45,
      memoryLimit: 512,
      xpReward: 150,
      isDailyChallenge: false,
      challengeDate: '',
      status: 'published',
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-01T00:00:00Z'
    },
    {
      id: 'chal_rag_8',
      title: 'Multimodal Search System',
      description: 'Build a multimodal search system that can search across images and text using CLIP embeddings. Users should be able to search with either text or an image query.',
      difficulty: 'medium',
      category: 'Coding',
      tags: ['multimodal', 'clip', 'embeddings', 'search'],
      constraints: 'Must support text-to-image and image-to-image search\nMust use CLIP or similar multimodal embeddings\nMust return ranked results with similarity scores',
      inputFormat: 'Read query type ("text" or "image") and query content.',
      outputFormat: 'Print top 5 image filenames with similarity scores.',
      sampleTestCases: [
        { input: 'text\na cat sitting on a couch', output: 'cat_003.jpg 0.93\ncat_001.jpg 0.88\ncat_007.jpg 0.82\npet_002.jpg 0.76\nanimal_005.jpg 0.71', explanation: 'Return top 5 matching images for text query.' }
      ],
      hiddenTestCases: [],
      starterCode: { python: 'import torch\nfrom PIL import Image\nfrom transformers import CLIPProcessor, CLIPModel\n\ndef solve(readline):\n    query_type = readline()\n    query = readline()\n    # Implement multimodal search here\n    pass\n', javascript: '' },
      supportedLanguages: ['python'],
      timeLimit: 30,
      memoryLimit: 512,
      xpReward: 100,
      isDailyChallenge: false,
      challengeDate: '',
      status: 'published',
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-01T00:00:00Z'
    },
    {
      id: 'chal_rag_9',
      title: 'Production AI Serving',
      description: 'Set up a production-grade model serving infrastructure. Serve a quantized model with BentoML, add monitoring with Prometheus metrics, and implement A/B testing between two model versions.',
      difficulty: 'hard',
      category: 'GitHub',
      tags: ['mlops', 'serving', 'monitoring', 'production'],
      constraints: 'Must serve at least 2 model versions\nMust expose Prometheus metrics\nMust include A/B testing routing\nMust include load testing script\nMust include deployment configuration',
      inputFormat: '',
      outputFormat: '',
      sampleTestCases: [],
      hiddenTestCases: [],
      starterCode: { python: 'import bentoml\nfrom bentoml.io import JSON\n\n# Define your serving service here\n', javascript: '' },
      supportedLanguages: ['python'],
      timeLimit: 60,
      memoryLimit: 1024,
      xpReward: 150,
      isDailyChallenge: false,
      challengeDate: '',
      status: 'published',
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-01T00:00:00Z'
    }
  ],
  ChallengeSubmissions: [],
  ChallengeLeaderboard: [
    {
      id: 'cl_overall',
      period: 'overall',
      rankings: [
        { userId: 'u_1', userName: 'Athithyan S', photo: 'https://ui-avatars.com/api/?name=Athithyan+S&background=ff5500&color=fff', totalScore: 920, accuracy: 100, avgTime: 120, attempts: 1, streak: 8, badges: ['first_challenge', 'streak_7'] },
        { userId: 'u_2', userName: 'Mithres P', photo: 'https://ui-avatars.com/api/?name=Mithres+P&background=ff5500&color=fff', totalScore: 840, accuracy: 100, avgTime: 180, attempts: 1, streak: 4, badges: ['first_challenge'] }
      ]
    }
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
      return () => {};
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
      return () => {};
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
      if (!docSnap.exists()) { const e = new Error(`Record ${id} not found in ${collectionName}`); e.code = 'NOT_FOUND'; throw e; }
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
      if (idx === -1) { const e = new Error(`Record ${id} not found in fallback`); e.code = 'NOT_FOUND'; throw e; }
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
