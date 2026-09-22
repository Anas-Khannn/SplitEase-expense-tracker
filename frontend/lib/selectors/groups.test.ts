import { describe, expect, it } from "vitest";
import {
  buildBalanceMap,
  filterGroups,
  isLinkActive,
} from "@/lib/selectors/groups";
import type { DashboardSummary, GroupListItem } from "@/types";

const GROUPS: GroupListItem[] = [
  { group_id: "g-settled", name: "Trip", icon: null, description: null, role: "admin" },
  { group_id: "g-owed", name: "Rent", icon: null, description: null, role: "member" },
  { group_id: "g-owes", name: "Dinner Club", icon: null, description: null, role: "member" },
];

const SUMMARY: DashboardSummary = {
  total_owed: 0,
  total_owe: 0,
  net_balance: 0,
  groups: [
    { group_id: "g-settled", group_name: "Trip", icon: null, balance: 0 },
    { group_id: "g-owed", group_name: "Rent", icon: null, balance: 25 },
    { group_id: "g-owes", group_name: "Dinner Club", icon: null, balance: -30 },
  ],
};

describe("buildBalanceMap", () => {
  it("maps group ids to balances", () => {
    expect(buildBalanceMap(SUMMARY)).toEqual({
      "g-settled": 0,
      "g-owed": 25,
      "g-owes": -30,
    });
  });

  it("returns an empty map when summary is undefined", () => {
    expect(buildBalanceMap(undefined)).toEqual({});
  });
});

describe("filterGroups", () => {
  const balances = buildBalanceMap(SUMMARY);

  it("returns all groups on the all tab", () => {
    expect(filterGroups(GROUPS, "", "all", balances, true)).toHaveLength(3);
  });

  it("returns only settled groups", () => {
    expect(filterGroups(GROUPS, "", "settled", balances, true).map((g) => g.group_id)).toEqual([
      "g-settled",
    ]);
  });

  it("returns only outstanding groups", () => {
    expect(filterGroups(GROUPS, "", "outstanding", balances, true).map((g) => g.group_id)).toEqual([
      "g-owed",
      "g-owes",
    ]);
  });

  it("filters by search query case-insensitively", () => {
    expect(filterGroups(GROUPS, "rent", "all", balances, true).map((g) => g.group_id)).toEqual([
      "g-owed",
    ]);
  });

  it("ignores tabs when balances are unavailable", () => {
    expect(filterGroups(GROUPS, "", "settled", balances, false)).toHaveLength(3);
  });

  it("handles undefined groups", () => {
    expect(filterGroups(undefined, "", "all", balances, true)).toEqual([]);
  });
});

describe("isLinkActive", () => {
  it("matches dashboard exactly", () => {
    expect(isLinkActive("/dashboard", "/dashboard")).toBe(true);
    expect(isLinkActive("/dashboard", "/dashboard/extra")).toBe(false);
  });

  it("matches a route and its sub-routes", () => {
    expect(isLinkActive("/groups", "/groups")).toBe(true);
    expect(isLinkActive("/groups", "/groups/abc-123/expenses")).toBe(true);
  });

  it("does not match unrelated routes", () => {
    expect(isLinkActive("/groups", "/expenses")).toBe(false);
  });
});