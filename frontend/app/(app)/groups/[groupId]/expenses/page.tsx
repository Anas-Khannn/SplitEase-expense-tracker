"use client";

import { useState, use, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGroupExpenses } from "@/hooks/useExpenses";
import { useGroupMembers } from "@/hooks/useGroups";
import { useGroupSummary } from "@/hooks/useSummary";
import { useGroupBalance } from "@/hooks/useBalances";
import { useDeleteExpense } from "@/hooks/mutations";
import { CreateExpenseModal } from "@/components/expenses/CreateExpenseModal";
import { EditExpenseModal } from "@/components/expenses/EditExpenseModal";
import { ExpenseReactions } from "@/components/expenses/ExpenseReactions";
import { GroupExpensesSkeleton } from "@/components/skeletons";
import { ViewExpenseModal } from "@/components/expenses/ViewExpenseModal";
import {
  Button,
  ErrorState,
  EmptyState,
  ConfirmDialog,
} from "@/components/ui";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Search,
  Download,
  Filter,
  Pencil,
  Trash2,
  Eye,
  ShoppingCart,
  Utensils,
  Wifi,
  Zap,
  Home,
  Plane,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  formatCurrency,
  formatDate,
  getSplitLabel,
} from "@/lib/selectors";
import type { Expense } from "@/types";

const PAGE_SIZE = 20;

interface ExpensesPageProps {
  params: Promise<{ groupId: string }>;
}

function getCategoryIcon(description: string = "") {
  const d = description.toLowerCase();
  if (d.includes("grocer") || d.includes("market") || d.includes("supermarket") || d.includes("snack")) return ShoppingCart;
  if (d.includes("dinner") || d.includes("lunch") || d.includes("bistro") || d.includes("food") || d.includes("coffee") || d.includes("restaurant")) return Utensils;
  if (d.includes("wifi") || d.includes("internet")) return Wifi;
  if (d.includes("electric") || d.includes("utilit") || d.includes("power") || d.includes("bill")) return Zap;
  if (d.includes("rent") || d.includes("apartment") || d.includes("house") || d.includes("cabin")) return Home;
  if (d.includes("flight") || d.includes("travel") || d.includes("trip") || d.includes("hotel")) return Plane;
  return FileText;
}

function getCategoryTag(description: string = ""): string {
  const d = description.toLowerCase();
  if (d.includes("rent") || d.includes("lease")) return "Fixed monthly";
  if (d.includes("wifi") || d.includes("electric") || d.includes("utilit") || d.includes("water") || d.includes("power")) return "Utilities";
  if (d.includes("grocer") || d.includes("market")) return "Groceries";
  if (d.includes("dinner") || d.includes("lunch") || d.includes("food")) return "Dining";
  if (d.includes("flight") || d.includes("trip") || d.includes("hotel")) return "Travel";
  return "General";
}

export default function ExpensesPage({ params }: ExpensesPageProps) {
  const { groupId } = use(params);
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayer, setSelectedPayer] = useState<string>("all");

  const { data: membersData } = useGroupMembers(groupId);
  const members = membersData ?? [];

  const { data: summaryData } = useGroupSummary(groupId);
  const { data: balancesData } = useGroupBalance(groupId);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGroupExpenses(groupId, {
    payer_id: selectedPayer !== "all" ? selectedPayer : undefined,
    page,
    limit: PAGE_SIZE,
  });

  const deleteExpense = useDeleteExpense();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [viewing, setViewing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const expenses = data?.expenses ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.total_pages ?? 0;

  // Filter by local search query
  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses;
    const q = searchQuery.toLowerCase();
    return expenses.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        (e.payer?.name && e.payer.name.toLowerCase().includes(q))
    );
  }, [expenses, searchQuery]);

  // Financial metrics for group
  const totalSpend = useMemo(() => {
    if (summaryData?.total_spending !== undefined) {
      return summaryData.total_spending;
    }
    return expenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
  }, [summaryData, expenses]);

  const userBalance = useMemo(() => {
    const b = (balancesData ?? []).find((bal) => bal.user_id === user?.user_id);
    return b ? b.balance : 0;
  }, [balancesData, user]);

  const yourOwed = userBalance > 0 ? userBalance : 0;
  const yourOwe = userBalance < 0 ? Math.abs(userBalance) : 0;

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

  const handleExportCSV = () => {
    if (!expenses.length) return;
    const headers = ["Description", "Payer", "Amount", "Date"];
    const rows = expenses.map((e) => [
      `"${(e.description || "Untitled").replace(/"/g, '""')}"`,
      `"${(e.payer?.name || "Unknown").replace(/"/g, '""')}"`,
      e.amount,
      e.expense_date,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Group_${groupId}_Expenses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startIndex = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. METRIC CARDS matching Stitch (3-Column Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Spend */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-label">
              Total Group Spend
            </span>
            <span className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              <Receipt className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
              {formatCurrency(totalSpend)}
            </span>
            <span className="text-xs text-zinc-500">
              {total} {total === 1 ? "item" : "items"} logged
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1">
            <span>Includes shared rent &amp; utilities</span>
          </p>
        </div>

        {/* Card 2: Your Share Pending (You owe) */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-label">
              Your Share Pending
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
              You owe
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
              -{formatCurrency(yourOwe)}
            </span>
            <span className="text-xs text-zinc-500">pending settlement</span>
          </div>
          <div className="text-xs text-zinc-500 mt-2 flex items-center justify-between">
            <span>Liabilities to group</span>
            <Link
              href={`/groups/${groupId}/balances`}
              className="text-xs font-medium text-zinc-900 dark:text-zinc-100 underline hover:text-zinc-600"
            >
              Settle now
            </Link>
          </div>
        </div>

        {/* Card 3: You Are Owed Back */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-label">
              You Are Owed Back
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
              Reimbursable
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              +{formatCurrency(yourOwed)}
            </span>
            <span className="text-xs text-zinc-500">from members</span>
          </div>
          <div className="text-xs text-zinc-500 mt-2 flex items-center justify-between">
            <span>Owed by roommates</span>
            <Link
              href={`/groups/${groupId}/balances`}
              className="text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
            >
              View balances →
            </Link>
          </div>
        </div>
      </div>

      {/* 2. FILTER & SEARCH CONTROLS TOOLBAR matching Stitch */}
      <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Search within expenses */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 size-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter expenses by description or member..."
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:bg-white dark:focus:bg-zinc-950 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all outline-none"
          />
        </div>

        {/* Dropdown filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Payer filter */}
          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300">
            <span className="text-zinc-400">Payer:</span>
            <select
              value={selectedPayer}
              onChange={(e) => {
                setSelectedPayer(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by payer"
              className="bg-transparent text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
            >
              <option value="all">All members</option>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.name || m.user_id}
                </option>
              ))}
            </select>
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-8 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export as CSV"
          >
            <Download className="size-3 text-zinc-500" />
            <span>Export</span>
          </button>

          {/* Add expense quick button */}
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="h-8 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Add expense</span>
          </button>
        </div>
      </section>

      {/* 3. EXPENSES LIST / CARDS matching Stitch */}
      {isLoading && <GroupExpensesSkeleton />}

      {isError && (
        <ErrorState
          title="Failed to load expenses"
          description={error?.message ?? "Something went wrong"}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && filteredExpenses.length === 0 && (
        <EmptyState
          icon={<Receipt className="size-8 text-zinc-400" />}
          title="No expenses found"
          description={
            searchQuery
              ? "No expenses matched your filter criteria."
              : "Add your first expense to start splitting costs with the group."
          }
          action={
            <Button
              variant="primary"
              size="md"
              icon={<Plus />}
              onClick={() => setCreateOpen(true)}
            >
              Add expense
            </Button>
          }
        />
      )}

      {!isLoading && !isError && filteredExpenses.length > 0 && (
        <div
          className={cn(
            "space-y-3",
            isFetching && "opacity-60 transition-opacity duration-150"
          )}
        >
          {filteredExpenses.map((expense: Expense) => {
            const CategoryIcon = getCategoryIcon(expense.description);
            const tag = getCategoryTag(expense.description);
            const isPayer = expense.payer?.user_id === user?.user_id;
            const payerName = isPayer ? "You" : expense.payer?.name || "Member";
            const numericAmount = parseFloat(expense.amount) || 0;
            const splitLabel = getSplitLabel(expense);

            const mySplit = expense.splits?.find((s) => s.user_id === user?.user_id);
            const myShare = mySplit?.share_amount ?? (expense.splits?.length ? numericAmount / expense.splits.length : numericAmount / 2);

            return (
              <div
                key={expense.expense_id}
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl p-4 transition-all duration-150 hover:shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Category Icon & Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0">
                      <CategoryIcon className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {expense.description || "Untitled expense"}
                        </h3>
                        <span className="text-[11px] font-medium px-2 py-0.2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded border border-zinc-200/60 dark:border-zinc-700/60">
                          {tag}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                        Paid by <strong className="font-medium text-zinc-700 dark:text-zinc-300">{payerName}</strong> · {formatDate(expense.expense_date)} · {splitLabel}
                      </p>
                    </div>
                  </div>

                  {/* Right: Split Status & Total Bill & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                    <div className="text-right">
                      {isPayer ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 tabular-nums">
                          You are owed +{formatCurrency(numericAmount - myShare)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60 tabular-nums">
                          You owe -{formatCurrency(myShare)}
                        </span>
                      )}
                      <p className="text-[11px] text-zinc-400 mt-0.5 text-right tabular-nums">
                        {formatCurrency(numericAmount)} Total bill
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setViewing(expense)}
                        aria-label={`View ${expense.description}`}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                      >
                        <Eye className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(expense)}
                        aria-label={`Edit ${expense.description}`}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(expense)}
                        aria-label={`Delete ${expense.description}`}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Emoji Reaction Section matching Stitch */}
                <ExpenseReactions
                  expenseId={expense.expense_id}
                  currentUserId={user?.user_id}
                />
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-xs text-zinc-500">
                Showing {startIndex}-{endIndex} of {total} expenses
              </p>
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
                <span className="text-xs text-zinc-500">
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

      <ViewExpenseModal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        groupId={groupId}
        expense={viewing}
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
