# Checkpoint 01 — Skeletons for Every Component and Page

## Goal

Every page and every data-driven component has a dedicated skeleton (loading)
state, replacing one-off inline `Skeleton` blocks with reusable named skeleton
components. Skeleton layouts mirror the real layout so there is no layout shift
between loading and loaded states.

## Context

- The `Skeleton` UI primitive already exists (`components/ui/Skeleton.tsx`,
  variants: `text` | `circle` | `rect`).
- Pages currently render ad-hoc inline skeleton JSX while `isLoading`
  (e.g. dashboard, groups). Data components (GroupList, ExpenseList,
  BalanceList, ActivityFeed, MemberList, SummaryChart) have no skeleton of
  their own.

## Deliverables

1. `frontend/components/skeletons/` — page-level skeletons that mirror each
   page's real layout (header + action buttons, card grids, tables, list rows):
   - `DashboardOverviewSkeleton`
   - `GroupsPageSkeleton`
   - `ExpensesPageSkeleton`
   - `BalancesPageSkeleton`
   - `ActivityPageSkeleton`
   - `GroupSummarySkeleton`
   - `GroupExpensesSkeleton`
   - `GroupBalancesSkeleton`
   - `GroupMembersSkeleton`
   - `GroupActivitySkeleton`
   - `ProfilePageSkeleton`
   - `SettingsPageSkeleton`
   - `AuthCardSkeleton`
2. `frontend/components/skeletons/` — component-level skeletons:
   `GroupCardSkeleton`, `GroupListSkeleton`, `ExpenseCardSkeleton`,
   `ExpenseListSkeleton`, `BalanceCardSkeleton`, `BalanceListSkeleton`,
   `ActivityItemSkeleton`, `ActivityFeedSkeleton`, `MemberListSkeleton`,
   `SummaryChartSkeleton`, `SidebarSkeleton`, `HeaderSkeleton`.
3. Wire page skeletons into every page under its `isLoading` branch
   (replacing inline skeleton JSX).
4. Wire component-level skeletons into data components via an `isLoading`
   (and optional `count`) prop where the component owns its loading state.
5. Export all skeletons from a barrel `components/skeletons/index.ts`.

## Acceptance criteria (parity review)

- Every page in `app/` renders its named skeleton while loading (verified by
  RTL harness: render page with query mocked loading, assert skeleton present;
  render with data, assert skeleton absent and content present).
- No page contains a raw inline skeleton grid for its own loading state
  (grep check passes except inside `skeletons/` and `components/`).
- `sha256sum -c checkpoints/01-skeletons/plan.lock` passes.
- `npm run lint` and existing `next build` pass.

## Out of scope

- Any behavior change beyond loading visuals.
- Backend changes.