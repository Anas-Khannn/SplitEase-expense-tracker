"use client";

import Link from "next/link";
import { groupIcon } from "@/lib/utils/group-icons";
import { formatCurrency } from "@/lib/selectors";
import type { GroupListItem, GroupMemberRecord } from "@/types";
import { Receipt, ArrowRight } from "lucide-react";

interface GroupCardProps {
  group: GroupListItem;
  balance?: number;
  members?: GroupMemberRecord[];
  membersLoading?: boolean;
}

export function GroupCard({
  group,
  balance,
  members = [],
}: GroupCardProps) {
  const isAdmin = group.role === "admin";
  const isSettled = balance === 0;
  const isOwed = (balance ?? 0) > 0;

  return (
    <Link
      href={`/groups/${group.group_id}/expenses`}
      className="block group outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 rounded-xl"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all flex flex-col justify-between h-full">
        <div>
          {/* Top Card Header */}
          <div className="flex items-start justify-between">
            <div className="size-11 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200 shrink-0 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-colors duration-200">
              {groupIcon(group.icon)}
            </div>
            <div className="flex items-center gap-1.5">
              {balance !== undefined && isSettled ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  <span className="size-1.5 rounded-full bg-zinc-400" /> Settled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                  <span className="size-1.5 rounded-full bg-emerald-500" /> Active
                </span>
              )}
              <span className="text-xs text-zinc-400">•</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {members.length > 0 ? `${members.length} members` : isAdmin ? "Admin" : "Member"}
              </span>
            </div>
          </div>

          {/* Group Details */}
          <h3 className="font-headline font-semibold text-base text-zinc-900 dark:text-zinc-50 mt-4 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors truncate">
            {group.name}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed line-clamp-2">
            {group.description || "Shared group expenses, rent, utilities, and dining split evenly."}
          </p>
        </div>

        {/* Balance & Footer Link */}
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Your status</span>
            {balance === undefined ? (
              <span className="text-xs text-zinc-400">—</span>
            ) : isSettled ? (
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 tabular-nums">
                All settled ($0.00)
              </span>
            ) : isOwed ? (
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                You are owed +{formatCurrency(balance)}
              </span>
            ) : (
              <span className="text-sm font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                You owe -{formatCurrency(Math.abs(balance))}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Receipt className="size-3.5 text-zinc-400" />
              <span>Tracked expenses</span>
            </div>
            <span className="font-medium text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Open <ArrowRight className="size-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}