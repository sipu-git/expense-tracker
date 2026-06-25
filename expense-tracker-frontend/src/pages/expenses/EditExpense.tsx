// src/components/expenses/EditExpensePage.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Sparkles, Check, AlertCircle, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { cn, formatCurrency } from '../../utils';
import { clearExpenseDetail, updateExpense, viewExpense } from '@/store/slices/expenseSlice/expenses.slice';
import { EXPENSE_TYPES } from './AddExpenses';
import { CATEGORY_ICONS, ExpenseTypes } from '@/types/expense.type';

interface ExpenseFormState {
    name: string;
    amount: string;
    type: ExpenseTypes | '';
    bought_at: string;
    notes: string;
}


const today = () => new Date().toISOString().split('T')[0];

function emptyForm(): ExpenseFormState {
    return { name: '', amount: '', type: '', bought_at: today(), notes: '' };
}

function fromExpense(expense: any): ExpenseFormState {
    return {
        name: expense.name ?? '',
        amount: String(expense.amount ?? ''),
        type: expense.type ?? '',
        bought_at: expense.bought_at?.split('T')[0] ?? today(),
        notes: expense.notes ?? expense.note ?? '',
    };
}

function buildPatch(original: ExpenseFormState, current: ExpenseFormState): Partial<any> {
    const patch: Record<string, any> = {};
    if (current.name !== original.name) patch.name = current.name.trim();
    if (current.amount !== original.amount) patch.amount = parseFloat(current.amount);
    if (current.type !== original.type) patch.type = current.type;
    if (current.bought_at !== original.bought_at) patch.date = current.bought_at;
    if (current.notes !== original.notes) patch.notes = current.notes.trim();
    return patch;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
            {children}
            {required && <span className="text-accent ml-0.5">*</span>}
        </label>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
            <AlertCircle size={11} /> {message}
        </p>
    );
}

function ChangeBadge({ show }: { show: boolean }) {
    return (
        <span
            className={cn(
                'inline-block w-1.5 h-1.5 rounded-full ml-1.5 transition-all duration-200',
                show ? 'bg-accent opacity-100 scale-100' : 'opacity-0 scale-0'
            )}
        />
    );
}

export default function EditExpensePage() {
    const { expenseId } = useParams<{ expenseId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const expense = useAppSelector((state: any) => state.expense.expenseDetail);
    const detailLoading = useAppSelector((state: any) => state.expense.detailLoading);

    useEffect(() => {
        if (expenseId) dispatch(viewExpense(expenseId));
        return () => { dispatch(clearExpenseDetail()); }; // cleanup on unmount
    }, [expenseId]);

    const original = useMemo(
        () => (expense ? fromExpense(expense) : emptyForm()),
        [expense]
    );

    const [form, setForm] = useState<ExpenseFormState>(original);
    const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormState, string>>>({});
    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const titleRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (expense) {
            const loaded = fromExpense(expense);
            setForm(loaded);
        }
    }, [expense?.id]);

    useEffect(() => {
        titleRef.current?.focus();
    }, []);

    // ── Derived state ──
    const patch = useMemo(() => buildPatch(original, form), [original, form]);
    const isDirty = Object.keys(patch).length > 0;
    const amountNum = parseFloat(form.amount);
    const amountValid = !isNaN(amountNum) && amountNum > 0;

    // ── Validation ──
    function validate(): boolean {
        const next: typeof errors = {};
        if (!form.name.trim()) next.name = 'Title is required';
        if (!form.amount) next.amount = 'Amount is required';
        else if (!amountValid) next.amount = 'Enter a valid positive amount';
        if (!form.type) next.type = 'Pick a category';
        if (!form.bought_at) next.bought_at = 'Date is required';
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    // ── Submit ──
    async function handleSave() {
        if (!validate()) return;
        if (!isDirty) { navigate(-1); return; }

        setStatus('saving');
        try {
            await dispatch(
                updateExpense({ expenseId: expenseId!, data: patch })
            ).unwrap();
            setStatus('success');
            setTimeout(() => navigate(-1), 900);
        } catch (err: any) {
            setStatus('error');
            setErrorMsg(err?.message ?? 'Failed to save. Please try again.');
        }
    }

    function handleDiscard() {
        setForm(original);
        setErrors({});
        setStatus('idle');
    }

    function set<K extends keyof ExpenseFormState>(key: K, value: ExpenseFormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
        if (status === 'error') setStatus('idle');
    }

    // ─── Guard: loading ────────────────────────────────────────────────────────
    if (detailLoading) {
        return (
            <div className="max-w-xl mx-auto space-y-4 pb-10">
                <div className="flex items-center gap-3 pt-1">
                    <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted hover:text-text hover:border-accent/50 transition-all">
                        <ArrowLeft size={15} />
                    </button>
                    <h1 className="text-base font-bold text-text">Edit Expense</h1>
                </div>
                <div className="card flex items-center justify-center py-20">
                    <Loader2 size={22} className="animate-spin text-accent" />
                </div>
            </div>
        );
    }
    if (!expense) {
        return (
            <div className="max-w-xl mx-auto space-y-4 pb-10">
                <div className="flex items-center gap-3 pt-1">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted hover:text-text hover:border-accent/50 transition-all"
                    >
                        <ArrowLeft size={15} />
                    </button>
                    <h1 className="text-base font-bold text-text">Edit Expense</h1>
                </div>
                <div className="card text-center py-16">
                    <p className="text-4xl mb-3">🔍</p>
                    <p className="text-base font-semibold text-text">Expense not found</p>
                    <p className="text-sm text-muted mt-1">
                        It may have been deleted or the page was refreshed.
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-hover transition-all"
                    >
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto space-y-4 pb-10">

            {/* ── Header ── */}
            <div className="flex items-center gap-3 pt-1">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted hover:text-text hover:border-accent/50 transition-all"
                >
                    <ArrowLeft size={15} />
                </button>
                <div className="flex-1">
                    <h1 className="text-base font-bold text-text leading-tight">Edit Expense</h1>
                    {expense && (
                        <p className="text-xs text-muted truncate max-w-[220px]">{expense.name}</p>
                    )}
                </div>
                {/* Live amount preview */}
                {amountValid && (
                    <span className="text-sm font-bold text-accent tabular-nums">
                        {formatCurrency(amountNum)}
                    </span>
                )}
            </div>

            {/* ── Form card ── */}
            <div className="card space-y-5">

                {/* Title */}
                <div>
                    <FieldLabel required>
                        Title
                        <ChangeBadge show={patch.name !== undefined} />
                    </FieldLabel>
                    <input
                        ref={titleRef}
                        className={cn('form-input', errors.name && 'border-red-500 focus:border-red-500')}
                        placeholder="e.g. Lunch at café"
                        value={form.name}
                        onChange={(e) => set('name', e.target.value)}
                        maxLength={100}
                    />
                    <FieldError message={errors.name} />
                </div>

                {/* Amount */}
                <div>
                    <FieldLabel required>
                        Amount
                        <ChangeBadge show={patch.amount !== undefined} />
                    </FieldLabel>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted select-none">
                            ₹
                        </span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className={cn(
                                'form-input pl-7 tabular-nums',
                                errors.amount && 'border-red-500 focus:border-red-500'
                            )}
                            placeholder="0.00"
                            value={form.amount}
                            onChange={(e) => set('amount', e.target.value)}
                        />
                    </div>
                    <FieldError message={errors.amount} />
                </div>

                {/* Date */}
                <div>
                    <FieldLabel required>
                        Date
                        <ChangeBadge show={patch.date !== undefined} />
                    </FieldLabel>
                    <input
                        type="date"
                        className={cn('form-input', errors.bought_at && 'border-red-500 focus:border-red-500')}
                        value={form.bought_at}
                        max={today()}
                        onChange={(e) => set('bought_at', e.target.value)}
                    />
                    <FieldError message={errors.bought_at} />
                </div>

                {/* Category */}
                <div>
                    <FieldLabel required>
                        Category
                        <ChangeBadge show={patch.type !== undefined} />
                    </FieldLabel>
                    {errors.type && <FieldError message={errors.type} />}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-1">
                        {EXPENSE_TYPES.map((cat) => {
                            const active = form.type === cat;
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => set('type', cat)}
                                    className={cn(
                                        'flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-medium transition-all',
                                        active
                                            ? 'bg-accent/10 border-accent text-accent shadow-sm shadow-accent/20'
                                            : 'border-border text-muted hover:border-accent/40 hover:text-text'
                                    )}
                                >
                                    <span className="text-lg leading-none">{CATEGORY_ICONS[cat]}</span>
                                    <span className="truncate w-full text-center leading-tight">{cat}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Note */}
                <div>
                    <FieldLabel>
                        Note
                        <ChangeBadge show={patch.notes !== undefined} />
                        <span className="ml-1 normal-case font-normal text-muted/70">(optional)</span>
                    </FieldLabel>
                    <textarea
                        rows={3}
                        className="form-input resize-none"
                        placeholder="Any extra details..."
                        value={form.notes}
                        onChange={(e) => set('notes', e.target.value)}
                        maxLength={300}
                    />
                    <p className="text-right text-xs text-muted/60 mt-1">{form.notes.length}/300</p>
                </div>
            </div>

            {/* ── Changed fields summary ── */}
            {isDirty && status !== 'success' && (
                <div className="card bg-accent/5 border border-accent/20 flex items-start gap-2.5 py-3">
                    <Sparkles size={14} className="text-accent mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-accent mb-1">
                            {Object.keys(patch).length} field{Object.keys(patch).length !== 1 ? 's' : ''} changed
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {Object.keys(patch).map((k) => (
                                <span
                                    key={k}
                                    className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs font-medium capitalize"
                                >
                                    {k}
                                </span>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={handleDiscard}
                        className="text-muted hover:text-text transition-colors shrink-0"
                        title="Discard changes"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* ── Error banner ── */}
            {status === 'error' && (
                <div className="card border border-red-500/30 bg-red-500/5 flex items-center gap-2.5 py-3">
                    <AlertCircle size={14} className="text-red-500 shrink-0" />
                    <p className="text-xs text-red-500 flex-1">{errorMsg}</p>
                    <button onClick={() => setStatus('idle')} className="text-red-400 hover:text-red-500">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* ── Actions ── */}
            <div className="flex gap-2.5">
                <button
                    onClick={() => navigate(-1)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-border text-muted hover:text-text hover:border-accent/40 transition-all"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={status === 'saving' || status === 'success'}
                    className={cn(
                        'flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md',
                        status === 'success'
                            ? 'bg-green-500 text-white shadow-green-500/25'
                            : isDirty
                                ? 'bg-accent text-white hover:bg-accent-hover shadow-accent/25'
                                : 'bg-accent/40 text-white/70 cursor-not-allowed shadow-none'
                    )}
                >
                    {status === 'saving' && <Loader2 size={15} className="animate-spin" />}
                    {status === 'success' && <Check size={15} />}
                    {status === 'saving' ? 'Saving…' : status === 'success' ? 'Saved!' : isDirty ? 'Save changes' : 'No changes'}
                </button>
            </div>
        </div>
    );
}