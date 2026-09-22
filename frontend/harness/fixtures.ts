import type {
  Activity,
  Balance,
  Contribution,
  Expense,
  GroupListItem,
  GroupMemberRecord,
} from "@/types";

const noop = () => {};

const GROUP: GroupListItem = {
  group_id: "group-1",
  name: "Weekend Trip",
  icon: "plane",
  description: "Gas, food, and lodging for the weekend.",
  role: "admin",
};

const MEMBERS: GroupMemberRecord[] = [
  {
    group_member_id: "gm-1",
    group_id: "group-1",
    user_id: "user-1",
    role: "admin",
    joined_at: "2026-01-10T00:00:00.000Z",
    name: "Alex Doe",
    email: "alex@example.com",
  },
  {
    group_member_id: "gm-2",
    group_id: "group-1",
    user_id: "user-2",
    role: "member",
    joined_at: "2026-01-12T00:00:00.000Z",
    name: "Jordan Smith",
  },
];

const EXPENSE: Expense = {
  expense_id: "exp-1",
  group_id: "group-1",
  description: "Dinner at pasta place",
  amount: "64.50",
  paid_by: "user-1",
  expense_date: "2026-03-14T00:00:00.000Z",
  created_at: "2026-03-14T20:00:00.000Z",
  updated_at: "2026-03-14T20:00:00.000Z",
  payer: { user_id: "user-1", name: "Alex Doe", email: "alex@example.com" },
  splits: [
    {
      expense_split_id: "es-1",
      user_id: "user-1",
      share_amount: 32.25,
      user: { user_id: "user-1", name: "Alex Doe", email: "alex@example.com" },
    },
    {
      expense_split_id: "es-2",
      user_id: "user-2",
      share_amount: 32.25,
      user: { user_id: "user-2", name: "Jordan Smith", email: "jordan@example.com" },
    },
  ],
};

const ACTIVITY: Activity = {
  activity_id: "act-1",
  group_id: "group-1",
  user: { user_id: "user-1", name: "Alex Doe", email: "alex@example.com" },
  action: "EXPENSE_CREATED",
  description: "Added expense DINNER at pasta place ($64.50)",
  created_at: "2026-03-14T20:05:00.000Z",
};

const BALANCES: Balance[] = [
  { user_id: "user-1", name: "Alex Doe", total_paid: 100, total_share: 50, balance: 50, status: "OWED" },
  { user_id: "user-2", name: "Jordan Smith", total_paid: 40, total_share: 90, balance: -50, status: "OWES" },
  { user_id: "user-3", name: "Taylor Brown", total_paid: 25, total_share: 25, balance: 0, status: "SETTLED" },
];

const CONTRIBUTIONS: Contribution[] = [
  { user_id: "user-1", name: "Alex Doe", amount: 120.0 },
  { user_id: "user-2", name: "Jordan Smith", amount: 80.5 },
];

export interface FixtureMap {
  ExpenseList: (props?: Record<string, unknown>) => Record<string, unknown>;
  ExpenseCard: (props?: Record<string, unknown>) => Record<string, unknown>;
  ActivityItem: (props?: Record<string, unknown>) => Record<string, unknown>;
  ActivityFeed: (props?: Record<string, unknown>) => Record<string, unknown>;
  GroupCard: (props?: Record<string, unknown>) => Record<string, unknown>;
  BalanceList: (props?: Record<string, unknown>) => Record<string, unknown>;
  MemberList: (props?: Record<string, unknown>) => Record<string, unknown>;
  SummaryChart: (props?: Record<string, unknown>) => Record<string, unknown>;
}

export const fixtures: FixtureMap = {
  ExpenseList: (overrides = {}) => ({
    expenses: [EXPENSE],
    currentUserId: "user-1",
    onAddExpense: noop,
    onEdit: noop,
    onDelete: noop,
    isFiltered: false,
    onClearFilters: noop,
    ...overrides,
  }),
  ExpenseCard: (overrides = {}) => ({
    expense: EXPENSE,
    currentUserId: "user-1",
    onEdit: noop,
    onDelete: noop,
    ...overrides,
  }),
  ActivityItem: (overrides = {}) => ({
    activity: ACTIVITY,
    groupName: GROUP.name,
    ...overrides,
  }),
  ActivityFeed: (overrides = {}) => ({
    activities: [ACTIVITY, { ...ACTIVITY, activity_id: "act-2" }],
    groupNames: { [GROUP.group_id]: GROUP.name },
    ...overrides,
  }),
  GroupCard: (overrides = {}) => ({
    group: GROUP,
    balance: 25,
    members: MEMBERS,
    membersLoading: false,
    ...overrides,
  }),
  BalanceList: (overrides = {}) => ({
    balances: BALANCES,
    currentUserId: "user-1",
    ...overrides,
  }),
  MemberList: (overrides = {}) => ({
    groupId: GROUP.group_id,
    members: MEMBERS,
    currentUserId: "user-1",
    currentUserName: "Alex Doe",
    ...overrides,
  }),
  SummaryChart: (overrides = {}) => ({
    contributions: CONTRIBUTIONS,
    totalSpending: 200.5,
    ...overrides,
  }),
};

export function parseProps(raw: string): Record<string, unknown> {
  if (!raw || raw === "__empty__") return {};
  return JSON.parse(raw);
}

export { EXPENSE, ACTIVITY, GROUP, MEMBERS, noop };