// src/components/expenses/ExpenseRow.tsx
import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { openModal } from '../../store/slices/uiSlice';
import { Expense, CATEGORY_COLORS, CATEGORY_ICONS } from '../../types';
import { formatCurrency } from '../../utils';

interface ExpenseRowProps {
  expense: Expense;
}

export default function ExpenseRow({ expense }: ExpenseRowProps) {
  const dispatch = useAppDispatch();
  const color = CATEGORY_COLORS[expense.category];
  const emoji = CATEGORY_ICONS[expense.category];

  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-hover transition-colors group">
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
        style={{ backgroundColor: `${color}20` }}
      >
        {emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text truncate">{expense.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded-full"
            style={{ color, backgroundColor: `${color}20` }}
          >
            {expense.category}
          </span>
          {expense.notes && (
            <span className="text-xs text-muted truncate hidden sm:inline">{expense.notes}</span>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-text">{formatCurrency(expense.amount)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => dispatch(openModal({ type: 'edit', expenseId: expense.id }))}
          className="p-1.5 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => dispatch(openModal({ type: 'delete', expenseId: expense.id }))}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
