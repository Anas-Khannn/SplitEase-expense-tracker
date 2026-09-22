"use client";

import { useState } from "react";
import { useExpenseReactions } from "@/hooks/useReactions";
import {
  useAddExpenseReaction,
  useRemoveExpenseReaction,
} from "@/hooks/mutations";
import { cn } from "@/lib/utils/cn";
import { countReactions } from "@/lib/selectors";
import type { ReactionType, ExpenseReaction } from "@/types";
import { Smile } from "lucide-react";

export const REACTION_OPTIONS: { emoji: ReactionType; label: string }[] = [
  { emoji: "👍", label: "Thumbs Up" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "😮", label: "Surprised" },
  { emoji: "❤️", label: "Love" },
  { emoji: "😢", label: "Sad" },
];

export interface ExpenseReactionsProps {
  expenseId: string;
  currentUserId?: string;
  compact?: boolean;
  className?: string;
}

function getReactedUsersList(reactions: ExpenseReaction[], emoji: ReactionType, currentUserId?: string): string {
  const users = reactions
    .filter((r) => r.reaction === emoji)
    .map((r) => {
      if (currentUserId && r.user_id === currentUserId) return "You";
      return r.user?.name || "Member";
    });

  if (users.length === 0) return "";
  if (users.length === 1) return users[0];
  if (users.length === 2) return `${users[0]} and ${users[1]}`;
  return `${users.slice(0, 2).join(", ")} and ${users.length - 2} more`;
}

export function ExpenseReactions({
  expenseId,
  currentUserId,
  compact = false,
  className,
}: ExpenseReactionsProps) {
  const { data: reactions = [], isLoading } = useExpenseReactions(expenseId);
  const addReaction = useAddExpenseReaction();
  const removeReaction = useRemoveExpenseReaction();
  const [hoveredReaction, setHoveredReaction] = useState<ReactionType | null>(null);

  const myReaction = reactions.find((r) => r.user_id === currentUserId);
  const busy = addReaction.isPending || removeReaction.isPending;

  const handleReaction = (reaction: ReactionType) => {
    if (busy) return;
    if (!myReaction) {
      addReaction.mutate({ expenseId, reaction });
    } else if (myReaction.reaction === reaction) {
      removeReaction.mutate(expenseId);
    } else {
      removeReaction.mutate(expenseId, {
        onSuccess: () => addReaction.mutate({ expenseId, reaction }),
      });
    }
  };

  const totalReactionCount = reactions.length;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5",
        compact ? "" : "pt-2.5 mt-2 border-t border-zinc-100 dark:border-zinc-800/80",
        className
      )}
      aria-label="Expense reactions"
    >
      {/* Visual header label if not compact */}
      {!compact && (
        <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mr-1 select-none">
          <Smile className="size-3.5" />
          <span className="hidden sm:inline">Reactions</span>
        </div>
      )}

      {/* Emoji Reaction Buttons */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
        {REACTION_OPTIONS.map(({ emoji, label }) => {
          const count = countReactions(reactions, emoji);
          const active = myReaction?.reaction === emoji;
          const userList = count > 0 ? getReactedUsersList(reactions, emoji, currentUserId) : "";

          return (
            <div key={emoji} className="relative group">
              <button
                type="button"
                disabled={busy}
                onClick={() => handleReaction(emoji)}
                onMouseEnter={() => setHoveredReaction(emoji)}
                onMouseLeave={() => setHoveredReaction(null)}
                aria-label={`${label}: ${count} reactions. ${active ? "Click to remove your reaction" : "Click to react"}`}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer active:scale-90 select-none",
                  compact
                    ? "h-7 px-2"
                    : "h-8 px-2.5 sm:px-3",
                  active
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs font-semibold ring-2 ring-zinc-900/10 dark:ring-zinc-100/20"
                    : count > 0
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 hover:bg-zinc-200/70 dark:hover:bg-zinc-700"
                      : "bg-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 opacity-70 hover:opacity-100",
                  busy && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className="text-sm leading-none" aria-hidden="true">
                  {emoji}
                </span>
                {count > 0 && (
                  <span
                    className={cn(
                      "text-[11px] font-semibold tabular-nums leading-none",
                      active
                        ? "text-white dark:text-zinc-900"
                        : "text-zinc-600 dark:text-zinc-300"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>

              {/* Tooltip showing who reacted */}
              {count > 0 && hoveredReaction === emoji && userList && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-30 pointer-events-none hidden sm:block whitespace-nowrap rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-2 py-0.5 text-[11px] font-medium shadow-md">
                  <span>{userList}</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-100" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary indicator if there are reactions */}
      {totalReactionCount > 0 && !compact && (
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 ml-auto hidden sm:inline tabular-nums">
          {totalReactionCount} {totalReactionCount === 1 ? "reaction" : "reactions"}
        </span>
      )}
    </div>
  );
}
