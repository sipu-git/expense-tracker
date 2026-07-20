import { api } from "../utils/api";

const subUrl = "/expenses";

export const expenseApis = {
    extractReceipt: (file: File) => {
        const formData = new FormData();
        formData.append("receipt", file);

        return api.post(`${subUrl}/extract-expense-receipt`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    }, addExpense: (data: any) => api.post(`${subUrl}/add-expense`, data),
    viewExpenses: () => api.get(`${subUrl}/view-all-expenses`),
    viewExpense: (expenseId: string) => api.get(`${subUrl}/view-expense-id/${expenseId}`),
    updateExpense: (expenseId: string, data: any) => api.patch(`${subUrl}/modify-expense/${expenseId}`, data),
    deleteExpense: (expenseId: string) => api.delete(`${subUrl}/delete-expense/${expenseId}`),
    removeAllExpense: () => api.delete(`${subUrl}/delete-all-expenses`),

    filterExpense: (filter: "day" | "month" | "year" = "month", groupId?: string) =>
        api.get(`${subUrl}/filter-expense`, { params: { filter, ...(groupId ? { groupId } : {}) } })
}
