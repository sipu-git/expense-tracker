// src/App.tsx

import React, { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import { selectHydrating, selectIsAuthenticated, setHydrate, viewProfile } from "./store/slices/userSlices/user.slice";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ExpensesList from "./pages/expenses/ExpensesList";
import Analytics from "./pages/Analytics/Analytics";
import Budgets from "./pages/Budgets/Budgets";
import Settings from "./pages/Settings";
import AppLayout from "./components/layout/AppLayout";
import Profile from "./pages/Profile";
import ForgotPasswordEmail from "./pages/auth/ForgotPswdPage";
import VerifyPasswordOtp from "./pages/auth/VerifyOtpPage";
import ResetPassword from "./pages/auth/ResetPasswordPage";
import AddExpensePage from "./pages/expenses/AddExpenses";
import { selectActiveAccount } from "./store/slices/accountSlices/account.slice";
// import AppLayout from "./components/layout/AppLayout";

function LoginRoute({ isAuthenticated }: { isAuthenticated: boolean }) {
  const location = useLocation();
  const isAddingAccount = Boolean(location.state?.addAccount);

  if (isAuthenticated && !isAddingAccount) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
}

export default function App() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const hydrating = useAppSelector(selectHydrating);
  const activeAccount = useAppSelector(selectActiveAccount)
  const profileRequestedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!activeAccount?.id) {
      dispatch(setHydrate());
      profileRequestedFor.current = null;
      return;
    }

    if (profileRequestedFor.current === activeAccount.id) return;
    profileRequestedFor.current = activeAccount.id;
    dispatch(viewProfile());
  }, [dispatch, activeAccount?.id]);

  if (hydrating) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 text-[#0397f4]">
          <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="4" cy="12" r="3">
            <animate id="spinner_jObz" begin="0;spinner_vwSQ.end-0.25s" attributeName="r" dur="0.75s" values="3;.2;3">
            </animate></circle><circle cx="12" cy="12" r="3">
              <animate begin="spinner_jObz.end-0.6s" attributeName="r" dur="0.75s" values="3;.2;3"></animate></circle><circle cx="20" cy="12" r="3"><animate id="spinner_vwSQ" begin="spinner_jObz.end-0.45s" attributeName="r" dur="0.75s" values="3;.2;3"></animate></circle></svg></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to={isAuthenticated
          ? "/dashboard"
          : "/login"}
          replace
        />
        }
        />

        <Route
          path="/login"
          element={<LoginRoute isAuthenticated={isAuthenticated} />}
        />

        <Route
          path="/register"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <Register />
          }
        />

        {isAuthenticated && (
          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route path="/expenses" element={<ExpensesList />} />
            <Route path="/add-expense" element={<AddExpensePage />} />

            <Route
              path="/analytics"
              element={<Analytics />}
            />
            <Route path="/view-profile" element={<Profile />} />
            <Route
              path="/budgets"
              element={<Budgets />}
            />
            <Route path="/settings" element={<Settings />} />
          </Route>
        )}

        <Route
          path="*"
          element={
            <Navigate
              to={
                isAuthenticated
                  ? "/dashboard"
                  : "/login"
              }
              replace
            />
          }
        />
        <Route path="/send-otp" element={<ForgotPasswordEmail />} />
        <Route path="/verify-otp" element={<VerifyPasswordOtp />} />
        <Route path="/reset-new-password" element={<ResetPassword />} />

      </Routes>
    </BrowserRouter>
  );
}
