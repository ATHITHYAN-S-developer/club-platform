# Plan: Professional Task Platform Redesign (HackerRank/Examly Inspired)

**Goal:** Redesign the Task Management System from a standard page layout into a full-screen three-panel professional platform with markdown support, dynamic submission panels, collapsible layout, bottom status bar, gamification achievements, and an enhanced admin panel.

---

## Overview of Changes

| Aspect | Current | Target |
|--------|---------|--------|
| Layout | Standard page (`max-width: 1100px`, centered) | Full-screen three-panel (HackerRank style) |
| Task View | Single page with sidebar form | Top bar + Left nav sidebar + Center content + Right submission panel + Bottom status bar |
| Markdown | None (raw HTML input) | Full markdown rendering with code blocks |
| Submission | Simple form with submit | Preview + Save Draft + Submit, autosave |
| Dashboard | 4 stat cards | Welcome card + stats grid + quick action buttons + leaderboard snippet |
| My Submissions | Card list with timeline | Professional table with filters, columns, bulk actions |
| Leaderboard | Podium + table | Podium + table + department/year/category filters |
| Admin | 3 tabs | 8 tabs: Overview, Create Task, Manage Tasks, Submissions, Reviews, Leaderboard, Analytics, Settings |
| Gamification | Level + XP + badges | + Daily/weekly streak, Monthly Champion, Task Champion, Innovation Award, Coding Champion |
| UI Features | None | Collapsible panels, glassmorphism, dark/light mode support, animations |
| Autosave | None | Every 10 seconds, draft persistence in localStorage |
| Status Bar | None | Bottom bar: autosave status, internet status, submission status, keyboard shortcuts |

---

## Phase 1: New Dependencies & Foundation

### npm packages to install
```bash
npm install react-markdown remark-gfm react-syntax-highlighter
```

### Create these new files

| # | File | Purpose |
|---|------|---------|
| 1 | `src/components/task/TaskLayout.jsx` | Three-panel layout wrapper with collapsible panels |
| 2 | `src/components/task/TaskTopBar.jsx` | Top navigation bar (logo, task info, timer, submit) |
| 3 | `src/components/task/TaskLeftSidebar.jsx` | Left navigator with task list, progress stats |
| 4 | `src/components/task/TaskStatusBar.jsx` | Bottom status bar with autosave, internet, shortcuts |
| 5 | `src/components/task/TaskMarkdown.jsx` | Markdown renderer using react-markdown |
| 6 | `src/components/task/TaskChecklist.jsx` | Requirements checklist component |
| 7 | `src/utils/autosave.js` | Autosave utility (localStorage + debounce) |
| 8 | `src/config/achievementsConfig.js` | Gamification achievements config |

---

## Phase 2: Layout Architecture

### TaskLayout.jsx

The core layout component that wraps the task detail/submission view.

```
┌─────────────────────────────────────────────────────────────┐
│  TaskTopBar                                                  │
│  [Logo]  Task: {name}  Category  Student  Timer  Online  ☀  │
├────────┬────────────────────────────────┬────────────────────┤
│  Left  │  Center (scrollable)           │  Right Panel       │
│  Side  │  - Task Header                 │  (dynamic per      │
│  Bar   │  - Description (Markdown)      │   task type)       │
│        │  - Objectives                  │  - Form fields      │
│ Task   │  - Requirements Checklist      │  - Preview          │
│ List   │  - Resources                   │  - Save Draft       │
│        │  - Evaluation Criteria         │  - Submit           │
│ Stats  │                                │                    │
├────────┴────────────────────────────────┴────────────────────┤
│  TaskStatusBar                                                │
│  Autosave  Last Saved  Internet  Status  Ctrl+S  Ctrl+Enter  │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Full viewport height (`100vh`), no scroll on body
- Left sidebar: collapsible, width ~280px when expanded
- Right panel: collapsible, width ~400px when expanded
- Center panel: scrollable, fills remaining space
- Left/right panels have collapse toggle buttons
- Responsive: tablets stack right panel below center; mobile stacks all

### TaskTopBar.jsx

```
[MindCraft AI Logo]  |  Task: AI Portfolio Website  |  Category: Web Development
                     |  Student: ATHITHYAN S  |  Dept: CSE
                     |  Timer: 02:15:30  |  [● Online]  |  [✓ Autosaved]
                     |  [🌙 Theme Toggle]  |  [Submit Task]
```

**Features:**
- Sticky at top, `z-index: 100`
- Glassmorphism effect (`backdrop-filter: blur(12px)`)
- Countdown timer component that ticks every second
- Internet status indicator (from `navigator.onLine` + custom event listeners)
- Autosave status indicator
- Theme toggle (uses existing ThemeContext)
- Submit button (opens confirmation modal)

### TaskLeftSidebar.jsx

```
Task Navigator
──────────────────
 1  Portfolio Website      ● Completed
 2  AI Chatbot             ◐ In Progress
 3  Prompt Engineering     ○ Not Started
 4  Innovation Idea        ● Submitted
 5  UI Design              🔒 Locked
──────────────────
 Statistics
 Completed      3
 Pending        2
 Reviewed       1
 XP Earned     550 XP
 Progress     ████████░░  60%
```

**Features:**
- Task list with number, name, status indicator (color dot + label)
- Status colors: Completed (green), In Progress (blue), Not Started (gray), Submitted (orange), Locked (red)
- Bottom stats section always visible
- Progress bar for overall completion
- Collapsible via toggle button in TopBar or on sidebar edge

### TaskStatusBar.jsx

```
Autosave: Every 10s  |  Last Saved: 2s ago  |  Internet: ● Online  |  Status: Draft  |  ⌨ Ctrl+S  ⌨ Ctrl+Enter
```

**Features:**
- Sticky at bottom, `z-index: 100`
- Shows autosave interval countdown
- Shows "last saved" with relative time
- Internet status with live indicator dot
- Submission status (Draft / Submitted / Under Review / etc.)
- Keyboard shortcut hints

---

## Phase 3: Enhanced Submission Form (Right Panel)

### Updated taskConfig.js Field Definitions

Add new per-type fields to match the requirements:

| Task Type | New/Enhanced Fields |
|-----------|-------------------|
| **coding** | githubRepo (url, req), liveDemo (url, opt), technologies (text, req), projectDescription (textarea, opt), **additionalNotes** (textarea, opt) |
| **idea** | projectTitle (text, req), problemStatement (textarea, req), proposedSolution (textarea, req), keyFeatures (textarea, opt), expectedImpact (textarea, opt), futureScope (textarea, opt), **references** (textarea, opt) |
| **ai** | githubRepo (url, opt), liveDemo (url, opt), modelDescription (textarea, req), datasetUsed (textarea, req), technologies (text, opt) |
| **uiux** | figmaLink (url, req), prototypeLink (url, opt), designDescription (textarea, req), **designDecisions** (textarea, opt) |
| **research** | googleDocsLink (url, req), abstract (textarea, req), **methodology** (textarea, opt), references (textarea, opt) |
| **presentation** | youtubeLink (url, req), canvaLink (url, opt), presentationSummary (textarea, opt) |
| **poster** | googleDocsLink (url, opt), designDescription (textarea, req) |
| **innovation** | problemStatement (textarea, req), proposedSolution (textarea, req), keyFeatures (textarea, opt), expectedImpact (textarea, opt) |
| **datascience** | githubRepo (url, opt), datasetUsed (textarea, req), technologies (text, opt), projectDescription (textarea, opt) |

### SubmissionForm.jsx Enhancements

- Add **Preview** button: modal/section that shows a read-only preview of the submission
- Add **Save Draft** button: saves to localStorage, restores on revisit
- Auto-save every 10 seconds via autosave utility
- Show field character counts for textareas
- Better URL validation with helpful error messages
- Smooth transitions between task types when navigating

---

## Phase 4: Center Panel Enhancements

### TaskDetail.jsx → Rewrite to use TaskLayout

The center panel will show:

1. **Task Header**: Title, difficulty badge, category, XP reward, estimated time, deadline, tags
2. **Description**: Rendered via `TaskMarkdown.jsx` (supports markdown + code blocks)
3. **Objectives**: List of objectives (new field on Tasks collection)
4. **Requirements Checklist**: Interactive checklist (new field on Tasks collection)
5. **Resources**: GitHub, Drive, YouTube, Documentation links
6. **Evaluation Criteria**: Displayed as a table with max scores per criterion

### TaskMarkdown.jsx

```jsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Renders markdown with:
// - GitHub Flavored Markdown (tables, task lists, strikethrough)
// - Syntax-highlighted code blocks
// - Image support
// - Link handling (opens in new tab)
```

---

## Phase 5: Student Dashboard Enhancements

### New dashboard layout (TaskDashboard.jsx rewrite)

```
┌──────────────────────────────────────────────────────┐
│  Welcome back, Athithyan!                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │Rank  │ │XP    │ │Level │ │Tasks │ │Streak│       │
│  │#3    │ │1,250 │ │Lv.3  │ │12    │ │5w 🔥│       │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘       │
│                                                        │
│  [Browse Tasks] [My Submissions] [Leaderboard] [Profile]│
│                                                        │
│  ┌─── Upcoming Deadlines ───┐ ┌─── Recent Feedback ──┐│
│  │  Task A - Jul 15         │ │  Task A - 85% - Good ││
│  │  Task B - Jul 20         │ │  Task B - 92% - Great││
│  └──────────────────────────┘ └──────────────────────┘│
│                                                        │
│  ┌─── Badges ───────────────┐ ┌─── Leaderboard ──────┐│
│  │  🥇 🥈 🥉              │ │  You: #3 of 45       ││
│  └──────────────────────────┘ └──────────────────────┘│
└──────────────────────────────────────────────────────┘
```

---

## Phase 6: My Submissions Rewrite

### Professional table with columns:

| Task | Type | Submitted | Status | Score | XP | Feedback | Reviewer | Actions |
|------|------|-----------|--------|-------|----|----------|----------|---------|

- Filters: All, Pending, Approved, Rejected, Under Review
- Search bar
- Sort by column headers
- Click to expand row for full details
- Pagination if > 20 submissions

---

## Phase 7: Leaderboard Enhancements

### Add filter bar above leaderboard

```
[Search by name...]  [Department ▼]  [Year ▼]  [Category ▼]
```

- Department filter dropdown
- Year filter dropdown (1st, 2nd, 3rd, 4th)
- Category filter (or you could call it "Task Category" to only rank by certain task types)

---

## Phase 8: Admin Panel Expansion

### New tab structure (8 tabs):

| Tab | Features |
|-----|----------|
| **Overview** | Summary dashboard: total tasks, active, pending reviews, submission rate, top contributors, recent activity |
| **Create Task** | Full-page form with sections: Basic Info, Scheduling, Instructions (markdown editor), Resources, Submission Config, Review Criteria, Rewards, Notifications, Security |
| **Manage Tasks** | Table (existing) + bulk actions (publish, archive, delete selected) |
| **Submissions** | All submissions table with search, filters, export CSV |
| **Reviews** | Split-view review dashboard (existing ReviewForm enhanced) |
| **Leaderboard** | View/manage leaderboard, manually adjust XP, reset stats |
| **Analytics** | Enhanced with charts (using existing Chart.js), export reports |
| **Settings** | Task defaults, badge thresholds, XP multipliers, notification templates |

### Create Task Form Sections

```
Section 1: Basic Information
├── Title, Description (markdown editor), Category, Task Type, Difficulty, Tags

Section 2: Scheduling
├── Publish Date, Due Date/Time, Estimated Time, Visibility

Section 3: Instructions
├── Full markdown editor with preview tab (instructions field)

Section 4: Resources
├── GitHub, Google Drive, YouTube, Documentation links

Section 5: Submission Configuration
├── Required fields checkboxes (all possible fields listed)
├── Max Attempts, Multiple Submissions toggle, Late Submission toggle

Section 6: Review Criteria
├── Per-type scoring criteria (auto-filled from taskConfig, admin can adjust max scores)

Section 7: Rewards
├── XP Reward, Early Bonus XP, Badge (system or custom)

Section 8: Notifications (optional)
├── Custom notification message when task is published
├── Reminder settings

Section 9: Security (optional)
├── Plagiarism check toggle
├── Code similarity check (if coding task)
```

---

## Phase 9: Gamification Achievements

### New config file: `src/config/achievementsConfig.js`

```js
export const ACHIEVEMENTS = [
  // Streak achievements
  { id: 'daily_streak_3', name: 'Daily Grind', icon: '🔥', condition: 'daily_streak >= 3', xp: 25 },
  { id: 'daily_streak_7', name: 'Week Warrior', icon: '🔥', condition: 'daily_streak >= 7', xp: 75 },
  { id: 'weekly_streak_4', name: 'Monthly Regular', icon: '📅', condition: 'weekly_streak >= 4', xp: 100 },

  // Champion achievements
  { id: 'monthly_champion', name: 'Monthly Champion', icon: '👑', condition: 'monthly_rank == 1', xp: 500 },
  { id: 'task_champion', name: 'Task Champion', icon: '🏆', condition: 'completed_tasks >= 20', xp: 300 },
  { id: 'innovation_award', name: 'Innovation Award', icon: '💡', condition: 'innovation_score >= 90', xp: 150 },
  { id: 'coding_champion', name: 'Coding Champion', icon: '💻', condition: 'coding_score >= 90', xp: 150 },

  // Existing system badges stay in taskConfig.js
];
```

### Track on User Profile

Add new fields to user profile:
```js
{
  dailyStreak: number,
  weeklyStreak: number,
  lastDailyActivity: string (ISO date),
  lastWeeklyActivity: string (ISO date),
  achievements: [{ id, name, icon, earnedAt }],
  monthlyRank: number,
  monthlyXP: number,
}
```

---

## Phase 10: Autosave Utility

### `src/utils/autosave.js`

```js
// Manages draft saving to localStorage
// - Saves every 10 seconds if changes detected
// - Restores draft when entering task submission
// - Clears draft on successful submit
// - Shows "last saved" timestamp

export function saveDraft(taskId, userId, data) { ... }
export function loadDraft(taskId, userId) { ... }
export function clearDraft(taskId, userId) { ... }
export function getLastSaved(taskId, userId) { ... }
```

---

## Phase 11: UI/UX Polish

### Glassmorphism Effects
- Top bar: `background: rgba(255,255,255,0.8); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.2);`
- Bottom bar: same glassmorphism style
- Cards: subtle shadows with `box-shadow: 0 8px 32px rgba(0,0,0,0.06);`
- Dark mode variant: `background: rgba(30,30,40,0.9); backdrop-filter: blur(12px);`

### Animations
- Panel collapse/expand: smooth width transitions (300ms ease)
- Task card hover: scale + shadow
- Status transitions: color changes with transition
- Countdown timer: smooth number changes
- Form submit: loading spinner + success checkmark

### Dark Mode
- All new components must respect the existing ThemeContext
- Use CSS variables for colors
- Ensure glassmorphism adapts to dark mode

### Responsive
- Desktop (1200px+): Three-panel layout
- Tablet (768-1199px): Right panel stacks below center, sidebar collapsible
- Mobile (<768px): Single column, sidebar and right panel as overlays/drawers

---

## File Changes Summary

### NEW files (8):

| # | File | Lines (est) |
|---|------|-------------|
| 1 | `src/components/task/TaskLayout.jsx` | ~150 |
| 2 | `src/components/task/TaskTopBar.jsx` | ~180 |
| 3 | `src/components/task/TaskLeftSidebar.jsx` | ~160 |
| 4 | `src/components/task/TaskStatusBar.jsx` | ~100 |
| 5 | `src/components/task/TaskMarkdown.jsx` | ~60 |
| 6 | `src/components/task/TaskChecklist.jsx` | ~40 |
| 7 | `src/utils/autosave.js` | ~60 |
| 8 | `src/config/achievementsConfig.js` | ~50 |

### REWRITE files (5):

| # | File | Change |
|---|------|--------|
| 1 | `src/pages/TaskDetail.jsx` | Rewrite to use TaskLayout + three-panel |
| 2 | `src/pages/TaskDashboard.jsx` | Enhanced dashboard with welcome card, quick buttons |
| 3 | `src/pages/MySubmissions.jsx` | Professional table with filters, sorting |
| 4 | `src/pages/TaskLeaderboard.jsx` | Add department/year/category filters |
| 5 | `src/pages/admin/TaskManagement.jsx` | 8 tabs, create task wizard, settings |

### MODIFY files (3):

| # | File | Change |
|---|------|--------|
| 1 | `src/config/taskConfig.js` | Add new fields per type, adjust scorings |
| 2 | `src/services/taskService.js` | Add autosave integration, achievement tracking |
| 3 | `src/components/task/SubmissionForm.jsx` | Enhanced: preview, save draft, autosave |

---

## Implementation Order

### Sprint 1: Foundation
1. Install `react-markdown`, `remark-gfm`, `react-syntax-highlighter`
2. Create `src/utils/autosave.js`
3. Create `src/config/achievementsConfig.js`
4. Create `src/components/task/TaskMarkdown.jsx`

### Sprint 2: Layout
5. Create `src/components/task/TaskTopBar.jsx`
6. Create `src/components/task/TaskLeftSidebar.jsx`
7. Create `src/components/task/TaskStatusBar.jsx`
8. Create `src/components/task/TaskLayout.jsx`

### Sprint 3: Task Detail (Three-Panel)
9. Update `src/config/taskConfig.js` (add new fields)
10. Enhance `SubmissionForm.jsx` (preview, save draft, autosave)
11. Rewrite `TaskDetail.jsx` to use TaskLayout + three panels

### Sprint 4: Student Pages
12. Rewrite `TaskDashboard.jsx` (enhanced dashboard)
13. Rewrite `MySubmissions.jsx` (professional table)
14. Enhance `TaskLeaderboard.jsx` (add filters)

### Sprint 5: Admin
15. Create admin Create Task form sections
16. Rewrite `TaskManagement.jsx` (8 tabs, settings, enhanced review)
17. Update `src/services/taskService.js` (achievements, enhanced analytics)

### Sprint 6: Polish
18. Add glassmorphism styles to all new components
19. Ensure dark mode compatibility
20. Responsive testing + adjustments
21. Test autosave flow end-to-end

---

## Testing Checklist

- [ ] Three-panel layout renders correctly at all breakpoints
- [ ] Left sidebar collapsible on desktop, overlay on mobile
- [ ] Right panel collapsible on desktop, stacks on tablet
- [ ] Countdown timer ticks correctly and shows warning at 5 min
- [ ] Autosave saves every 10s, restores draft on revisit
- [ ] Internet status indicator updates in real-time
- [ ] Markdown renders with syntax highlighting, tables, task lists
- [ ] Submission form adapts to all 9 task types
- [ ] Preview shows read-only formatted submission
- [ ] Save Draft persists across page refresh
- [ ] Submit clears draft and redirects
- [ ] Dashboard shows all stats correctly
- [ ] My Submissions table sorts and filters
- [ ] Leaderboard filters work
- [ ] Admin Create Task form saves all sections
- [ ] Admin split-view review works
- [ ] Dark mode toggle affects all new components
- [ ] `npm run build` succeeds with zero errors
