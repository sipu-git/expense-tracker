import React, { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { ShieldCheck, ArrowRight, RotateCcw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import AuthLayout from "../AuthLayout";
import { clearError, sendForgotPasswordOtp, verifyForgotPasswordOtp } from "@/store/slices/authSlice/authSlice";
import { useNavigate } from "react-router-dom";

const OTP_LENGTH = 6;

export default function VerifyPasswordOtp() {
    const dispatch = useAppDispatch();
    const { loading, error: apiError, email } = useAppSelector((s) => s.auth);

    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [resendCooldown, setResendCooldown] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const navigate = useNavigate()
    // Countdown timer for resend
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const focusAt = (index: number) => {
        inputRefs.current[index]?.focus();
    };

    const handleChange = (index: number, value: string) => {
        // Only allow single digit
        const digit = value.replace(/\D/g, "").slice(-1);
        const newDigits = [...digits];
        newDigits[index] = digit;
        setDigits(newDigits);

        // Auto-advance to next
        if (digit && index < OTP_LENGTH - 1) {
            focusAt(index + 1);
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (digits[index]) {
                const newDigits = [...digits];
                newDigits[index] = "";
                setDigits(newDigits);
            } else if (index > 0) {
                focusAt(index - 1);
            }
        }
        if (e.key === "ArrowLeft" && index > 0) focusAt(index - 1);
        if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) focusAt(index + 1);
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (!pasted) return;
        const newDigits = [...digits];
        pasted.split("").forEach((char, i) => {
            newDigits[i] = char;
        });
        setDigits(newDigits);
        // Focus last filled or last box
        const lastIndex = Math.min(pasted.length, OTP_LENGTH - 1);
        focusAt(lastIndex);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otp = digits.join("");
        if (otp.length < OTP_LENGTH) return;
        dispatch(clearError());
        const result = await dispatch(verifyForgotPasswordOtp({ email: email!, otp }));
        if (verifyForgotPasswordOtp.fulfilled.match(result)) {
            navigate("/reset-new-password", { replace: true });
        }

    };

    const handleResend = () => {
        if (resendCooldown > 0 || !email) return;
        dispatch(clearError());
        dispatch(sendForgotPasswordOtp({ email }));
        setDigits(Array(OTP_LENGTH).fill(""));
        setResendCooldown(60);
        focusAt(0);
    };

    const isComplete = digits.every((d) => d !== "");

    return (
        <AuthLayout>
            {/* Heading */}
            <div className="mb-7">
                <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 rounded-full px-3 py-1 mb-4">
                    <ShieldCheck size={13} className="text-indigo-500" />
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        Verify your identity
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Enter verification code
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    We sent a 6-digit code to{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span>
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

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                {/* OTP boxes */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
                        Verification code
                    </label>
                    <div className="flex items-center gap-2 justify-between">
                        {digits.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                onFocus={(e) => e.target.select()}
                                aria-label={`Digit ${index + 1}`}
                                className={`w-12 h-12 text-center text-lg font-semibold rounded-xl border bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 outline-none transition-all duration-200 caret-transparent
                                    ${digit
                                        ? "border-indigo-500 ring-2 ring-indigo-500/20 dark:border-indigo-400"
                                        : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    }
                                    ${apiError ? "border-red-400 dark:border-red-500" : ""}
                                `}
                            />
                        ))}
                    </div>
                </div>

                {/* Expiry note */}
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center -mt-2">
                    Code expires in <span className="font-medium text-slate-600 dark:text-slate-400">10 minutes</span>
                </p>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading || !isComplete}
                    className="h-11 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Verifying…
                        </>
                    ) : (
                        <>
                            Verify code
                            <ArrowRight size={15} strokeWidth={2.5} />
                        </>
                    )}
                </button>

                {/* Resend */}
                <div className="flex items-center justify-center gap-1.5">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Didn't receive the code?
                    </span>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendCooldown > 0 || loading}
                        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                    >
                        <RotateCcw size={13} />
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
                    </button>
                </div>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                Wrong email?{" "}
                <a
                    href="/send-otp"
                    className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                    Go back
                </a>
            </p>
        </AuthLayout>
    );
}