// src/store/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

interface UiState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  modal: {
    type: 'add' | 'edit' | 'delete' | 'budget' | null;
    expenseId?: string;
  };
  activeView: 'dashboard' | 'expenses' | 'analytics' | 'budgets' | 'settings';
}

const getInitialTheme = (): 'light' | 'dark' => {
  try {
    const stored = localStorage.getItem('expense_tracker_theme');
    if (stored === 'dark' || stored === 'light') return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch {}
  return 'light';
};

const initialState: UiState = {
  theme: getInitialTheme(),
  sidebarOpen: true,
  modal: { type: null },
  activeView: 'dashboard',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('expense_tracker_theme', state.theme); } catch {}
    },
    setTheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.theme = action.payload;
      try { localStorage.setItem('expense_tracker_theme', action.payload); } catch {}
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    openModal(state, action: PayloadAction<UiState['modal']>) {
      state.modal = action.payload;
    },
    closeModal(state) {
      state.modal = { type: null };
    },
    setActiveView(state, action: PayloadAction<UiState['activeView']>) {
      state.activeView = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, toggleSidebar, openModal, closeModal, setActiveView } =
  uiSlice.actions;

export const selectTheme = (state: RootState) => state.ui.theme;
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectModal = (state: RootState) => state.ui.modal;
export const selectActiveView = (state: RootState) => state.ui.activeView;

export default uiSlice.reducer;
