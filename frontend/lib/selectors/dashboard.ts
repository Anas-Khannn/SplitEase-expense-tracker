import type { UseQueryResult } from "@tanstack/react-query";
import type {
  Activity,
  ActivityAction,
  Expense,
  GroupListItem,
} from "@/types";

const ACTIVITY_ALIASES: Record<string, ActivityAction> = {
  created_group: "GROUP_CREATED",
  added_expense: "EXPENSE_CREATED",
  updated_expense: "EXPENSE_UPDATED",
  deleted_expense: "EXPENSE_DELETED",
  made_payment: "PAYMENT_CREATED",
  added_member: "MEMBER_ADDED",
  removed_member: "MEMBER_REMOVED",
};

export function normalizeActivity(activity: Activity): Activity {
  const action = ACTIVITY_ALIASES[activity.action] ?? activity.action;
  return action === activity.action ? activity : { ...activity, action };
}

export function collectRecentActivity(
  groups: GroupListItem[] | undefined,
  groupQueries: ReadonlyArray<UseQueryResult<Activity[], Error>>,
  limit = 6
): { activities: Activity[]; groupNames: Record<string, string> } {
  const groupNames: Record<string, string> = {};
  for (const group of groups ?? []) {
    groupNames[group.group_id] = group.name;
  }

  const activities: Activity[] = [];
  for (const query of groupQueries) {
    for (const item of query.data ?? []) {
      activities.push(item);
    }
  }

  activities.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return { activities: activities.slice(0, limit), groupNames };
}

export function collectRecentExpenses(
  groups: GroupListItem[] | undefined,
  expenseQueries: ReadonlyArray<UseQueryResult<Expense[], Error>>,
  limit = 5
): { expenses: Expense[]; groupNames: Record<string, string> } {
  const groupNames: Record<string, string> = {};
  for (const group of groups ?? []) {
    groupNames[group.group_id] = group.name;
  }

  const expenses: Expense[] = [];
  for (const query of expenseQueries) {
    for (const item of query.data ?? []) {
      expenses.push(item);
    }
  }

  expenses.sort(
    (a, b) =>
      new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
  );

  return { expenses: expenses.slice(0, limit), groupNames };
}