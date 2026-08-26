export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  paidBy: string;
  groupId?: string;
  splitType: "equal" | "exact" | "percentage" | "shares";
  createdAt: string;
  updatedAt: string;
}

export interface Balance {
  id: string;
  userId: string;
  groupId?: string;
  amount: number;
  currency: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
