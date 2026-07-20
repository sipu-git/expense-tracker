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

export interface ExtractedReceiptData {
    name: string | null;
    amount: number | null;
    quantity: string | null;
    bought_at: string | null;
    type: ExpenseTypes | null;
    confidence: "high" | "medium" | "low";
}
export interface ExtractReceiptResponse {
    success: boolean;
    receiptKey: string;
    receiptUrl: string;
    extractedData: ExtractedReceiptData | null;
    extractionFailed: boolean;
}
export interface ExpenseStates {
    expenses: Expense[];
    activeAccountId: string | null;
    expenseDetail: Expense | null;
    suggestCategory: string | null;
    categoryLoading: boolean;
    loading: boolean;
    receiptExtraction: {
        loading: boolean;
        error: string | null;
        extractedData: ExtractedReceiptData | null;
        receiptKey: string | null;
        receiptUrl: string | null;
        extractionFailed: boolean;
    };
    error: string | null;
    success: boolean;
}
