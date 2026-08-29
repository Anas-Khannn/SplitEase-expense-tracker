"use client";

import Link from "next/link";
import { Card, CardContent, Badge } from "@/components/ui";
import type { GroupListItem } from "@/types";

interface GroupCardProps {
  group: GroupListItem;
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Link
      href={`/groups/${group.group_id}/expenses`}
      className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded-radius-lg"
    >
      <Card variant="interactive">
        <CardContent className="py-5">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-radius-md bg-primary-100 text-h3">
              {group.icon ?? "📁"}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-body font-semibold text-text-primary truncate">
                {group.name}
              </h3>
              {group.description && (
                <p className="mt-1 text-body-sm text-text-secondary line-clamp-2">
                  {group.description}
                </p>
              )}
              <div className="mt-2">
                <Badge variant={group.role === "admin" ? "primary" : "neutral"}>
                  {group.role}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
