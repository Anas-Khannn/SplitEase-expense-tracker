"use client";

import { useMemo, useState } from "react";
import { useGroups } from "@/hooks/useGroups";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { useAllGroupMembers } from "@/hooks/useAllGroupMembers";
import { GroupList } from "@/components/groups/GroupList";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import {
  Button,
  Card,
  CardContent,
  Input,
  Skeleton,
  EmptyState,
  ErrorState,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { Plus, Users, Search, Wallet, TrendingDown, TrendingUp } from "lucide-react";

type GroupTab = "all" | "settled" | "outstanding";

const TAB_OPTIONS: { value: GroupTab; label: string }[] = [
  { value: "all", label: "All Groups" },
  { value: "settled", label: "Settled" },
  { value: "outstanding", label: "Outstanding" },
];

export default function GroupsPage() {
  const {
    data: groups,
    isLoading,
    isError,
    error,
    refetch,
  } = useGroups();

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useDashboardSummary();

  const memberQueries = useAllGroupMembers(groups);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<GroupTab>("all");

  const balances = useMemo(() => {
    const map: Record<string, number> = {};
    for (const group of summary?.groups ?? []) {
      map[group.group_id] = group.balance;
    }
    return map;
  }, [summary]);

  const hasBalances = !!summary;

  const filteredGroups = useMemo(() => {
    const search = query.trim().toLowerCase();
    return (groups ?? []).filter((group) => {
      if (search && !group.name.toLowerCase().includes(search)) return false;
      if (!hasBalances || tab === "all") return true;
      const balance = balances[group.group_id];
      if (tab === "settled") return balance === 0;
      return balance !== 0;
    });
  }, [groups, query, tab, balances, hasBalances]);

  const summaryCardsLoading = summaryLoading;
  const summaryCardsFailed = !summaryLoading && summaryError;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 font-bold text-text-primary">Your Groups</h1>
          <p className="mt-1 text-body-sm text-text-muted">
            Manage your shared expenses and groups.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Plus />}
          onClick={() => setModalOpen(true)}
        >
          Create group
        </Button>
      </div>

      {summaryCardsLoading && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-5">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {summaryCardsFailed && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-radius-md bg-danger-100/40 px-4 py-3">
          <p className="text-body-sm text-danger-500">
            Failed to load balance summary.
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetchSummary()}>
            Retry
          </Button>
        </div>
      )}

      {!summaryCardsLoading && !summaryCardsFailed && summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-radius-md bg-primary-100">
                  <Wallet className="h-5 w-5 text-primary-500" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-caption text-text-muted">Total balance</p>
                  <p className="text-h3 font-bold text-text-primary">
                    ${summary.net_balance.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-radius-md bg-danger-100">
                  <TrendingDown className="h-5 w-5 text-danger-500" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-caption text-text-muted">You owe</p>
                  <p className="text-h3 font-bold text-danger-500">
                    ${summary.total_owe.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-radius-md bg-success-100">
                  <TrendingUp className="h-5 w-5 text-success-500" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-caption text-text-muted">You are owed</p>
                  <p className="text-h3 font-bold text-success-500">
                    ${summary.total_owed.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-full">
              <CardContent className="space-y-4 py-5">
                <div className="flex items-start gap-4">
                  <Skeleton variant="rect" className="h-12 w-12 shrink-0 rounded-radius-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border-default pt-4">
                  <Skeleton variant="circle" className="h-8 w-8" />
                  <Skeleton className="h-5 w-20 rounded-radius-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <ErrorState
          title="Failed to load groups"
          description={error?.message ?? "Something went wrong"}
          onRetry={refetch}
        />
      )}

      {!isLoading &&
        !isError &&
        groups &&
        groups.length === 0 && (
          <EmptyState
            icon={<Users />}
            title="No groups yet"
            description="Create a group to start splitting expenses with friends."
            action={
              <Button
                variant="primary"
                size="md"
                icon={<Plus />}
                onClick={() => setModalOpen(true)}
              >
                Create group
              </Button>
            }
          />
        )}

      {!isLoading &&
        !isError &&
        groups &&
        groups.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                  aria-hidden="true"
                />
                <Input
                  id="group-search"
                  type="search"
                  placeholder="Search groups"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pl-9"
                  aria-label="Search groups"
                />
              </div>

              <Tabs
                defaultValue="all"
                value={tab}
                onValueChange={(value) => setTab(value as GroupTab)}
              >
                <TabsList className="w-full sm:w-auto">
                  {TAB_OPTIONS.map((option) => (
                    <TabsTrigger
                      key={option.value}
                      value={option.value}
                      className="flex-1 sm:flex-none"
                    >
                      {option.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {filteredGroups.length === 0 ? (
              <EmptyState
                icon={<Search />}
                title="No groups match"
                description="Try adjusting your search or switching tabs."
              />
            ) : (
              <GroupList
                groups={filteredGroups}
                balances={balances}
                memberQueries={memberQueries}
              />
            )}
          </div>
        )}

      <CreateGroupModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}