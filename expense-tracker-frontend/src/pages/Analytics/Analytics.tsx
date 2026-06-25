// src/components/dashboard/Analytics.tsx
import React from 'react';
import { useAppSelector } from '../../hooks/redux';
import {
  selectCategoryTotals,
  selectDailyTotals,
  selectMonthTotal,
  selectMonthExpenses,
} from '../../store/slices/expensesSlice';
import SpendingBarChart from '../../components/charts/SpendingBarChart';
import CategoryPieChart from '../../components/charts/CategoryPieChart';
import MonthlyLineChart from '../../components/charts/MonthlyLineChart';
import { formatCurrency } from '../../utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useAppSelector as useSelector } from '../../hooks/redux';
import { selectTheme } from '../../store/slices/uiSlice';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/types/expense.type';

export default function Analytics() {
  const categoryTotals = useAppSelector(selectCategoryTotals);
  const dailyTotals = useAppSelector(selectDailyTotals);
  const monthTotal = useAppSelector(selectMonthTotal);
  const monthExpenses = useAppSelector(selectMonthExpenses);
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';

  const avgExpense = monthExpenses.length ? monthTotal / monthExpenses.length : 0;
  const maxSingleDay = dailyTotals.reduce((m, d) => Math.max(m, d.total), 0);

  return (
    <div className="space-y-6">
      {/* Quick metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 grid-cols-1 gap-4">
        {[
          { label: 'Total Transactions', value: monthExpenses.length.toString() },
          { label: 'Avg Transaction', value: formatCurrency(avgExpense) },
          { label: 'Highest Day', value: formatCurrency(maxSingleDay) },
          { label: 'Active Days', value: dailyTotals.filter(d => d.total > 0).length.toString() },
        ].map((m) => (
          <div key={m.label} className="card">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">{m.label}</p>
            <p className="text-2xl font-bold text-text">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Area chart */}
      <div className="card">
        <h3 className="font-bold text-text mb-1">Spending Over Time</h3>
        <p className="text-xs text-muted mb-4">Daily cumulative spend (last 30 days)</p>
        <MonthlyLineChart data={dailyTotals} />
      </div>

      {/* Bar + Pie side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-bold text-text mb-1">Daily Breakdown</h3>
          <p className="text-xs text-muted mb-4">Bar chart of recent spending</p>
          <SpendingBarChart data={dailyTotals} />
        </div>
        <div className="card">
          <h3 className="font-bold text-text mb-1">Category Distribution</h3>
          <p className="text-xs text-muted mb-4">Where your money goes</p>
          <CategoryPieChart data={categoryTotals} />
        </div>
      </div>

      {/* Horizontal bar by category */}
      <div className="card">
        <h3 className="font-bold text-text mb-1">Category Comparison</h3>
        <p className="text-xs text-muted mb-4">Monthly spend by category</p>
        <ResponsiveContainer width="100%" height={Math.max(categoryTotals.length * 42, 120)}>
          <BarChart
            layout="vertical"
            data={categoryTotals.map(c => ({ ...c, name: c.category }))}
            margin={{ top: 0, right: 30, bottom: 0, left: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#ffffff10' : '#00000008'} horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => `$${v}`}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#475569' }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip
              formatter={(val: number) => [formatCurrency(val), 'Spent']}
              contentStyle={{
                background: isDark ? '#1e293b' : '#ffffff',
                border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'),
                borderRadius: '12px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="total" radius={[0, 6, 6, 0]} maxBarSize={24}>
              {categoryTotals.map((entry) => (
                <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category table */}
      <div className="card overflow-hidden">
        <h3 className="font-bold text-text mb-4">Full Category Report</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border dark:border-slate-700">
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider py-2 pr-4">Category</th>
                <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider py-2 px-4">Transactions</th>
                <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider py-2 px-4">Total</th>
                <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider py-2 pl-4">Share</th>
              </tr>
            </thead>
            <tbody>
              {categoryTotals.map((cat) => (
                <tr key={cat.category} className="border-b border-border/50 hover:bg-hover transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{CATEGORY_ICONS[cat.category]}</span>
                      <span className="font-medium text-text">{cat.category}</span>
                    </div>
                  </td>
                  <td className="text-right text-muted py-3 px-4">{cat.count}</td>
                  <td className="text-right font-bold text-text py-3 px-4">{formatCurrency(cat.total)}</td>
                  <td className="text-right py-3 pl-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-hover rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: CATEGORY_COLORS[cat.category],
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted w-10 text-right">{cat.percentage.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
