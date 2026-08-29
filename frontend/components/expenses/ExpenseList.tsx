"use client";

import { ExpenseCard, ExpenseTableRow } from "./ExpenseCard";
import { EmptyState, Button } from "@/components/ui";
import { ReceiptText, Plus, FilterX, X } from "lucide-react";
import type { Expense } from "@/types";

interface ExpenseListProps {
  expenses: Expense[];
  currentUserId?: string;
  onAddExpense: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

const TH_CLASS =
  "px-4 py-3 text-caption font-medium uppercase tracking-wide text-text-muted";

export function ExpenseList({
  expenses,
  currentUserId,
  onAddExpense,
  onEdit,
  onDelete,
  isFiltered = false,
  onClearFilters,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    if (isFiltered) {
      return (
        <EmptyState
          icon={<FilterX />}
          title="No expenses match your filters"
          description="Try adjusting or clearing the filters to see more expenses."
          action={
            onClearFilters && (
              <Button
                variant="secondary"
                size="md"
                icon={<X />}
                onClick={onClearFilters}
              >
                Clear filters
              </Button>
            )
          }
        />
      );
    }

    return (
      <EmptyState
        icon={<ReceiptText />}
        title="No expenses yet"
        description="Add your first expense to start splitting costs with the group."
        action={
          <Button
            variant="primary"
            size="md"
            icon={<Plus />}
            onClick={onAddExpense}
          >
            Add expense
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="hidden sm:block">
        <div className="overflow-x-auto rounded-radius-lg border border-border-default bg-surface shadow-xs">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border-default bg-surface-alt/60">
                <th scope="col" className={TH_CLASS}>
                  Description
                </th>
                <th scope="col" className={TH_CLASS}>
                  Amount
                </th>
                <th scope="col" className={TH_CLASS}>
                  Payer
                </th>
                <th scope="col" className={TH_CLASS}>
                  Date
                </th>
                <th scope="col" className={TH_CLASS}>
                  Split with
                </th>
                <th scope="col" className={TH_CLASS}>
                  Reactions
                </th>
                <th
                  scope="col"
                  className={`${TH_CLASS} text-right`}
                >
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {expenses.map((expense) => (
                <ExpenseTableRow
                  key={expense.expense_id}
                  expense={expense}
                  currentUserId={currentUserId}
                  onEdit={() => onEdit(expense)}
                  onDelete={() => onDelete(expense)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 sm:hidden">
        {expenses.map((expense) => (
          <ExpenseCard
            key={expense.expense_id}
            expense={expense}
            currentUserId={currentUserId}
            onEdit={() => onEdit(expense)}
            onDelete={() => onDelete(expense)}
          />
        ))}
      </div>
    </>
  );
}