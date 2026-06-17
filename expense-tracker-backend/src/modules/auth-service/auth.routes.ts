import express from 'express'
import { resetPasswordWithOtpController, sendForgotOtp, verifyForgotPasswordOtpController } from './auth.controller';
import { resetTokenMiddleware } from '../../shared/middlewares/resetToken.middleware';

const router = express.Router()

router.post("/forgot-password/send-otp", sendForgotOtp);
router.post("/forgot-password/verify-otp", verifyForgotPasswordOtpController);
router.patch("/forgot-password/reset-password",resetTokenMiddleware, resetPasswordWithOtpController);

export default router;