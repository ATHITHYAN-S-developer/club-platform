# Plan: Leaderboard — Dedicated Collection + Role-Based Auth + Real-Time

## Architecture Overview

```
QuizPlayer (submit) 
  → resultService.saveResult()          → QuizResults collection (history)
  → leaderboardService.saveEntry()      → "leaderboard" collection (display)
    → recalculateRanks(quizId)           → updates rank field on all entries for that quiz

Leaderboard page        → subscribeCollection("leaderboard")  → real-time display
Admin leaderboard tab   → subscribeCollection("leaderboard")  → real-time display + CRUD
ResultView              → query leaderboard by userId+quizId  → show rank
Dashboard               → query leaderboard by userId          → show rank summary
```

---

## Leaderboard Collection Schema

Collection name: **`leaderboard`**

Each document = one user's best attempt per quiz:

```
{
  id: string,
  userId: string,
  userName: string,
  userEmail: string,
  userPhoto: string,
  userDepartment: string,
  userCollege: string,
  quizId: string,
  quizTitle: string,
  quizCategory: string,
  score: number,
  total: number,
  percentage: number,
  accuracy: number,
  timeTaken: number,        // seconds
  submittedAt: ISO string,
  rank: number,              // computed, updated after each submission
  badge: { name, icon, color } | null
}
```

**One entry per user per quiz** — if user retakes, only keep the attempt with the higher score%.

---

## Files to Modify

### 1. `src/db.js` — Add real-time onSnapshot subscription

- Import `onSnapshot` from `firebase/firestore`
- Add method `subscribeCollection(collectionName, onData, onError)`:
  - Calls `onSnapshot(collectionRef, snapshot => { ... apply deleted-ID filter ... onData(items) })`
  - Returns the unsubscribe function
  - On permission error, falls back to `setInterval` polling via `getDocs` (every 10s)

### 2. `src/services/leaderboardService.js` — Rewrite (was 55 lines)

New functions:

| Function | Description |
|----------|-------------|
| `saveEntry(data)` | Write/update entry in "leaderboard" collection (one per userId+quizId, keep best). Then calls `recalculateRanks(quizId)`. |
| `getEntries(quizId?)` | One-time fetch of leaderboard data (optional quiz filter). |
| `subscribeEntries(callback, errorCallback)` | Real-time onSnapshot subscription to entire "leaderboard" collection. Returns unsubscribe fn. |
| `recalculateRanks(quizId)` | Read all entries for quiz → sort (Score% desc, TimeTaken asc, SubmittedAt asc) → batch-update each doc's `rank` field. |
| `deleteEntry(id)` | Admin — delete single entry. |
| `clearQuiz(quizId)` | Admin — delete all entries for a quiz. |
| `clearAll()` | Admin — delete ALL leaderboard entries. |
| `getUserRank(userId, quizId)` | Return rank for a user in a specific quiz. |

All write methods try Firestore first, fall back to localStorage (existing `db.insert`/`db.delete` pattern).

### 3. `src/services/resultService.js` — Add leaderboard sync

- In `saveResult(data)`, after saving to QuizResults, call `leaderboardService.saveEntry(...)` with leaderboard-shaped data
- Import leaderboardService and call `saveEntry` with score, time, badge, etc.

### 4. `src/pages/Leaderboard.jsx` — Rewrite for real-time + member UX

- On mount: call `leaderboardService.subscribeEntries(callback)` → real-time state updates
- On unmount: call the returned unsubscribe fn
- **Empty state**: "🏆 No leaderboard data available yet. Complete a quiz to appear."
- **Podium**: top 3 with trophy icons (already done via LeaderboardPodium)
- **Stats bar**: participants count, avg score, highest score, avg accuracy, fastest time
- **Filters**: time filter (all/today/week/month) + quiz filter (dropdown)
- **Table**: rank, name, score, %, time taken, quiz name, submission date → uses LeaderboardTable component
- **Highlight my-row**: already in LeaderboardTable
- **Your Position card**: shown when user exists but rank > 10
- **No admin actions**: no delete, no clear, view-only

### 5. `src/pages/admin/LeaderboardAdmin.jsx` — Rewrite for same collection + CRUD

- On mount: call `leaderboardService.subscribeEntries(callback)` → real-time state updates
- **Admin actions**:
  - Delete single entry (per-row trash button)
  - Clear quiz leaderboard (dropdown select quiz → Clear Quiz button)
  - Clear all (Clear All button with confirmation)
  - Export CSV (download current filtered/sorted data as CSV)
- **Filters**: quiz filter dropdown, sort by (score/time)
- **Table**: rank, name, quiz, score (with %), time, date, action (delete)
- **Empty state**: "No results yet"

### 6. `src/components/quiz/ResultView.jsx` — Read rank from leaderboard

- Current code fetches all QuizResults and computes rank client-side
- Replace with: query `leaderboardService.getEntries(quizId)` → find user's entry with stored `rank`
- This is faster and uses the authoritative rank from the leaderboard collection

### 7. `src/components/quiz/QuizDashboard.jsx` — Show user's rank

- After loading results, also fetch leaderboard entries for this user via `leaderboardService.getEntries()`
- Show a **rank card** in the "Your Results" section displaying the user's best rank across quizzes
- If user has no entries, show nothing

### 8. `src/components/Sidebar.jsx` — Add leaderboard link

- Add `{ to: '/leaderboard', label: 'Leaderboard', icon: 'fa-ranking-star' }` to `navItems` array

---

## Firestore Security Rules (paste in Firebase Console)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null
        && get(/databases/$(database)/documents/Users/$(request.auth.uid)).data.role == 'admin';
    }

    // Leaderboard: read by all auth'd, write by all (for submission), delete by admin only
    match /leaderboard/{doc} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if isAdmin();
    }

    // QuizResults: read by all, create by all (submission), update/delete by admin only
    match /QuizResults/{doc} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Quiz: read by all, write by admin only
    match /Quiz/{doc} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // Users: read by all, user can update own, admin full access
    match /Users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == userId || isAdmin();
      allow delete: if isAdmin();
    }

    // Default: admin only
    match /{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## Data Flow Summary

```
┌──────────────┐     saveResult()     ┌──────────────┐
│  QuizPlayer  │ ──────────────────→  │  QuizResults  │  (history, MyResults)
│  (submit)    │                      └──────────────┘
└──────┬───────┘
       │ saveEntry() + recalculateRanks()
       ▼
┌──────────────┐     onSnapshot       ┌──────────────────┐
│  leaderboard  │ ←────────────────── │  Leaderboard.jsx  │  (member view)
│  collection   │                     └──────────────────┘
│               │     onSnapshot       ┌──────────────────────┐
│               │ ←────────────────── │  LeaderboardAdmin.jsx │  (admin CRUD)
└──────────────┘                     └──────────────────────┘
       │ query                        ┌──────────────┐
       ├─────────────────────────────→│  ResultView   │  (show rank)
       │ query                        └──────────────┘
       └─────────────────────────────→│  QuizDashboard│  (show rank summary)
                                      └──────────────┘
```

---

## Files NOT Changed

- `Header.jsx` — leaderboard link already present for all users
- `App.jsx` — route already correct at `/leaderboard` with `ProtectedRoute`
- `LeaderboardPodium.jsx` — works as-is with the data shape
- `LeaderboardTable.jsx` — works as-is (search, pagination, my-row highlight, badges)
- `QuizPlayer.jsx` — submission flow stays, `saveResult` internally triggers leaderboard sync
- `QuizPage.jsx` — no changes needed
- `MyResults.jsx` — still reads from QuizResults via `getUserResults`
- `MyBadges.jsx` — no changes needed

---

## Verification

1. `npm run build` — zero errors
2. Login as **member** → `/leaderboard` → see real-time data, no delete/clear buttons
3. Login as **admin** → `/leaderboard` → see same data + delete/clear/export buttons
4. Complete a quiz → leaderboard updates in real-time on all open pages
5. Result page shows correct rank
6. Dashboard shows rank summary
