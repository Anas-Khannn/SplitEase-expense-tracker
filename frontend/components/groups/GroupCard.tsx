"use client";

import Link from "next/link";
import { Card, CardContent, Badge, Avatar, Skeleton } from "@/components/ui";
import { groupIcon } from "@/lib/utils/group-icons";
import type { GroupListItem, GroupMemberRecord } from "@/types";

interface GroupCardProps {
  group: GroupListItem;
  balance?: number;
  members?: GroupMemberRecord[];
  membersLoading?: boolean;
}

function formatBalance(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function GroupCard({
  group,
  balance,
  members = [],
  membersLoading = false,
}: GroupCardProps) {
  const isAdmin = group.role === "admin";
  const isSettled = balance === 0;
  const isOwed = (balance ?? 0) > 0;

  return (
    <Link
      href={`/groups/${group.group_id}/expenses`}
      className="block rounded-radius-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    >
      <Card variant="interactive" className="h-full">
        <CardContent className="flex h-full flex-col gap-4 py-5">
          <div className="flex items-start gap-4">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-radius-md bg-primary-100 text-h3"
              aria-hidden="true"
            >
              {groupIcon(group.icon)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-body font-semibold text-text-primary">
                  {group.name}
                </h3>
                {isAdmin && <Badge variant="primary">Admin</Badge>}
              </div>
              {group.description && (
                <p className="mt-1 text-body-sm text-text-secondary line-clamp-2">
                  {group.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border-default pt-4">
            <div className="flex min-w-0 items-center gap-2">
              {membersLoading ? (
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      variant="circle"
                      className="h-8 w-8 border-2 border-surface"
                    />
                  ))}
                </div>
              ) : members.length > 0 ? (
                <div className="flex -space-x-2">
                  {members.slice(0, 3).map((member) => (
                    <Avatar
                      key={member.user_id}
                      name={member.name ?? member.user_id}
                      alt={member.name ?? "Group member"}
                      size="sm"
                      className="border-2 border-surface"
                    />
                  ))}
                </div>
              ) : (
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-alt text-caption text-text-muted"
                  aria-hidden="true"
                >
                  ?
                </span>
              )}
              <span className="shrink-0 text-caption text-text-muted">
                {members.length} {members.length === 1 ? "member" : "members"}
              </span>
            </div>

            {balance === undefined ? (
              <span className="shrink-0 text-caption text-text-muted">—</span>
            ) : isSettled ? (
              <Badge variant="success">Settled</Badge>
            ) : (
              <Badge variant={isOwed ? "success" : "danger"}>
                {isOwed ? "You're owed " : "You owe "}
                {formatBalance(Math.abs(balance))}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}