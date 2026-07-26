## Sidebar UX Updates

Update `src/components/dashboard/DashboardLayout.tsx` and `src/components/dashboard/DashboardSidebar.tsx` to change the sidebar's default state, add click-empty-space toggle, and persist the user's preference.

### 1. Default open + persist preference (localStorage)

In `DashboardLayout.tsx`:
- Change `useState(true)` (collapsed by default) to read from `localStorage.getItem('sidebar:collapsed')`.
- If nothing is stored, default to **open** (`collapsed = false`).
- On every toggle, write the new value to `localStorage`.

### 2. Click empty space to toggle

In `DashboardSidebar.tsx`:
- Attach `onClick={onToggle}` to the outer `<aside>` (or to the `<nav>` and footer container's empty regions).
- Nav item `Button`s already handle their own `onClick` and call `navigate(...)`. Add `e.stopPropagation()` inside `handleNavClick` so clicks on nav items don't bubble up and toggle the sidebar.
- Add `stopPropagation` on the `Logo` wrapper, the collapse/expand chevron buttons, `ThemeToggle` container, and the `Logout` button so those interactive controls don't trigger a toggle.
- The Logo continues to link to `/dashboard` (already configured via `linkTo="/dashboard"` in both collapsed and expanded states), satisfying the "logo always returns to home" requirement.

### 3. Cursor affordance

- Add `cursor-pointer` to the `<aside>` and `cursor-default` (or explicit override) on the interactive children so users get visual feedback that empty space is clickable.

### Notes

- No changes to routing or nav item behavior — clicking Dashboard/Tracker/etc. still navigates as today.
- No backend changes.
