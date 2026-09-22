import type { UseQueryResult } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { collectActivity } from "@/lib/selectors/activity";
import { ACTIVITY, GROUP } from "@/harness/fixtures";

function queryOf(data: unknown): UseQueryResult<never[], Error> {
  return { data } as unknown as UseQueryResult<never[], Error>;
}

describe("collectActivity", () => {
  it("merges activity across groups and sorts newest first", () => {
    const older = { ...ACTIVITY, activity_id: "old", created_at: "2026-03-01T00:00:00.000Z" };
    const newer = { ...ACTIVITY, activity_id: "new", created_at: "2026-04-01T00:00:00.000Z" };
    const { activities } = collectActivity([GROUP], [queryOf([newer, older])]);
    expect(activities.map((a) => a.activity_id)).toEqual(["new", "old"]);
  });

  it("builds a group name map", () => {
    const { groupNames } = collectActivity([GROUP], [queryOf([])]);
    expect(groupNames).toEqual({ [GROUP.group_id]: GROUP.name });
  });

  it("handles empty inputs", () => {
    const { activities, groupNames } = collectActivity(undefined, []);
    expect(activities).toEqual([]);
    expect(groupNames).toEqual({});
  });
});