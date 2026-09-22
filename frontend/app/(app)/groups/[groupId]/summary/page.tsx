"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGroupSummary } from "@/hooks/useSummary";
import { useGroupBalance } from "@/hooks/useBalances";
import { SummaryChart } from "@/components/balances/SummaryChart";
import {
  Avatar,
  EmptyState,
  ErrorState,
  Button,
} from "@/components/ui";
import { GroupSummarySkeleton } from "@/components/skeletons";
import { formatCurrency } from "@/lib/selectors";
import {
  Receipt,
  Wallet,
  Handshake,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SummaryPageProps {
  params: Promise<{ groupId: string }>;
}

export default function SummaryPage({ params }: SummaryPageProps) {
  const { groupId } = use(params);
  const { user } = useAuth();

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    error,
    refetch,
  } = useGroupSummary(groupId);

  const {
    data: balances,
    isLoading: balancesLoading,
  } = useGroupBalance(groupId);

  const contributions = useMemo(
    () =>
      (summary?.contributions ?? []).map((c) => ({
        ...c,
        name: c.name || c.user_id,
      })),
    [summary]
  );

  const myBalance = useMemo(() => {
    if (!balances || !user) return 0;
    const found = balances.find((b) => b.user_id === user.user_id);
    return found ? found.balance : 0;
  }, [balances, user]);

  const settledCount = useMemo(() => {
    return (balances ?? []).filter((b) => b.balance === 0).length;
  }, [balances]);

  const isOwed = myBalance > 0;
  const isOwe = myBalance < 0;

  const isLoading = summaryLoading || balancesLoading;
  const hasData = contributions.length > 0;

  return (
    <div className="space-y-6 pb-8">
      {isLoading && <GroupSummarySkeleton />}

      {summaryError && (
        <ErrorState
          title="Failed to load summary"
          description={error?.message ?? "Something went wrong"}
          onRetry={refetch}
        />
      )}

      {!isLoading && !summaryError && summary && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column (7 cols): Hero Card & Balance Breakdown */}
          <div className="lg:col-span-7 space-y-6">
            {/* Near-Black Gradient Hero Balance Card matching Stitch */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-900 p-6 text-white shadow-sm border border-zinc-800">
              <div className="absolute -right-12 -top-12 size-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border",
                    isOwed
                      ? "border-emerald-800/60 bg-emerald-950/80 text-emerald-400"
                      : isOwe
                        ? "border-rose-800/60 bg-rose-950/80 text-rose-400"
                        : "border-zinc-700 bg-zinc-800/80 text-zinc-300"
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full animate-pulse",
                      isOwed ? "bg-emerald-400" : isOwe ? "bg-rose-400" : "bg-zinc-400"
                    )}
                  />
                  {isOwed ? "Net positive" : isOwe ? "Owing balance" : "All settled"}
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  {balances?.length ?? 0} members in group
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 font-label">
                  Your Group Balance
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
                  {isOwed ? (
                    <>
                      You&apos;re owed{" "}
                      <span className="font-extrabold text-emerald-400 tabular-nums">
                        +{formatCurrency(myBalance)}
                      </span>
                    </>
                  ) : isOwe ? (
                    <>
                      You owe{" "}
                      <span className="font-extrabold text-rose-400 tabular-nums">
                        -{formatCurrency(Math.abs(myBalance))}
                      </span>
                    </>
                  ) : (
                    "You're all settled up"
                  )}
                </h2>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                <CheckCircle className="size-4 text-emerald-400" />
                <span>
                  {settledCount} of {balances?.length ?? 0} members settled
                </span>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-3 pt-5 border-t border-zinc-800/80">
                <Link href={`/groups/${groupId}/balances`}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="gap-2 bg-white text-zinc-950 hover:bg-zinc-100 shadow-sm"
                  >
                    <Handshake className="size-4" />
                    <span>Settle up</span>
                  </Button>
                </Link>
                <Link href={`/groups/${groupId}/expenses`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2 border border-zinc-700 bg-zinc-800/80 text-zinc-200 hover:bg-zinc-800"
                  >
                    <Receipt className="size-4" />
                    <span>View expenses</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Member Balances Breakdown Card */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Member Balances
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Outstanding shares across group members
                  </p>
                </div>
                <Link
                  href={`/groups/${groupId}/balances`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>Details</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>

              {!balances || balances.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No balances recorded yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {balances.map((member) => (
                    <div
                      key={member.user_id}
                      className="flex items-center justify-between py-3 px-1 hover:bg-muted/40 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          name={member.name || member.user_id}
                          alt={member.name || "Member"}
                          size="md"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {member.name || member.user_id}
                            {user && member.user_id === user.user_id && " (You)"}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {member.status.toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={cn(
                            "text-sm font-bold tabular-nums",
                            member.balance > 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : member.balance < 0
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-muted-foreground"
                          )}
                        >
                          {member.balance > 0
                            ? `+${formatCurrency(member.balance)}`
                            : member.balance < 0
                              ? `-${formatCurrency(Math.abs(member.balance))}`
                              : "$0.00"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Total Spending & Chart */}
          <div className="lg:col-span-5 space-y-6">
            {/* Total Spending Stat Card */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-2xs flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                <Wallet className="size-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground font-label">
                  Total Spending
                </p>
                <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-3xl">
                  {formatCurrency(summary.total_spending)}
                </p>
              </div>
            </div>

            {/* Contributions Chart and Breakdown */}
            {!hasData ? (
              <EmptyState
                className="py-12"
                icon={<Receipt />}
                title="No spending recorded"
                description="When members log expenses, the category and payer breakdowns will show here."
              />
            ) : (
              <div className="space-y-6">
                <SummaryChart
                  contributions={contributions}
                  totalSpending={summary.total_spending}
                />

                <div className="rounded-xl border border-border bg-card p-6 shadow-2xs">
                  <h3 className="text-base font-semibold text-foreground pb-2 border-b border-border">
                    Contributions by Member
                  </h3>
                  <div className="divide-y divide-border mt-2">
                    {contributions.map((c) => (
                      <div
                        key={c.user_id}
                        className="flex items-center justify-between py-3 px-1"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar name={c.name} alt={c.name} size="sm" />
                          <span className="text-sm font-medium text-foreground truncate">
                            {c.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-foreground tabular-nums">
                          {formatCurrency(c.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
