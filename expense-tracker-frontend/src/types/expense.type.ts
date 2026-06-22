export type ExpenseTypes = "FOOD" | "TRANSPORTATION" | "SHOPPING" | "ENTERTAINMENT" | "HEALTHCARE" | "UTILITIES" | "HOUSING" | "TRAVEL" | "EDUCATION" | "OTHER";
export interface Expense {
    id: string;
    name: string;
    amount: number;
    type :ExpenseTypes;
    quantity?: string;
    bought_at: string;
    accountId?: string;
    groupId?: string;
    created_by?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ExpenseStates {
    expenses: Expense[];
    activeAccountId: string | null;
    loading: boolean;
    error: string | null;
    success: boolean;
}
