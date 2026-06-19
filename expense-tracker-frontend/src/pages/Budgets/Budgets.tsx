// src/components/dashboard/Budgets.tsx
import React, { useState } from 'react';
import { Plus, AlertTriangle, CheckCircle, Trash2, TrendingUp } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { selectBudgetStatus, setBudget, removeBudget } from '../../store/slices/budgetsSlice';
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS, Category } from '../../types';
import { formatCurrency, cn } from '../../utils';

export default function Budgets() {
  const dispatch = useAppDispatch();
  const budgetStatus = useAppSelector(selectBudgetStatus);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ category: Category; limit: string }>({
    category: 'Food & Dining',
    limit: '',
  });

  const handleAdd = () => {
    const limit = parseFloat(form.limit);
    if (!limit || limit <= 0) return;
    dispatch(setBudget({ category: form.category, limit, period: 'monthly' }));
    setForm({ category: 'Food & Dining', limit: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-text text-lg">Monthly Budgets</h2>
          <p className="text-xs text-muted mt-0.5">Set limits and track against your spending</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-hover transition-all shadow-md shadow-accent/25"
        >
          <Plus size={15} />
          Add Budget
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card border-2 border-accent/30">
          <h3 className="font-semibold text-text text-sm mb-4">New Budget</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1.5">Category</label>
              <select
                className="form-input"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1.5">Monthly Limit (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 500"
                value={form.limit}
                onChange={(e) => setForm((f) => ({ ...f, limit: e.target.value }))}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-hover transition-all"
              >
                Save Budget
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="py-2.5 px-4 rounded-xl text-sm font-semibold border border-border text-muted hover:text-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget cards */}
      {budgetStatus.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">💰</p>
          <p className="text-base font-semibold text-text">No budgets set</p>
          <p className="text-sm text-muted mt-1">Add a budget to start tracking your spending</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetStatus.map((b) => {
            const color = CATEGORY_COLORS[b.category];
            const pct = Math.min(b.percentage, 100);
            const StatusIcon = b.isOverBudget ? AlertTriangle : b.isNearLimit ? TrendingUp : CheckCircle;
            const statusColor = b.isOverBudget
              ? 'text-red-500'
              : b.isNearLimit
              ? 'text-amber-500'
              : 'text-emerald-500';

            return (
              <div key={b.category} className={cn('card group relative', b.isOverBudget && 'border-red-500/30')}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      {CATEGORY_ICONS[b.category]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text">{b.category}</p>
                      <p className="text-xs text-muted">Monthly budget</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon size={16} className={statusColor} />
                    <button
                      onClick={() => dispatch(removeBudget({ category: b.category }))}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted">Spent</span>
                    <span className={cn('font-semibold', b.isOverBudget ? 'text-red-500' : 'text-text')}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-hover rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: b.isOverBudget ? '#ef4444' : b.isNearLimit ? '#f59e0b' : color,
                      }}
                    />
                  </div>
                </div>

                {/* Amounts */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted">Spent</p>
                    <p className="text-sm font-bold text-text">{formatCurrency(b.spent)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted">Limit</p>
                    <p className="text-sm font-bold text-text">{formatCurrency(b.limit)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted">Remaining</p>
                    <p className={cn('text-sm font-bold', b.isOverBudget ? 'text-red-500' : 'text-emerald-500')}>
                      {b.isOverBudget ? '-' : ''}{formatCurrency(Math.abs(b.remaining))}
                    </p>
                  </div>
                </div>

                {b.isOverBudget && (
                  <div className="mt-3 pt-3 border-t border-red-500/20 flex items-center gap-2">
                    <AlertTriangle size={12} className="text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-500">
                      Over budget by {formatCurrency(Math.abs(b.remaining))}
                    </p>
                  </div>
                )}
                {b.isNearLimit && !b.isOverBudget && (
                  <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-center gap-2">
                    <TrendingUp size={12} className="text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-amber-500">
                      Approaching limit — {formatCurrency(b.remaining)} left
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
