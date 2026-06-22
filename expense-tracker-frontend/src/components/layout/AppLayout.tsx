// src/components/layout/AppLayout.tsx

import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { selectTheme, selectSidebarOpen } from "@/store/slices/uiSlice";
import Sidebar from "./Sidebar";
import Header from "./Header";
import DeleteModal from "@/pages/expenses/DeleteModal";
import { cn } from "@/utils";
import { viewExpenses } from "@/store/slices/expenseSlice/expenses.slice";
import { viewGroups, viewInvitations } from "@/store/slices/groupSlice/group.slice";
import { selectActiveAccountId } from "@/store/slices/accountSlices/account.slice";
// import { setActiveApiAccountId } from "@/utils/api";

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const sidebarOpen = useAppSelector(selectSidebarOpen);
  const activeAccountId = useAppSelector(selectActiveAccountId);

  useEffect(() => {
    // setActiveApiAccountId(activeAccountId);
    dispatch(viewExpenses());
    dispatch(viewGroups());
    dispatch(viewInvitations());
  }, [dispatch, activeAccountId]);

  return (
    <div className={cn("min-h-screen bg-background text-text font-sans", theme)}>
      <Sidebar />

      <div
        className={cn(
          "transition-all duration-300 min-h-screen flex flex-col",
          sidebarOpen ? "lg:pl-64" : "lg:pl-20"
        )}
      >
        <Header />

        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <DeleteModal />
    </div>
  );
}
