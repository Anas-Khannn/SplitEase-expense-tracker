"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGroup } from "@/hooks/useGroups";
import { useGroupExpenses } from "@/hooks/useExpenses";
import { Avatar, Button, Skeleton, ErrorState } from "@/components/ui";
import { groupIcon } from "@/lib/utils/group-icons";
import { cn } from "@/lib/utils/cn";
import { CreateExpenseModal } from "@/components/expenses/CreateExpenseModal";
import { AddMemberModal } from "@/components/groups/AddMemberModal";
import {
  BarChart3,
  Receipt,
  Scale,
  Users,
  Activity,
  Plus,
  Handshake,
  UserPlus,
  CheckCircle2,
} from "lucide-react";

const TABS = [
  { key: "summary", label: "Summary", icon: BarChart3 },
  { key: "expenses", label: "Expenses", icon: Receipt },
  { key: "balances", label: "Balances", icon: Scale },
  { key: "members", label: "Members", icon: Users },
  { key: "activity", label: "Activity", icon: Activity },
] as const;

interface GroupHeaderProps {
  groupId: string;
}

export function GroupHeader({ groupId }: GroupHeaderProps) {
  const pathname = usePathname();
  const { data: group, isLoading, isError, error, refetch } = useGroup(groupId);
  const { data: expensesData } = useGroupExpenses(groupId);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const activeTab = TABS.find(
    (tab) => pathname === `/groups/${groupId}/${tab.key}`
  )?.key ?? "summary";

  const expensesCount = expensesData?.expenses?.length;
  const membersCount = group?.members?.length;

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-14 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
          <div className="h-10 rounded-md bg-muted/60 animate-pulse" />
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
          {/* Main Page Header matching Stitch */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-2 border-b border-border/80">
            {/* Group Identity */}
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-2xl shadow-xs">
                {groupIcon(group.icon)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground font-headline">
                    {group.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" />
                    Active
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {group.members.length} {group.members.length === 1 ? "member" : "members"} · {group.description || "Shared group expenses"}
                </p>

                {/* Member Avatar Stack & Invite matching Stitch */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {group.members.slice(0, 5).map((member) => (
                      <Avatar
                        key={member.user_id}
                        name={member.name}
                        alt={member.name}
                        size="sm"
                        className="ring-2 ring-background"
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(true)}
                    className="inline-flex items-center gap-1 rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <UserPlus className="size-3" />
                    <span>Invite</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons Cluster */}
            <div className="flex items-center gap-2.5 self-start md:self-auto">
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5 rounded-lg shadow-xs"
                onClick={() => setExpenseModalOpen(true)}
              >
                <Plus className="size-4" />
                <span>Add expense</span>
              </Button>
              <Link href={`/groups/${groupId}/balances`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 rounded-lg shadow-xs border border-border"
                >
                  <Handshake className="size-4 text-muted-foreground" />
                  <span>Settle up</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Horizontal Navigation Tabs matching Stitch */}
          <nav
            aria-label="Group tabs"
            className="flex items-center gap-6 border-b border-border text-sm font-medium overflow-x-auto"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = tab.key === "expenses" ? expensesCount : tab.key === "members" ? membersCount : undefined;

              return (
                <Link
                  key={tab.key}
                  href={`/groups/${groupId}/${tab.key}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 pb-3 transition-colors -mb-px border-b-2 text-xs font-semibold whitespace-nowrap",
                    isActive
                      ? "border-foreground text-foreground font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.icon className="size-3.5" />
                  <span>{tab.label}</span>
                  {count !== undefined && count > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-mono">
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Modals */}
          <CreateExpenseModal
            open={expenseModalOpen}
            onClose={() => setExpenseModalOpen(false)}
            groupId={groupId}
          />
          <AddMemberModal
            open={inviteModalOpen}
            onClose={() => setInviteModalOpen(false)}
            groupId={groupId}
          />
        </>
      )}
    </div>
  );
}
