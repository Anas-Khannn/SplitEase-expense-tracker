# SplitEase Checkpoint Status

> Resume point. A fresh session can read this file to continue work exactly
> where it stopped. Update after every step.

## Overall progress

| Checkpoint | Plan | Lock | Implementation | Acceptance |
|------------|------|------|----------------|------------|
| 00-harness | approved | LOCKED | **DONE** | **PASSED** |
| 01-skeletons | approved | **LOCKED** | **DONE** | **PASSED** |
| 02-frontend-decoupling | approved | **LOCKED** | **DONE** | **PASSED** |
| 03-backend-separation | approved | **LOCKED** | **DONE** | **PASSED** |
| 04-stitch-ui-backend-alignment | approved | **LOCKED** | **DONE** | **PASSED** |
| 05-stitch-full-ui-overhaul | approved | **LOCKED** | **DONE** | **PASSED** |

Base branch: `feat/shadcn-ui-overhaul` (working tree was clean at start of work).

## Checkpoint 00 — harness (DONE)

What shipped:
- `backend/src/utils/service-registry.js` — 9 services registered.
- `backend/scripts/debug-cli.js` — `--list`, `<service>.<method> [argsJson]`,
  `--sync` flag. Verified: `--list`, `NODE_ENV=test --sync auth.signup`.
- `backend/src/routes/debug.routes.js` — `GET /api/debug/services`,
  `GET /api/debug/service/:service/:method?args=<json>`, mounted in app.js only
  when NODE_ENV !== production. Verified in test env (200 list, 404 unknown).
- Backend jest suite: 231 tests pass.
- Frontend deps: vitest 3.2.7, @vitejs/plugin-react@5, jsdom, RTL 16,
  jest-dom 6 (plugin-react pinned to v5 to avoid Babel 8 conflict;
  allowScripts += esbuild, unrs-resolver).
- `frontend/vitest.config.ts`, `frontend/test/setup.ts`,
  `frontend/harness/render.tsx`, `frontend/harness/dump.test.tsx`.
- npm scripts: `test`, `test:run`, `harness:dump`.
- Verified: `HARNESS_COMPONENT=EmptyState ... npm run harness:dump` writes JSON
  to HARNESS_OUTPUT; smoke tests for ExpenseList + cn pass. Lint: 0 errors.

Usage notes (call convention): services that take an options object are called
with that object as a single array element:
`node scripts/debug-cli.js auth.signup '[{"name":"x","email":"e","password":"p"}]'`

## Checkpoint 01 — skeletons (DONE)

Started: after locking `checkpoints/01-skeletons/plan.lock`.

### Done
- `frontend/components/skeletons/component-skeletons.tsx` — GroupCardSkeleton,
  GroupListSkeleton, ExpenseCardSkeleton, ExpenseListSkeleton (frame=table|rows,
  mirrors table + mobile cards), BalanceListSkeleton (embedded option),
  BalanceCardSkeleton, ActivityItemSkeleton, ActivityFeedSkeleton (card option),
  MemberListSkeleton, SummaryChartSkeleton, SidebarSkeleton, HeaderSkeleton.
- `frontend/components/skeletons/page-skeletons.tsx` — DashboardOverviewSkeleton,
  GroupsPageSkeleton, ExpensesPageSkeleton, BalancesPageSkeleton,
  ActivityPageSkeleton, GroupSummarySkeleton, GroupExpensesSkeleton,
  GroupBalancesSkeleton, GroupMembersSkeleton, GroupActivitySkeleton,
  ProfilePageSkeleton, SettingsPageSkeleton, AuthCardSkeleton.
- `frontend/components/skeletons/index.ts` barrel.
- Wired into every page's loading branch (dashboard, groups, expenses,
  balances, activity, all group sub-pages, profile, settings). Zero raw
  `<Skeleton` grids remain in `app/`.
- Data components own loading state via `isLoading`/`skeletonCount` props:
  GroupList, ExpenseList, ActivityFeed, BalanceList, MemberList, SummaryChart.
- Acceptance: RTL harness tests pass (skeleton shown while loading, content
  when loaded, page skeleton renders), `npm run lint` 0 errors,
  `npm run test:run` 6 pass, `next build` green (17 pages).
- Verified: `HARNESS_COMPONENT=ExpenseList ... isLoading:true` dump contains
  `animate-pulse`.

### Notes
- `AuthCardSkeleton` shipped but un-wired: auth screens have no loading state
  (static forms), so there is no branch to substitute.

## Checkpoint 02 — frontend decoupling (DONE)

Started: after locking `checkpoints/02-frontend-decoupling/plan.lock`.

### Plan
Extract all non-JSX logic into pure, unit-tested `frontend/lib/selectors/`
modules (`format`, `dashboard`, `groups`, `activity`, `expenses`, `balances`,
`header`). Pages/components import from selectors; behavior must be identical
(verified via harness before/after HTML dumps).

### Done
- `frontend/lib/selectors/` created: `format.ts` (formatCurrency,
  formatCompactCurrency, formatBalance, formatDate/formatTimestamp/formatTime,
  truncateName), `dashboard.ts` (normalizeActivity, collectRecentActivity,
  collectRecentExpenses), `groups.ts` (buildBalanceMap, filterGroups,
  isLinkActive, GroupTab), `activity.ts` (collectActivity),
  `expenses.ts` (getSplitLabel, countReactions, activeFilterCount,
  validateExpenseFilters), `balances.ts` (statusLabel,
  groupMembersToOptions), `header.ts` (breadcrumbSegments), `index.ts` barrel.
- Rewired callers to selectors, deleting inline logic: dashboard, groups,
  activity pages; group {summary, balances, expenses} pages; profile page;
  ActivityItem, GroupCard, MemberList, BalanceList, SummaryChart, ExpenseCard,
  Header, Sidebar.
- Harness parity rig: `harness/fixtures.ts` + QueryClientProvider wrapper in
  `render.tsx`; registry now covers ExpenseCard, ActivityItem, ActivityFeed,
  GroupCard, BalanceList, MemberList, SummaryChart. `HARNESS_PROPS` behaviour
  preserved; `HARNESS_OVERRIDES` supported for fixture components.
- Parity: before/after HTML dumps for all 8 harness components are
  byte-identical.
- Unit tests: `lib/selectors/*.test.ts` (format, dashboard, groups, activity,
  expenses, balances, header) + existing harness tests = 57 tests pass.
- Acceptance: `npm run test:run` 57 pass, `npm run lint` 0 errors (5
  pre-existing warnings), `next build` green (17 pages).

## Checkpoint 03 — backend separation (DONE)

Started: after locking `checkpoints/03-backend-separation/plan.lock`.

### Audit
- All 9 controllers reviewed (auth, balance, dashboard, expense, group,
  payment, reaction, summary, activity). All were thin: one service call +
  `{ success, message?, data }` envelope + correct HTTP status.
- `grep` for inline computation (`.map/.filter/.reduce/Math.*/toFixed` etc.)
  across controllers: no matches.
- Services contain zero HTTP imports (`req.`/`res.` confirmed absent).
- Only inline logic found: pagination parsing in `activity.controller.js`
  (`parseInt(req.query.page) || 1`); expense/summary use the validatedQuery
  middleware instead.

### Done
- `backend/src/utils/pagination.utils.js` — pure `parsePagination(query,
  defaults)` helper with `DEFAULT_PAGE_SIZE`/`MAX_PAGE_SIZE`; mirrors the
  original `parseInt || fallback` contract exactly (negative ints forwarded,
  oversized limits clamped) so observable behavior is unchanged.
- `activity.controller.js` now uses `parsePagination(req.query)`; no inline
  parsing remains in any controller.
- `backend/__tests__/pagination-utils.test.js` — 7 unit tests (defaults,
  string/int parsing, zero/empty/non-numeric fallbacks, negative passthrough,
  limit clamp, custom defaults).

### Acceptance
- Full backend suite: **238 tests pass** (231 existing + 7 new for the
  extracted helper).
- `node scripts/debug-cli.js --list` works (no new service methods added, so
  nothing new to expose; registry unchanged and healthy).
- `sha256sum -c checkpoints/03-backend-separation/plan.lock` passes.

## Checkpoint 04 — stitch-ui-backend-alignment (DONE)

Started: after locking `checkpoints/04-stitch-ui-backend-alignment/plan.lock`.

### Done
- Downloaded and cataloged all 40 Google Stitch screens into `docs/stitch/` (HTML templates, high-res screenshots, and `manifest.json`).
- `frontend/components/layout/MobileBottomNav.tsx` — added app-native mobile bottom navigation bar with safe-area padding (`pb-safe`) for 1-tap switching between Dashboard, Expenses, Balances, Activity, and Groups.
- `frontend/app/(app)/layout.tsx` — wired `MobileBottomNav` with responsive padding clearance for mobile screens (`pb-20 md:pb-6`).
- `frontend/app/(app)/expenses/page.tsx` — aligned with Stitch "Choose a Group" specification with segmented status filters (All Groups, Active, Settled), search input, and responsive group cards.
- `frontend/app/(app)/profile/page.tsx` — upgraded to match Stitch profile screen specifications with live stats cards (You're owed [emerald], You owe [rose], Active Groups count), user details table with SplitEase tag copy support, and currency/language preferences.

### Acceptance
- Full backend suite: **238 tests pass** (10 test suites).
- Frontend test suite: **57 unit and harness tests pass** (8 test files).
- Frontend linting: **0 errors** (1 pre-existing warning).
- Frontend production build: **17/17 pages generated cleanly** (`next build --webpack`).
- Hash lock `sha256sum -c checkpoints/04-stitch-ui-backend-alignment/plan.lock` passes.

## Checkpoint 05 — stitch-full-ui-overhaul (DONE)

Started: after locking `checkpoints/05-stitch-full-ui-overhaul/plan.lock`.

### Done
- **`Header.tsx` & `Sidebar.tsx`**: Transformed desktop and shell navigation matching Stitch designs (`Live sync` pulsating pill badge, global search with `⌘K` badge, currency indicator, alert notification bell, pinned "+ Add expense" CTA, version tag, and user trigger footer).
- **`Dashboard` (`/dashboard`)**: Full Stitch Bento layout rebuild with billing cycle banner, 3 KPI metric cards (You're owed [emerald], You owe [rose] with "Pay back →", Net balance with status pill), and 2-column grid (Your Groups + Recent Activity).
- **`Groups` (`/groups`)**: Full Stitch Bento layout rebuild with 3 summary stat cards (Total balance, Owed, Owe), segmented filter tabs (All / Active / Settled), search input, and 3-column group cards grid with member avatars and quick actions.
- **`Balances` (`/balances`)**: Full Stitch layout rebuild with 3 summary stat cards, 2-column layout (People balances with filter chips and Remind/Pay action triggers, Group breakdown with direct links).
- **`Activity` (`/activity`)**: Full Stitch layout rebuild with segmented filter pills (All activity, Expenses, Payments & Settlements, Members) and styled event cards.
- **`Group Details` (`/groups/[groupId]/*`)**:
  - `GroupHeader`: Stitch group banner with category icon, status badge, member avatars, Invite trigger, and active border-b tabs.
  - `Summary`: Hero balance card with emerald/rose indicators, member balance list, total spending, and contributions chart.
  - `Expenses`: Verified itemized expense rows, split tags, and fixed amount display in `ExpenseTableRow`.
  - `Balances`: Settle up modal integration and member balance breakdown.
  - `Members`: Member list with role promote/demote and remove confirmation modal.
  - `Activity`: Paginated group activity feed with relative timestamps.
- Cleaned up lint warnings and confirmed zero build or TypeScript issues.

### Acceptance
- Full backend suite: **238 tests pass** (10 test suites).
- Frontend test suite: **57 unit and harness tests pass** (8 test files).
- Frontend linting: **0 errors** (1 pre-existing warning).
- Frontend production build: **17/17 pages compiled cleanly** (`next build --webpack`).
- Hash lock `sha256sum -c checkpoints/05-stitch-full-ui-overhaul/plan.lock` passes.

## Resume commands

```bash
sha256sum -c checkpoints/05-stitch-full-ui-overhaul/plan.lock
cd backend && npm test
cd frontend && npm run test:run
cd frontend && npm run lint
cd frontend && npm run build
```