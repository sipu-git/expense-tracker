// src/store/slices/expensesSlice.ts
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  deleteExpense as deleteExpenseThunk,
  updateExpense as updateExpenseThunk,
  viewExpenses as viewExpensesThunk,
  deleteAllExpenses as deleteAllExpensesThunk
} from './expenseSlice/expenses.slice';
import { Expense as ApiExpense } from '../../types/expense.type';
import { Category, Expense, ExpenseFilters } from '../../types';
import {
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
} from 'date-fns';
import { RootState } from '../index';

interface ExpensesUiState {
  filters: ExpenseFilters;
}

const initialState: ExpensesUiState = {
  filters: {},
};

const TYPE_TO_CATEGORY: Record<string, Category> = {
  FOOD: 'Food & Dining',
  TRANSPORTATION: 'Transportation',
  SHOPPING: 'Shopping',
  ENTERTAINMENT: 'Entertainment',
  HEALTHCARE: 'Healthcare',
  UTILITIES: 'Utilities',
  HOUSING: 'Housing',
  TRAVEL: 'Travel',
  EDUCATION: 'Education',
  OTHER: 'Other',
};

const normalizeDate = (value?: string) => {
  if (!value) return format(new Date(), 'yyyy-MM-dd');
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 10);
  return format(parsed, 'yyyy-MM-dd');
};

const normalizeExpense = (expense: ApiExpense | any): Expense => {
  const category = TYPE_TO_CATEGORY[expense.type] ?? 'Other';
  const createdAt = expense.createdAt ?? expense.created_at ?? expense.bought_at ?? new Date().toISOString();
  const updatedAt = expense.updatedAt ?? expense.updated_at ?? createdAt;

  return {
    id: expense.id,
    title: expense.name ?? expense.title ?? 'Untitled expense',
    amount: Number(expense.amount) || 0,
    category,
    date: normalizeDate(expense.bought_at ?? expense.date ?? createdAt),
    notes: expense.group?.name ? `Group: ${expense.group.name}` : undefined,
    createdAt,
    updatedAt,
  };
};

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<ExpenseFilters>) {
      state.filters = action.payload;
    },
    clearFilters(state) {
      state.filters = {};
    },
  },
});

export const { setFilters, clearFilters } = expensesSlice.actions;
export const deleteExpense = deleteExpenseThunk;
export const updateExpense = updateExpenseThunk;
export const resetToSampleData = viewExpensesThunk;
export const removeAll = deleteAllExpensesThunk;

const selectApiExpenses = (state: RootState) => state.expense.expenses;
const selectFilters = (state: RootState) => state.expenses.filters;

export const selectAllExpenses = createSelector(selectApiExpenses, (items) =>
  items.map(normalizeExpense)
);

export const selectFilteredExpenses = createSelector(
  selectAllExpenses,
  selectFilters,
  (items, filters) => {
    return items.filter((e) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!e.title.toLowerCase().includes(q) && !e.category.toLowerCase().includes(q)) return false;
      }
      if (filters.categories?.length && !filters.categories.includes(e.category)) return false;
      if (filters.dateFrom && e.date < filters.dateFrom) return false;
      if (filters.dateTo && e.date > filters.dateTo) return false;
      if (filters.minAmount != null && e.amount < filters.minAmount) return false;
      if (filters.maxAmount != null && e.amount > filters.maxAmount) return false;
      if (filters.month && !e.date.startsWith(filters.month)) return false;
      return true;
    });
  }
);

export const selectTodayExpenses = createSelector(selectAllExpenses, (items) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return items.filter((e) => e.date === today);
});

export const selectTodayTotal = createSelector(selectTodayExpenses, (items) =>
  items.reduce((sum, e) => sum + e.amount, 0)
);

export const selectMonthExpenses = createSelector(selectAllExpenses, (items) => {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  return items.filter((e) => {
    const d = parseISO(e.date);
    return !Number.isNaN(d.getTime()) && isWithinInterval(d, { start, end });
  });
});

export const selectMonthTotal = createSelector(selectMonthExpenses, (items) =>
  items.reduce((sum, e) => sum + e.amount, 0)
);

export const selectCategoryTotals = createSelector(selectMonthExpenses, (items) => {
  const totals: Record<string, { total: number; count: number }> = {};
  items.forEach((e) => {
    if (!totals[e.category]) totals[e.category] = { total: 0, count: 0 };
    totals[e.category].total += e.amount;
    totals[e.category].count += 1;
  });
  const grandTotal = Object.values(totals).reduce((s, v) => s + v.total, 0);
  return Object.entries(totals)
    .map(([category, { total, count }]) => ({
      category: category as Category,
      total,
      count,
      percentage: grandTotal ? (total / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
});

export const selectDailyTotals = createSelector(selectAllExpenses, (items) => {
  const totals: Record<string, { total: number; count: number }> = {};
  items.forEach((e) => {
    if (!totals[e.date]) totals[e.date] = { total: 0, count: 0 };
    totals[e.date].total += e.amount;
    totals[e.date].count += 1;
  });
  return Object.entries(totals)
    .map(([date, { total, count }]) => ({ date, total, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);
});

export const selectExpensesByDay = createSelector(selectFilteredExpenses, (items) => {
  const groups: Record<string, Expense[]> = {};
  items.forEach((e) => {
    if (!groups[e.date]) groups[e.date] = [];
    groups[e.date].push(e);
  });
  return Object.entries(groups)
    .map(([date, expenses]) => ({
      date,
      expenses,
      total: expenses.reduce((s, e) => s + e.amount, 0),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
});

export default expensesSlice.reducer;