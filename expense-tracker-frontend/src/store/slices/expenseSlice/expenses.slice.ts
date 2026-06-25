import { expenseApis } from "@/services/expenses.service";
import { Expense, ExpenseStates } from "@/types/expense.type";
import { handleApiError } from "@/utils/apiError";
// import { setActiveApiAccountId } from "@/utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { switchAccount } from "../accountSlices/account.slice";

const initialStates: ExpenseStates = {
    expenses: [],
    activeAccountId: null,
    expenseDetail: null,
    suggestCategory: null,
    categoryLoading: false,
    loading: false,
    error: null,
    success: false,
};

export const suggestExpenseCategory = createAsyncThunk(
    "expense/suggestCategory",
    async ({ name, amount }: { name: string; amount: number }, { rejectWithValue }) => {
        try {
            const res = await fetch("/api/automation/suggest-category", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name, amount }),
            }); const data = await res.json();
            if (!data.success) throw new Error(data.message);
            return data.type as string;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const addExpense = createAsyncThunk(
    "expenses/add",
    async (data: Partial<Expense>, { rejectWithValue, getState }) => {
        try {
            // const accountId = selectActiveAccountId(getState());
            // setActiveApiAccountId(accountId);
            const response = await expenseApis.addExpense(data);
            return { data: response.data.data };
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const viewExpenses = createAsyncThunk(
    "expenses/viewAll",
    async (_, { rejectWithValue, getState }) => {
        try {
            // const accountId = selectActiveAccountId(getState());
            // setActiveApiAccountId(accountId);
            const response = await expenseApis.viewExpenses();
            return { data: response.data.data };
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const viewExpense = createAsyncThunk(
    "expenses/viewById",
    async (expenseId: string, { rejectWithValue, getState }) => {
        try {
            // const accountId = selectActiveAccountId(getState());
            // setActiveApiAccountId(accountId);
            const response = await expenseApis.viewExpense(expenseId);
            return { data: response.data.data };
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const updateExpense = createAsyncThunk(
    "expenses/update",
    async (
        { expenseId, data }: { expenseId: string; data: Partial<Expense> },
        { rejectWithValue }
    ) => {
        try {
            const response = await expenseApis.updateExpense(expenseId, data);
            return { data: response.data.data };
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    });

export const deleteExpense = createAsyncThunk(
    "expenses/delete",
    async (expenseId: string, { rejectWithValue, getState }) => {
        try {
            // const accountId = selectActiveAccountId(getState());
            // setActiveApiAccountId(accountId);
            await expenseApis.deleteExpense(expenseId);
            return { expenseId };
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const deleteAllExpenses = createAsyncThunk("expenses/removeAll", async (_, { rejectWithValue, getState }) => {
    try {
        // const accountId = selectActiveAccountId(getState());
        // setActiveApiAccountId(accountId);
        const response = await expenseApis.removeAllExpense();
        return { data: response.data.data };
    } catch (error) {
        return rejectWithValue(handleApiError(error));
    }
})

export const filterExpense = createAsyncThunk(
    "expenses/filter",
    async (_, { rejectWithValue, getState }) => {
        try {
            // const accountId = selectActiveAccountId(getState());
            // setActiveApiAccountId(accountId);
            const response = await expenseApis.filterExpense("month");
            return { data: response.data.data, };
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

// Slice
export const expenseSlice = createSlice({
    name: "expense",
    initialState: initialStates,
    reducers: {
        clearError: (state) => {
            state.error = null;
            state.loading = false;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        resetExpenseState: (state) => {
            return initialStates;
        },
        clearSuggestion: (state) => {
            state.suggestCategory = null;
            state.categoryLoading = false;
        },
        clearExpenseDetail: (state) => {
            state.expenseDetail = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(suggestExpenseCategory.pending, (state) => {
                state.categoryLoading = true;
                state.suggestCategory = null;
            })
            .addCase(suggestExpenseCategory.fulfilled, (state, action) => {
                state.categoryLoading = false;
                state.suggestCategory = action.payload;
            })
            .addCase(suggestExpenseCategory.rejected, (state) => {
                state.categoryLoading = false;
                state.suggestCategory = null;   // silent fail — user picks manually
            });

        builder
            .addCase(switchAccount, (state, action) => {
                state.expenses = [];
                state.activeAccountId = action.payload;
                state.loading = false;
                state.error = null;
            })
        // Add Expense
        builder
            .addCase(addExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(addExpense.fulfilled, (state, action) => {
                // if (!isCurrentAccount(state, action.payload.accountId)) return;
                state.loading = false;
                // state.activeAccountId = action.payload.accountId;
                state.expenses.push(action.payload.data);
                state.success = true;
                state.error = null;
            })
            .addCase(addExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });

        // View All Expenses
        builder
            .addCase(viewExpenses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(viewExpenses.fulfilled, (state, action) => {
                // if (!isCurrentAccount(state, action.payload.accountId)) return;
                state.loading = false;
                // state.activeAccountId = action.payload.accountId;
                state.expenses = action.payload.data;
                state.error = null;
            })
            .addCase(viewExpenses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // View Single Expense
        builder
            .addCase(viewExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(viewExpense.fulfilled, (state, action) => {
                state.loading = false;
                state.expenseDetail = action.payload.data;
                const idx = state.expenses.findIndex(
                    (e) => e.id === action.payload.data.id
                );
                if (idx > -1) {
                    state.expenses[idx] = action.payload.data;
                } state.error = null;
            })
            .addCase(viewExpense.rejected, (state, action) => {
                state.loading = false;
                state.expenseDetail = null;
                state.error = action.payload as string;
            });

        // Update Expense
        builder
            .addCase(updateExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateExpense.fulfilled, (state, action) => {
                state.loading = false;
                const idx = state.expenses.findIndex(
                    (e) => e.id === action.payload.data.id
                );
                if (idx > -1) {
                    state.expenses[idx] = action.payload.data;
                }
                if (state.expenseDetail?.id === action.payload.data.id) {
                    state.expenseDetail = action.payload.data;
                } state.success = true;
                state.error = null;
            })
            .addCase(updateExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });

        // Delete Expense
        builder
            .addCase(deleteExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(deleteExpense.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses = state.expenses.filter(
                    (e) => e.id !== action.payload.expenseId
                );
                if (state.expenseDetail?.id === action.payload.expenseId) {
                    state.expenseDetail = null;
                } state.success = true;
                state.error = null;
            })
            .addCase(deleteExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });

        builder
            .addCase(deleteAllExpenses.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(deleteAllExpenses.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.expenseDetail = null;
                state.expenses = action.payload.data;
                state.error = null;
            })
            .addCase(deleteAllExpenses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });

        // Filter Expenses
        builder
            .addCase(filterExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(filterExpense.fulfilled, (state, action) => {
                // if (!isCurrentAccount(state, action.payload.accountId)) return;
                state.loading = false;
                // state.activeAccountId = action.payload.accountId;
                state.expenses = action.payload.data;
                state.error = null;
            })
            .addCase(filterExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearSuccess,
    resetExpenseState, clearSuggestion, clearExpenseDetail } = expenseSlice.actions;
export default expenseSlice.reducer;
