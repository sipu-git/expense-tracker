
import { ExpenseTypes } from "./expense.type";


export interface Budget {
  category: ExpenseTypes;
  limit: number;
  period: 'monthly' | 'weekly';
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
