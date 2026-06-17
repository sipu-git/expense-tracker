import { Request, Response } from "express";
import { ChangePasswordRequestSchema, ResetPasswordSchema, VerifyChangePasswordOtpSchema } from "./auth.validation";
import { sendForGotPasswordOtp, verifyForgotPasswordOtp } from "./forgot-pswd.service";
import { errorResponse, successResponse } from "../../shared/util/ApiResponses";
import { resetPasswordWithToken } from "./reset-pswd.service";

export const sendForgotOtp = async (req: Request, res: Response) => {
    const parsed = ChangePasswordRequestSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({
            success: false, message: "Validation failed", errors: parsed.error.format()
        });
    }
    const infos = parsed.data;
    const response = await sendForGotPasswordOtp(infos.email)
    return res.status(201).json(successResponse("OTP sent successfully to registered email!", response))
}

export async function verifyForgotPasswordOtpController(req: Request, res: Response) {
    const parsed = VerifyChangePasswordOtpSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({
            success: false, message: "Validation failed", errors: parsed.error.format()
        });
    }
    const infos = parsed.data;

    const result = await verifyForgotPasswordOtp(infos.email, infos.otp);

    res.status(200).json(successResponse("password verified successfully!", result));
}

export async function resetPasswordWithOtpController(req: Request, res: Response): Promise<void> {
    const { newPassword } = req.body;
    if (!newPassword) {
        res.status(400).json(errorResponse('Reset token and new password are required'));
        return;
    }

    if (newPassword.length < 8) {
        res.status(400).json({
            success: false,
            message: 'New password must be at least 8 characters long',
        });
        return;
    }
    const { userId, email } = req.resetUser!;

    const result = await resetPasswordWithToken(userId, email, newPassword);

    res.status(200).json(successResponse("password reset successfully!", result));
}
