# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Vite + HMR at http://localhost:5173)
npm run build    # Production build to /dist
npm run lint     # Run ESLint on all .js/.jsx files
npm run preview  # Preview production build locally
```

## Architecture Overview

**Millieu** is a React + Vite task management system for residential care staff, with compliance tracking and manager oversight. The app splits into **staff** and **manager** roles with different dashboards.

### Tech Stack

- **React 19** + **React Router 7**
- **Zustand 5** for state management
- **Supabase** for PostgreSQL + realtime subscriptions
- **Tailwind CSS 3** + custom design tokens (`milieuNavy #0a1c36`, `milieuBlue`, `milieuCoral`, `milieuYellow`)
- **Vite** with `@vitejs/plugin-react`
- **Recharts** for data visualization, **html2canvas** for report exports
- **date-fns** for time utilities, **Lucide React** for icons

### State Management — Three Zustand Stores

**`src/store/taskStore.js`** — Core store; manages shift sessions and tasks.
- Session model: `{ programId, shift, staffId, date, tasks[] }`
- Task model: `{ id, sessionId, title, startTime, endTime, status, completedAt, completedBy, comment }`
- Status values: `'upcoming' | 'pending' | 'late' | 'missed' | 'completed'`
- Key methods: `initSession()`, `fetchActiveSessions()`, `completeTask()`, `refreshStatuses()`, `refreshAllStatuses()`
- Listens to Supabase realtime changes on `shift_tasks` via PostgreSQL channels
- Self-healing: if a session has 0 tasks, auto-regenerates them from `TASK_TEMPLATES`

**`src/store/authStore.js`** — Persists auth state to `localStorage` via Zustand middleware.
- Fields: `user`, `isAuthenticated`, `selectedShift`
- Auto-detects shift on login: hour 7–15 = day, 15–23 = evening, 23–7 = night

**`src/store/alertStore.js`** — System alerts for missed tasks, bulk submissions, and compliance issues.
- Fields: `id`, `type`, `severity`, `message`, `programId`, `taskId`, `createdAt`
- Types: `'missed' | 'bulk-submit' | 'compliance'`
- Realtime: listens to `alerts` table INSERT/UPDATE/DELETE
- Idempotency: prevents duplicate alerts for the same task + type

### Pages & Routing

`App.jsx` enforces `requiredRole` at the layout level via `ProtectedLayout`.

| Page | Route | Role |
|------|-------|------|
| `LoginPage` | `/` | Public |
| `StaffDashboard` | `/staff` | staff |
| `ManagerDashboard` | `/manager` | manager |
| `ProgramsPage` | `/programs` | manager |
| `SchedulesPage` | `/schedules` | manager |
| `ReportsPage` | `/reports` | manager |
| `AlertsPage` | `/alerts` | shared |

### Key Custom Hook — `useTaskTimer`

`src/hooks/useTaskTimer.js` runs every 30 seconds to:
1. Refresh task statuses based on current time vs. time windows
2. Fire 5-minute pre-window reminder toasts
3. Detect missed tasks and write alerts to Supabase
4. Detect bulk-submit patterns (3+ tasks completed within 5 minutes)

It verifies against Supabase before marking a task missed, preventing stale local state from triggering false alerts.

### Key Utilities

**`src/utils/timeUtils.js`**
- `parseSlotTime(timeStr)` — Converts `"HH:MM"` to `Date`; handles midnight crossing for night shift
- `getTaskStatus(task, now?)` — Computes status from `completedAt` and time windows at render time (not stored)
- `getShiftDateString()` — If current time is 00:00–06:59, returns yesterday's date string so night shift tasks aren't split across calendar days

**`src/utils/complianceUtils.js`**
- `calculateCompliance(tasks)` — % of tasks with status `completed` or `late`
- `detectBulkSubmit(tasks)` — Flags 3+ completions within a 5-minute window

### Data Files

- `src/data/programs.js` — Program registry (id, name, location, color)
- `src/data/taskTemplates.js` — Task templates per program per shift (`{ title, startTime, endTime, description }`). Templates are **not stored in the DB**; they're used only to initialize new sessions.
- `src/data/mockUsers.js` — Demo accounts for login

### Key Design Patterns

**Optimistic UI + Realtime Sync** — Store methods update local state immediately, then write to Supabase. Realtime subscriptions merge changes from other clients.

**Status computed at render time** — `getTaskStatus(task)` derives status from timestamps rather than trusting stored status strings, keeping UI accurate even if realtime is delayed.

**Multi-session awareness** — Manager view spans all programs × all shifts. `refreshAllStatuses()` loops through all sessions; staff view only touches the active session.

**Self-healing sessions** — `fetchActiveSessions()` and `initSession()` detect sessions with 0 tasks and rebuild them from templates automatically.

### Database Field Mapping

Supabase uses snake_case; frontend uses camelCase. Mapping happens in store methods and display components:

| Frontend | Supabase |
|----------|----------|
| `startTime` | `start_time` |
| `endTime` | `end_time` |
| `completedAt` | `completed_at` |
| `completedBy` | `completed_by` |
| `programId` | `program_id` |
| `staffId` | `staff_id` |
| `sessionId` | `session_id` |
| `alertSent` | `alert_sent` |

### Styling

- Custom Tailwind colors in `tailwind.config.js`: `milieuNavy`, `milieuBlue`, `milieuCoral`, `milieuYellow` + extended navy/teal/slate palettes
- Shared component classes in `src/index.css`: `.glass-card`, `.btn-primary`, `.status-{completed|late|missed|pending|upcoming}`, `.nav-item`, `.stat-card`
- Sidebar hidden below `lg` breakpoint; `MobileNav` appears instead
- Custom keyframe animations: `fade-in`, `slide-in`, `bounce-in`, `pulse` defined in Tailwind config

### Environment

Requires `.env.local`:
```
VITE_SUPABASE_URL=https://vvjupxzylwxtolsabxrm.supabase.co
VITE_SUPABASE_ANON_KEY=<JWT token>
```
