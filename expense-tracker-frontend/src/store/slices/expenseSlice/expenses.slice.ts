import { expenseApis } from "@/services/expenses.service";
import { Expense, ExpenseStates } from "@/types/expense.type";
import { handleApiError } from "@/utils/apiError";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

const initialStates: ExpenseStates = {
    expenses: [],
    loading: false,
    error: null,
    success: false,
};

// Async Thunks
export const addExpense = createAsyncThunk(
    "expenses/add",
    async (data: Partial<Expense>, { rejectWithValue, getState }) => {
        try {
            const response = await expenseApis.addExpense(data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const viewExpenses = createAsyncThunk(
    "expenses/viewAll",
    async (_, { rejectWithValue, getState }) => {
        try {
            const response = await expenseApis.viewExpenses();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const viewExpense = createAsyncThunk(
    "expenses/viewById",
    async (expenseId: string, { rejectWithValue, getState }) => {
        try {
            const response = await expenseApis.viewExpense(expenseId);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const updateExpense = createAsyncThunk(
    "expenses/update",
    async (
        { expenseId, data }: { expenseId: string; data: Partial<Expense> },
        { rejectWithValue, getState }
    ) => {
        try {
            const response = await expenseApis.updateExpense(expenseId, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const deleteExpense = createAsyncThunk(
    "expenses/delete",
    async (expenseId: string, { rejectWithValue, getState }) => {
        try {
            await expenseApis.deleteExpense(expenseId);
            return expenseId;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const deleteAllExpenses = createAsyncThunk("expenses/removeAll", async (_, { rejectWithValue, getState }) => {
    try {
        const response = await expenseApis.removeAllExpense();
        return response.data.data;
    } catch (error) {
        return rejectWithValue(handleApiError(error));
    }
})

export const filterExpense = createAsyncThunk(
    "expenses/filter",
    async (_, { rejectWithValue, getState }) => {
        try {
            const response = await expenseApis.filterExpense("month", undefined);
            return response.data.data;
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
    },
    extraReducers: (builder) => {
        // Add Expense
        builder
            .addCase(addExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(addExpense.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses.push(action.payload);
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
                state.loading = false;
                state.expenses = action.payload;
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
                const existingIndex = state.expenses.findIndex(
                    (e) => e.id === action.payload.id
                );
                if (existingIndex > -1) {
                    state.expenses[existingIndex] = action.payload;
                } else {
                    state.expenses.push(action.payload);
                }
                state.error = null;
            })
            .addCase(viewExpense.rejected, (state, action) => {
                state.loading = false;
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
                const index = state.expenses.findIndex(
                    (e) => e.id === action.payload.id
                );
                if (index > -1) {
                    state.expenses[index] = action.payload;
                }
                state.success = true;
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
                    (e) => e.id !== action.payload
                );
                state.success = true;
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
                state.expenses = action.payload;
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
                state.loading = false;
                state.expenses = action.payload;
                state.error = null;
            })
            .addCase(filterExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearSuccess, resetExpenseState } = expenseSlice.actions;
export default expenseSlice.reducer;
