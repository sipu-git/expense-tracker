// src/pages/auth/LoginPage.tsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ArrowRight, LogIn } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { LoginFormData, loginSchema } from "@/validations/login.validate";
import { clearError, loginUser, viewProfile } from "@/store/slices/userSlices/user.slice";
import AuthLayout from "./AuthLayout";
import { zodResolver } from "@hookform/resolvers/zod";
// import { addAccount } from "@/store/slices/accountSlices/account.slice";

interface FieldProps {
    label: string;
    id: string;
    type?: string;
    placeholder?: string;
    defaultValue?: string;
    error?: string;
    registration: object;
    suffix?: React.ReactNode;
}

function Field({ label, id, type = "text", defaultValue, placeholder, error, registration, suffix }: FieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={id}
                className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none"
            >
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    defaultValue={defaultValue}
                    autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : undefined}
                    {...registration}
                    className={`w-full h-11 px-4 ${suffix ? "pr-11" : ""} text-sm rounded-xl border bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all duration-200
            ${error
                            ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20"
                            : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        }`}
                />
                {suffix && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
                )}
            </div>
            {error && (
                <p role="alert" className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
                    <span
                        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold shrink-0"
                        aria-hidden="true"
                    >
                        !
                    </span>
                    {error}
                </p>
            )}
        </div>
    );
}


function Divider({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/60" />
            <span className="text-xs text-slate-400 dark:text-slate-500 select-none">{text}</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/60" />
        </div>
    );
}

export default function Login() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error: apiError } = useAppSelector((s) => s.user);
    const [showPassword, setShowPassword] = useState(false);
    const location = useLocation()
    const prefillEmail = location.state?.prefillEmail ?? "";
    const isAddNewAccount = Boolean(location.state?.addAccount);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { rememberMe: false },
        mode: "onBlur",
        reValidateMode: "onChange"
    });

    const onSubmit = async (data: LoginFormData) => {
        dispatch(clearError());

        const result = await dispatch(
            loginUser({
                email: data.email,
                password: data.password,
            })
        );

        if (loginUser.fulfilled.match(result)) {
            // // const { user, token } = result.payload;
            // dispatch(addAccount(result.payload))
            navigate("/dashboard", { replace: true });
        }
    };

    return (
        <AuthLayout>
            {/* Heading */}
            <div className="mb-7">
                <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 rounded-full px-3 py-1 mb-4">
                    <LogIn size={13} className="text-indigo-500" />
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Sign in</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Welcome back
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Sign in to continue to your dashboard
                </p>
            </div>

            {/* API error banner */}
            {apiError && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 px-4 py-3 mb-5"
                >
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-bold shrink-0 mt-0.5">!</span>
                    <p className="text-sm text-red-700 dark:text-red-300">{apiError}</p>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
                <Field
                    label="Email address"
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    defaultValue={prefillEmail}
                    error={errors.email?.message}
                    registration={register("email")}
                />

                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none"
                        >
                            Password
                        </label>
                        <Link
                            to="/send-otp"
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            {...register("password")}
                            className={`w-full h-11 px-4 pr-11 text-sm rounded-xl border bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all duration-200
                ${errors.password
                                    ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20"
                                    : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p role="alert" className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold shrink-0" aria-hidden="true">!</span>
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {/* Remember me */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            {...register("rememberMe")}
                            className="peer w-4 h-4 rounded border border-slate-300 dark:border-slate-600 appearance-none bg-white dark:bg-slate-800 checked:bg-indigo-600 checked:border-indigo-600 transition-colors cursor-pointer"
                        />
                        <svg
                            viewBox="0 0 10 8"
                            fill="none"
                            className="absolute left-0.5 top-0.5 w-3 h-3 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                        >
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Remember me for 30 days</span>
                </label>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 h-11 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Signing in…
                        </>
                    ) : (
                        <>
                            Sign in
                            <ArrowRight size={15} strokeWidth={2.5} />
                        </>
                    )}
                </button>

                {/* <Divider text="or continue with" /> */}

                {/* Google OAuth placeholder */}
                {/* <button
                    type="button"
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98]"
                >
                    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
                        <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.826.957 4.039l3.007-2.332z" fill="#FBBC05" />
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button> */}
            </form>

            {/* Footer link */}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                Don't have an account?{" "}
                <Link
                    to="/register"
                    state={isAddNewAccount ? { addAccount: true } : undefined}
                    className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                    Create one free
                </Link>
            </p>
        </AuthLayout>
    );
}