import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { Budget } from '../../types';
import { RootState } from '../index';
import { selectCategoryTotals } from './expensesSlice';
import { ExpenseTypes } from '@/types/expense.type';
import { budgetApis, BudgetPayload as BudgetApiPayload } from '@/services/budget.service';
import { handleApiError } from '@/utils/apiError';
import { switchAccount } from './accountSlices/account.slice';

type SetBudgetPayload = Budget & { accountId?: string | null };
type RemoveBudgetPayload = { category: ExpenseTypes; accountId?: string | null };

interface BudgetsState {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: BudgetsState = {
  budgets: [],
  loading: false,
  error: null,
  success: false,
};

export const fetchBudgets = createAsyncThunk(
  'budgets/viewAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await budgetApis.viewBudgets();
      return response.data.data as Budget[];
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const setBudget = createAsyncThunk(
  'budgets/set',
  async (payload: SetBudgetPayload, { rejectWithValue }) => {
    try {
      const data: BudgetApiPayload = {
        category: payload.category,
        limit: payload.limit,
        period: payload.period ?? 'monthly',
      };
      const response = await budgetApis.addBudget(data);
      return response.data.data as Budget;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const removeBudget = createAsyncThunk(
  'budgets/remove',
  async (payload: RemoveBudgetPayload, { rejectWithValue }) => {
    try {
      const response = await budgetApis.deleteBudgetByCategory(payload.category);
      return response.data.data as Budget;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(switchAccount, (state) => {
      state.budgets = [];
      state.loading = false;
      state.error = null;
      state.success = false;
    });

    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload;
        state.error = null;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(setBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(setBudget.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.budgets.findIndex((budget) => budget.category === action.payload.category);
        if (idx !== -1) state.budgets[idx] = action.payload;
        else state.budgets.push(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(setBudget.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(removeBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(removeBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = state.budgets.filter((budget) => budget.category !== action.payload.category);
        state.success = true;
        state.error = null;
      })
      .addCase(removeBudget.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      });
  },
});

export const selectBudgets = (state: RootState) => state.budgets.budgets;
export const selectBudgetsLoading = (state: RootState) => state.budgets.loading;
export const selectBudgetsError = (state: RootState) => state.budgets.error;

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
