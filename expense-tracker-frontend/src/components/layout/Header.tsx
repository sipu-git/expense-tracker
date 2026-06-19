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
import { selectIsAuthenticated, signOutUser } from '@/store/slices/userSlices/user.slice';
import { useSelector } from 'react-redux';

type NotifKind = 'alert' | 'info' | 'success';

interface Notification {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

// ── Demo notifications ────────────────────────────────────────────────────────

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1', kind: 'alert',
    title: 'Budget limit reached',
    body: 'Food & Dining is at 95% of your monthly budget.',
    time: '2m ago', read: false,
  },
  {
    id: '2', kind: 'info',
    title: 'Monthly report ready',
    body: 'Your June spending summary is available to download.',
    time: '1h ago', read: false,
  },
  {
    id: '3', kind: 'success',
    title: 'Export complete',
    body: 'expenses-2025-06.csv was downloaded successfully.',
    time: 'Yesterday', read: true,
  },
];

// ── Constants ─────────────────────────────────────────────────────────────────

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

const KIND_STYLES: Record<NotifKind, { icon: React.ElementType; iconClass: string; dotClass: string }> = {
  alert: { icon: AlertCircle, iconClass: 'text-amber-500', dotClass: 'bg-amber-500' },
  info: { icon: Info, iconClass: 'text-blue-500', dotClass: 'bg-blue-500' },
  success: { icon: Check, iconClass: 'text-emerald-500', dotClass: 'bg-emerald-500' },
};

// ── useDropdown hook — shared close-on-outside-click logic ────────────────────

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

// ── Notification panel ────────────────────────────────────────────────────────

interface NotifPanelProps {
  items: Notification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

function NotifPanel({ items, onMarkRead, onClearAll, onClose }: NotifPanelProps) {
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-[100] bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text">Notifications</span>
          {unread > 0 && (
            <span className="text-xs font-semibold bg-accent text-white px-1.5 py-0.5 rounded-full leading-none">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-accent hover:underline px-1.5 py-1 rounded-lg hover:bg-hover transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-hover text-muted hover:text-text transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-border">
        {items.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="text-sm font-medium text-text">You're all caught up</p>
            <p className="text-xs text-muted mt-0.5">No new notifications</p>
          </div>
        ) : (
          items.map((n) => {
            const { icon: Icon, iconClass, dotClass } = KIND_STYLES[n.kind];
            return (
              <button
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-hover ${!n.read ? 'bg-accent/5' : ''
                  }`}
              >
                <div className={`mt-0.5 flex-shrink-0 ${iconClass}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-text leading-tight">{n.title}</p>
                    <span className="text-xs text-muted flex-shrink-0 mt-0.5">{n.time}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">{n.body}</p>
                </div>
                {!n.read && (
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 {dotClass}`} />
                )}
              </button>
            );
          })
        )}
      </div>

      {items.length > 0 && (
        <div className="px-4 py-2.5 border-t border-border">
          <button className="w-full flex items-center justify-center gap-1 text-xs text-accent hover:underline py-1">
            View all notifications <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Profile dropdown ──────────────────────────────────────────────────────────

interface ProfileDropdownProps {
  user: { full_name?: string; email?: string; avatarUrl?: string } | null;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onLogout: () => Promise<void>;
  isLoggingOut?: boolean;
}

function ProfileDropdown({
  user,
  onClose,
  onNavigate,
  onLogout,
  isLoggingOut = false
}: ProfileDropdownProps) {
  return (
    <div className="absolute right-0 top-full mt-2 w-56 z-[100] bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
      {/* User info */}
      <div className="px-4 py-3 border-b border-border">
        <p className="text-sm font-semibold text-text truncate">{user?.full_name ?? 'User'}</p>
        <p className="text-xs text-muted truncate mt-0.5">{user?.email ?? ''}</p>
      </div>

      {/* Actions */}
      <div className="py-1">
        <button
          onClick={() => {
            onClose();
            onNavigate('/view-profile');
          }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-hover transition-colors"
        >
          <User size={15} className="text-muted flex-shrink-0" />
          View profile
        </button>

        <button
          onClick={() => {
            onClose();
            onNavigate('/groups');
          }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-hover transition-colors"
        >
          <User size={15} className="text-muted flex-shrink-0" />
          View Groups
        </button>

        <button
          onClick={() => {
            onClose();
            onNavigate('/settings');
          }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-hover transition-colors"
        >
          <Settings size={15} className="text-muted flex-shrink-0" />
          Settings
        </button>
      </div>

      {/* Divider + Sign out */}
      <div className="border-t border-border py-1">
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
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const pageTitle = VIEW_TITLES[location.pathname] ?? 'SpendWise';

  const notif = useDropdown();
  const profile = useDropdown();
  const accountMenu = useDropdown();

  const [notifs, setNotifs] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const unreadCount = notifs.filter((n) => !n.read).length;

  const markRead = (id: string) => setNotifs((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs((p) => p.map((n) => ({ ...n, read: true })));

  const handleExport = () => {
    exportToCSV(
      expenses.map((e) => ({
        Title: e.title,
        Amount: e.amount,
        Category: e.category,
        Date: e.date,
        Notes: e.notes || '',
      })),
      `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`
    );
  };

  const handleLogout = async () => {
    try {
      await dispatch(signOutUser()).unwrap();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
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

  // Derive initials for avatar
  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 h-16 bg-header border-b border-border backdrop-blur-sm">

      {/* ── Left ── */}
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
            {getGreeting()}, {user?.full_name?.split(' ')[0] ?? 'Alex'} 👋 — {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Export — label on md+, icon-only below */}
        <button
          onClick={handleExport}
          disabled={isLoggingOut}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-hover text-muted hover:text-text transition-colors border border-border disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={15} />
          <span>Export</span>
        </button>

        <button
          onClick={handleExport}
          disabled={isLoggingOut}
          aria-label="Export expenses"
          className="md:hidden p-2 rounded-xl hover:bg-hover text-muted hover:text-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          disabled={isLoggingOut}
          aria-label="Toggle theme"
          className="p-2 rounded-xl hover:bg-hover text-muted hover:text-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div ref={notif.ref} className="relative">
          <button
            onClick={() => { notif.setOpen((p) => !p); profile.setOpen(false); accountMenu.setOpen(false); }}
            disabled={isLoggingOut}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            className={`relative p-2 rounded-xl hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${notif.open ? 'bg-hover text-text' : 'text-muted hover:text-text'}`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 ring-2 ring-header leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notif.open && (
            <NotifPanel
              items={notifs}
              onMarkRead={markRead}
              onClearAll={markAllRead}
              onClose={() => notif.setOpen(false)}
            />
          )}
        </div>

        {/* ── Profile ── */}
        <div ref={profile.ref} className="relative">
          <button
            onClick={() => { profile.setOpen((p) => !p); notif.setOpen(false); accountMenu.setOpen(false); }}
            disabled={isLoggingOut}
            aria-label="Account menu"
            className={`flex items-center gap-0.5 pl-1 pr-2 py-1 rounded-xl hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${profile.open ? 'bg-hover' : ''}`}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user ? (
                <div className="text-xs w-8 h-8 flex justify-center items-center rounded-full bg-blue-100 font-semibold text-accent">
                  {initials}
                </div>
              ) : (
                <span className="text-xs font-semibold text-accent">N/A</span>
              )}
            </div>

            {/* Chevron — visible on sm+ */}
            <ChevronDown
              size={14}
              className={`hidden sm:block text-muted transition-transform duration-200 ${profile.open ? 'rotate-180' : ''}`}
            />
          </button>

          {profile.open && (
            <ProfileDropdown
              user={user}
              onClose={() => profile.setOpen(false)}
              onNavigate={navigate}
              onLogout={handleLogout}
              isLoggingOut={isLoggingOut}
            />
          )}
        </div>
      </div>
    </header>
  );
}
