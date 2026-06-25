export type ExpenseTypes = "FOOD" | "TRANSPORTATION" | "SHOPPING" | "ENTERTAINMENT" | "HEALTHCARE" | "UTILITIES" | "HOUSING" | "TRAVEL" | "EDUCATION" | "OTHER";

export type Category = ExpenseTypes;

export const CATEGORIES: ExpenseTypes[] = [
    'FOOD', 'TRANSPORTATION', 'SHOPPING', 'ENTERTAINMENT',
    'HEALTHCARE', 'UTILITIES', 'HOUSING', 'TRAVEL', 'EDUCATION', 'OTHER',
];

export const CATEGORY_ICONS: Record<ExpenseTypes, string> = {
    FOOD: '🍽️',
    TRANSPORTATION: '🚗',
    SHOPPING: '🛍️',
    ENTERTAINMENT: '🎬',
    HEALTHCARE: '🏥',
    UTILITIES: '💡',
    HOUSING: '🏠',
    TRAVEL: '✈️',
    EDUCATION: '📚',
    OTHER: '📦',
};

export const CATEGORY_COLORS: Record<ExpenseTypes, string> = {
    FOOD: '#f97316',
    TRANSPORTATION: '#3b82f6',
    SHOPPING: '#a855f7',
    ENTERTAINMENT: '#ec4899',
    HEALTHCARE: '#ef4444',
    UTILITIES: '#14b8a6',
    HOUSING: '#f59e0b',
    TRAVEL: '#06b6d4',
    EDUCATION: '#22c55e',
    OTHER: '#6b7280',
};
export interface Expense {
    id: string;
    name: string;
    amount: number;
    type: ExpenseTypes;
    quantity?: string;
    bought_at: string;
    accountId?: string;
    groupId?: string;
    created_by?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ExpenseStates {
    expenses: Expense[];
    activeAccountId: string | null;
    expenseDetail: Expense | null;
    suggestCategory: string | null;
    categoryLoading: boolean;
    loading: boolean;
    error: string | null;
    success: boolean;
}
