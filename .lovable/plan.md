

# Dashboard Hub with Collapsible Sidebar

## Overview
Transform `/dashboard` into a central hub with stats, charts, and recent activity. Move the Kanban board to `/tracker`. Add a collapsible sidebar for navigation across all authenticated pages. Use the dedicated analytics API endpoint instead of client-side computation.

## Architecture

### New Routes
| Route | Component | Content |
|---|---|---|
| `/dashboard` | Dashboard.tsx | Hub with stats cards, velocity chart, recent apps |
| `/tracker` | TrackerPage.tsx | Current Kanban board (JobKanbanBoard) |
| `/profile` | ProfilePage.tsx | Existing profile (wrapped in shared layout) |

### Sidebar Navigation Items
| Label | Icon | Route | Status |
|---|---|---|---|
| Dashboard | LayoutDashboard | /dashboard | Active |
| Job Tracker | Briefcase | /tracker | Active |
| Resume Generator | FileText | -- | Coming Soon |
| Cover Letter | PenTool | -- | Coming Soon |
| Referral Base | Users | -- | Coming Soon |
| Analytics | BarChart3 | -- | Coming Soon |
| Collaborative Apply | Handshake | -- | Coming Soon |
| Global Apply | Globe | -- | Coming Soon |
| Profile | UserCircle | /profile | Active |

Sidebar is collapsed by default (icons only, ~w-16). Expands to ~w-60 with labels. Tooltips on hover when collapsed. "Coming Soon" items show a toast on click. Footer has logout + theme toggle.

## Files to Create

### 1. `src/lib/analyticsApi.ts`
New API module for dashboard analytics:
- `getDashboardAnalytics()` calls `GET /api/analytics/dashboard` on the external backend (`https://tracker-backend-production-535d.up.railway.app/api/analytics/dashboard`)
- Uses same auth helper pattern as `jobApi.ts`
- Returns typed `DashboardAnalytics` with `summary` and `recent_activity`

### 2. `src/types/analytics.ts`
Type definitions:
```text
DashboardAnalytics {
  summary: {
    totalApplications: number
    interviews: number
    offers: number
    statusCounts: Record<string, number>
  }
  recent_activity: Array<{ date: string, count: number }>
}
```

### 3. `src/components/dashboard/DashboardLayout.tsx`
Shared layout wrapper for all authenticated pages:
- Renders the collapsible sidebar + main content area
- Main content uses `ml-16` (collapsed) or `ml-60` (expanded) with smooth transition
- Passes sidebar state down via props or context

### 4. `src/components/dashboard/DashboardHub.tsx`
Main hub component with three sections:
- **Stats cards row** (4 cards): Applied (`summary.totalApplications`), In Review (`summary.statusCounts['In Review']`), Interviews (`summary.interviews`), Success Rate (computed)
- **Application Velocity chart**: `recharts` BarChart fed by `recent_activity` array. X-axis = `date`, Bar = `count`. Blue gradient bars.
- **Recent Applications list**: Fetches latest 5 from `jobApi.getAllApplications()` (sorted by date desc, sliced). Shows company initial avatar, role, status badge.

### 5. `src/pages/TrackerPage.tsx`
- Same auth-check as current Dashboard.tsx
- Renders `DashboardLayout` wrapping `JobKanbanBoard`

## Files to Edit

### 6. `src/App.tsx`
- Add `/tracker` route pointing to `TrackerPage`

### 7. `src/pages/Dashboard.tsx`
- Replace `JobKanbanBoard` with `DashboardLayout` wrapping `DashboardHub`

### 8. `src/components/dashboard/DashboardSidebar.tsx`
Complete rewrite:
- Collapsed by default (w-16, icons only)
- Expanded (w-60, icons + labels)
- Toggle via chevron button at top
- Tooltips on hover when collapsed (using existing Tooltip component)
- "Coming Soon" items styled with `opacity-60` and a small badge; click shows `toast.info('Coming soon!')`
- Logo: icon-only when collapsed, full when expanded
- Footer: Logout button + ThemeToggle
- Active route highlighted

### 9. `src/components/kanban/JobKanbanBoard.tsx`
- Remove the entire header section (Logo, ThemeToggle, profile dropdown) since the sidebar layout handles navigation
- Keep the action bar (title, Add Application, view toggle, settings)

### 10. `src/pages/ProfilePage.tsx`
- Remove header section (Logo, ThemeToggle, Back button)
- Wrap with `DashboardLayout` so sidebar is consistent

## Technical Details

### Analytics API Call
```text
GET https://tracker-backend-production-535d.up.railway.app/api/analytics/dashboard
Authorization: Bearer <token>

Response: {
  "summary": { "totalApplications": 47, "interviews": 8, "offers": 0, "statusCounts": {...} },
  "recent_activity": [{ "date": "2023-10-21", "count": 2 }, ...]
}
```

### Stats Cards Mapping
- Applied: `summary.totalApplications`
- In Review: `summary.statusCounts['In Review'] || 0`
- Interviews: `summary.interviews`
- Success Rate: `Math.round((summary.interviews / summary.totalApplications) * 100) || 0`

### Velocity Chart
- Uses `recharts` BarChart (already installed)
- `data={recent_activity}`, `dataKey="date"` for X-axis, `dataKey="count"` for Bar
- Blue gradient fill matching the reference image

### Recent Applications
- `jobApi.getAllApplications(undefined, 1, 5)` to get the latest 5
- Each row shows: colored initial circle, company name, role, status badge, date

### Sidebar Behavior
- Default: collapsed (w-16)
- Toggle button (ChevronRight/Left) at top
- Tooltips via existing Tooltip component when collapsed
- Smooth `transition-all duration-300`
- Main content `ml-16` or `ml-60` with matching transition

## Summary of All Files

| Action | File |
|---|---|
| Create | `src/types/analytics.ts` |
| Create | `src/lib/analyticsApi.ts` |
| Create | `src/components/dashboard/DashboardLayout.tsx` |
| Create | `src/components/dashboard/DashboardHub.tsx` |
| Create | `src/pages/TrackerPage.tsx` |
| Edit | `src/App.tsx` |
| Edit | `src/pages/Dashboard.tsx` |
| Edit | `src/components/dashboard/DashboardSidebar.tsx` |
| Edit | `src/components/kanban/JobKanbanBoard.tsx` |
| Edit | `src/pages/ProfilePage.tsx` |

## No New Dependencies
- `recharts` already installed for charts
- `next-themes` already installed for theme toggle
- `lucide-react` has all needed icons

## No Database Changes
All data comes from the existing external backend API.

