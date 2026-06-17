// src/components/dashboard/Dashboard.tsx
import React from 'react';
import { DollarSign, ShoppingCart, Calendar, TrendingUp, Plus } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import {
  selectTodayTotal,
  selectMonthTotal,
  selectCategoryTotals,
  selectDailyTotals,
  selectTodayExpenses,
  selectMonthExpenses,
} from '../store/slices/expensesSlice';
import { openModal } from '../store/slices/uiSlice';
import StatCard from '../components/ui/StatCard';
import SpendingBarChart from '../components/charts/SpendingBarChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import MonthlyLineChart from '../components/charts/MonthlyLineChart';
import ExpenseRow from './expenses/ExpenseRow';
import { formatCurrency, formatDate } from '../utils';
import { CATEGORY_COLORS } from '../types';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const todayTotal = useAppSelector(selectTodayTotal);
  const monthTotal = useAppSelector(selectMonthTotal);
  const categoryTotals = useAppSelector(selectCategoryTotals);
  const dailyTotals = useAppSelector(selectDailyTotals);
  const todayExpenses = useAppSelector(selectTodayExpenses);
  const monthExpenses = useAppSelector(selectMonthExpenses);

  const avgDaily = dailyTotals.length
    ? dailyTotals.reduce((s, d) => s + d.total, 0) / dailyTotals.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today"
          value={formatCurrency(todayTotal)}
          subtitle={`${todayExpenses.length} transactions`}
          icon={DollarSign}
          trend={todayTotal > avgDaily ? ((todayTotal - avgDaily) / avgDaily) * 100 : -((avgDaily - todayTotal) / Math.max(avgDaily, 1)) * 100}
          trendLabel="vs daily avg"
          accent="bg-accent"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(monthTotal)}
          subtitle={`${monthExpenses.length} transactions`}
          icon={Calendar}
          trend={-5.2}
          trendLabel="vs last month"
          accent="bg-emerald-500"
        />
        <StatCard
          title="Avg / Day"
          value={formatCurrency(avgDaily)}
          subtitle="Last 30 days"
          icon={TrendingUp}
          accent="bg-violet-500"
        />
        <StatCard
          title="Top Category"
          value={categoryTotals[0]?.category.split(' ')[0] ?? '—'}
          subtitle={categoryTotals[0] ? formatCurrency(categoryTotals[0].total) : 'No data'}
          icon={ShoppingCart}
          accent="bg-amber-500"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-text">Daily Spending</h3>
              <p className="text-xs text-muted mt-0.5">Last 30 days overview</p>
            </div>
          </div>
          <SpendingBarChart data={dailyTotals} />
        </div>

        <div className="card">
          <div className="mb-4">
            <h3 className="font-bold text-text">Category Breakdown</h3>
            <p className="text-xs text-muted mt-0.5">This month's spending</p>
          </div>
          <CategoryPieChart data={categoryTotals} />
        </div>
      </div>

      {/* Monthly trend + Today's expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <div className="mb-4">
            <h3 className="font-bold text-text">Spending Trend</h3>
            <p className="text-xs text-muted mt-0.5">Daily trend this month</p>
          </div>
          <MonthlyLineChart data={dailyTotals} />
        </div>

        {/* Today's expenses */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-text">Today's Expenses</h3>
              <p className="text-xs text-muted mt-0.5">{formatDate(new Date().toISOString())}</p>
            </div>
            <button
              onClick={() => dispatch(openModal({ type: 'add' }))}
              className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {todayExpenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">🎉</p>
              <p className="text-sm font-medium text-text">No expenses yet!</p>
              <p className="text-xs text-muted mt-1">Start tracking your spending</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto -mx-2">
              {todayExpenses.map((e) => (
                <ExpenseRow key={e.id} expense={e} />
              ))}
            </div>
          )}

          {todayExpenses.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Total</span>
              <span className="text-sm font-bold text-text">{formatCurrency(todayTotal)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Category breakdown table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-text">Category Details</h3>
            <p className="text-xs text-muted mt-0.5">Month-to-date breakdown</p>
          </div>
        </div>
        <div className="space-y-3">
          {categoryTotals.slice(0, 6).map((cat) => {
            const color = CATEGORY_COLORS[cat.category];
            return (
              <div key={cat.category}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="font-medium text-text">{cat.category}</span>
                    <span className="text-xs text-muted">({cat.count} items)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">{cat.percentage.toFixed(1)}%</span>
                    <span className="font-bold text-text">{formatCurrency(cat.total)}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-hover rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${cat.percentage}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
