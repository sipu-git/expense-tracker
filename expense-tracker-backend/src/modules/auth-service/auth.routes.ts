import express from 'express'
import { resetPasswordWithOtpController, sendForgotOtp, verifyForgotPasswordOtpController } from './auth.controller.js';
import { resetTokenMiddleware } from '../../shared/middlewares/resetToken.middleware.js';
import { asyncHandler } from '../../shared/middlewares/asyncHandler.middleware.js';

const router = express.Router()

router.post("/forgot-password/send-otp", asyncHandler(sendForgotOtp));
router.post("/forgot-password/verify-otp", asyncHandler(verifyForgotPasswordOtpController));
router.patch("/forgot-password/reset-password", resetTokenMiddleware, asyncHandler(resetPasswordWithOtpController));

export default router;