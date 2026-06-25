// src/components/layout/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, Sun, Moon, Download, Bell,
  X, Check, AlertCircle, Info, ChevronRight,
  User, LogOut, Settings, ChevronDown, Wallet, Plus, Loader2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { toggleSidebar, toggleTheme, selectTheme } from '../../store/slices/uiSlice';
import { selectFilteredExpenses } from '../../store/slices/expensesSlice';
import { exportToCSV } from '../../utils';
import { format } from 'date-fns';
import { clearUser, setUser, signOutUser } from '@/store/slices/userSlices/user.slice';
import { useSelector } from 'react-redux';
import {
  removeAccount,
  selectActiveAccount,
  selectAllAccounts,
  selectIsAuthenticatedFromAccounts,
  switchAccount,
} from '@/store/slices/accountSlices/account.slice';
import { persistor, store } from '@/store';
import { getProfilePicUrl } from '@/utils/profile.util';

type NotifKind = 'alert' | 'info' | 'success';

const VIEW_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/expenses': 'Expenses',
  '/analytics': 'Analytics',
  '/budgets': 'Budgets',
  '/settings': 'Settings',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return { open, setOpen, ref };
}

interface ProfileDropdownProps {
  user: { full_name?: string; email?: string; avatarUrl?: string } | null;
  onClose: () => void;
  onNavigate: (path: string, options?: { state?: any }) => void;
  onLogout: () => Promise<void>;
  isLoggingOut?: boolean;
}

function ProfileDropdown({
  user,
  onClose,
  onNavigate,
  onLogout,
  isLoggingOut = false,
}: ProfileDropdownProps) {
  const dispatch = useAppDispatch();
  const accounts = useSelector(selectAllAccounts);
  const activeAccount = useSelector(selectActiveAccount);

  // Only show accounts OTHER than the active one
  const otherAccounts = accounts.filter(a => a.id !== activeAccount?.id);

  const handleSwitch = (id: string) => {
    const targetAccount = accounts.find(a => a.id === id);
    if (!targetAccount) return;

    dispatch(switchAccount(id));
    dispatch(setUser(targetAccount.user));
    onClose();
    onNavigate('/dashboard');
  };

  const handleRemoveAccount = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch(removeAccount(id));
    // removeAccount reducer already switches activeAccountId to next account
    // so we just need to sync userSlice
    const nextAccount = accounts.find(a => a.id !== id);
    if (nextAccount) {
      dispatch(setUser(nextAccount.user));
    } else {
      dispatch(clearUser());
      onClose();
      onNavigate('/login');
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-64 z-[100] bg-card border border-border rounded-2xl shadow-xl overflow-hidden">

      {/* Active user info */}
      <div className="px-4 py-3 border-b border-border">
        <p className="text-sm font-semibold text-text truncate">{user?.full_name ?? 'User'}</p>
        <p className="text-xs text-muted truncate mt-0.5">{user?.email ?? ''}</p>
      </div>

      {/* Menu actions */}
      <div className="py-1 border-b border-border">
        <button
          onClick={() => { onClose(); onNavigate('/view-profile'); }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-hover transition-colors"
        >
          <User size={15} className="text-muted flex-shrink-0" />
          View profile
        </button>
        <button
          onClick={() => { onClose(); onNavigate('/settings'); }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-hover transition-colors"
        >
          <Settings size={15} className="text-muted flex-shrink-0" />
          Settings
        </button>
      </div>

      {/* Other accounts — only shown if there are other accounts */}
      {otherAccounts.length > 0 && (
        <div className="py-2 border-b border-border">
          <p className="px-4 pb-1.5 text-xs font-semibold text-muted uppercase tracking-wider">
            Other profiles
          </p>
          {otherAccounts.map(account => {
            const initials = account.user.full_name?.[0]?.toUpperCase() ?? '?';
            return (
              <div
                key={account.id}
                onClick={() => handleSwitch(account.id)}
                className="group flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-hover transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  {account.user?.profilePic ? (
                    <img
                      src={getProfilePicUrl(account.user?.profilePic) ?? ''}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-2xl font-bold text-accent">{initials}</span>
                  )}                  </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted">{account.user.email}</p>
                </div>
                <button
                  onClick={(e) => handleRemoveAccount(e, account.id)}
                  title="Remove account"
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted hover:text-red-400 transition-all flex-shrink-0"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add account — navigates to /login WITH addAccount state */}
      <div className="py-1 border-b border-border">
        <button
          onClick={() => {
            onClose();
            onNavigate('/login', { state: { addAccount: true } });
          }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-hover transition-colors"
        >
          <Plus size={15} className="text-muted flex-shrink-0" />
          Add account
        </button>
      </div>

      {/* Sign out — removes active account then redirects */}
      <div className="py-1">
        <button
          onClick={async () => {
            onClose();
            await onLogout();
          }}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut size={15} className="flex-shrink-0" />
          {isLoggingOut ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}

export default function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useAppSelector(selectTheme);
  const expenses = useAppSelector(selectFilteredExpenses);
  const { user, loading: isLoggingOut } = useAppSelector((state) => state.user);
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticatedFromAccounts);

  const pageTitle = VIEW_TITLES[location.pathname] ?? 'ExpenseWallet';

  const notif = useDropdown();
  const profile = useDropdown();
  const accountMenu = useDropdown();

  const handleExport = () => {
    exportToCSV(
      expenses.map((e) => ({
        Title: e.name,
        Amount: e.amount,
        Category: e.type,
        Date: e.bought_at,
        // Notes: e.notes || '',
      })),
      `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`
    );
  };


  const handleLogout = async () => {
    try {
      const accountsState = (store.getState().accounts as any);
      const activeId = accountsState.activeAccountId;

      await dispatch(signOutUser()).unwrap();

      dispatch(removeAccount(activeId));

      const remainingAccounts = (store.getState().accounts as any).accounts as any[];

      if (remainingAccounts.length > 0) {
        const next = remainingAccounts[0];
        dispatch(switchAccount(next.id));
        dispatch(setUser(next.user));
        await persistor.flush();
        navigate('/dashboard');
      } else {
        dispatch(clearUser());
        await persistor.flush();
        await persistor.purge();
        navigate('/login');
      }
    } catch (err) {
      console.error('Logout failed:', err);
      dispatch(clearUser());
      await persistor.flush();
      await persistor.purge();
      navigate('/login');
    }
  };
  if (!isAuthenticated) {
    return (
      <nav className="sticky top-0 z-20 bg-gray-800 text-white p-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-lg">ExpenseWallet</h1>
          <a href="/login" className="hover:underline text-sm">Login</a>
        </div>
      </nav>
    );
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 h-16 bg-header border-b border-border backdrop-blur-sm">

      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Toggle sidebar"
          className="flex-shrink-0 p-2 rounded-xl hover:bg-hover text-muted hover:text-text transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="font-bold text-base text-text leading-tight truncate">{pageTitle}</h1>
          <p className="text-xs text-muted hidden sm:block truncate">
            {getGreeting()}, {user?.full_name?.split(' ')[0] ?? 'there'} 👋 — {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button
          onClick={handleExport}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-hover text-muted hover:text-text transition-colors border border-border"
        >
          <Download size={15} />
          <span>Export</span>
        </button>
        <button
          onClick={handleExport}
          aria-label="Export expenses"
          className="md:hidden p-2 rounded-xl hover:bg-hover text-muted hover:text-text transition-colors"
        >
          <Download size={18} />
        </button>

        <button
          onClick={() => dispatch(toggleTheme())}
          aria-label="Toggle theme"
          className="p-2 rounded-xl hover:bg-hover text-muted hover:text-text transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Profile dropdown */}
        <div ref={profile.ref} className="relative">
          <button
            onClick={() => { profile.setOpen((p) => !p); notif.setOpen(false); accountMenu.setOpen(false); }}
            aria-label="Account menu"
            className={`flex items-center gap-0.5 pl-1 pr-2 py-1 rounded-xl hover:bg-hover transition-colors ${profile.open ? 'bg-hover' : ''}`}
          >
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <div className="text-xs w-8 h-8 flex justify-center items-center rounded-full bg-blue-100 font-semibold text-accent">
                {user?.profilePic ? (
                  <img
                    src={getProfilePicUrl(user?.profilePic) ?? ''}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-2xl font-bold text-accent">{initials}</span>
                )}              </div>
            </div>
            <ChevronDown
              size={14}
              className={`hidden sm:block text-muted transition-transform duration-200 ${profile.open ? 'rotate-180' : ''}`}
            />
          </button>

          {profile.open && (
            <ProfileDropdown
              user={user}
              onClose={() => profile.setOpen(false)}
              onNavigate={(path, options) => navigate(path, options)}
              onLogout={handleLogout}
              isLoggingOut={isLoggingOut}
            />
          )}
        </div>
      </div>
    </header>
  );
}