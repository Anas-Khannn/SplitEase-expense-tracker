import type { UseQueryResult } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import {
  collectRecentActivity,
  collectRecentExpenses,
  normalizeActivity,
} from "@/lib/selectors/dashboard";
import { ACTIVITY, EXPENSE, GROUP } from "@/harness/fixtures";
import type { Activity } from "@/types";

function queryOf(data: unknown): UseQueryResult<never[], Error> {
  return { data } as unknown as UseQueryResult<never[], Error>;
}

describe("normalizeActivity", () => {
  it("maps legacy snake_case keys to canonical actions", () => {
    const legacy = { ...ACTIVITY, action: "added_expense" } as unknown as Activity;
    expect(normalizeActivity(legacy).action).toBe("EXPENSE_CREATED");
  });

  it("returns known actions unchanged", () => {
    expect(normalizeActivity(ACTIVITY)).toBe(ACTIVITY);
  });

  it("leaves unknown actions as-is", () => {
    const unknown = { ...ACTIVITY, action: "some_new_action" } as unknown as Activity;
    expect(normalizeActivity(unknown).action).toBe("some_new_action");
  });
});

describe("collectRecentActivity", () => {
  const groups = [GROUP];

  it("merges activity across groups and sorts newest first", () => {
    const older = { ...ACTIVITY, activity_id: "old", created_at: "2026-03-01T00:00:00.000Z" };
    const newer = { ...ACTIVITY, activity_id: "new", created_at: "2026-04-01T00:00:00.000Z" };
    const { activities } = collectRecentActivity(
      groups,
      [queryOf([newer, older])]
    );
    expect(activities.map((a) => a.activity_id)).toEqual(["new", "old"]);
  });

  it("truncates to the limit and builds a group name map", () => {
    const items = Array.from({ length: 8 }, (_, i) => ({
      ...ACTIVITY,
      activity_id: `act-${i}`,
      created_at: `2026-03-${String(i + 1).padStart(2, "0")}T00:00:00.000Z`,
    }));
    const { activities, groupNames } = collectRecentActivity(
      groups,
      [queryOf(items)],
      3
    );
    expect(activities).toHaveLength(3);
    expect(groupNames).toEqual({ [GROUP.group_id]: GROUP.name });
  });
});

describe("collectRecentExpenses", () => {
  it("merges expenses and sorts by expense_date descending", () => {
    const older = { ...EXPENSE, expense_id: "exp-old", expense_date: "2026-03-01T00:00:00.000Z" };
    const newer = { ...EXPENSE, expense_id: "exp-new", expense_date: "2026-04-01T00:00:00.000Z" };
    const { expenses } = collectRecentExpenses([GROUP], [queryOf([newer, older])]);
    expect(expenses.map((e) => e.expense_id)).toEqual(["exp-new", "exp-old"]);
  });

  it("truncates to the default limit of 5", () => {
    const items = Array.from({ length: 7 }, (_, i) => ({
      ...EXPENSE,
      expense_id: `exp-${i}`,
      expense_date: `2026-03-${String(i + 1).padStart(2, "0")}T00:00:00.000Z`,
    }));
    const { expenses } = collectRecentExpenses([GROUP], [queryOf(items)]);
    expect(expenses).toHaveLength(5);
  });
});