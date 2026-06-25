
import { ExpenseTypes } from "./expense.type";


export interface Budget {
  id?: string;
  category: ExpenseTypes;
  limit: number;
  period: 'monthly' | 'weekly';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currency: string;
  theme: 'light' | 'dark';
}

export interface ExpenseFilters {
  dateFrom?: string;
  dateTo?: string;
  categories?: ExpenseTypes[];
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  month?: string;
}

export interface DailyTotal {
  date: string;
  total: number;
  count: number;
}

export interface CategoryTotal {
  category: ExpenseTypes;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyTotal {
  month: string;
  total: number;
  count: number;
}
