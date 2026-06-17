// src/components/expenses/DeleteModal.tsx
import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { closeModal, selectModal } from '../../store/slices/uiSlice';
import { deleteExpense, selectFilteredExpenses } from '../../store/slices/expensesSlice';
import { formatCurrency } from '../../utils';

export default function DeleteModal() {
  const dispatch = useAppDispatch();
  const modal = useAppSelector(selectModal);
  const expenses = useAppSelector(selectFilteredExpenses);

  if (modal.type !== 'delete') return null;

  const expense = expenses.find((e) => e.id === modal.expenseId);
  if (!expense) return null;

  const handleDelete = () => {
    dispatch(deleteExpense(expense.id));
    dispatch(closeModal());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => dispatch(closeModal())} />
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl animate-modal p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={26} className="text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-text mb-1">Delete Expense?</h2>
        <p className="text-sm text-muted mb-1">
          Are you sure you want to delete
        </p>
        <p className="text-sm font-semibold text-text mb-1">"{expense.title}"</p>
        <p className="text-sm text-muted mb-5">
          {formatCurrency(expense.amount)} — This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => dispatch(closeModal())}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-border text-muted hover:text-text hover:bg-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors active:scale-95"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
