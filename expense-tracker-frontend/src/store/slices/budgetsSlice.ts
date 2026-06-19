// src/store/slices/budgetsSlice.ts
import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { Budget, Category } from '../../types';
import { sampleBudgets } from '@/data/sampleData';
import { RootState } from '../index';
import { selectCategoryTotals } from './expensesSlice';

const STORAGE_KEY = 'expense_tracker_budgets';

function load(): Budget[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch { }
  return sampleBudgets;
}

function persist(items: Budget[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { }
}

interface BudgetsState {
  items: Budget[];
}

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState: { items: load() } as BudgetsState,
  reducers: {
    setBudget(state, action: PayloadAction<Budget>) {
      const budget = {
        category: action.payload.category,
        limit: action.payload.limit,
        period: action.payload.period,
      };
      const idx = state.items.findIndex((b) => b.category === budget.category);
      if (idx !== -1) state.items[idx] = budget;
      else state.items.push(budget);
      persist(state.items);
    },
    removeBudget(state, action: PayloadAction<{ category: Category }>) {
      state.items = state.items.filter((b) => b.category !== action.payload.category);
      persist(state.items);
    },
  },
});

export const { setBudget, removeBudget } = budgetsSlice.actions;

export const selectBudgets = (state: RootState) => state.budgets.items;

export const selectBudgetStatus = createSelector(
  selectBudgets,
  selectCategoryTotals,
  (budgets, categoryTotals) =>
    budgets.map((budget) => {
      const spent = categoryTotals.find((c) => c.category === budget.category)?.total ?? 0;
      const percentage = budget.limit ? (spent / budget.limit) * 100 : 0;
      return {
        ...budget,
        spent,
        remaining: budget.limit - spent,
        percentage,
        isOverBudget: spent > budget.limit,
        isNearLimit: percentage >= 80 && percentage < 100,
      };
    })
);

export default budgetsSlice.reducer;