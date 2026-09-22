import { describe, expect, it } from "vitest";
import { breadcrumbSegments } from "@/lib/selectors/header";

describe("breadcrumbSegments", () => {
  it("derives labels, hrefs, and last-segment flags", () => {
    const segments = breadcrumbSegments("/groups/abc-123/expenses");
    expect(segments).toEqual([
      { label: "Groups", href: "/groups", isLast: false },
      { label: "Abc 123", href: "/groups/abc-123", isLast: false },
      { label: "Expenses", href: "/groups/abc-123/expenses", isLast: true },
    ]);
  });

  it("returns an empty list for the root path", () => {
    expect(breadcrumbSegments("/")).toEqual([]);
  });

  it("handles single segments", () => {
    const segments = breadcrumbSegments("/dashboard");
    expect(segments).toEqual([
      { label: "Dashboard", href: "/dashboard", isLast: true },
    ]);
  });
});