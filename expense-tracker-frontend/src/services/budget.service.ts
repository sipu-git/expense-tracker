import { ExpenseTypes } from "@/types/expense.type";
import { api } from "../utils/api";

const subUrl = "/budgets";

export interface BudgetPayload {
    category: ExpenseTypes;
    limit: number;
    period?: "monthly" | "weekly";
}

export const budgetApis = {
    addBudget: (data: BudgetPayload) => api.post(`${subUrl}/add-budget`, data),
    viewBudgets: () => api.get(`${subUrl}/view-all-budgets`),
    viewBudget: (budgetId: string) => api.get(`${subUrl}/view-budget-id/${budgetId}`),
    updateBudget: (budgetId: string, data: Partial<BudgetPayload>) =>
        api.patch(`${subUrl}/modify-budget/${budgetId}`, data),
    deleteBudget: (budgetId: string) => api.delete(`${subUrl}/delete-budget/${budgetId}`),
    deleteBudgetByCategory: (category: ExpenseTypes) =>
        api.delete(`${subUrl}/delete-budget-category/${category}`),
};
