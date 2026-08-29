/* ── API Response Envelope ── */
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors?: string[];
}

/* ── User ── */
export interface User {
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserSummary {
  user_id: string;
  name: string;
  email: string;
}

/* ── Auth ── */
export interface AuthData {
  user: User;
  token: string;
}

/* ── Group ── */
export interface Group {
  group_id: string;
  name: string;
  icon: string | null;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupListItem {
  group_id: string;
  name: string;
  icon: string | null;
  description: string | null;
  role: "admin" | "member";
}

export interface GroupMember {
  user_id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  joined_at: string;
}

export interface GroupDetail extends Group {
  members: GroupMember[];
}

export interface GroupMemberRecord {
  group_member_id: string;
  group_id: string;
  user_id: string;
  role: "admin" | "member";
  joined_at: string;
  name?: string;
  email?: string;
}

/* ── Expense ── */
export interface ExpenseSplit {
  expense_split_id: string;
  user_id: string;
  share_amount: number;
  user: UserSummary;
}

export interface Expense {
  expense_id: string;
  group_id: string;
  description: string;
  amount: string;
  paid_by: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
  payer: UserSummary;
  splits: ExpenseSplit[];
}

export interface ExpenseFilters {
  payer_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  pagination: Pagination;
}

/* ── Payment ── */
export interface Payment {
  payment_id: string;
  group_id: string;
  amount: string;
  note: string | null;
  payment_date: string;
  created_at: string;
  updated_at: string;
  payer: UserSummary;
  receiver: UserSummary;
}

/* ── Balance ── */
export interface Balance {
  user_id: string;
  name: string;
  total_paid: number;
  total_share: number;
  balance: number;
  status: "OWED" | "OWES" | "SETTLED";
}

/* ── Activity ── */
export type ActivityAction =
  | "GROUP_CREATED"
  | "MEMBER_ADDED"
  | "MEMBER_REMOVED"
  | "EXPENSE_CREATED"
  | "EXPENSE_UPDATED"
  | "EXPENSE_DELETED"
  | "PAYMENT_CREATED";

export interface Activity {
  activity_id: string;
  group_id: string;
  user: UserSummary;
  action: ActivityAction;
  description: string;
  created_at: string;
}

export interface ActivityListResponse {
  activities: Activity[];
  pagination: Pagination;
}

/* ── Summary ── */
export interface Contribution {
  user_id: string;
  name: string;
  amount: number;
}

export interface GroupSummary {
  total_spending: number;
  contributions: Contribution[];
}

/* ── Dashboard ── */
export interface DashboardGroupBalance {
  group_id: string;
  group_name: string;
  icon: string | null;
  balance: number;
}

export interface DashboardSummary {
  total_owed: number;
  total_owe: number;
  net_balance: number;
  groups: DashboardGroupBalance[];
}

/* ── Reaction ── */
export type ReactionType = "👍" | "😂" | "😮" | "❤️" | "😢";

export interface ExpenseReaction {
  reaction_id: string;
  expense_id: string;
  user_id: string;
  reaction: ReactionType;
  created_at: string;
  user: UserSummary;
}

/* ── Mutation Request Bodies ── */
export interface CreateGroupRequest {
  name: string;
  icon?: string;
  description?: string;
}

export interface AddMemberRequest {
  user_id: string;
}

export interface UpdateMemberRoleRequest {
  role: "admin" | "member";
}

export interface CreateExpenseRequest {
  amount: number;
  description: string;
  paid_by: string;
  participant_ids: string[];
  expense_date: string;
}

export interface UpdateExpenseRequest {
  amount?: number;
  description?: string;
  paid_by?: string;
  participant_ids?: string[];
  expense_date?: string;
}

export interface CreatePaymentRequest {
  paid_to: string;
  amount: number;
  note?: string;
  payment_date: string;
}

export interface AddReactionRequest {
  reaction: ReactionType;
}

export interface ActivityPagination {
  page?: number;
  limit?: number;
}
