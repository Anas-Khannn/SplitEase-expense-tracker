import type { UseQueryResult } from "@tanstack/react-query";
import type { Activity, GroupListItem } from "@/types";

export interface AggregatedActivity {
  activities: Activity[];
  groupNames: Record<string, string>;
}

export function collectActivity(
  groups: GroupListItem[] | undefined,
  groupQueries: ReadonlyArray<UseQueryResult<Activity[], Error>>
): AggregatedActivity {
  const groupNames: Record<string, string> = {};
  for (const group of groups ?? []) {
    groupNames[group.group_id] = group.name;
  }

  const activities: Activity[] = [];
  for (const query of groupQueries) {
    for (const item of query.data ?? []) {
      activities.push(item);
    }
  }

  activities.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return { activities, groupNames };
}