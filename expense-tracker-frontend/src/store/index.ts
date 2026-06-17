// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import budgetsReducer from './slices/budgetsSlice';
import expenseReducer from './slices/expenseSlice/expenses.slice'
import userReducer from './slices/userSlices/user.slice'
import groupReducer from './slices/groupSlice/group.slice'
import expensesReducer from './slices/expensesSlice';
import authReducer from './slices/authSlice/authSlice';

export const store = configureStore({
  reducer: {
    expenses: expensesReducer,
    expense: expenseReducer,
    group: groupReducer,
    user: userReducer,
    auth: authReducer,
    ui: uiReducer,
    budgets: budgetsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
