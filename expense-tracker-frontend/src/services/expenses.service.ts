import { api } from "../utils/api";

const subUrl = "/expenses";

export const expenseApis = {
    addExpense: (data:any, accountId?: string | null) =>
        api.post(`${subUrl}/add-expense`, { ...data, ...(accountId ? { accountId } : {}) }),
    viewExpenses: (accountId?: string | null) =>
        api.get(`${subUrl}/view-all-expenses`, { params: accountId ? { accountId } : {} }),
    viewExpense: (expenseId: string, accountId?: string | null) =>
        api.get(`${subUrl}/view-expense-id/${expenseId}`, { params: accountId ? { accountId } : {} }),
    updateExpense: (expenseId: string,data:any, accountId?: string | null) =>
        api.put(`${subUrl}/modify-expense/${expenseId}`,data, { params: accountId ? { accountId } : {} }),
    deleteExpense: (expenseId: string, accountId?: string | null) =>
        api.delete(`${subUrl}/delete-expense/${expenseId}`, { params: accountId ? { accountId } : {} }),
    removeAllExpense: (accountId?: string | null) =>
        api.delete(`${subUrl}/delete-all-expenses`, { params: accountId ? { accountId } : {} }),
    filterExpense: (filter: "day" | "month" | "year" = "month", groupId?: string, accountId?: string | null) =>
        api.get(`${subUrl}/filter-expense`, { params: { filter, ...(groupId ? { groupId } : {}), ...(accountId ? { accountId } : {}) } })
}
