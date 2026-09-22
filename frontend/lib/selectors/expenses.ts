import type {
  Expense,
  ExpenseFilters,
  ExpenseReaction,
  ReactionType,
} from "@/types";

export function getSplitLabel(expense: Expense): string {
  const participantNames = expense.splits
    .map((s) => s.user.name)
    .filter(Boolean);
  return participantNames.length
    ? participantNames.join(", ")
    : `${expense.splits.length} participant${expense.splits.length === 1 ? "" : "s"}`;
}

export function countReactions(
  reactions: ExpenseReaction[] | undefined,
  reaction: ReactionType
): number {
  return (reactions ?? []).filter((r) => r.reaction === reaction).length;
}

export function activeFilterCount(filters: ExpenseFilters): number {
  return [
    filters.payer_id,
    filters.start_date,
    filters.end_date,
  ].filter(Boolean).length;
}

export function validateExpenseFilters(
  next: ExpenseFilters
): string | null {
  if (next.start_date && next.end_date && next.start_date > next.end_date) {
    return "Start date must be on or before end date.";
  }
  return null;
}