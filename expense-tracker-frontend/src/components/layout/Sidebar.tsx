// src/components/layout/Sidebar.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Receipt, BarChart3,
  Wallet, Settings, X, TrendingUp, LogOut,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { toggleSidebar, selectSidebarOpen } from '../../store/slices/uiSlice';
import { cn } from '../../utils';
import { signOutUser } from '@/store/slices/userSlices/user.slice';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'expenses',  label: 'Expenses',  icon: Receipt,         path: '/expenses'  },
  { id: 'analytics', label: 'Analytics', icon: BarChart3,        path: '/analytics' },
  { id: 'budgets',   label: 'Budgets',   icon: Wallet,          path: '/budgets'   },
  { id: 'settings',  label: 'Settings',  icon: Settings,        path: '/settings'  },
] as const;

export default function Sidebar() {
  const dispatch    = useAppDispatch();
  const sidebarOpen = useAppSelector(selectSidebarOpen);
  const navigate    = useNavigate();
  const location    = useLocation();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await dispatch(signOutUser()).unwrap();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) dispatch(toggleSidebar());
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-30 h-full flex flex-col transition-all duration-300',
          'bg-sidebar border-r border-sidebar-border',
          sidebarOpen ? 'w-64' : 'w-0 lg:w-20',
          'overflow-hidden',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border flex-shrink-0">
          <div className={cn('flex items-center gap-3', !sidebarOpen && 'lg:justify-center')}>
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 shadow-lg">
              <TrendingUp size={18} className="text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <p className="font-bold text-sm text-sidebar-text tracking-tight">ExpenseWallet</p>
                <p className="text-xs text-sidebar-muted">Dashboard</p>
              </div>
            )}
          </div>
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden p-1.5 rounded-lg hover:bg-sidebar-hover text-sidebar-muted hover:text-sidebar-text transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
            const active = location.pathname === path;
            return (
              <button
                key={id}
                onClick={() => handleNavClick(path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-accent text-white shadow-md shadow-accent/30'
                    : 'text-sidebar-muted hover:text-sidebar-text hover:bg-sidebar-hover',
                  !sidebarOpen && 'lg:justify-center lg:px-2',
                )}
                title={!sidebarOpen ? label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span>{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="border-t border-sidebar-border flex-shrink-0">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn(
              'w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors',
              'text-red-500 hover:bg-sidebar-hover',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              !sidebarOpen && 'lg:justify-center lg:px-2',
            )}
            title={!sidebarOpen ? 'Sign out' : undefined}
          >
            <LogOut size={15} className="flex-shrink-0" />
            {sidebarOpen && (
              <span>{isLoggingOut ? 'Signing out…' : 'Sign out'}</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}