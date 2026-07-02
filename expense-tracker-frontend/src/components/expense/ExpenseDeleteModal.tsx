// src/components/expense/ClearAllExpensesModal.tsx
import React, { useState } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface ClearAllExpensesModalProps {
  isOpen: boolean;
  count: number;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ClearAllExpensesModal({
  isOpen,
  count,
  loading = false,
  onClose,
  onConfirm,
}: ClearAllExpensesModalProps) {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-red-50 dark:bg-red-950/40 px-6 py-4 border-b border-red-200 dark:border-red-900/50 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-red-200 dark:bg-red-900 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle size={18} className="text-red-700 dark:text-red-300" />
          </div>
          <div>
            <p className="font-semibold text-red-900 dark:text-red-100">Clear all expenses</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              This action is permanent and cannot be undone
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-xs text-muted mb-4 leading-relaxed">
            Before you proceed, please read and acknowledge the following:
          </p>

          <ul className="space-y-2 mb-5">
            {[
              { label: `All ${count} expenses will be erased.`, detail: 'This includes every transaction, category, and note tied to them.' },
              { label: 'No recovery possible.', detail: 'Deleted expenses cannot be restored once confirmed.' },
              { label: 'Charts and budgets reset.', detail: 'Any Recharts visualizations will show empty data until new expenses are added.' },
            ].map(({ label, detail }) => (
              <li key={label} className="flex items-start gap-2.5 text-xs bg-hover rounded-xl p-3">
                <X size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-text leading-relaxed">
                  <span className="font-semibold">{label}</span> {detail}
                </p>
              </li>
            ))}
          </ul>

          <div className="mb-5">
            <label className="block text-xs text-muted mb-1.5">
              Type{' '}
              <code className="bg-hover text-red-500 px-1.5 py-0.5 rounded text-[11px]">
                Delete all expenses
              </code>{' '}
              to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type Delete all expenses here"
              className="w-full text-sm bg-hover border border-red-500/30 focus:border-red-500 rounded-xl px-3 py-2 outline-none transition-colors text-text"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-border text-text hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={confirmText !== 'Delete all expenses' || loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <Trash2 size={14} /> Delete All
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}