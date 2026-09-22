"use client";

import { useState, use, useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGroupBalance } from "@/hooks/useBalances";
import { useGroupSummary } from "@/hooks/useSummary";
import { useGroup } from "@/hooks/useGroups";
import { SettleUpButton } from "@/components/balances/SettleUpButton";
import { RecordPaymentModal } from "@/components/balances/RecordPaymentModal";
import { GroupBalancesSkeleton } from "@/components/skeletons";
import { groupMembersToOptions, formatCurrency, statusLabel } from "@/lib/selectors";
import { EmptyState, ErrorState, Button } from "@/components/ui";
import {
  Wallet,
  PieChart,
  Users,
  Network,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Bell,
  Handshake,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Balance } from "@/types";

interface BalancesPageProps {
  params: Promise<{ groupId: string }>;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColorClass(initials: string): string {
  const code = (initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0);
  const palettes = [
    "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    "bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    "bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    "bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  ];
  return palettes[code % palettes.length];
}

export default function BalancesPage({ params }: BalancesPageProps) {
  const { groupId } = use(params);
  const { user } = useAuth();

  const [simplifyDebts, setSimplifyDebts] = useState(true);
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [remindedUsers, setRemindedUsers] = useState<Record<string, boolean>>({});

  const {
    data: balances,
    isLoading: balancesLoading,
    isError: balancesError,
    error,
    refetch,
  } = useGroupBalance(groupId);

  const { data: group, isLoading: groupLoading } = useGroup(groupId);
  const { data: summaryData, isLoading: summaryLoading } = useGroupSummary(groupId);

  const members = useMemo(
    () => groupMembersToOptions(group?.members ?? []),
    [group]
  );

  const memberCount = group?.members?.length ?? balances?.length ?? 1;
  const totalSpend = summaryData?.total_spending ?? 0;
  const perPerson = memberCount > 0 ? totalSpend / memberCount : 0;

  const userBalance = useMemo(() => {
    const b = (balances ?? []).find((bal) => bal.user_id === user?.user_id);
    return b ? b.balance : 0;
  }, [balances, user]);

  // Who owes you (people with negative balance in the group, or balances where user is positive)
  const whoOwesYou = useMemo(() => {
    if (!balances || userBalance <= 0) return [];
    return balances.filter((b) => b.user_id !== user?.user_id && b.balance < 0);
  }, [balances, userBalance, user]);

  // Who you owe (people with positive balance when user has negative balance)
  const whoYouOwe = useMemo(() => {
    if (!balances || userBalance >= 0) return [];
    return balances.filter((b) => b.user_id !== user?.user_id && b.balance > 0);
  }, [balances, userBalance, user]);

  const settledMembers = useMemo(() => {
    if (!balances) return [];
    return balances.filter((b) => b.balance === 0);
  }, [balances]);

  const handleRemind = (userId: string) => {
    setRemindedUsers((prev) => ({ ...prev, [userId]: true }));
    setTimeout(() => {
      setRemindedUsers((prev) => ({ ...prev, [userId]: false }));
    }, 4000);
  };

  const isLoading = balancesLoading || groupLoading || summaryLoading;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-headline">
            Balances &amp; Settlements
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Current financial standing across all members with automated debt routing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SettleUpButton groupId={groupId} members={members} />
        </div>
      </div>

      {isLoading && <GroupBalancesSkeleton />}

      {balancesError && (
        <ErrorState
          title="Failed to load balances"
          description={error?.message ?? "Something went wrong"}
          onRetry={refetch}
        />
      )}

      {!isLoading && !balancesError && balances && (
        <>
          {/* 2. Key Metrics Summary Strip matching Stitch (4 Cards) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Total Spend */}
            <div className="bg-white dark:bg-zinc-950 p-4.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1.5">
                <span className="text-xs font-medium uppercase tracking-wider font-label">
                  Total group spending
                </span>
                <Wallet className="size-4 text-zinc-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight tabular-nums">
                  {formatCurrency(totalSpend)}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  All-time total expenses logged
                </p>
              </div>
            </div>

            {/* Metric 2: Per person average */}
            <div className="bg-white dark:bg-zinc-950 p-4.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1.5">
                <span className="text-xs font-medium uppercase tracking-wider font-label">
                  Per person
                </span>
                <PieChart className="size-4 text-zinc-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight tabular-nums">
                  {formatCurrency(perPerson)}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Average equal split, {memberCount} {memberCount === 1 ? "member" : "members"}
                </p>
              </div>
            </div>

            {/* Metric 3: Group Members */}
            <div className="bg-white dark:bg-zinc-950 p-4.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1.5">
                <span className="text-xs font-medium uppercase tracking-wider font-label">
                  Group members
                </span>
                <Users className="size-4 text-zinc-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight tabular-nums">
                  {memberCount} active
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Participating in this shared budget
                </p>
              </div>
            </div>

            {/* Metric 4: Net Balance */}
            <div className="bg-white dark:bg-zinc-950 p-4.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1.5">
                <span className="text-xs font-medium uppercase tracking-wider font-label">
                  Your net balance
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border",
                    userBalance > 0
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
                      : userBalance < 0
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800"
                        : "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                  )}
                >
                  {userBalance > 0 ? "Owed overall" : userBalance < 0 ? "Owing" : "Settled"}
                </span>
              </div>
              <div className="mt-2">
                <div
                  className={cn(
                    "text-2xl font-bold tracking-tight tabular-nums",
                    userBalance > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : userBalance < 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-zinc-900 dark:text-zinc-50"
                  )}
                >
                  {userBalance >= 0 ? `+${formatCurrency(userBalance)}` : `-${formatCurrency(Math.abs(userBalance))}`}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Net standing across pairwise offsets
                </p>
              </div>
            </div>
          </section>

          {/* 3. Debt Simplification Banner with Toggle Switch matching Stitch */}
          <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 px-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0 mt-0.5">
                <Network className="size-4.5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Simplify group debts
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                      simplifyDebts
                        ? "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700"
                        : "bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-500"
                    )}
                  >
                    {simplifyDebts ? "ENABLED" : "DISABLED"}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  SplitEase graph algorithms calculate minimum payment routes to settle all debts with fewer overall transfers.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Smart routing
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={simplifyDebts}
                onClick={() => setSimplifyDebts(!simplifyDebts)}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  simplifyDebts ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"
                )}
              >
                <span className="sr-only">Toggle debt simplification</span>
                <span
                  className={cn(
                    "pointer-events-none inline-block size-4 transform rounded-full bg-white dark:bg-zinc-900 shadow-sm transition duration-200 ease-in-out",
                    simplifyDebts ? "translate-x-4" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </section>

          {/* 4. Three Divided Sections matching Stitch (Who Owes You / Who You Owe / All Balances) */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            {/* Column 1: WHO OWES YOU */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs p-5 flex flex-col h-full">
              <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100 dark:border-zinc-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <h3 className="text-xs font-semibold tracking-wider uppercase text-zinc-900 dark:text-zinc-100 font-label">
                    Who owes you
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {whoOwesYou.length} {whoOwesYou.length === 1 ? "person" : "people"}
                  </span>
                </div>
                {userBalance > 0 && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{formatCurrency(userBalance)}
                  </span>
                )}
              </div>

              {whoOwesYou.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  <CheckCircle2 className="size-6 text-emerald-500/50 mx-auto mb-1.5" />
                  No members currently owe you in this group.
                </div>
              ) : (
                <div className="space-y-3">
                  {whoOwesYou.map((b) => {
                    const initials = getInitials(b.name || b.user_id);
                    const colorClass = getAvatarColorClass(initials);
                    const isReminded = remindedUsers[b.user_id];

                    return (
                      <div
                        key={b.user_id}
                        className="p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/30 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={cn(
                                "size-9 rounded-full font-semibold text-xs flex items-center justify-center shrink-0 border",
                                colorClass
                              )}
                            >
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {b.name || b.user_id}
                              </div>
                              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                Outstanding shared share
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                              owes you {formatCurrency(Math.abs(b.balance))}
                            </div>
                            <div className="text-[10px] text-zinc-400">Pending settlement</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                          <span className="text-[11px] text-zinc-400">
                            {isReminded ? "Reminder sent!" : "Active balance"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemind(b.user_id)}
                            className="text-xs font-medium px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors shadow-xs cursor-pointer"
                          >
                            {isReminded ? "Sent ✓" : "Remind"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Column 2: WHO YOU OWE */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs p-5 flex flex-col h-full">
              <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100 dark:border-zinc-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-rose-500" />
                  <h3 className="text-xs font-semibold tracking-wider uppercase text-zinc-900 dark:text-zinc-100 font-label">
                    Who you owe
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {whoYouOwe.length} {whoYouOwe.length === 1 ? "person" : "people"}
                  </span>
                </div>
                {userBalance < 0 && (
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                    -{formatCurrency(Math.abs(userBalance))}
                  </span>
                )}
              </div>

              {whoYouOwe.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  <CheckCircle2 className="size-6 text-emerald-500/50 mx-auto mb-1.5" />
                  You don&apos;t owe anyone in this group! All settled.
                </div>
              ) : (
                <div className="space-y-3">
                  {whoYouOwe.map((b) => {
                    const initials = getInitials(b.name || b.user_id);
                    const colorClass = getAvatarColorClass(initials);

                    return (
                      <div
                        key={b.user_id}
                        className="p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/30 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={cn(
                                "size-9 rounded-full font-semibold text-xs flex items-center justify-center shrink-0 border",
                                colorClass
                              )}
                            >
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {b.name || b.user_id}
                              </div>
                              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                Shared group liability
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                              you owe {formatCurrency(Math.abs(b.balance))}
                            </div>
                            <div className="text-[10px] text-zinc-400">Pending payment</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                          <span className="text-[11px] text-zinc-400">Direct payment</span>
                          <button
                            type="button"
                            onClick={() => setSettleModalOpen(true)}
                            className="text-xs font-medium px-2.5 py-1 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs cursor-pointer"
                          >
                            Pay now →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Column 3: ALL GROUP BALANCES */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs p-5 flex flex-col h-full">
              <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100 dark:border-zinc-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-zinc-400" />
                  <h3 className="text-xs font-semibold tracking-wider uppercase text-zinc-900 dark:text-zinc-100 font-label">
                    All Member Balances
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {balances.length} total
                  </span>
                </div>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {balances.map((b) => {
                  const isSelf = b.user_id === user?.user_id;
                  const initials = getInitials(b.name || b.user_id);
                  const isPositive = b.balance > 0;
                  const isNegative = b.balance < 0;
                  const isSettled = b.balance === 0;

                  return (
                    <div
                      key={b.user_id}
                      className={cn(
                        "py-3 flex items-center justify-between gap-3 px-1 rounded-md transition-colors",
                        isSelf && "bg-zinc-50/70 dark:bg-zinc-900/40"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {b.name || b.user_id}
                            </span>
                            {isSelf && (
                              <span className="text-[10px] font-medium px-1 py-0.2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-400">
                            {statusLabel(b.status)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={cn(
                            "text-xs font-bold tabular-nums",
                            isPositive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isNegative
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-zinc-500"
                          )}
                        >
                          {isPositive
                            ? `+${formatCurrency(b.balance)}`
                            : isNegative
                              ? `-${formatCurrency(Math.abs(b.balance))}`
                              : "$0.00"}
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          {isPositive ? "gets back" : isNegative ? "owes" : "settled"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Record Payment / Settle Up Modal */}
      <RecordPaymentModal
        open={settleModalOpen}
        onClose={() => setSettleModalOpen(false)}
        groupId={groupId}
        members={members}
      />
    </div>
  );
}
