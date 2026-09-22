# Checkpoint 04 — Stitch UI & Backend Feature Alignment

## Goal

Align SplitEase's frontend user experience and backend functionality with the 40 high-fidelity screens designed in Google Stitch (`projects/11317181224524761185`), while maintaining full regression test coverage, test harness parity, and strict adherence to the project's shadcn/ui design tokens.

## Context & Stitch Inventory

All 40 screens have been downloaded into `docs/stitch/` (HTML templates, high-res screenshots, and `manifest.json`).
The Stitch design specification establishes:
- **Design Language**: shadcn/ui aesthetic with light/dark theme support, 1px neutral borders (`border-zinc-200` / `dark:border-zinc-800`), clean typography (Inter + Geist mono), and money semantics (emerald for positive/owed, rose for negative/owing).
- **Responsive Architecture**:
  - **Desktop**: Left fixed sidebar navigation (256px), top sticky breadcrumbs/header with search & user menu, and multi-column bento grid cards.
  - **Mobile**: Sticky top app bar, native-feeling bottom navigation bar (`MobileBottomNav`) with safe area insets, full-bleed touch targets (44px+), and stacked cards.

## Scope & Deliverables

### 1. Mobile App-Native Shell & Navigation
- Create `frontend/components/layout/MobileBottomNav.tsx`:
  - Renders fixed bottom navigation dock on mobile viewports (`md:hidden`) with destinations:
    1. **Dashboard** (`/dashboard`)
    2. **Expenses** (`/expenses`)
    3. **Balances** (`/balances`)
    4. **Activity** (`/activity`)
    5. **Groups** (`/groups`)
  - Supports active indicators, icon stroke matching, and iOS safe area padding (`pb-safe`).
  - Integrated into `frontend/app/(app)/layout.tsx` so mobile users experience the app-native feel designed in Stitch (`splitease_-_dashboard_overview_926e107f.html`).

### 2. Global Expenses & Group Picker Alignment
- Align `frontend/app/(app)/expenses/page.tsx` with Stitch's "Expenses - Choose a Group" specification:
  - If a user has groups, provide a group picker segmented control or card grid allowing instant filtering between all groups or a selected group.
  - Support instant expense creation targeting the active or chosen group.
  - Render empty and loading states cleanly using `ExpenseListSkeleton`.

### 3. Group Detail Sub-Pages Polish
- **Group Summary (`/groups/[groupId]/summary`)**:
  - Align with Stitch (`splitease_-_apartment_group_summary__desktop_c7c65181.html`):
    - Hero Group Balance Card with gradient background, net positive/negative pill, and settlement summary ("All settled with X of Y members").
    - Action buttons: "+ Add expense", "Settle up", "Invite".
    - Monthly spending filter and category/payer breakdown.
- **Group Balances (`/groups/[groupId]/balances`)**:
  - Settle-up modal integration connecting to `POST /api/groups/:groupId/payments`.
  - Individual balance rows with debtor/creditor breakdown and "Settle up" quick trigger.
- **Group Members (`/groups/[groupId]/members`)**:
  - Member cards with avatars, roles (`ADMIN` vs `MEMBER`), and admin actions.
- **Group Activity (`/groups/[groupId]/activity`)**:
  - Chronological feed with reactions support.

### 4. User Profile & Settings Polish
- **Profile (`/profile`)**:
  - Align with Stitch (`splitease_-_profile__desktop_22cb8e22.html`):
    - Profile header banner with avatar and verified status.
    - Quick Stats row (Owed to you, You owe, Active Groups count).
    - Account details table (Name, Email, SplitEase tag, Member since).
- **Settings (`/settings`)**:
  - Appearance settings (theme selector: Light / Dark / System).
  - Default currency and regional preference selectors.

### 5. Backend Alignment & Hardening
- Audit and ensure backend services support profile updates (`PUT /api/auth/profile` or `/me`) if user modifies preferences.
- Verify payment settlement endpoint (`POST /api/groups/:groupId/payments`) is wired and covered by tests.
- Maintain test registry in `backend/src/utils/service-registry.js`.
- Keep full test suites green (backend 238 tests, frontend 57 tests).

## Acceptance Criteria

1. `npm test` in `backend/` passes (all 238+ tests green).
2. `npm run test:run` in `frontend/` passes (all 57+ unit and harness tests green).
3. `npm run lint` in `frontend/` reports 0 errors.
4. `npm run build` in `frontend/` completes successfully with all 17 routes rendered.
5. Mobile bottom navigation renders properly on viewport widths < 768px, and desktop sidebar renders on viewports >= 768px.
6. Hash lock `checkpoints/04-stitch-ui-backend-alignment/plan.lock` is verified before and after implementation.

## Out of Scope
- Third-party OAuth providers (Google/GitHub actual credentials).
- Real payment gateway API processing (Stripe/PayPal live processing).
