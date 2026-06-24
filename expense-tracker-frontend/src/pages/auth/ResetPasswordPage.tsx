import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight, KeyRound, Check } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import AuthLayout from "../AuthLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { clearError, clearForgotPasswordState, resetPassword } from "@/store/slices/authSlice/authSlice";
import { removeAccount, selectActiveAccount } from "@/store/slices/accountSlices/account.slice";
import { clearUser } from "@/store/slices/userSlices/user.slice";

const resetSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[0-9]/, "Must contain at least one number"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type ResetFormData = z.infer<typeof resetSchema>;

// Password strength util
function getStrength(password: string): { score: number; label: string; color: string } {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score, label: "Weak", color: "bg-red-400" };
    if (score <= 2) return { score, label: "Fair", color: "bg-orange-400" };
    if (score <= 3) return { score, label: "Good", color: "bg-yellow-400" };
    if (score <= 4) return { score, label: "Strong", color: "bg-emerald-400" };
    return { score, label: "Very strong", color: "bg-emerald-500" };
}

const rules = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

export default function ResetPassword() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { loading, error: apiError, resetToken: reduxResetToken, step } = useAppSelector((s) => s.auth);
    const resetToken = location.state?.resetToken ?? reduxResetToken;

    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const activeAccount = useAppSelector(selectActiveAccount)
    const { register, handleSubmit, watch, formState: { errors }, } = useForm<ResetFormData>({
        resolver: zodResolver(resetSchema),
        mode: "onChange",
    });

    const watchedPassword = watch("newPassword", "");
    const strength = getStrength(watchedPassword);

    useEffect(() => {
        if (!resetToken) {
            navigate("/send-otp", { replace: true });
        }
    }, [resetToken, navigate]);

    const onSubmit = async (data: ResetFormData) => {
        if (!resetToken) return;
        dispatch(clearError());
        const result = await dispatch(
            resetPassword({ resetToken, newPassword: data.newPassword })
        );
        if (resetPassword.fulfilled.match(result)) {
            dispatch(clearForgotPasswordState());
            if (activeAccount?.id) {
                dispatch(removeAccount(activeAccount.id));
            }
            // dispatch(clearUser());
            navigate("/login", { replace: true });
        }
    };

    // Success screen
    if (step === "DONE") {
        return (
            <AuthLayout>
                <div className="flex flex-col items-center text-center gap-4 py-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center">
                        <Check size={28} className="text-emerald-500" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Password updated!
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Your password has been reset successfully.
                        </p>
                    </div>
                    <a
                        href="/login"
                        className="mt-2 h-11 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-600/20"
                    >
                        Back to sign in
                        <ArrowRight size={15} strokeWidth={2.5} />
                    </a>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            {/* Heading */}
            <div className="mb-7">
                <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 rounded-full px-3 py-1 mb-4">
                    <KeyRound size={13} className="text-indigo-500" />
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        Create new password
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Set a new password
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Choose something strong that you haven't used before.
                </p>
            </div>

            {/* API error banner */}
            {apiError && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 px-4 py-3 mb-5"
                >
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-bold shrink-0 mt-0.5">
                        !
                    </span>
                    <p className="text-sm text-red-700 dark:text-red-300">{apiError}</p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="newPassword"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none"
                    >
                        New password
                    </label>
                    <div className="relative">
                        <input
                            id="newPassword"
                            type={showNew ? "text" : "password"}
                            placeholder="Enter new password"
                            autoComplete="new-password"
                            {...register("newPassword")}
                            className={`w-full h-11 px-4 pr-11 text-sm rounded-xl border bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all duration-200
                                ${errors.newPassword
                                    ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20"
                                    : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew((v) => !v)}
                            aria-label={showNew ? "Hide password" : "Show password"}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                    </div>

                    {/* Strength bar */}
                    {watchedPassword.length > 0 && (
                        <div className="flex flex-col gap-1.5 mt-1">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score
                                                ? strength.color
                                                : "bg-slate-200 dark:bg-slate-700"
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Strength:{" "}
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {strength.label}
                                </span>
                            </p>
                        </div>
                    )}

                    {errors.newPassword && (
                        <p role="alert" className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold shrink-0">
                                !
                            </span>
                            {errors.newPassword.message}
                        </p>
                    )}
                </div>

                {/* Password rules checklist */}
                <div className="flex flex-col gap-1.5 -mt-1">
                    {rules.map((rule) => {
                        const passed = rule.test(watchedPassword);
                        return (
                            <div key={rule.label} className="flex items-center gap-2">
                                <span
                                    className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold transition-colors ${passed
                                            ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                                        }`}
                                >
                                    {passed ? "✓" : "·"}
                                </span>
                                <span
                                    className={`text-xs transition-colors ${passed
                                            ? "text-emerald-600 dark:text-emerald-400"
                                            : "text-slate-400 dark:text-slate-500"
                                        }`}
                                >
                                    {rule.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none"
                    >
                        Confirm password
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            type={showConfirm ? "text" : "password"}
                            placeholder="Re-enter new password"
                            autoComplete="new-password"
                            {...register("confirmPassword")}
                            className={`w-full h-11 px-4 pr-11 text-sm rounded-xl border bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all duration-200
                                ${errors.confirmPassword
                                    ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20"
                                    : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            aria-label={showConfirm ? "Hide password" : "Show password"}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p role="alert" className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold shrink-0">
                                !
                            </span>
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 h-11 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Updating password…
                        </>
                    ) : (
                        <>
                            Update password
                            <ArrowRight size={15} strokeWidth={2.5} />
                        </>
                    )}
                </button>
            </form>
        </AuthLayout>
    );
}