"use client";

import { useState, use } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGroupExpenses } from "@/hooks/useExpenses";
import { useDeleteExpense } from "@/hooks/mutations";
import { ExpenseList } from "@/components/expenses/ExpenseList";
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
import { Plus } from "lucide-react";
import type { Expense } from "@/types";

interface ExpensesPageProps {
  params: Promise<{ groupId: string }>;
}

export default function ExpensesPage({ params }: ExpensesPageProps) {
  const { groupId } = use(params);
  const { user } = useAuth();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGroupExpenses(groupId);

  const deleteExpense = useDeleteExpense();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const expenses = data?.expenses ?? [];

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

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-h3 font-semibold text-text-primary">Expenses</h3>
          <p className="text-body-sm text-text-muted mt-1">
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
        <ExpenseList
          expenses={expenses}
          currentUserId={user?.user_id}
          onAddExpense={() => setCreateOpen(true)}
          onEdit={setEditing}
          onDelete={setDeleting}
        />
      )}

      {deleteError && (
        <p className="text-body-sm text-danger-500" role="alert">
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
