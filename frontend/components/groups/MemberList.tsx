"use client";

import { useState } from "react";
import {
  useRemoveGroupMember,
  useUpdateMemberRole,
} from "@/hooks/mutations";
import {
  Avatar,
  Badge,
  IconButton,
  Button,
  ConfirmDialog,
} from "@/components/ui";
import { UserMinus } from "lucide-react";
import type { GroupMemberRecord } from "@/types";

interface MemberListProps {
  groupId: string;
  members: GroupMemberRecord[];
  currentUserId?: string;
  currentUserName?: string;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function MemberList({
  groupId,
  members,
  currentUserId,
  currentUserName,
}: MemberListProps) {
  const removeMember = useRemoveGroupMember();
  const updateRole = useUpdateMemberRole();

  const [memberToRemove, setMemberToRemove] =
    useState<GroupMemberRecord | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const currentMember = members.find((m) => m.user_id === currentUserId);
  const canManage = currentMember?.role === "admin";

  const busy = removeMember.isPending || updateRole.isPending;

  const handleRemoveConfirm = () => {
    if (!memberToRemove) return;
    setActionError(null);
    removeMember.mutate(
      { groupId, userId: memberToRemove.user_id },
      {
        onSuccess: () => setMemberToRemove(null),
        onError: (err: unknown) => {
          setActionError(
            err instanceof Error
              ? err.message
              : "Failed to remove member. Please try again."
          );
        },
      }
    );
  };

  const handleRoleToggle = (member: GroupMemberRecord) => {
    setActionError(null);
    updateRole.mutate(
      {
        groupId,
        userId: member.user_id,
        role: member.role === "admin" ? "member" : "admin",
      },
      {
        onError: (err: unknown) => {
          setActionError(
            err instanceof Error
              ? err.message
              : "Failed to update member role. Please try again."
          );
        },
      }
    );
  };

  return (
    <div>
      <ul className="divide-y divide-border-default overflow-hidden rounded-radius-lg border border-border-default bg-surface shadow-xs">
        {members.map((member) => {
          const isSelf = member.user_id === currentUserId;
          const displayName =
            isSelf && currentUserName ? currentUserName : "Member";
          const joined = formatDate(member.joined_at);

          return (
            <li
              key={member.group_member_id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <Avatar name={displayName} alt={displayName} size="md" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-body font-medium text-text-primary">
                    {displayName}
                  </p>
                  {isSelf && <Badge variant="primary">You</Badge>}
                  <Badge
                    variant={member.role === "admin" ? "primary" : "neutral"}
                  >
                    {member.role}
                  </Badge>
                </div>
                <p className="truncate text-caption text-text-muted">
                  {member.user_id}
                  {joined ? ` · Joined ${joined}` : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {canManage && !isSelf && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => handleRoleToggle(member)}
                  >
                    {member.role === "admin" ? "Demote" : "Promote"}
                  </Button>
                )}
                {canManage && !isSelf && (
                  <IconButton
                    icon={<UserMinus />}
                    aria-label={`Remove member ${displayName}`}
                    variant="danger"
                    size="sm"
                    disabled={busy}
                    onClick={() => {
                      setActionError(null);
                      setMemberToRemove(member);
                    }}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {actionError && (
        <p className="mt-3 text-body-sm text-danger-500" role="alert">
          {actionError}
        </p>
      )}

      <ConfirmDialog
        open={memberToRemove !== null}
        onClose={() => {
          if (busy) return;
          setMemberToRemove(null);
          setActionError(null);
        }}
        onConfirm={handleRemoveConfirm}
        title="Remove member"
        description={`Remove this member from the group? They will no longer have access to the group's expenses.`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        danger
        loading={removeMember.isPending}
      />
    </div>
  );
}
