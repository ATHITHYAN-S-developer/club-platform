# Plan: Task Management System (v2)

## Overview

A professional Task Management System, completely separate from the Quiz System. **Leaderboard is computed on-the-fly from approved submissions + user XP — no separate leaderboard collection.** Badges stored on user profile.

---

## Firestore Collections

### Keep (5 collections):
| Collection | Purpose |
|------------|---------|
| `Users` | Store XP, badges, streak on user profile (`xp`, `taskBadges`, `taskStreak` fields) |
| `Tasks` | Task definitions with all settings |
| `TaskSubmissions` | Student submissions (one per attempt) |
| `TaskReviews` | Admin reviews with per-criteria scores + feedback |
| `TaskXPHistory` | XP transaction log for audit trail |

### Removed (not needed):
| Collection | Why |
|------------|-----|
| `TaskLeaderboard` | Derived from approved submissions + user XP |
| `TaskBadges` | Badges stored as data on user profile |

---

## Task Statuses (expanded)

```
Draft → Published → Open → Closed → Reviewing → Completed → Archived
```

| Status | Meaning |
|--------|---------|
| **Draft** | Being edited, not visible to students |
| **Published** | Listed but not yet accepting submissions |
| **Open** | Accepting submissions |
| **Closed** | Submissions no longer accepted |
| **Reviewing** | Admin is reviewing submissions |
| **Completed** | All reviews done, results published |
| **Archived** | Hidden from active views, kept for history |

---

## Task Schema (`Tasks`)

```js
{
  id: string,
  title: string,
  description: string,              // rich text HTML
  category: string,
  taskType: string,                  // coding | idea | ai | uiux | datascience | research | presentation | poster | innovation
  difficulty: string,                // easy | medium | hard
  tags: string[],
  visibility: string,                // all | first_year | second_year | third_year | fourth_year | core | departments
  selectedDepartments: string[],     // only when visibility = departments
  
  // Scheduling
  publishDate: string (ISO),
  dueDate: string (ISO),
  dueTime: string,                   // HH:mm
  estimatedTime: string,             // e.g. "2-3 hours"
  
  // Points & Rewards
  xpReward: number,
  maxEarlyBonusXP: number,           // max bonus XP for submitting well before deadline
  earlySubmissionDays: number,       // days before deadline to qualify for early bonus
  badgeReward: string | null,        // badge ID (system-defined) or custom badge name
  badgeIsCustom: boolean,            // true if admin created a custom badge
  
  // Submission Settings
  allowMultipleSubmissions: boolean,
  maxAttempts: number,
  lateSubmissionAllowed: boolean,
  showLeaderboard: boolean,
  showScoresImmediately: boolean,
  anonymousReview: boolean,
  
  // Rich Content
  instructions: string,              // rich text HTML
  resources: {
    githubRepo: string,
    docLink: string,
    youtubeVideo: string,
    driveLink: string,
  },
  
  // Fields
  requiredFields: object,            // { fieldName: boolean }
  
  // Tracking
  status: string,
  createdBy: string,
  createdAt: string,
  updatedAt: string,
  totalSubmissions: number,
}
```

---

## TaskSubmissions Schema

```js
{
  id: string,
  taskId: string,
  taskTitle: string,
  userId: string,
  userName: string,
  userEmail: string,
  userPhoto: string,
  userDepartment: string,
  attemptNumber: number,             // 1, 2, 3... for multiple attempts
  
  // Timeline
  status: string,                    // submitted | under_review | feedback_added | approved | rejected
  submittedAt: string (ISO),
  reviewedAt: string (ISO),
  xpAwardedAt: string (ISO),
  
  // Dynamic submission fields per task type
  githubRepo: string,
  liveDemo: string,
  projectTitle: string,
  projectDescription: string,
  technologies: string,
  problemStatement: string,
  proposedSolution: string,
  keyFeatures: string,
  expectedImpact: string,
  futureScope: string,
  datasetUsed: string,
  figmaLink: string,
  youtubeLink: string,
  canvaLink: string,
  googleDocsLink: string,
  modelDescription: string,
  abstract: string,
  references: string,
  presentationSummary: string,
  designDescription: string,
  prototypeLink: string,
}
```

---

## TaskReviews Schema

```js
{
  id: string,
  submissionId: string,
  taskId: string,
  taskTitle: string,
  userId: string,
  reviewerId: string,
  reviewerName: string,               // hidden from student if task.anonymousReview = true
  
  // Scoring
  scores: [{ criteria: string, score: number, maxScore: number }],
  finalScore: number,
  maxScore: number,                  // always 100
  xpEarned: number,
  earlyBonusXP: number,              // dynamic bonus based on how early submitted
  badgeEarned: string | null,
  
  // Feedback
  feedback: {
    overallComments: string,
    strengths: string,
    improvements: string,
    suggestions: string,
  },
  
  reviewedAt: string (ISO),
}
```

---

## User Profile Extras

On the existing `Users` collection, add these fields:
```js
{
  // ... existing fields ...
  xp: number,                        // total accumulated XP
  taskBadges: [{                     // earned task badges
    id: string,
    name: string,
    icon: string,
    color: string,
    earnedAt: string,
  }],
  taskStreak: number,                 // consecutive weeks with approved submission
  lastTaskActivity: string (ISO),     // last approved submission date (for streak)
}
```

---

## Hybrid Badge System

### System-Defined Badges (in `taskConfig.js`)

| Badge | Icon | Color | Criteria |
|-------|------|-------|----------|
| First Submission | 🥇 | gold | Submit first task ever |
| Coding Champion | 💻 | blue | Score ≥90 on a coding task |
| Innovation Master | 💡 | purple | Score ≥90 on an idea/innovation task |
| AI Explorer | 🤖 | cyan | Score ≥90 on an AI task |
| Design Wizard | 🎨 | pink | Score ≥90 on a UI/UX or poster task |
| Data Scientist | 📊 | green | Score ≥90 on a data science task |
| Research Scholar | 📄 | orange | Score ≥90 on a research task |
| Fast Finisher | 🚀 | amber | Submit 3+ tasks before deadline |
| Task Legend | 👑 | gold | Complete 10+ tasks with ≥80 avg score |
| 10 Task Streak | 🔥 | red | Approved submission 10 weeks in a row |

### Custom Badges
- Admin can create a **custom badge** per task (free-form name, icon choice from predefined list, color picker)
- Stored in `Tasks.badgeReward` (custom name) + `Tasks.badgeIsCustom = true`
- Custom badges use a default icon (⭐) if no icon specified

### Earning & Storage
- Badge earned when `finalScore >= 90` (or per-task threshold)
- Badge data stored on `Users.taskBadges[]`:
  ```js
  { id: string, name: string, icon: string, color: string, earnedAt: string, custom: boolean }
  ```
- Each badge can only be earned once per user (system badges check by `id`, custom badges check by `name`)

---

## Dynamic Early Submission Bonus

Calculated at review time based on how early the submission was made:

```
daysEarly = (dueDate - submittedAt) / (1000 * 60 * 60 * 24)
earlyBonusXP = Math.round(maxEarlyBonusXP * (daysEarly / task.earlySubmissionDays))
```

- If `daysEarly >= earlySubmissionDays`, student gets full `maxEarlyBonusXP`
- If `daysEarly <= 0` (late or on deadline), no bonus
- Rounded to nearest integer
- Bonus shown separately in review UI and stored in `TaskReviews.earlyBonusXP`
- XP awarded = `baseXPEarned + earlyBonusXP` where `baseXPEarned = (finalScore / 100) * xpReward`

---

## Task Type Config (`src/config/taskConfig.js`)

### 9 Task Types & Auto-Adapting Fields

| # | Task Type | Submission Fields | Default Required |
|---|-----------|------------------|-----------------|
| 1 | Coding Challenge | githubRepo, liveDemo, technologies, projectDescription | githubRepo*, technologies* |
| 2 | Idea Submission | projectTitle, problemStatement, proposedSolution, keyFeatures, expectedImpact, futureScope | projectTitle*, problemStatement*, proposedSolution* |
| 3 | AI Project | githubRepo, liveDemo, modelDescription, datasetUsed, technologies | modelDescription*, datasetUsed* |
| 4 | UI/UX Design | figmaLink, prototypeLink, designDescription | figmaLink*, designDescription* |
| 5 | Data Science | githubRepo, datasetUsed, technologies, projectDescription | datasetUsed* |
| 6 | Research | googleDocsLink, abstract, references | googleDocsLink*, abstract* |
| 7 | Presentation | youtubeLink, canvaLink, presentationSummary | youtubeLink* |
| 8 | Poster Design | googleDocsLink, designDescription | designDescription* |
| 9 | Innovation Challenge | problemStatement, proposedSolution, keyFeatures, expectedImpact | problemStatement*, proposedSolution* |

### Scoring Criteria Per Task Type (4 criteria × 25pts = 100max)

| Task Type | Criteria |
|-----------|----------|
| Coding Challenge | Functionality, Code Quality, UI/UX, Documentation |
| Idea Submission | Innovation, Creativity, Feasibility, Presentation |
| AI Project | Technical Depth, Implementation, Dataset Quality, Documentation |
| UI/UX Design | Creativity, Visual Design, UX, Accessibility |
| Data Science | Data Quality, Analysis Depth, Visualization, Documentation |
| Research | Content Quality, Analysis Depth, References, Presentation |
| Presentation | Content Quality, Delivery, Visuals, Engagement |
| Poster Design | Creativity, Visual Design, Content Clarity, Impact |
| Innovation Challenge | Innovation, Feasibility, Impact, Presentation |

---

## Leaderboard Computation

**Derived at query time** (not stored in a separate collection):

```
Overall Score = Task XP + Early Bonus XP + Badge Bonus
```

Where:
- **Task XP** = sum of all `baseXPEarned` from approved `TaskReviews` (where `baseXPEarned = (finalScore/100) * xpReward`)
- **Early Bonus XP** = sum of all `earlyBonusXP` from approved `TaskReviews` (dynamic per task, see early bonus section)
- **Badge Bonus** = +50XP per earned badge (configurable constant)

Algorithm (in `taskService.js`):
1. Fetch all approved `TaskReviews` grouped by userId
2. Fetch `Users` for XP, badges, streak
3. Sort by: totalXP desc → averageScore desc → tasksCompleted desc
4. Assign ranks dynamically

### Leaderboard Display Fields
- Rank
- Member (name + photo)
- Department
- XP (total)
- Average Review Score
- Tasks Completed
- Current Streak
- Level

### Level Formula
```
Level = floor(sqrt(totalXP / 100))
```
- 0XP → L0, 100XP → L1, 400XP → L2, 900XP → L3, 1600XP → L4, etc.

---

## Submission Timeline

```
Submitted → Under Review → Feedback Added → Approved / Rejected → XP Awarded
```

Each step updates `TaskSubmissions.status`:
1. `submitted` — student submits
2. `under_review` — admin opens the submission
3. `feedback_added` — admin saves review with feedback
4. `approved` — admin approves (final)
5. `rejected` — admin rejects (final)

On `approved`, XP is awarded to user profile and `TaskXPHistory` entry is created.

---

## Admin Review Workflow

1. **Pending Review** — list all submissions with status `submitted`
2. **Open Submission** — view full submission details
3. **Score** — rate each criteria (0-25 per criteria, 100 max)
4. **Feedback** — add overall comments, strengths, improvements, suggestions
5. **Approve / Reject** — set final status
6. **Award XP** — automatically: `baseXPEarned = (finalScore / 100) * task.xpReward` + `earlyBonusXP` (dynamically calculated). If `finalScore >= 90` and task has `badgeReward`, award badge too.
7. **Leaderboard Updates Automatically** — no separate collection to sync

---

## Student Dashboard (separate route: `/tasks/dashboard`)

A dedicated dashboard page showing:

- **Active Tasks** — count of open tasks
- **Upcoming Deadlines** — next 3 deadlines
- **My XP** — total XP from profile
- **My Rank** — current position on task leaderboard
- **Badges** — earned task badges (with visual cards)
- **Recent Feedback** — latest review feedback
- **Submission History** — last 5 submissions with status timeline

---

## Admin Analytics

Display on admin task dashboard:

| Metric | Source |
|--------|--------|
| Open Tasks | `Tasks.filter(status === 'Open')` |
| Closed Tasks | `Tasks.filter(status === 'Closed')` |
| Total Submissions | `TaskSubmissions.length` |
| Pending Reviews | `TaskSubmissions.filter(status === 'submitted')` |
| Average Score | Average of `TaskReviews.finalScore` |
| Department Performance | Group submissions by department, calculate avg score |
| Top Contributors | Sort users by total XP from `TaskReviews` |
| Completion Rate | Approved / Total submissions ratio |

---

## Task Cards

Each task card displays:
- **Title**
- **Category** with icon
- **Difficulty** (Easy/Medium/Hard with color badge)
- **XP** reward
- **Deadline countdown** (e.g. "3d 12h remaining")
- **Submissions count**
- **Estimated completion time**
- **Tags**
- **Status** badge

---

## File Structure

### NEW files (11):

| # | File | Purpose |
|---|------|---------|
| 1 | `src/config/taskConfig.js` | Task types, field mappings, scoring criteria, level formula, system badges |
| 2 | `src/services/taskService.js` | All CRUD + leaderboard derivation + XP/badge logic + early bonus calc |
| 3 | `src/components/task/TaskCard.jsx` | Task card for student listing |
| 4 | `src/components/task/SubmissionForm.jsx` | Auto-adapting URL/text-only form per task type |
| 5 | `src/components/task/TaskLeaderboardPodium.jsx` | Top 3 podium for task leaderboard |
| 6 | `src/components/task/TaskLeaderboardTable.jsx` | Full task leaderboard table |
| 7 | `src/components/task/ReviewForm.jsx` | Admin review form with per-criteria scoring |
| 8 | `src/pages/TaskDashboard.jsx` | Student dashboard (separate route) |
| 9 | `src/pages/TaskDetail.jsx` | Student task detail + submission page |
| 10 | `src/pages/MySubmissions.jsx` | Student's submission history with status timeline |
| 11 | `src/pages/TaskLeaderboard.jsx` | Dedicated task leaderboard page |

### MODIFIED files (7):

| # | File | Change |
|---|------|--------|
| 1 | `src/pages/Tasks.jsx` | Rewrite: task cards + links (dashboard removed to separate page) |
| 2 | `src/pages/admin/TaskManagement.jsx` | Rewrite: full CRUD with all settings, hybrid badges, analytics, review dashboard |
| 3 | `src/App.jsx` | Add routes: `/tasks/dashboard`, `/tasks/:id`, `/my-submissions`, `/task-leaderboard` |
| 4 | `src/db.js` | Add `Tasks`, `TaskSubmissions`, `TaskReviews`, `TaskXPHistory` seed data; no `TaskLeaderboard`/`TaskBadges` |
| 5 | `src/pages/Admin.jsx` | Ensure Tasks tab links to updated TaskManagement |
| 6 | `src/components/Header.jsx` | Add `/tasks/dashboard`, `/my-submissions` links to profile dropdown |
| 7 | `src/components/Sidebar.jsx` | Add `/task-leaderboard` link |

---

## Routes

### New Routes (in src/App.jsx):
```
/tasks/dashboard      → TaskDashboard.jsx       (student dashboard — NEW file, protected)
/tasks                → Tasks.jsx               (task listing, protected)
/tasks/:id            → TaskDetail.jsx          (detail + submission form, protected)
/my-submissions       → MySubmissions.jsx       (user's submission history, protected)
/task-leaderboard     → TaskLeaderboard.jsx     (separate leaderboard, protected)
```

### Admin (in Admin.jsx sidebar):
```
Tasks tab             → TaskManagement.jsx      (CRUD + review + analytics)
```

---

## Implementation Order

### Phase 1: Foundation
1. Create `src/config/taskConfig.js`
2. Create `src/services/taskService.js` (CRUD + leaderboard derivation + XP logic)
3. Update `src/db.js` with seed data

### Phase 2: Components
4. Create `src/components/task/TaskCard.jsx`
5. Create `src/components/task/SubmissionForm.jsx`
6. Create `src/components/task/TaskLeaderboardPodium.jsx`
7. Create `src/components/task/TaskLeaderboardTable.jsx`
8. Create `src/components/task/ReviewForm.jsx`

### Phase 3: Student Pages
9. Create `src/pages/TaskDashboard.jsx` (separate dashboard page)
10. Rewrite `src/pages/Tasks.jsx` (task card listing only)
11. Create `src/pages/TaskDetail.jsx`
12. Create `src/pages/MySubmissions.jsx`
13. Create `src/pages/TaskLeaderboard.jsx`

### Phase 4: Admin
13. Rewrite `src/pages/admin/TaskManagement.jsx` (CRUD + review dashboard + analytics)
14. Update `src/pages/Admin.jsx` (ensure Tasks tab works)

### Phase 5: Integration
15. Update `src/App.jsx` — routes
16. Update `src/components/Header.jsx` — nav links
17. Update `src/components/Sidebar.jsx` — task leaderboard link

---

## Verification

1. `npm run build` — zero errors
2. Admin creates tasks for each of the 9 types → form auto-adapts
3. Student views tasks → sees dashboard + task cards + countdown
4. Student submits → URL/text fields only, no file upload
5. Admin reviews → per-criteria scoring → feedback → approve → XP awarded
6. Leaderboard shows computed rankings (no separate collection)
7. All routes work with proper protection
