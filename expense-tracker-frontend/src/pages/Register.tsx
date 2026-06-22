// src/pages/auth/RegisterPage.tsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ArrowRight, UserPlus, Check } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { RegisterFormData, registerSchema } from "@/validations/register.validate";
import { clearError, createUser } from "@/store/slices/userSlices/user.slice";
import AuthLayout from "./AuthLayout";
import { zodResolver } from "@hookform/resolvers/zod";

interface StrengthResult {
    score: number; // 0-4
    label: string;
    color: string;
    bg: string;
}

function getStrength(pw: string): StrengthResult {
    if (!pw) return { score: 0, label: "", color: "", bg: "" };
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;

    const levels: StrengthResult[] = [
        { score: 0, label: "", color: "", bg: "" },
        { score: 1, label: "Weak", color: "#EF4444", bg: "bg-red-500" },
        { score: 2, label: "Fair", color: "#F59E0B", bg: "bg-amber-500" },
        { score: 3, label: "Good", color: "#3B82F6", bg: "bg-blue-500" },
        { score: 4, label: "Strong", color: "#10B981", bg: "bg-emerald-500" },
    ];
    return levels[s];
}

interface FieldProps {
    label: string;
    id: string;
    type?: string;
    placeholder?: string;
    error?: string;
    registration: object;
    suffix?: React.ReactNode;
    autoComplete?: string;
}

function Field({
    label, id, type = "text", placeholder, error,
    registration, suffix, autoComplete,
}: FieldProps) {
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
                    autoComplete={autoComplete}
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

// ── Password rules checklist ───────────────────────────────────────────────────

const pwRules = [
    { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
    { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
    { label: "One number", test: (v: string) => /[0-9]/.test(v) },
    { label: "One special character", test: (v: string) => /[^a-zA-Z0-9]/.test(v) },
];

function PasswordRules({ value }: { value: string }) {
    if (!value) return null;
    return (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-1">
            {pwRules.map(({ label, test }) => {
                const passed = test(value);
                return (
                    <li key={label} className="flex items-center gap-1.5">
                        <span
                            className={`inline-flex items-center justify-center w-4 h-4 rounded-full shrink-0 transition-colors ${passed
                                ? "bg-emerald-500/15 text-emerald-500"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                }`}
                        >
                            <Check size={9} strokeWidth={3} />
                        </span>
                        <span
                            className={`text-[11px] transition-colors ${passed
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-400 dark:text-slate-500"
                                }`}
                        >
                            {label}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}

// ── RegisterPage ───────────────────────────────────────────────────────────────

export default function Register() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error: apiError } = useAppSelector((s) => s.user);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const location = useLocation();
    const isAddingAccount = Boolean(location.state?.addAccount);

    const { register, handleSubmit, watch, formState: { errors }, } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        mode: "onBlur",
        reValidateMode: "onChange"
    });

    const passwordValue = watch("password", "");
    const strength = getStrength(passwordValue);

    const onSubmit = async (data: RegisterFormData) => {
        dispatch(clearError());
        console.log("form error:", apiError)
        const result = await dispatch(
            createUser({
                full_name: data.full_name,
                phone: data.phone,
                email: data.email,
                password: data.password,
            } as any));
        if (createUser.fulfilled.match(result)) {
            navigate("/login", {
                replace: true,
                state: {
                    registered: true,
                    ...(isAddingAccount && { addAccount: true }),
                },
            });
        }
    };

    return (
        <AuthLayout>
            {/* Heading */}
            <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 rounded-full px-3 py-1 mb-4">
                    <UserPlus size={13} className="text-indigo-500" />
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">New account</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Start tracking for free
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Set up your account in under a minute
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
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">

                {/* Full name */}
                <Field
                    label="Full name"
                    id="fullName"
                    placeholder="Jane Smith"
                    autoComplete="fullName"
                    error={errors.full_name?.message}
                    registration={register("full_name")}
                />

                {/* Email */}
                <Field
                    label="Email address"
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={errors.email?.message}
                    registration={register("email")}
                />
                <Field
                    label="Phone Number"
                    id="phone"
                    type="text"
                    placeholder="873 2134 520"
                    autoComplete="phone"
                    error={errors.phone?.message}
                    registration={register("phone")}
                />

                {/* Password + strength */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="password"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Min. 8 characters"
                            autoComplete="new-password"
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

                    {/* Strength bar */}
                    {passwordValue && (
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex gap-1 flex-1">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="h-1 flex-1 rounded-full transition-all duration-300"
                                        style={{
                                            backgroundColor:
                                                strength.score >= i ? strength.color : "rgb(226 232 240)",
                                        }}
                                    />
                                ))}
                            </div>
                            <span
                                className="text-[11px] font-semibold min-w-[40px] text-right transition-colors"
                                style={{ color: strength.color }}
                            >
                                {strength.label}
                            </span>
                        </div>
                    )}

                    {/* Rules checklist */}
                    <PasswordRules value={passwordValue} />

                    {errors.password && (
                        <p role="alert" className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold shrink-0">!</span>
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {/* Confirm password */}
                <Field
                    label="Confirm password"
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    error={errors.confirmPassword?.message}
                    registration={register("confirmPassword")}
                    suffix={
                        <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            aria-label={showConfirm ? "Hide password" : "Show password"}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                    }
                />

                {/* Terms */}
                <div className="flex flex-col gap-1">
                    <label className="flex items-start gap-3 cursor-pointer select-none group">
                        <div className="relative mt-0.5 shrink-0 flex items-center">
                            <input
                                type="checkbox"
                                {...register("acceptTerms")}
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
                        <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            I agree to Expenzo's{" "}
                            <Link to="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                                Privacy Policy
                            </Link>
                        </span>
                    </label>
                    {errors.acceptTerms && (
                        <p role="alert" className="text-xs text-red-500 dark:text-red-400 ml-7">
                            {errors.acceptTerms.message}
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
                            Creating account…
                        </>
                    ) : (
                        <>
                            Create account
                            <ArrowRight size={15} strokeWidth={2.5} />
                        </>
                    )}
                </button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
                Already have an account?{" "}
                <Link
                    to="/login"
                    state={isAddingAccount ? { addAccount: true } : undefined}
                    className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
}