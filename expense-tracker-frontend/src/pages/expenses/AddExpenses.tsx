import React, { useEffect, useState } from 'react';
import {
  Wallet, BarChart3, Bell, Users, DollarSign, Hash, Calendar, Tag,
  Loader2, CheckCircle2, ChevronRight, Lock, FileText, Zap, ShieldCheck, ArrowLeft,
} from 'lucide-react';
import { Expense, ExpenseTypes } from '@/types/expense.type';
import { format } from 'date-fns';
import { cn } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { addExpense, clearSuggestion, suggestExpenseCategory } from '@/store/slices/expenseSlice/expenses.slice';

// ─── Constants ────────────────────────────────────────────────────────────────

export const EXPENSE_TYPES: ExpenseTypes[] = [
  'FOOD', 'TRANSPORTATION', 'SHOPPING', 'ENTERTAINMENT',
  'HEALTHCARE', 'UTILITIES', 'HOUSING', 'TRAVEL', 'EDUCATION', 'OTHER',
];

const TYPE_META: Record<ExpenseTypes, { icon: string; label: string }> = {
  FOOD: { icon: '🍽️', label: 'Food' },
  TRANSPORTATION: { icon: '🚗', label: 'Transport' },
  SHOPPING: { icon: '🛍️', label: 'Shopping' },
  ENTERTAINMENT: { icon: '🎬', label: 'Fun' },
  HEALTHCARE: { icon: '🏥', label: 'Health' },
  UTILITIES: { icon: '💡', label: 'Utilities' },
  HOUSING: { icon: '🏠', label: 'Housing' },
  TRAVEL: { icon: '✈️', label: 'Travel' },
  EDUCATION: { icon: '📚', label: 'Education' },
  OTHER: { icon: '📦', label: 'Other' },
};

// ─── Left panel static data ───────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Wallet,
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
    title: 'Log any expense',
    desc: 'By category, quantity, and date — in under 10 seconds.',
  },
  {
    icon: BarChart3,
    iconBg: 'bg-teal-100 dark:bg-teal-900/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
    title: 'See where it goes',
    desc: 'Visual monthly breakdowns so nothing stays hidden.',
  },
  {
    icon: Bell,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    title: 'Stay on budget',
    desc: 'Set limits per category and get warned before you exceed.',
  },
  {
    icon: Users,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    title: 'Group spending',
    desc: 'Assign expenses to a group for shared households or trips.',
  },
];

const HOW_IT_WORKS = [
  { n: 1, title: 'Fill the form', desc: "Name, amount, category, quantity, and date. That's it." },
  { n: 2, title: 'Pick a category', desc: 'Choose from 10 types to keep your data clean and filterable.' },
  { n: 3, title: 'Track over time', desc: 'Your dashboard updates the moment you submit.' },
  { n: 4, title: 'Export or share', desc: 'Attach a group ID to split costs across people.' },
];

const TERMS = [
  {
    icon: Lock,
    title: 'Your data stays yours',
    body: 'We never sell or share your records. Everything is encrypted at rest and in transit. Delete your account anytime from Settings.',
  },
  {
    icon: FileText,
    title: 'What we store',
    body: 'Expense names, amounts, categories, dates, and optional group IDs. We also store your email and a hashed password — no card details ever.',
  },
  {
    icon: Zap,
    title: 'Acceptable use',
    body: 'Personal and team budgeting only. Automated scraping or fake-data injection is prohibited and may result in suspension.',
  },
  {
    icon: ShieldCheck,
    title: 'Changes to these terms',
    body: 'Material changes will be notified by email at least 14 days before they take effect.',
  },
];

// ─── Form state ───────────────────────────────────────────────────────────────

type FormState = {
  name: string;
  amount: number | '';
  type: ExpenseTypes;
  quantity?: string;
  bought_at: string;
  groupId: string;
};

const EMPTY: FormState = {
  name: '',
  amount: '',
  type: 'FOOD',
  quantity: '1',
  bought_at: format(new Date(), 'yyyy-MM-dd'),
  groupId: '',
};

// ─── Shared primitives ────────────────────────────────────────────────────────

/**
 * Section eyebrow label — small uppercase label above a content block.
 */
function SectionLabel({
  children,
  color = 'violet',
}: {
  children: React.ReactNode;
  color?: 'violet' | 'teal' | 'amber';
}) {
  const colorMap = {
    violet: 'text-violet-600 dark:text-violet-400',
    teal: 'text-teal-600 dark:text-teal-400',
    amber: 'text-amber-600 dark:text-amber-400',
  };
  return (
    <p className={cn('text-[10px] font-semibold uppercase tracking-[0.12em] mb-2', colorMap[color])}>
      {children}
    </p>
  );
}

/**
 * Individual form field wrapper with label, icon, error message slot.
 */
function Field({
  label,
  icon: Icon,
  error,
  optional,
  children,
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
        <Icon size={12} />
        {label}
        {optional && (
          <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-normal border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/60">
            optional
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500 dark:bg-red-400 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Input base class (shared between all text/number/date inputs) ─────────────

const inputBase = (hasError?: boolean) =>
  cn(
    'w-full px-3 py-2.5 rounded-lg text-sm text-slate-900 dark:text-slate-100',
    'bg-white dark:bg-slate-900',
    'border transition-colors outline-none',
    'placeholder:text-slate-400 dark:placeholder:text-slate-600',
    'focus:ring-2 focus:ring-violet-500/20 dark:focus:ring-violet-400/20',
    hasError
      ? 'border-red-400 dark:border-red-500 focus:border-red-400 dark:focus:border-red-500'
      : 'border-slate-200 dark:border-slate-700 focus:border-violet-500 dark:focus:border-violet-400',
  );

// ─── Left panel ───────────────────────────────────────────────────────────────

function LeftPanel() {
  const [openTerm, setOpenTerm] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-7 py-1">

      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-violet-600 dark:bg-violet-500 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Wallet size={18} className="text-white" />
        </div>
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">
            Expense Tracker
          </p>
          <p className="text-[13px] font-medium text-slate-800 dark:text-slate-100 leading-tight">
            Know where your money goes
          </p>
        </div>
      </div>

      {/* Headline */}
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white leading-snug">
          Log expenses.{' '}
          <span className="text-violet-600 dark:text-violet-400">
            Understand spending.
          </span>
        </h1>
        <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
          One form, ten categories, instant dashboard updates. Built for people
          who want clarity over complexity.
        </p>
      </div>

      {/* Features */}
      <div>
        <SectionLabel color="violet">Features</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-2">
          {FEATURES.map(({ icon: Icon, iconBg, iconColor, title, desc }) => (
            <div
              key={title}
              className="flex flex-col gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-slate-800/50"
            >
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
                <Icon size={13} className={iconColor} />
              </div>
              <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 leading-snug">
                {title}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div>
        <SectionLabel color="teal">How it works</SectionLabel>
        <div className="flex flex-col gap-2.5">
          {HOW_IT_WORKS.map(({ n, title, desc }) => (
            <div key={n} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-violet-600 dark:bg-violet-500 flex items-center justify-center flex-shrink-0 text-[10px] font-semibold text-white mt-0.5 shadow-sm">
                {n}
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                  {title}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terms accordion */}
      <div>
        <SectionLabel color="amber">Terms & conditions</SectionLabel>
        <div className="flex flex-col gap-1.5">
          {TERMS.map(({ icon: Icon, title, body }, i) => {
            const open = openTerm === i;
            return (
              <div
                key={title}
                className={cn(
                  'rounded-xl border overflow-hidden transition-all duration-150',
                  open
                    ? 'border-violet-300 dark:border-violet-700/60 bg-violet-50 dark:bg-violet-900/20'
                    : 'border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40',
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenTerm(open ? null : i)}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                >
                  <Icon
                    size={12}
                    className={open
                      ? 'text-violet-600 dark:text-violet-400'
                      : 'text-slate-400 dark:text-slate-500'}
                  />
                  <span className="flex-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    {title}
                  </span>
                  <ChevronRight
                    size={12}
                    className={cn(
                      'text-slate-400 transition-transform duration-200',
                      open && 'rotate-90',
                    )}
                  />
                </button>
                {open && (
                  <p className="px-3 pb-3 pl-8 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {body}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { v: '10s', l: 'to log' },
          { v: '10', l: 'categories' },
          { v: '100%', l: 'your data' },
        ].map(({ v, l }) => (
          <div
            key={l}
            className="flex flex-col items-center gap-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40"
          >
            <span className="text-base font-semibold text-slate-900 dark:text-white">
              {v}
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 text-center">
              {l}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}

// ─── Right panel — the form ───────────────────────────────────────────────────

function ExpenseForm() {
  const dispatch = useAppDispatch();
  const { loading, error: storeError, suggestCategory, categoryLoading } = useAppSelector((s) => s.expense);
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [aiSuggested, setAiSuggested] = useState(false);
  const [manualType, setManualType] = useState(false);
  const [aiPending, setAiPending] = useState(false);

  useEffect(() => {
    if (suggestCategory && !manualType) {
      set('type', suggestCategory as ExpenseTypes);
      setAiSuggested(true);
    }
  }, [suggestCategory]);

  useEffect(() => {
    return () => { dispatch(clearSuggestion()); };
  }, []);
  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim())
      e.name = 'Name is required';
    if (form.amount === '' || Number(form.amount) <= 0)
      e.amount = 'Enter an amount greater than 0';
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0)
      e.quantity = 'Enter a quantity greater than 0';
    if (!form.bought_at)
      e.bought_at = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    if (!form.name.trim() || form.amount === '' || manualType) return;
    setAiPending(true);

    const timer = setTimeout(() => {
      setAiPending(false);
      dispatch(suggestExpenseCategory({
        name: form.name,
        amount: Number(form.amount)
      }));
    }, 800);

    return () => {
      clearTimeout(timer);
      setAiPending(false);
    };
  }, [form.name, form.amount]);

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload: Partial<Expense> = {
      name: form.name.trim(),
      amount: Number(form.amount),
      type: form.type,
      quantity: form.quantity,
      bought_at: new Date(`${form.bought_at}T00:00:00`).toISOString(),
      ...(form.groupId ? { groupId: form.groupId } : {}),
    };
    try {
      await dispatch(addExpense(payload)).unwrap();
      setSuccess(true);
      setTimeout(() => navigate('/expenses'), 1400);
    } catch {
      // storeError already populated by slice
    }
  };

  // ── Success view ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 h-full py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/40 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
            Logged
          </p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            Expense added
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Redirecting to dashboard…
          </p>
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-600 dark:text-violet-400 mb-1">
          New entry
        </p>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Add an expense
        </h2>
        <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
          Every field except Group ID is required.
        </p>
      </div>

      {/* API error banner */}
      {storeError && (
        <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 text-red-700 dark:text-red-400 text-[12px] mb-5">
          <span className="mt-0.5 flex-shrink-0">⚠</span>
          <span>{storeError}</span>
        </div>
      )}

      <div className="flex flex-col gap-4 flex-1">
        {/* Amount + Quantity */}
        {/* Amount + Quantity */}
        <div className="grid lg:grid-cols-3 md:grid-cols-3 grid-cols-1 gap-3">
          <Field label="Expense name" icon={Tag} error={errors.name}>
            <input
              className={inputBase(!!errors.name)}
              placeholder="e.g. Grocery run"
              value={form.name}
              onChange={(e) => {
                set('name', e.target.value);
                setAiSuggested(false);
                setManualType(false);
                dispatch(clearSuggestion());
                if (errors.name) setErrors((prev) => { const n = { ...prev }; delete n.name; return n; });
              }}
              disabled={loading}
            />
          </Field>

          <Field label="Amount" icon={DollarSign} error={errors.amount}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm select-none">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                className={cn(inputBase(!!errors.amount), 'pl-6')}
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => {
                  set('amount', e.target.value === '' ? '' : parseFloat(e.target.value));
                  if (errors.amount) setErrors((prev) => { const n = { ...prev }; delete n.amount; return n; });
                }}
                disabled={loading}
              />
            </div>
          </Field>

          <Field label="Quantity" icon={Hash} error={errors.quantity} optional>
            <input
              type="number"
              min="1"
              step="1"
              className={inputBase(!!errors.quantity)}
              placeholder="1"
              value={form.quantity}
              onChange={(e) => {
                set('quantity', e.target.value);
                if (errors.quantity) setErrors((prev) => { const n = { ...prev }; delete n.quantity; return n; });
              }}
              disabled={loading}
            />
          </Field>
        </div>

        {/* ← AI status row sits HERE, outside the grid, below name+amount */}
        {(aiPending || categoryLoading || aiSuggested) && (
          <div className="flex items-center gap-1.5 -mt-2">
            {(aiPending || categoryLoading) && (
              <span className="flex items-center gap-1 text-[11px] text-violet-500 dark:text-violet-400">
                <Loader2 size={11} className="animate-spin" />
                AI is detecting category…
              </span>
            )}
            {aiSuggested && !aiPending && !categoryLoading && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-500 dark:text-emerald-400">
                <CheckCircle2 size={11} />
                Category auto-selected — override below if needed
              </span>
            )}
          </div>
        )}

        {/* Category picker */}
        <div className="flex flex-col gap-1.5">
          {/* Label row — AI badge sits here */}
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Category
            </label>
            {categoryLoading && (
              <span className="flex items-center gap-1 text-[10px] text-violet-500 dark:text-violet-400">
                <Loader2 size={10} className="animate-spin" />
                AI suggesting…
              </span>
            )}
            {aiSuggested && !categoryLoading && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-700/40">
                <Zap size={8} />
                AI suggested — you can override
              </span>
            )}
          </div>

          {/* Category buttons */}
          <div className="grid lg:grid-cols-3 grid-cols-2 gap-3">
            {EXPENSE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                disabled={loading || categoryLoading}
                onClick={() => {
                  set('type', t);
                  setManualType(true);
                  setAiSuggested(false);
                  dispatch(clearSuggestion());
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium border transition-all duration-100 disabled:opacity-50',
                  form.type === t
                    ? 'bg-violet-50 dark:bg-violet-900/25 border-violet-400 dark:border-violet-500/60 text-violet-700 dark:text-violet-300'
                    : 'border-slate-200 dark:border-slate-700/70 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200',
                )}
              >
                <span className="text-[13px] leading-none">{TYPE_META[t].icon}</span>
                <span className="truncate">{TYPE_META[t].label}</span>
              </button>
            ))}
          </div>

          {/* Helper text below grid */}
          {!manualType && !categoryLoading && !aiSuggested && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Fill in the name field — AI will auto-suggest a category.
            </p>
          )}
          {manualType && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Manually selected — AI suggestion overridden.
            </p>
          )}
        </div>

        {/* Date */}
        <Field label="Date purchased" icon={Calendar} error={errors.bought_at}>
          <input
            type="date"
            className={inputBase(!!errors.bought_at)}
            value={form.bought_at}
            onChange={(e) => {
              set('bought_at', e.target.value);
              if (errors.bought_at) setErrors((prev) => { const n = { ...prev }; delete n.bought_at; return n; });
            }}
            disabled={loading}
          />
        </Field>

        {/* Group ID */}
        <Field label="Group ID" icon={Tag} optional>
          <input
            className={inputBase()}
            placeholder="e.g. trip-goa or household"
            value={form.groupId}
            onChange={(e) => set('groupId', e.target.value)}
            disabled={loading}
          />
        </Field>

        {/* Divider before CTA */}
        <div className="border-t border-slate-100 dark:border-slate-800 mt-1" />

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-medium border transition-colors disabled:opacity-40',
              'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400',
              'hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200',
            )}
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-100',
              'bg-violet-600 dark:bg-violet-600 text-white shadow-sm',
              'hover:bg-violet-700 dark:hover:bg-violet-500 active:scale-[0.98]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
            )}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Adding…
              </>
            ) : (
              'Add expense'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddExpensePage() {
  return (
    <div className="w-full flex justify-center items-center">
      <div className="w-full">
        <div
          className={cn(
            // Responsive: stacked on mobile, split on desktop
            'grid grid-cols-1 lg:grid-cols-[35%_1px_65%]',
            // Card shell
            'bg-white dark:bg-slate-900',
            'border border-slate-200 dark:border-slate-800',
            'rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30',
            'overflow-hidden',
          )}
        >
          {/* LEFT — onboarding content */}
          <div className="px-8 py-9 bg-slate-50 dark:bg-slate-900/60 overflow-y-auto max-h-screen lg:max-h-[88vh]">
            <LeftPanel />
          </div>

          {/* Divider */}
          <div className="hidden lg:block bg-slate-200 dark:bg-slate-800" />

          {/* RIGHT — form */}
          <div className="py-9 px-8 bg-white dark:bg-slate-900 overflow-y-auto">
            <ExpenseForm />
          </div>
        </div>
      </div>
    </div>
  );
}