"use client";

import { useState, use } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGroupExpenses } from "@/hooks/useExpenses";
import { useGroupMembers } from "@/hooks/useGroups";
import { useDeleteExpense } from "@/hooks/mutations";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { CreateExpenseModal } from "@/components/expenses/CreateExpenseModal";
import { EditExpenseModal } from "@/components/expenses/EditExpenseModal";
import {
  Button,
  Card,
  CardContent,
  Skeleton,
  ErrorState,
  ConfirmDialog,
} from "@/components/ui";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Expense, ExpenseFilters as ExpenseFilterValues } from "@/types";

const PAGE_SIZE = 20;

interface ExpensesPageProps {
  params: Promise<{ groupId: string }>;
}

export default function ExpensesPage({ params }: ExpensesPageProps) {
  const { groupId } = use(params);
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState<ExpenseFilterValues>({});
  const [draftFilters, setDraftFilters] = useState<ExpenseFilterValues>({});
  const [filterError, setFilterError] = useState<string | null>(null);

  const { data: membersData } = useGroupMembers(groupId);
  const members = membersData ?? [];

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGroupExpenses(groupId, {
    ...appliedFilters,
    page,
    limit: PAGE_SIZE,
  });

  const deleteExpense = useDeleteExpense();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const expenses = data?.expenses ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.total_pages ?? 0;

  const activeFilterCount = [
    appliedFilters.payer_id,
    appliedFilters.start_date,
    appliedFilters.end_date,
  ].filter(Boolean).length;

  const handleApplyFilters = (next: ExpenseFilterValues) => {
    setFilterError(null);
    if (next.start_date && next.end_date && next.start_date > next.end_date) {
      setFilterError("Start date must be on or before end date.");
      return;
    }
    setAppliedFilters(next);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilterError(null);
    setDraftFilters({});
    setAppliedFilters({});
    setPage(1);
  };

  const handleDeleteConfirm = () => {
    if (!deleting) return;
    setDeleteError(null);
    deleteExpense.mutate(
      { groupId, expenseId: deleting.expense_id },
      {
        onSuccess: () => setDeleting(null),
        onError: (err: unknown) => {
          setDeleteError(
            err instanceof Error
              ? err.message
              : "Failed to delete expense. Please try again."
          );
        },
      }
    );
  };

  const startIndex = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl text-foreground">Expenses</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Track and split shared expenses with the group.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Plus />}
          onClick={() => setCreateOpen(true)}
        >
          Add expense
        </Button>
      </div>

      <ExpenseFilters
        members={members}
        values={draftFilters}
        onChange={setDraftFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        activeCount={activeFilterCount}
        error={filterError}
      />

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-40 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <ErrorState
          title="Failed to load expenses"
          description={error?.message ?? "Something went wrong"}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && (
        <div
          className={cn(
            "space-y-3",
            isFetching && "opacity-60 transition-opacity duration-150"
          )}
        >
          <ExpenseList
            expenses={expenses}
            currentUserId={user?.user_id}
            onAddExpense={() => setCreateOpen(true)}
            onEdit={setEditing}
            onDelete={setDeleting}
            isFiltered={activeFilterCount > 0}
            onClearFilters={handleClearFilters}
          />
        </div>
      )}

      {!isLoading && !isError && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Showing {startIndex}-{endIndex} of {total} expense
            {total === 1 ? "" : "s"}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<ChevronLeft />}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                icon={<ChevronRight />}
                iconPosition="right"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {deleteError && (
        <p className="text-sm text-danger" role="alert">
          {deleteError}
        </p>
      )}

      <CreateExpenseModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        groupId={groupId}
      />

      <EditExpenseModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        groupId={groupId}
        expense={editing}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => {
          if (deleteExpense.isPending) return;
          setDeleting(null);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete expense"
        description="Delete this expense? It will be removed from the group's records."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        loading={deleteExpense.isPending}
      />
    </div>
  );
}
