// src/store/slices/budgetsSlice.ts
import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { Budget, Category } from '../../types';
import { sampleBudgets } from '@/data/sampleData';
import { RootState } from '../index';
import { selectCategoryTotals } from './expensesSlice';

const STORAGE_KEY = 'expense_tracker_budgets';
const DEFAULT_ACCOUNT_KEY = '__default__';

type BudgetByAccount = Record<string, Budget[]>;
type BudgetPayload = Budget & { accountId?: string | null };
type RemoveBudgetPayload = { category: Category; accountId?: string | null };

const accountKey = (accountId?: string | null) => accountId ?? DEFAULT_ACCOUNT_KEY;

function load(): BudgetByAccount {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return { [DEFAULT_ACCOUNT_KEY]: parsed };
      if (parsed && typeof parsed === 'object' && parsed.byAccountId) return parsed.byAccountId;
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch { }
  return { [DEFAULT_ACCOUNT_KEY]: sampleBudgets };
}

function persist(byAccountId: BudgetByAccount) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ byAccountId })); } catch { }
}

interface BudgetsState {
  byAccountId: BudgetByAccount;
}

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState: { byAccountId: load() } as BudgetsState,
  reducers: {
    setBudget(state, action: PayloadAction<BudgetPayload>) {
      const key = accountKey(action.payload.accountId);
      const items = state.byAccountId[key] ?? [];
      const budget = {
        category: action.payload.category,
        limit: action.payload.limit,
        period: action.payload.period,
      };
      const idx = items.findIndex((b) => b.category === budget.category);
      if (idx !== -1) items[idx] = budget;
      else items.push(budget);
      state.byAccountId[key] = items;
      persist(state.byAccountId);
    },
    removeBudget(state, action: PayloadAction<RemoveBudgetPayload>) {
      const key = accountKey(action.payload.accountId);
      state.byAccountId[key] = (state.byAccountId[key] ?? []).filter((b) => b.category !== action.payload.category);
      persist(state.byAccountId);
    },
  },
});

export const { setBudget, removeBudget } = budgetsSlice.actions;

const selectActiveAccountId = (state: RootState) =>
  (state.accounts as unknown as { activeAccountId: string | null }).activeAccountId;

export const selectBudgets = createSelector(
  (state: RootState) => state.budgets.byAccountId,
  selectActiveAccountId,
  (byAccountId, activeAccountId) => byAccountId[accountKey(activeAccountId)] ?? []
);

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
