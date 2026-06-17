import { prisma } from "../../../lib/prisma.js";
import { generateOTP } from "./auth.util.js";
import { sendOtpEmail } from "../../shared/configs/nodemailer.config.js";
import { checkRateLimit, resetRateLimit, storeOtp, verfiyOtp } from "./redis/redis.util.js";
import jwt from 'jsonwebtoken';

export async function sendForGotPasswordOtp(email: string): Promise<string> {
    try {
        await checkRateLimit(email)
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (!user) {
            throw new Error('User with this email does not exist');
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
            throw new Error('Invalid OTP');
        }
        const findUser = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (!findUser) {
            throw new Error('User not found');
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