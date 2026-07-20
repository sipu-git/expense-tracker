// src/components/expenses/ExpensesList.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { selectExpensesByDay, setFilters, clearFilters } from '../../store/slices/expensesSlice';
import { openModal } from '../../store/slices/uiSlice';
import { formatCurrency, formatDate, cn } from '../../utils';
import { useNavigate } from 'react-router-dom';
import { format, subMonths } from 'date-fns';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS, ExpenseTypes } from '@/types/expense.type';
import { viewExpenses } from '@/store/slices/expenseSlice/expenses.slice';

export default function ExpensesList() {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectExpensesByDay);
  const [search, setSearch] = useState('');
  const [selectedCats, setSelectedCats] = useState<ExpenseTypes[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const [selectMonth, setSelectMonth] = useState('');

 const monthOptions = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy'),
      };
    });
    return [{ value: '', label: 'View All' }, ...months];
  }, []);

  const applyFilters = (s: string, cats: ExpenseTypes[], month: string) => {
    dispatch(setFilters({ search: s || undefined, categories: cats.length ? cats : undefined, month: month || undefined }));
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    applyFilters(val, selectedCats, selectMonth);
  };

  const toggleCat = (cat: ExpenseTypes) => {
    const next = selectedCats.includes(cat)
      ? selectedCats.filter((c) => c !== cat)
      : [...selectedCats, cat];
    setSelectedCats(next);
    applyFilters(search, next, selectMonth);
  };

  const handleMonthChange = (month: string) => {
    setSelectMonth(month);
    applyFilters(search, selectedCats, month);
  };

  const handleClear = () => {
    setSearch('');
    setSelectedCats([]);
    dispatch(clearFilters());
  };

 useEffect(() => {
    dispatch(viewExpenses()); 
    dispatch(clearFilters());
  }, []);
  const totalExpenses = groups.reduce((s, g) => s + g.expenses.length, 0);

  return (
    <div className="space-y-4">

      {/* ── Search + filter bar ── */}
      <div className="card">
        <div className="flex lg:flex-row flex-col gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="form-input pl-9"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex lg:justify-normal justify-start gap-2">
            <select
              value={selectMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm font-medium border border-border text-text bg-card hover:border-accent/50 transition-all outline-none cursor-pointer"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                showFilters
                  ? 'bg-accent/10 border-accent text-accent'
                  : 'border-border text-muted hover:text-text hover:border-accent/50'
              )}
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">Filters</span>
              {selectedCats.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center">
                  {selectedCats.length}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/add-expense')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-hover transition-all shadow-md shadow-accent/25"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>

        {/* Category filters */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Filter by category</p>
              {selectedCats.length > 0 && (
                <button onClick={handleClear} className="text-xs text-accent hover:underline">Clear all</button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCat(cat)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    selectedCats.includes(cat)
                      ? 'bg-accent/10 border-accent text-accent'
                      : 'border-border text-muted hover:text-text hover:border-accent/40'
                  )}
                >
                  <span>{CATEGORY_ICONS[cat]}</span>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Summary ── */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted">
          <span className="font-semibold text-text">{totalExpenses}</span> expenses across{' '}
          <span className="font-semibold text-text">{groups.length}</span> days
        </p>
        <p className="text-sm font-bold text-text">
          {formatCurrency(groups.reduce((s, g) => s + g.total, 0))} total
        </p>
      </div>

      {/* ── Grouped by day ── */}
      {groups.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-base font-semibold text-text">No expenses found</p>
          <p className="text-sm text-muted mt-1">Try adjusting your filters or add a new expense</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {groups.map((group) => (
            <div key={group.date} className="card overflow-hidden">

              {/* ── Day header ── */}
              <div className="flex items-center justify-between pb-3 mb-1 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                    {new Date(group.date + 'T12:00:00').getDate()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text">{formatDate(group.date, 'EEEE, MMMM d')}</p>
                    <p className="text-xs text-muted">
                      {group.expenses.length} expense{group.expenses.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-text">{formatCurrency(group.total)}</span>
              </div>

              {/* ── Expense rows ── */}
              <div className="space-y-1">
                {group.expenses.map((expense) => {
                  const color = CATEGORY_COLORS[expense.type as ExpenseTypes];
                  const emoji = CATEGORY_ICONS[expense.type as ExpenseTypes];
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-hover transition-colors group"
                    >
                      {/* Category icon */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        {emoji}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text truncate">{expense.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span
                            className="text-xs font-medium px-1.5 py-0.5 rounded-full capitalize"
                            style={{ color, backgroundColor: `${color}20` }}
                          >
                            {expense.type}
                          </span>
                          {expense.quantity && Number(expense.quantity) !== 1 && (
                            <span className="text-xs text-muted">×{expense.quantity}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => navigate(`/edit-expense/${expense.id}`)}
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
                })}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}