// src/components/expenses/ExpensesList.tsx
import React, { useState } from 'react';
import { Search, SlidersHorizontal, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { selectExpensesByDay, setFilters, clearFilters } from '../../store/slices/expensesSlice';
import { openModal } from '../../store/slices/uiSlice';
import { CATEGORIES, CATEGORY_ICONS, Category } from '../../types';
import ExpenseRow from './ExpenseRow';
import { formatCurrency, formatDate, cn } from '../../utils';
import { useNavigate } from 'react-router-dom';

export default function ExpensesList() {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectExpensesByDay);
  const [search, setSearch] = useState('');
  const [selectedCats, setSelectedCats] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const applyFilters = (s: string, cats: Category[]) => {
    dispatch(setFilters({ search: s || undefined, categories: cats.length ? cats : undefined }));
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    applyFilters(val, selectedCats);
  };

  const toggleCat = (cat: Category) => {
    const next = selectedCats.includes(cat)
      ? selectedCats.filter((c) => c !== cat)
      : [...selectedCats, cat];
    setSelectedCats(next);
    applyFilters(search, next);
  };

  const handleClear = () => {
    setSearch('');
    setSelectedCats([]);
    dispatch(clearFilters());
  };

  const toggleDay = (date: string) =>
    setExpandedDays((prev) => ({ ...prev, [date]: !prev[date] }));

  const totalExpenses = groups.reduce((s, g) => s + g.expenses.length, 0);

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="card">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="form-input pl-9"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
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
            onClick={() => navigate("/add-expense")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-hover transition-all shadow-md shadow-accent/25"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Add</span>
          </button>
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

      {/* Summary */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted">
          <span className="font-semibold text-text">{totalExpenses}</span> expenses across{' '}
          <span className="font-semibold text-text">{groups.length}</span> days
        </p>
        <p className="text-sm font-bold text-text">
          {formatCurrency(groups.reduce((s, g) => s + g.total, 0))} total
        </p>
      </div>

      {/* Grouped by day */}
      {groups.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-base font-semibold text-text">No expenses found</p>
          <p className="text-sm text-muted mt-1">Try adjusting your filters or add a new expense</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const isExpanded = expandedDays[group.date] !== false; // default expanded
            return (
              <div key={group.date} className="card overflow-hidden">
                <button
                  onClick={() => toggleDay(group.date)}
                  className="w-full flex items-center justify-between hover:bg-hover -mx-5 -mt-4 px-5 pt-4 pb-3 mb-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                      {new Date(group.date + 'T12:00:00').getDate()}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-text">{formatDate(group.date, 'EEEE, MMMM d')}</p>
                      <p className="text-xs text-muted">{group.expenses.length} expense{group.expenses.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-text">{formatCurrency(group.total)}</span>
                    {isExpanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="-mx-2 space-y-0.5">
                    {group.expenses.map((e) => (
                      <ExpenseRow key={e.id} expense={e} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
