# Checkpoint 02 — Frontend Logic Decoupled from the UI

## Goal

Move all non-JSX logic out of pages and components into pure, framework-free,
unit-tested modules so the UI is a thin adapter and the logic is directly
testable (and inspectable via the checkpoint-00 harness) without rendering.

## Context

Logic currently lives inside pages/components:

- `app/(app)/dashboard/page.tsx` — `ACTIVITY_ALIASES`, `normalizeActivity`,
  `collectRecentActivity`, `collectRecentExpenses`, `formatExpenseCurrency`.
- `app/(app)/groups/page.tsx` — `buildBalanceMap`, tab/search filtering
  (`filteredGroups` useMemo).
- `app/(app)/activity/page.tsx` — `collectActivity` (merge + sort).
- `app/(app)/groups/[groupId]/summary/page.tsx` — `formatCurrency`,
  contribution mapping (`contributions`).
- `app/(app)/groups/[groupId]/expenses/page.tsx` — filter-application logic
  (`applyFilters`, `activeFilterCount`).
- `app/(app)/groups/[groupId]/balances/page.tsx` — member/balance transform.
- `app/(app)/profile/page.tsx` — `formatDate`.
- `app/(app)/balances/page.tsx` — per-group balance card grouping/derivation
  logic inside `GroupBalanceCard`.
- `components/activity/ActivityItem.tsx` — `formatTimestamp`, `formatTime`.
- `components/groups/GroupCard.tsx` — `formatBalance`.
- `components/groups/MemberList.tsx` — `formatDate`.
- `components/balances/BalanceList.tsx` — `formatCurrency`, `statusLabel`.
- `components/balances/SummaryChart.tsx` — `formatCurrency`,
  `formatCompactCurrency`, `truncateName`.
- `components/expenses/ExpenseCard.tsx` — reaction counting, `formatCurrency`,
  `formatDate`, `getSplitLabel`.
- `components/layout/Header.tsx` — breadcrumb/path derivation (inline).
- `components/layout/Sidebar.tsx` — `isLinkActive`.

## Deliverables

1. `frontend/lib/selectors/` pure modules (no React/JSX imports; typed with the
   existing `@/types`):
   - `format.ts` — `formatCurrency`, `formatCompactCurrency`, `formatDate`,
     `formatTimestamp`, `formatBalance`, `truncateName`.
   - `dashboard.ts` — `normalizeActivity`, `collectRecentActivity`,
     `collectRecentExpenses` (moved unchanged from dashboard page).
   - `groups.ts` — `buildBalanceMap`, `filterGroups`, `isLinkActive`.
   - `activity.ts` — `collectActivity` (merge + sort across group queries).
   - `expenses.ts` — `getSplitLabel`, `countReactions`, `applyExpenseFilters`,
     `activeFilterCount`.
   - `balances.ts` — `statusLabel`, member/balance transform helpers.
   - `header.ts` — breadcrumb segment derivation.
2. Update every page/component to import from the selectors (thin JSX only).
3. Unit tests: `frontend/lib/selectors/*.test.ts` covering each extracted
   function (vitest).

## Acceptance criteria (parity review)

- No page or data component in `app/` or `components/` defines a standalone
  logic helper (`function foo(` matching known extracted helpers) — grep check.
- Every extracted function has at least one unit test.
- Parity: the harness captures the rendered HTML of each affected page/component
  for fixed props **before** and **after** this checkpoint; the two dumps are
  identical for the same inputs.
- `sha256sum -c checkpoints/02-frontend-decoupling/plan.lock` passes.
- `npm test`, `npm run lint`, and `next build` pass.

## Out of scope

- New features or behavior changes (extraction is behavior-preserving).
- Refactoring hooks/services themselves.