import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Mail } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import AuthLayout from "../AuthLayout";
import { clearError, sendForgotPasswordOtp } from "@/store/slices/authSlice/authSlice";
import { useNavigate } from "react-router-dom";

const emailSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type EmailFormData = z.infer<typeof emailSchema>;

export default function ForgotPasswordEmail() {
    const dispatch = useAppDispatch();
    const { loading, error: apiError } = useAppSelector((s) => s.auth);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema),
        mode: "onBlur",
        reValidateMode: "onChange",
    });

    const onSubmit = async (data: EmailFormData) => {
        dispatch(clearError());
        const result = await dispatch(sendForgotPasswordOtp({ email: data.email }));
            console.log("result:", result); // ← add this to see what comes back
        if (sendForgotPasswordOtp.fulfilled.match(result)) {
            navigate("/verify-otp", { replace: true });
        }
    };

    return (
        <AuthLayout>
            {/* Heading */}
            <div className="mb-7">
                <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 rounded-full px-3 py-1 mb-4">
                    <Mail size={13} className="text-indigo-500" />
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        Password Recovery
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Forgot your password?
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Enter your registered email and we'll send you a verification code.
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

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="email"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none"
                    >
                        Email address
                    </label>
                    <div className="relative">
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            {...register("email")}
                            className={`w-full h-11 px-4 text-sm rounded-xl border bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all duration-200
                                ${errors.email
                                    ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20"
                                    : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                }`}
                        />
                    </div>
                    {errors.email && (
                        <p role="alert" className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold shrink-0">
                                !
                            </span>
                            {errors.email.message}
                        </p>
                    )}
                </div>

                {/* Info note */}
                <div className="flex items-start gap-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl px-4 py-3">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold shrink-0 mt-0.5">
                        i
                    </span>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                        A 6-digit OTP will be sent to your email. It expires in <span className="font-semibold">10 minutes</span>.
                    </p>
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
                            Sending OTP…
                        </>
                    ) : (
                        <>
                            Send OTP
                            <ArrowRight size={15} strokeWidth={2.5} />
                        </>
                    )}
                </button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                Remembered your password?{" "}
                <a
                    href="/login"
                    className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                    Back to sign in
                </a>
            </p>
        </AuthLayout>
    );
}