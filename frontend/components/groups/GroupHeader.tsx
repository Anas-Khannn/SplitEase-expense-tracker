"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGroup } from "@/hooks/useGroups";
import { Avatar, Skeleton, ErrorState } from "@/components/ui";
import { groupIcon } from "@/lib/utils/group-icons";
import { cn } from "@/lib/utils/cn";
import {
  Wallet,
  Scale,
  Users,
  Activity,
  BarChart3,
} from "lucide-react";

const TABS = [
  { key: "expenses", label: "Expenses", icon: Wallet },
  { key: "balances", label: "Balances", icon: Scale },
  { key: "members", label: "Members", icon: Users },
  { key: "activity", label: "Activity", icon: Activity },
  { key: "summary", label: "Summary", icon: BarChart3 },
] as const;

interface GroupHeaderProps {
  groupId: string;
}

export function GroupHeader({ groupId }: GroupHeaderProps) {
  const pathname = usePathname();
  const { data: group, isLoading, isError, error, refetch } = useGroup(groupId);

  const activeTab = TABS.find(
    (tab) => pathname === `/groups/${groupId}/${tab.key}`
  )?.key;

  return (
    <div className="space-y-5">
      {isLoading && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-80 max-w-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="h-10 rounded-md bg-background-alt animate-pulse" />
        </div>
      )}

      {isError && (
        <ErrorState
          title="Failed to load group"
          description={error?.message ?? "Something went wrong"}
          onRetry={refetch}
        />
      )}

      {group && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-card text-lg" aria-hidden="true">
                  {groupIcon(group.icon)}
                </span>
                <h2 className="truncate text-2xl font-bold text-foreground">
                  {group.name}
                </h2>
              </div>
              {group.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {group.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {group.members.slice(0, 4).map((member) => (
                    <Avatar
                      key={member.user_id}
                      name={member.name}
                      alt={member.name}
                      size="sm"
                      className="ring-2 ring-surface"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {group.members.length}{" "}
                  {group.members.length === 1 ? "member" : "members"}
                </span>
              </div>
            </div>
          </div>

          <nav
            aria-label="Group sections"
            className="-mx-1 overflow-x-auto pb-1"
          >
            <div className="inline-flex min-w-max items-center gap-1 rounded-radius-md bg-background-alt p-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <Link
                    key={tab.key}
                    href={`/groups/${groupId}/${tab.key}`}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-radius-sm transition-colors duration-150",
                      "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring",
                      isActive
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <tab.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
