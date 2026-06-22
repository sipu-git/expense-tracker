// src/types/index.ts

export type Category =
  | 'Food & Dining'
  | 'Transportation'
  | 'Shopping'
  | 'Entertainment'
  | 'Healthcare'
  | 'Utilities'
  | 'Housing'
  | 'Travel'
  | 'Education'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Utilities',
  'Housing',
  'Travel',
  'Education',
  'Other',
];

export const CATEGORY_COLORS: Record<Category, string> = {
  'Food & Dining': '#f97316',
  Transportation: '#3b82f6',
  Shopping: '#a855f7',
  Entertainment: '#ec4899',
  Healthcare: '#ef4444',
  Utilities: '#14b8a6',
  Housing: '#f59e0b',
  Travel: '#06b6d4',
  Education: '#22c55e',
  Other: '#6b7280',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  'Food & Dining': '🍽️',
  Transportation: '🚗',
  Shopping: '🛍️',
  Entertainment: '🎬',
  Healthcare: '🏥',
  Utilities: '⚡',
  Housing: '🏠',
  Travel: '✈️',
  Education: '📚',
  Other: '📦',
};

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string; // ISO string
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  category: Category;
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
  categories?: Category[];
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
  category: Category;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyTotal {
  month: string;
  total: number;
  count: number;
}
