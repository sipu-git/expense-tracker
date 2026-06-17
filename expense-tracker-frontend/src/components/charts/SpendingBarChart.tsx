// src/components/charts/SpendingBarChart.tsx
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { DailyTotal } from '../../types';
import { formatDateShort, formatCurrency } from '../../utils';
import { useAppSelector } from '../../hooks/redux';
import { selectTheme } from '../../store/slices/uiSlice';

interface Props { data: DailyTotal[]; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg">
      <p className="text-xs text-muted mb-1">{formatDateShort(label)}</p>
      <p className="text-sm font-bold text-text">{formatCurrency(payload[0].value)}</p>
      <p className="text-xs text-muted">{payload[0].payload.count} transactions</p>
    </div>
  );
};

export default function SpendingBarChart({ data }: Props) {
  const theme = useAppSelector(selectTheme);
  const isDark = theme === 'dark';
  const slice = data.slice(-14);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={slice} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#ffffff10' : '#00000008'} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateShort}
          tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v) => `₹${v}`}
          tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#ffffff08' : '#00000006' }} />
        <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
