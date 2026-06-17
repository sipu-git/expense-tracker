export interface SendOtpPayload{
    email:string;
}

export interface VerifyOtpProp{
    email:string;
    otp:string;
}

export interface ResetPasswordProp{
    resetToken:string;
    newPassword:string;
}

export interface AuthState{
    loading: boolean;
    error: string | null;
    success: boolean;
    step:'EMAIL' | 'OTP' | 'RESET' | 'DONE';
    resetToken:string | null;
    email:string | null;
}