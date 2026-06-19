// src/components/dashboard/Settings.tsx
import React from 'react';
import { Sun, Moon, Trash2, Download, RefreshCw, User } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { selectTheme, setTheme } from '../store/slices/uiSlice';
import { selectFilteredExpenses, resetToSampleData } from '../store/slices/expensesSlice';
import { exportToCSV } from '../utils';
import { format } from 'date-fns';
import { cn } from '../utils';
import { useNavigate } from 'react-router-dom';
import { removeAll } from '@/store/slices/expensesSlice';

export default function Settings() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const expense = useAppSelector(selectFilteredExpenses);
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.user)
  const { loading: expenseLoading } = useAppSelector((state) => state.expense)

  const handleExport = () => {
    exportToCSV(
      expense.map((e) => ({
        Title: e.title,
        Amount: e.amount,
        Category: e.category,
        Date: e.date,
        Notes: e.notes || '',
        'Created At': e.createdAt,
      })),
      `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`
    );
  };
  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile */}
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-100/5 dark:bg- flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user ? (
              <span className="text-xl font-semibold text-green-500">
                {initials}
              </span>
            ) : (
              <span className="text-xs font-semibold text-accent">N/A</span>
            )}
          </div>
          <div>
            <p className="font-bold text-text text-lg">{user?.full_name}</p>
            <p className="text-sm text-muted">{user?.email}</p>
            {/* <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              ✨ Pro Plan
            </span> */}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate("/view-profile")} className="py-2 px-4 rounded-xl text-sm font-medium border border-border text-muted hover:text-text hover:bg-hover transition-colors">
            Edit Profile
          </button>
          <button onClick={() => navigate("/send-otp")} className="py-2 px-4 rounded-xl text-sm font-medium border border-border text-muted hover:text-text hover:bg-hover transition-colors">
            Change Password
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className="card">
        <h3 className="font-bold text-text mb-1">Appearance</h3>
        <p className="text-xs text-muted mb-4">Choose your preferred theme</p>
        <div className="flex gap-3">
          {(['light', 'dark'] as const).map((t) => (
            <button
              key={t}
              onClick={() => dispatch(setTheme(t))}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all',
                theme === t
                  ? 'bg-accent/10 border-accent text-accent'
                  : 'border-border text-muted hover:text-text hover:border-accent/40'
              )}
            >
              {t === 'light' ? <Sun size={16} /> : <Moon size={16} />}
              {t.charAt(0).toUpperCase() + t.slice(1)} Mode
            </button>
          ))}
        </div>
      </div>

      {/* Data management */}
      <div className="card">
        <h3 className="font-bold text-text mb-1">Data Management</h3>
        <p className="text-xs text-muted mb-4">Export or reset your expense data</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-hover">
            <div className="flex items-center gap-3">
              <Download size={16} className="text-muted" />
              <div>
                <p className="text-sm font-medium text-text">Export CSV</p>
                <p className="text-xs text-muted">Download all {expense.length} expenses</p>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="text-xs font-semibold text-accent hover:underline"
            >
              Export
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-hover">
            <div className="flex items-center gap-3">
              <RefreshCw size={16} className="text-muted" />
              <div>
                <p className="text-sm font-medium text-text">Reset to Sample Data</p>
                <p className="text-xs text-muted">Restore the original demo dataset</p>
              </div>
            </div>
            <button
              onClick={() => dispatch(resetToSampleData())}
              className="text-xs font-semibold text-amber-500 hover:underline"
            >
              Reset
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/20">
            <div className="flex items-center gap-3">
              <Trash2 size={16} className="text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-500">Clear All Data</p>
                <p className="text-xs text-muted">Permanently delete all expenses</p>
              </div>
            </div>
            <button
              disabled={expenseLoading}
              onClick={async () => {
                if (confirm('Are you sure? This will delete all your expenses.')) {
                  await dispatch(removeAll());
                }
              }}
              className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {expenseLoading ? 'Deleting...' : 'Delete All'}
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h3 className="font-bold text-text mb-3">About ExpenseWallet</h3>
        <div className="space-y-2 text-sm text-muted">
          <div className="flex justify-between"><span>Version</span><span className="text-text font-medium">1.0.0</span></div>
          <div className="flex justify-between"><span>Stack</span><span className="text-text font-medium">React + Redux Toolkit + Tailwind</span></div>
          <div className="flex justify-between"><span>Charts</span><span className="text-text font-medium">Recharts</span></div>
          <div className="flex justify-between"><span>Storage</span><span className="text-text font-medium">LocalStorage</span></div>
        </div>
      </div>
    </div>
  );
}
