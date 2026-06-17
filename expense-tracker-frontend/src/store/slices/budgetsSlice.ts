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
  } catch {}
  return sampleBudgets;
}

interface BudgetsState {
  items: Budget[];
}

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState: { items: load() } as BudgetsState,
  reducers: {
    setBudget(state, action: PayloadAction<Budget>) {
      const idx = state.items.findIndex((b) => b.category === action.payload.category);
      if (idx !== -1) state.items[idx] = action.payload;
      else state.items.push(action.payload);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items)); } catch {}
    },
    removeBudget(state, action: PayloadAction<Category>) {
      state.items = state.items.filter((b) => b.category !== action.payload);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items)); } catch {}
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
