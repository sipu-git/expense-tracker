// src/App.tsx

import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
// import AppLayout from "./components/layout/AppLayout";

export default function App() {
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(
    selectIsAuthenticated
  );

  const hydrating = useAppSelector(
    selectHydrating
  );

  useEffect(() => {
    dispatch(viewProfile());
  }, [dispatch]);

  if (hydrating) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
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
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <Login />
          }
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

            <Route path="/expenses" element={<ExpensesList />}/>
            <Route path="/add-expense" element={<AddExpensePage />}/>

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