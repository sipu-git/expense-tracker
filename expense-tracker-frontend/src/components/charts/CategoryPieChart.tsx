// src/components/charts/CategoryPieChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CategoryTotal } from '../../types';
import { formatCurrency } from '../../utils';
import { CATEGORY_COLORS } from '@/types/expense.type';

interface Props { data: CategoryTotal[]; }

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-text">{d.category}</p>
      <p className="text-sm font-bold text-text">{formatCurrency(d.total)}</p>
      <p className="text-xs text-muted">{d.percentage.toFixed(1)}%</p>
    </div>
  );
};

export default function CategoryPieChart({ data }: Props) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-48 text-muted text-sm">No data</div>
  );
  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="total"
          >
            {data.map((entry) => (
              <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-1.5 mt-2">
        {data.slice(0, 4).map((d) => (
          <div key={d.category} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[d.category] }} />
              <span className="text-muted truncate max-w-[120px]">{d.category}</span>
            </div>
            <span className="font-semibold text-text">{d.percentage.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
