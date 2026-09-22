import type { Balance, GroupMember } from "@/types";

export function statusLabel(status: Balance["status"]): string {
  switch (status) {
    case "OWED":
      return "The group owes";
    case "OWES":
      return "Owes the group";
    case "SETTLED":
      return "All settled";
    default:
      return status;
  }
}

export function groupMembersToOptions(
  members: GroupMember[]
): Array<{ user_id: string; name: string }> {
  return members.map((member) => ({
    user_id: member.user_id,
    name: member.name,
  }));
}