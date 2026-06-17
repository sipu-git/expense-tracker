import { authApis } from "@/services/auth.service";
import { AuthState, ResetPasswordProp, SendOtpPayload, VerifyOtpProp } from "@/types/auth.types";
import { handleApiError } from "@/utils/apiError";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const INITIAL_STATE: AuthState = {
    loading: false,
    error: null,
    success: false,
    step: 'EMAIL',
    resetToken: null,
    email: null,
}

export const sendForgotPasswordOtp = createAsyncThunk(
    "forgotPassword/sendOtp",
    async (data: SendOtpPayload, { rejectWithValue }) => {
        try {
            const response = await authApis.sendOtp(data);
            return { email: data.email, ...response.data };
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
)

// STEP 2 — Verify OTP
export const verifyForgotPasswordOtp = createAsyncThunk(
    "forgotPassword/verifyOtp",
    async (data: VerifyOtpProp, { rejectWithValue }) => {
        try {
            const response = await authApis.verifyOtp(data);
            return response.data.data; // { isValid: true, resetToken: "..." }
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
)

// STEP 3 — Reset Password
export const resetPassword = createAsyncThunk(
    "forgotPassword/resetPassword",
    async (data: ResetPasswordProp, { rejectWithValue }) => {
        try {
            const response = await authApis.resetPassword(
                { resetToken: data.resetToken, password: data.newPassword }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
)

const authSlice = createSlice({
    name: "auth",
    initialState: INITIAL_STATE,
    reducers: {
        clearForgotPasswordState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.step = 'EMAIL';
            state.resetToken = null;
            state.email = null;
        },
        clearError: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendForgotPasswordOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(sendForgotPasswordOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.success = true;
                state.step = 'OTP';
                state.email = action.payload.email;
                // state.resetToken = action.payload.resetToken;
            })
            .addCase(sendForgotPasswordOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });

        builder
            .addCase(verifyForgotPasswordOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(verifyForgotPasswordOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.success = true;
                state.step = 'RESET';
                state.resetToken = action.payload.resetToken;
            })
            .addCase(verifyForgotPasswordOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });

        builder
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.resetToken=null;
                state.step='DONE';
                state.success = true;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });
    },
});


export const { clearForgotPasswordState, clearError } = authSlice.actions;
export default authSlice.reducer;