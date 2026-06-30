// src/components/dashboard/Budgets.tsx
import React, { useEffect, useState } from 'react';
import { Plus, AlertTriangle, CheckCircle, Trash2, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import {
  fetchBudgets,
  removeBudget,
  selectBudgetStatus,
  selectBudgetsError,
  selectBudgetsLoading,
  setBudget,
} from '../../store/slices/budgetsSlice';
import { formatCurrency, cn } from '../../utils';
import { selectActiveAccountId } from '@/store/slices/accountSlices/account.slice';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS, ExpenseTypes } from '@/types/expense.type';

export default function Budgets() {
  const dispatch = useAppDispatch();
  const budgetStatus = useAppSelector(selectBudgetStatus);
  const loading = useAppSelector(selectBudgetsLoading);
  const error = useAppSelector(selectBudgetsError);
  const activeAccountId = useAppSelector(selectActiveAccountId);
  const [showForm, setShowForm] = useState(false);
  // const [chartType, setChartType] = useState<'stacked' | 'grouped'>('stacked');
  const [form, setForm] = useState<{ category: ExpenseTypes; limit: string }>({
    category: 'FOOD',
    limit: '',
  });

  useEffect(() => {
    dispatch(fetchBudgets());
  }, [dispatch, activeAccountId]);

  const handleAdd = () => {
    const limit = parseFloat(form.limit);
    if (!limit || limit <= 0) return;
    dispatch(setBudget({ category: form.category, limit, period: 'monthly', accountId: activeAccountId }));
    setForm({ category: 'FOOD', limit: '' });
    setShowForm(false);
  };

  // Transform data for recharts
  const chartData = budgetStatus.map((b) => ({
    category: b.category,
    spent: Math.round(b.spent * 100) / 100,
    remaining: Math.round(b.remaining * 100) / 100,
    limit: Math.round(b.limit * 100) / 100,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-xl p-3 shadow-xl">
          <p className="text-xs font-bold text-text mb-2">{payload[0].payload.category}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs font-medium text-muted">
                  {entry.name}:
                </span>
                <span className="text-xs font-bold" style={{ color: entry.color }}>
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Scrollbar CSS
  const scrollbarCSS = `
    .hidden-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .hidden-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hidden-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .hidden-scrollbar::-webkit-scrollbar-thumb {
      background: transparent;
    }
  `;

  return (
    <>
      <style>{scrollbarCSS}</style>
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

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

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
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseTypes }))}
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

        {/* Main Layout - Chart and Cards Side by Side */}
        <div className="w-full flex lg:flex-row flex-col gap-4 lg:h-[calc(100vh-150px)] min-h-screen">
          {/* Left Side - Chart Section */}
          {!loading && budgetStatus.length > 0 && (
            <div className="lg:w-2/3 w-full card overflow-hidden flex flex-col">
              {/* Header with Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-border">
                <div className="flex-1">
                  <h3 className="font-bold text-text text-base">Budget Overview</h3>
                  <p className="text-xs text-muted mt-1">Spent vs remaining across all categories</p>
                </div>
                {/* <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setChartType('stacked')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      chartType === 'stacked'
                        ? 'bg-accent text-white'
                        : 'border border-border text-muted hover:text-text hover:bg-hover'
                    )}
                  >
                    Stacked
                  </button>
                  <button
                    onClick={() => setChartType('grouped')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      chartType === 'grouped'
                        ? 'bg-accent text-white'
                        : 'border border-border text-muted hover:text-text hover:bg-hover'
                    )}
                  >
                    Grouped
                  </button>
                </div> */}
              </div>

              {/* Chart Container */}
              <div className="flex-1 mb-6 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border-color, #e5e7eb)"
                      opacity={0.2}
                      vertical={false}
                      horizontalPoints={[0]}
                    />
                    <XAxis
                      dataKey="category"
                      tick={{ fill: 'var(--text-muted, #6b7280)', fontSize: 13, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      tick={{ fill: 'var(--text-muted, #6b7280)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={60}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={30}
                      iconType="square"
                      wrapperStyle={{ paddingTop: '20px' }}
                      formatter={(value) => <span style={{ fontSize: '13px', fontWeight: 500, color: '#6b7280' }}>{value}</span>}
                    />

                      <>
                        <Bar
                          dataKey="spent"
                          stackId="budget"
                          fill="#970fd7"
                          radius={[0, 0, 0, 0]}
                          name="Spent"
                          barSize={48}
                        />
                        <Bar
                          dataKey="remaining"
                          stackId="budget"
                          fill="#F73A3A"
                          radius={[0, 0, 0, 0]}
                          name="Remaining"
                          barSize={48}
                        />
                      </>
                    
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Stats */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                <div className="bg-hover/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted font-medium mb-1.5">Total Budget</p>
                  <p className="text-base font-bold text-text">
                    {formatCurrency(budgetStatus.reduce((sum, b) => sum + b.limit, 0))}
                  </p>
                </div>
                <div className="bg-red-500/5 rounded-lg p-3 text-center border border-red-500/10">
                  <p className="text-xs text-muted font-medium mb-1.5">Total Spent</p>
                  <p className="text-base font-bold text-red-500">
                    {formatCurrency(budgetStatus.reduce((sum, b) => sum + b.spent, 0))}
                  </p>
                </div>
                <div className="bg-emerald-500/5 rounded-lg p-3 text-center border border-emerald-500/10">
                  <p className="text-xs text-muted font-medium mb-1.5">Total Remaining</p>
                  <p className="text-base font-bold text-emerald-500">
                    {formatCurrency(budgetStatus.reduce((sum, b) => sum + Math.max(b.remaining, 0), 0))}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Right Side - Budget Cards with Scrollable Container */}
          <div className="lg:w-1/3 w-full flex flex-col overflow-hidden">
            {loading && budgetStatus.length === 0 ? (
              <div className="card text-center py-16 h-full flex items-center justify-center">
                <p className="text-base font-semibold text-text">Loading budgets...</p>
              </div>
            ) : budgetStatus.length === 0 ? (
              <div className="card text-center py-16 h-full flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-3">💰</p>
                  <p className="text-base font-semibold text-text">No budgets set</p>
                  <p className="text-sm text-muted mt-1">Add a budget to start tracking your spending</p>
                </div>
              </div>
            ) : (
              <div className="hidden-scrollbar space-y-3 overflow-y-auto pr-2">
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
                            onClick={() => dispatch(removeBudget({ category: b.category, accountId: activeAccountId }))}
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
        </div>
      </div>
    </>
  );
}