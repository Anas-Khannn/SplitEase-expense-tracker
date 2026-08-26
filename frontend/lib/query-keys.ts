export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },

  groups: {
    all: ["groups"] as const,
    list: () => [...queryKeys.groups.all, "list"] as const,
    detail: (groupId: string) => [...queryKeys.groups.all, groupId] as const,
    members: (groupId: string) =>
      [...queryKeys.groups.all, groupId, "members"] as const,
  },

  expenses: {
    all: ["expenses"] as const,
    list: (groupId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.expenses.all, groupId, filters ?? {}] as const,
    detail: (groupId: string, expenseId: string) =>
      [...queryKeys.expenses.all, groupId, expenseId] as const,
  },

  balances: {
    all: ["balances"] as const,
    group: (groupId: string) =>
      [...queryKeys.balances.all, groupId] as const,
  },

  payments: {
    all: ["payments"] as const,
    list: (groupId: string) =>
      [...queryKeys.payments.all, groupId] as const,
  },

  activity: {
    all: ["activity"] as const,
    list: (groupId: string, pagination?: Record<string, unknown>) =>
      [...queryKeys.activity.all, groupId, pagination ?? {}] as const,
  },

  summary: {
    all: ["summary"] as const,
    group: (groupId: string, month?: string) =>
      [...queryKeys.summary.all, groupId, month ?? "all"] as const,
  },

  dashboard: {
    all: ["dashboard"] as const,
    summary: () => [...queryKeys.dashboard.all, "summary"] as const,
  },

  reactions: {
    all: ["reactions"] as const,
    expense: (expenseId: string) =>
      [...queryKeys.reactions.all, expenseId] as const,
  },
} as const;
