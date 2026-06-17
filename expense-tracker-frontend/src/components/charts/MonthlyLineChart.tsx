// src/components/charts/MonthlyLineChart.tsx
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
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
    </div>
  );
};

export default function MonthlyLineChart({ data }: Props) {
  const theme = useAppSelector(selectTheme);
  const isDark = theme === 'dark';

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#ffffff10' : '#00000008'} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateShort}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v) => `₹${v}`}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#areaGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#6366f1', stroke: 'white', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
