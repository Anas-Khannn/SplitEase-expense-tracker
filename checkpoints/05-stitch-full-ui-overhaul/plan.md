# Checkpoint 05 — Full Stitch UI Overhaul (App Shell, Dashboard, Groups, Balances, Activity)

## Goal

Fully replace all legacy/placeholder UI elements across the inner application pages (`Header`, `Sidebar`, `Dashboard`, `Groups`, `Balances`, `Activity`) with the high-fidelity shadcn/ui designs designed in Google Stitch (`projects/11317181224524761185`), while preserving all underlying data hooks, selectors, and test suites.

## Context

While Checkpoints 00–04 established architecture, skeletons, selectors, backend separation, and mobile navigation, the visual presentation of the main app pages still retained older card layouts, missing the precise typography, bento grids, stat card designs, search controls, and visual polish present in the Stitch templates (`docs/stitch/html/*`).

## Deliverables

### 1. Header & Sidebar Stitch Alignment
- **`frontend/components/layout/Header.tsx`**:
  - Transform top header into the Stitch desktop navigation bar (`splitease_-_dashboard_overview__desktop_4da78d0f.html` lines 154-195):
    - Left: Breadcrumb / context & active route title with live-sync indicator pill (`Live sync` with pulsating emerald dot).
    - Center/Right: Global search bar with shortcut badge (`⌘K`).
    - Currency pill badge: `USD ($)`.
    - Notification bell button with alert badge.
    - Quick "+ Add expense" button.
    - User avatar and `ProfileDropdown`.
- **`frontend/components/layout/Sidebar.tsx`**:
  - Transform sidebar into the Stitch fixed desktop nav (`splitease_-_dashboard_overview__desktop_4da78d0f.html` lines 64-150):
    - Brand header with icon mark, `SplitEase` title, `v2.4` pill badge, and `Expense Sharing` subtitle.
    - Pinned "+ Add Expense" action button right under brand.
    - Navigation items with icons and live counters:
      - `Dashboard`
      - `Expenses`
      - `Balances` (with live balance indicator)
      - `Activity` (with event count badge)
      - `Groups` (with active group count badge)
    - Pinned footer section with `Profile`, `Settings`, and interactive user account card (initials, name, email, more icon).

### 2. Dashboard Page Stitch Bento Overhaul (`/dashboard`)
- Rebuild `frontend/app/(app)/dashboard/page.tsx` matching `splitease_-_dashboard_overview__desktop_4da78d0f.html`:
  - Welcome hero banner: `Dashboard Overview` headline, `Welcome back, [User]. Here's what's happening across your groups today.` subtitle, and `Current billing cycle: [Month YYYY]` badge.
  - 3 Stitch KPI Stat Cards:
    - **You're owed**: uppercase label, emerald trend icon in rounded container, large `+$X.XX` tabular figure, subtitle with emerald indicator dot ("X friends owe you across Y groups").
    - **You owe**: uppercase label, rose trend icon in rounded container, large `-$X.XX` tabular figure, subtitle with rose indicator dot ("X pending payments"), and quick "Pay back →" button.
    - **Net balance**: uppercase label, wallet icon in rounded container, large figure with "Overall positive" or "Deficit" pill badge, subtitle with indicator dot.
  - Two-Column Bento Layout:
    - Left: **Your Groups** card with "See all (X)" link, group items with icon in rounded-lg, group name, member count & description, right-aligned balance with status text.
    - Right: **Recent Activity** card with categorized items, category icons, timestamps, and amounts.

### 3. Groups Page Stitch Bento Overhaul (`/groups`)
- Rebuild `frontend/app/(app)/groups/page.tsx` matching `splitease_-_groups__desktop_42d61b02.html`:
  - Page header with "Your Groups" title, subtitle, and "+ Create group" CTA button.
  - 3 Summary Stat cards above groups: Total balance, You're owed, You owe.
  - Segmented control filter: `All Groups (X)` | `Active (Y)` | `Settled (Z)`.
  - Search input ("Search groups by name...").
  - 3-column Bento Grid of group cards:
    - Group category icon in rounded container.
    - Group name and description.
    - Member avatar stack + member count.
    - Role badge (`Admin`).
    - Balance indicator (You're owed / You owe / Settled).
    - Direct actions ("View Expenses →", "Settle up").

### 4. Balances Page Stitch Overhaul (`/balances`)
- Rebuild `frontend/app/(app)/balances/page.tsx` matching `splitease_-_balances__desktop_5aae4501.html`:
  - Header with title and subtitle.
  - 3 Stat Cards row (You're owed, You owe, Net balance).
  - Two-column layout:
    - Left (People): member balance list with avatar initials, name, group tags, amount, and action buttons ("Remind" / "Pay").
    - Right (Group Breakdown): card list of group balances with direct links to settle or view.

### 5. Activity Page Stitch Overhaul (`/activity`)
- Rebuild `frontend/app/(app)/activity/page.tsx` matching `splitease_-_activity_feed__desktop_41cc3d6b.html`:
  - Filter pills: `All activity` | `Expenses` | `Payments & Settlements`.
  - Grouped activity feed items with styled category icon avatars, bold actor & subject, relative timestamp, and status badges.

## Acceptance Criteria

1. `npm test` in `backend/` passes (all 238 tests green).
2. `npm run test:run` in `frontend/` passes (all 57 tests green).
3. `npm run lint` in `frontend/` passes (0 errors).
4. `npm run build` in `frontend/` compiles cleanly (17/17 routes).
5. Verify plan lock `sha256sum -c checkpoints/05-stitch-full-ui-overhaul/plan.lock`.
