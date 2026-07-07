import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Setup file paths for ES Module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Parse .env file manually to avoid external dependencies
const envPath = path.join(__dirname, '.env');
const envConfig = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      envConfig[key] = val;
    }
  });
} else {
  console.error('Error: .env file not found in the root directory.');
  process.exit(1);
}

// 2. Extract Firebase Config from parsed .env
const firebaseConfig = {
  apiKey: envConfig.VITE_FIREBASE_API_KEY,
  authDomain: envConfig.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envConfig.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envConfig.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envConfig.VITE_FIREBASE_APP_ID,
  measurementId: envConfig.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if project ID is defined
if (!firebaseConfig.projectId) {
  console.error('Error: VITE_FIREBASE_PROJECT_ID is not defined in your .env file.');
  process.exit(1);
}

console.log(`Connecting to Firebase Project: ${firebaseConfig.projectId}...`);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3. Define collections to clear (EXCLUDING Gallery and Events)
const COLLECTIONS_TO_CLEAR = [
  'Users',
  'Resources',
  'Quiz',
  'QuizResults',
  'WeeklyTasks',
  'TaskSubmissions',
  'Announcements',
  'EventRegistrations',
  'Notifications',
  'JoinRequests',
  'WeeklyWinners',
  'CoreMembers',
  'JoinFormFields',
  'Settings'
];

async function clearCollections() {
  console.log('\n--- START DATABASE CLEANUP ---');
  
  let adminUid = null;
  try {
    const auth = getAuth(app);
    console.log('Authenticating as Admin (mindcraftaiclub@gmail.com)...');
    const userCredential = await signInWithEmailAndPassword(auth, 'mindcraftaiclub@gmail.com', 'Mind2025@');
    adminUid = userCredential.user.uid;
    console.log('Authentication Successful! UID:', adminUid);

    // Assert admin profile document exists in Firestore to ensure permission
    console.log('Asserting Admin profile in Users collection...');
    await setDoc(doc(db, 'Users', adminUid), {
      id: adminUid,
      name: 'Admin',
      email: userCredential.user.email,
      role: 'admin',
      department: 'Computer Science',
      year: '1',
      position: 'Member',
      skills: [],
      verified: true
    });
    console.log('Admin profile successfully asserted.');
  } catch (authError) {
    console.error('Authentication/Assertion Failed:', authError.message);
    console.error('Continuing without authentication (this may fail if security rules block it)...');
  }
  
  for (const colName of COLLECTIONS_TO_CLEAR) {
    try {
      console.log(`Clearing collection: ${colName}...`);
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      
      if (snapshot.empty) {
        console.log(`  Collection ${colName} is already empty.`);
        continue;
      }

      let deletedCount = 0;
      for (const document of snapshot.docs) {
        if (colName === 'Users' && document.id === adminUid) {
          console.log(`  Skipping Admin profile document: ${document.id}`);
          continue;
        }
        await deleteDoc(doc(db, colName, document.id));
        deletedCount++;
      }
      console.log(`  Successfully deleted ${deletedCount} documents from ${colName}.`);
    } catch (error) {
      console.error(`  Error clearing collection ${colName}:`, error.message);
    }
  }

  console.log('\n--- CLEANUP COMPLETE (EXCLUDED: Events & Gallery) ---');
  process.exit(0);
}

clearCollections();
