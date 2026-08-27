import { GroupCard } from "./GroupCard";
import type { GroupListItem } from "@/types";

interface GroupListProps {
  groups: GroupListItem[];
}

export function GroupList({ groups }: GroupListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <GroupCard key={group.group_id} group={group} />
      ))}
    </div>
  );
}
