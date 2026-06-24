import { prisma } from "../../../lib/prisma.js";
import { generateOTP } from "./auth.util.js";
import { sendOtpEmail } from "../../shared/configs/nodemailer.config.js";
import { checkRateLimit, resetRateLimit, storeOtp, verfiyOtp } from "../../shared/redis/services/auth-redis.service.js";
import jwt from 'jsonwebtoken';
import { AppError } from "../../../lib/AppError.js";

export async function sendForGotPasswordOtp(email: string): Promise<string> {
    try {
        await checkRateLimit(email)
        const user = await prisma.user.findUnique({
            where: {
                email:email
            }
        })
        if (!user) {
            throw new AppError('User with this email does not exist',404);
        }
        const otp = generateOTP()
        await storeOtp(email, otp, 'FORGOT_PASSWORD')
        await sendOtpEmail({ email, otp, type: "FORGOT_PASSWORD" })
        return otp;
    } catch (error) {
        throw error;
    }
}

export async function verifyForgotPasswordOtp(email: string, otp: string): Promise<{ isValid: boolean; userId: string, resetToken: string }> {
    try {
        const verify = await verfiyOtp(email, otp, "FORGOT_PASSWORD")
        if (!verify.isValid) {
            throw new AppError('Invalid OTP',400);
        }
        const findUser = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (!findUser) {
            throw new AppError('User not found',404);
        }
        await resetRateLimit(email)

        const resetToken = jwt.sign({
            userId:findUser.id,
            email:findUser.email},process.env.JWT_SECRET as string, {expiresIn: "10m"})
        return {
            isValid: true,
            resetToken,
            userId: findUser.id
        }

    } catch (error) {
        throw error;
    }
    
}