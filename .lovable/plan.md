

## Fix 1: Replace Status Text Input with Toggle/Select Buttons

**Current behavior:** The status field in Add/Edit Job modals is a free-text input with autocomplete dropdown. Users have to type or click from a dropdown list.

**New behavior:** Replace the `StatusInput` with a visual toggle-button group showing all available statuses (from board columns + API). Users tap to select a status -- no typing needed. The selected status gets a highlighted/active state.

**Implementation:**
- Refactor `StatusInput.tsx` to render a flex-wrap grid of toggle buttons instead of a text input with dropdown
- Each button shows a status name; the currently selected one is highlighted (e.g., `bg-electric-blue text-white`)
- Still fetch statuses from `useTrackerColumns()` merged with `getUniqueStatuses()` API
- No text input needed -- purely click-to-select

---

## Fix 2: Improve Button Visibility on Profile Page

**Current behavior:** The "+" button for adding skills and the "Add" button for experience use `border-white/20 text-white hover:bg-white/10` -- making them nearly invisible until hovered.

**New behavior:** Give these action buttons a visible default style matching the app's brand (electric-blue tint), with a slightly lighter shade on hover for feedback. This follows the same pattern as the "Add Application" button on the dashboard.

**Implementation:**
- Update the skill "+" button: default `bg-electric-blue/20 text-electric-blue border-electric-blue/30`, hover `hover:bg-electric-blue/30`
- Update the experience "Add" button: same styling approach
- This keeps them visible at all times while the hover state adds a subtle brightness increase

---

### Technical Details

**Files to modify:**

1. **`src/components/kanban/StatusInput.tsx`** -- Replace the text input + dropdown with a toggle button group:
   - Render `allSuggestions` as a flex-wrap set of buttons
   - Active button: `bg-electric-blue text-white`
   - Inactive button: `bg-white/10 text-white/70 border border-white/20 hover:bg-white/20`
   - Remove the `Input`, `open` state, `filter` state, and click-outside logic

2. **`src/pages/ProfilePage.tsx`** -- Update button styles:
   - Line 221-228 (skill "+" button): Change classes to `bg-electric-blue/20 text-electric-blue border-electric-blue/30 hover:bg-electric-blue/30`
   - Line 237-245 (experience "Add" button): Change classes to `bg-electric-blue/20 text-electric-blue border-electric-blue/30 hover:bg-electric-blue/30`

