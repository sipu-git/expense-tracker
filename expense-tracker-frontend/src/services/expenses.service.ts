import { api } from "../utils/api";

const subUrl = "/expenses";

export const expenseApis = {
    addExpense: (data:any) => api.post(`${subUrl}/add-expense`,data),
    viewExpenses: () => api.get(`${subUrl}/view-all-expenses`),
    viewExpense: (expenseId: string) => api.get(`${subUrl}/view-expense-id/${expenseId}`),
    updateExpense: (expenseId: string,data:any) => api.put(`${subUrl}/modify-expense/${expenseId}`,data),
    deleteExpense: (expenseId: string) => api.delete(`${subUrl}/delete-expense/${expenseId}`),
    filterExpense: (filter: "day" | "month" | "year" = "month", groupId?: string) =>
        api.get(`${subUrl}/filter-expense`, { params: { filter, ...(groupId ? { groupId } : {}) } })
}
