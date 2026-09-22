import { describe, expect, it } from "vitest";
import { groupMembersToOptions, statusLabel } from "@/lib/selectors/balances";

describe("statusLabel", () => {
  it("labels each balance status", () => {
    expect(statusLabel("OWED")).toBe("The group owes");
    expect(statusLabel("OWES")).toBe("Owes the group");
    expect(statusLabel("SETTLED")).toBe("All settled");
  });

  it("falls back to the raw status", () => {
    expect(statusLabel("UNKNOWN" as never)).toBe("UNKNOWN");
  });
});

describe("groupMembersToOptions", () => {
  it("maps members to id/name options", () => {
    const members = [
      { user_id: "u1", name: "Alex", email: "a@x.com", role: "admin" as const, joined_at: "" },
      { user_id: "u2", name: "Jordan", email: "j@x.com", role: "member" as const, joined_at: "" },
    ];
    expect(groupMembersToOptions(members)).toEqual([
      { user_id: "u1", name: "Alex" },
      { user_id: "u2", name: "Jordan" },
    ]);
  });

  it("handles an empty list", () => {
    expect(groupMembersToOptions([])).toEqual([]);
  });
});