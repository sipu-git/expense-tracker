import { UserApis } from "@/services/user.service";
import { RootState } from "@/store";
import { User, UserState } from "@/types/user.types";
import { handleApiError } from "@/utils/apiError";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const INTITAL_STATES: UserState = {
    user: null,
    loading: false,
    hydrating: true,
    error: null,
    success: false,
}

export const createUser = createAsyncThunk("user/createUser", async (data: User, { rejectWithValue }) => {
    try {
        const response = await UserApis.createUser(data);
        return response.data.data;
    }
    catch (err: any) {
        return rejectWithValue(handleApiError(err))
    }
})

export const loginUser = createAsyncThunk("user/login", async (data: Partial<User>, { rejectWithValue }) => {
    try {
        const result = await UserApis.login(data);
        return result.data.data;
    } catch (error) {
        return rejectWithValue(handleApiError(error))
    }
})

export const signOutUser = createAsyncThunk("user/logout", async (_, { rejectWithValue }) => {
    try {
        const result = await UserApis.signOut();
        return result.data.data
    } catch (error) {
        return rejectWithValue(handleApiError(error))
    }
})

export const viewProfile = createAsyncThunk("user/profile", async (_, { rejectWithValue }) => {
    try {
        const result = await UserApis.getUser();
        return result.data.data;
    }
    catch (error) {
        return rejectWithValue(handleApiError(error))
    }
})


export const modifyUserProfile = createAsyncThunk("user/modifyProfile", async (data: Partial<User>, { rejectWithValue }) => {
    try {
        const response = await UserApis.modifyUser(data);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(handleApiError(error))
    }
})

const userSlice = createSlice({
    name: "user",
    initialState: INTITAL_STATES,
    reducers: {
        clearError: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false
        },
        setHydrate: (state) => {
            state.hydrating = false;
        }
    },
    extraReducers: (builder) => {
        // CREATE USER
        builder
            .addCase(createUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.success = true;
                state.error = null;
            })
            .addCase(createUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });

        // LOGIN USER
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.success = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });

        builder
            .addCase(signOutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signOutUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = null;
                state.success = true;
                state.error = null;
            })
            .addCase(signOutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });

        // VIEW PROFILE
        builder
            .addCase(viewProfile.pending, (state) => {
                state.loading = true;
                state.hydrating = true;
                state.error = null;
            })
            .addCase(viewProfile.fulfilled, (state, action) => {
                state.hydrating = false;
                state.loading = false;
                state.user = action.payload;
                state.success = true;
                state.error = null;
            })
            .addCase(viewProfile.rejected, (state, action) => {
                state.hydrating = false;
                state.loading = false;
                state.user = null;
                state.error = null;
            });

        builder
            .addCase(modifyUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(modifyUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.success = true;
                state.error = null;
            })
            .addCase(modifyUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });
    }
})
export const selectHydrating = (s: RootState) => s.user.hydrating;

export const selectIsAuthenticated = (state: { user: UserState }) => !!state.user.user;

export const { clearError, setHydrate } = userSlice.actions;
export default userSlice.reducer;