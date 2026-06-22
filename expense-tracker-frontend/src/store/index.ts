// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import budgetsReducer from './slices/budgetsSlice';
import expenseReducer from './slices/expenseSlice/expenses.slice'
import userReducer from './slices/userSlices/user.slice'
import groupReducer from './slices/groupSlice/group.slice'
import expensesReducer from './slices/expensesSlice';
import authReducer from './slices/authSlice/authSlice';
import accountReducer from './slices/accountSlices/account.slice';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const accountsPersistConfig = {
  key: 'accounts',
  storage,
  whitelist: ['accounts', 'activeAccountId'],
};
export const store = configureStore({
  reducer: {
    expense: expenseReducer,
    expenses: expensesReducer,
    group: groupReducer,
    user: userReducer,
    accounts: persistReducer(accountsPersistConfig, accountReducer) as any,
    auth: authReducer,
    ui: uiReducer,
    budgets: budgetsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
