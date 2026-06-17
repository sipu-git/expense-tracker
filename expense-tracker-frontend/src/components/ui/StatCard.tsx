// src/components/ui/StatCard.tsx
import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number; // percentage change
  trendLabel?: string;
  accent?: string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  accent = 'bg-accent',
  className,
}: StatCardProps) {
  const TrendIcon = trend == null ? Minus : trend > 0 ? TrendingUp : TrendingDown;
  const trendColor = trend == null ? 'text-muted' : trend > 0 ? 'text-red-500' : 'text-emerald-500';

  return (
    <div className={cn('card group relative overflow-hidden', className)}>
      {/* Decorative background blob */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 bg-accent group-hover:opacity-10 transition-opacity" />

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-1">{title}</p>
          <p className="text-2xl font-bold text-text">{value}</p>
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
        <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0', accent)}>
          <Icon size={20} className="text-white" />
        </div>
      </div>

      {trend != null && (
        <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
          <TrendIcon size={13} />
          <span>{Math.abs(trend).toFixed(1)}%</span>
          {trendLabel && <span className="text-muted font-normal ml-1">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
