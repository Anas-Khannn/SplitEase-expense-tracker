import { describe, expect, it } from "vitest";
import {
  activeFilterCount,
  countReactions,
  getSplitLabel,
  validateExpenseFilters,
} from "@/lib/selectors/expenses";
import { EXPENSE } from "@/harness/fixtures";

describe("getSplitLabel", () => {
  it("joins participant names", () => {
    expect(getSplitLabel(EXPENSE)).toBe("Alex Doe, Jordan Smith");
  });

  it("falls back to a participant count", () => {
    const unnamed = {
      ...EXPENSE,
      splits: EXPENSE.splits.map((s) => ({ ...s, user: { ...s.user, name: "" } })),
    };
    expect(getSplitLabel(unnamed)).toBe("2 participants");

    const single = { ...unnamed, splits: [unnamed.splits[0]] };
    expect(getSplitLabel(single)).toBe("1 participant");
  });

  it("ignores empty names", () => {
    const partiallyNamed = {
      ...EXPENSE,
      splits: EXPENSE.splits.map((s, i) => ({
        ...s,
        user: { ...s.user, name: i === 0 ? "Alex Doe" : "" },
      })),
    };
    expect(getSplitLabel(partiallyNamed)).toBe("Alex Doe");
  });
});

describe("countReactions", () => {
  it("counts reactions of a given type", () => {
    const reactions = [
      { reaction: "👍", user_id: "u1" },
      { reaction: "👍", user_id: "u2" },
      { reaction: "😂", user_id: "u3" },
    ] as never[];
    expect(countReactions(reactions, "👍")).toBe(2);
    expect(countReactions(reactions, "😂")).toBe(1);
  });

  it("handles undefined reactions", () => {
    expect(countReactions(undefined, "👍")).toBe(0);
  });
});

describe("activeFilterCount", () => {
  it("counts set filters", () => {
    expect(activeFilterCount({ payer_id: "u1", start_date: "2026-01-01", end_date: "2026-02-01" })).toBe(3);
    expect(activeFilterCount({ payer_id: "u1" })).toBe(1);
    expect(activeFilterCount({})).toBe(0);
  });
});

describe("validateExpenseFilters", () => {
  it("returns an error when start is after end", () => {
    expect(validateExpenseFilters({ start_date: "2026-03-02", end_date: "2026-03-01" })).toBe(
      "Start date must be on or before end date."
    );
  });

  it("returns null for valid or partial ranges", () => {
    expect(validateExpenseFilters({})).toBeNull();
    expect(validateExpenseFilters({ start_date: "2026-03-01", end_date: "2026-03-02" })).toBeNull();
    expect(validateExpenseFilters({ start_date: "2026-03-01" })).toBeNull();
  });
});