import { GroupCard } from "./GroupCard";
import { GroupListSkeleton } from "@/components/skeletons";
import type { UseQueryResult } from "@tanstack/react-query";
import type { GroupListItem, GroupMemberRecord } from "@/types";

interface GroupListProps {
  groups: GroupListItem[];
  balances?: Record<string, number>;
  memberQueries?: Array<UseQueryResult<GroupMemberRecord[], Error>>;
  isLoading?: boolean;
  skeletonCount?: number;
}

export function GroupList({
  groups,
  balances = {},
  memberQueries = [],
  isLoading = false,
  skeletonCount = 3,
}: GroupListProps) {
  if (isLoading) {
    return <GroupListSkeleton count={skeletonCount} />;
  }
  const queryByGroupId: Record<string, UseQueryResult<GroupMemberRecord[], Error>> = {};
  memberQueries.forEach((query, index) => {
    const group = groups[index];
    if (group) {
      queryByGroupId[group.group_id] = query;
    }
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => {
        const query = queryByGroupId[group.group_id];
        return (
          <GroupCard
            key={group.group_id}
            group={group}
            balance={balances[group.group_id]}
            members={query?.data}
            membersLoading={query?.isLoading}
          />
        );
      })}
    </div>
  );
}