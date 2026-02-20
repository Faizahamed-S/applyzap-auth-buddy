

# Black & White Theme with Dark/Light Mode Toggle

## Overview
Replace all hardcoded deep-blue backgrounds with a proper black-and-white design system that supports both dark and light modes via a toggle. Dark mode uses near-black backgrounds with white text; light mode uses white/off-white backgrounds with black text.

## What Changes

### 1. Set Up Theme Provider (`src/App.tsx`)
- Wrap the app with `ThemeProvider` from `next-themes` (already installed)
- Default to dark mode

### 2. Update CSS Variables (`src/index.css`)
- **Light mode (`:root`)**: White/off-white backgrounds, dark text, light gray cards and borders
- **Dark mode (`.dark`)**: Near-black backgrounds (`#0A0A0A` / `#111`), white text, dark gray cards and borders
- Remove all blue-tinted background variables -- keep blue only for primary accent buttons and links
- Update sidebar variables to match (black in dark, white in light)

### 3. Create Theme Toggle Component
- New file: `src/components/ui/ThemeToggle.tsx`
- Simple Sun/Moon icon button using `next-themes` `useTheme()`
- Compact enough to fit in any header/navbar

### 4. Remove All Hardcoded Colors from Pages
Replace every `bg-[#050A30]`, `bg-[hsl(230,75%,10%)]`, `text-white`, `text-white/70`, `border-white/10` with theme-aware Tailwind classes:

| Page | Current | New |
|---|---|---|
| `Login.tsx` | `bg-[hsl(230,75%,10%)]` | `bg-background` |
| `Signup.tsx` | `bg-[hsl(230,75%,10%)]` | `bg-background` |
| `ForgotPassword.tsx` | `bg-gradient-to-br from-background to-secondary/20` | `bg-background` |
| `ResetPassword.tsx` | `bg-gradient-to-br from-background to-secondary/20` | `bg-background` |
| `VerifyEmail.tsx` | `bg-gradient-to-br from-background to-secondary/20` | `bg-background` |
| `Dashboard.tsx` | `bg-[#050A30]` | `bg-background` |
| `ProfilePage.tsx` | `bg-[#050A30]`, `text-white`, `border-white/10` | `bg-background`, `text-foreground`, `border-border` |
| `StatusApplicationsPage.tsx` | `bg-background` (already correct) | No change needed |
| `NotFound.tsx` | `bg-gray-100` | `bg-background` |
| `JobKanbanBoard.tsx` | `bg-[#050A30]`, `text-white`, `border-white/10` | `bg-background`, `text-foreground`, `border-border` |
| `DashboardSidebar.tsx` | `bg-[hsl(230,75%,10%)]` | `bg-sidebar` (uses CSS variable) |

### 5. Update Landing Page
- `HeroSection.tsx`: Replace `bg-gradient-hero` with a black-to-dark-gray gradient in dark mode, white-to-gray in light mode (update the CSS variable)
- `ProblemSection.tsx`, `FeaturesSection.tsx`, `RoadmapSection.tsx`: Use `bg-background`/`bg-card` classes
- `Footer.tsx`: Already uses `bg-background` -- no change

### 6. Update Logo Component
- The Logo `variant` prop currently controls text color manually
- Update so `variant="auto"` follows the theme naturally (dark text in light mode, white text in dark mode)

### 7. Add Toggle to Key Locations
- Add the theme toggle button to:
  - Landing page header (HeroSection nav)
  - Dashboard/Kanban header bar
  - Profile page header
  - Auth pages (top-right corner)

## Files to Create
| File | Purpose |
|---|---|
| `src/components/ui/ThemeToggle.tsx` | Sun/Moon toggle button |

## Files to Edit
| File | Change |
|---|---|
| `src/App.tsx` | Wrap with `ThemeProvider` |
| `src/index.css` | Update `:root` and `.dark` CSS variables to pure B&W palette |
| `src/pages/Login.tsx` | Remove hardcoded bg, add theme toggle |
| `src/pages/Signup.tsx` | Remove hardcoded bg, add theme toggle |
| `src/pages/ForgotPassword.tsx` | Remove gradient bg, add Logo + theme toggle |
| `src/pages/ResetPassword.tsx` | Remove gradient bg, add Logo + theme toggle |
| `src/pages/VerifyEmail.tsx` | Remove gradient bg, add Logo + theme toggle |
| `src/pages/Dashboard.tsx` | Remove hardcoded `#050A30` |
| `src/pages/ProfilePage.tsx` | Replace all hardcoded white/blue colors with theme classes |
| `src/pages/NotFound.tsx` | Replace `bg-gray-100` with `bg-background` |
| `src/pages/StatusApplicationsPage.tsx` | Minor -- ensure consistency |
| `src/components/kanban/JobKanbanBoard.tsx` | Replace hardcoded colors, add theme toggle to header |
| `src/components/dashboard/DashboardSidebar.tsx` | Replace hardcoded bg |
| `src/components/landing/HeroSection.tsx` | Update gradient + add theme toggle |
| `src/components/ui/Logo.tsx` | Make `variant="auto"` respect theme |

## No New Dependencies
`next-themes` is already installed. No other packages needed.

## No Database Changes
This is purely a frontend styling update.
