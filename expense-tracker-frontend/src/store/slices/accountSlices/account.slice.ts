// src/store/slices/accountSlices/account.slice.ts
import { RootState } from "@/store";
import { User } from "@/types/user.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { loginUser, viewProfile } from "../userSlices/user.slice";

interface AccountEntry {
    id: string;
    user: User;
    token: string;
}

interface AccountsState {
    accounts: AccountEntry[];
    activeAccountId: string | null;
}

const INITIAL_STATE: AccountsState = {
    accounts: [],
    activeAccountId: null,
};

const accountsSlice = createSlice({
    name: "accounts",
    initialState: INITIAL_STATE,
    reducers: {
        addAccount: (state, action: PayloadAction<User>) => {
            const user = action.payload;
            const id = user.id;
            const exists = state.accounts.find(a => a.id === id);

            if (exists) {
                // refresh user data on re-login
                exists.user = user;
                state.activeAccountId = id;
                return;
            }

            state.accounts.push({ id, user, token: '' });
            state.activeAccountId = id;
        },

        switchAccount: (state, action: PayloadAction<string>) => {
            state.activeAccountId = action.payload;
        },

        removeAccount: (state, action: PayloadAction<string>) => {
            state.accounts = state.accounts.filter(a => a.id !== action.payload);
            if (state.activeAccountId === action.payload) {
                state.activeAccountId = state.accounts[0]?.id ?? null;
            }
        },

        updateAccountUser: (state, action: PayloadAction<User>) => {
            const account = state.accounts.find(a => a.id === action.payload.id);
            if (account) account.user = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loginUser.fulfilled, (state, action) => {
            const { findUser: user, token } = action.payload;
            const id = user.id;
            const exists = state.accounts.find(a => a.id === id);

            if (exists) {
                exists.user = user;
                exists.token = token;
                state.activeAccountId = id;
            } else {
                state.accounts.push({ id, user, token });
                state.activeAccountId = id;
            }
        });
        builder.addCase(viewProfile.fulfilled, (state, action) => {
        const user = action.payload?.findUser ?? action.payload;
        if (!user?.id) return;
        const account = state.accounts.find(a => a.id === user.id);
        if (account) {
            account.user = user; // update user data only, don't touch activeAccountId
        }
    });
    },
});

export const { addAccount, switchAccount, removeAccount, updateAccountUser } = accountsSlice.actions;
export default accountsSlice.reducer;

// Selectors
export const selectAllAccounts = (state: RootState) => (state.accounts as unknown as AccountsState).accounts;

export const selectActiveAccountId = (state: RootState) => (state.accounts as unknown as AccountsState).activeAccountId;
export const selectActiveAccount = (state: RootState) => {
    const accounts = state.accounts as unknown as AccountsState;
    return accounts.accounts.find(a => a.id === accounts.activeAccountId) ?? null;
}
