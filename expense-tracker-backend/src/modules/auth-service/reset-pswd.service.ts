import { prisma } from "../../../lib/prisma.js";
// import { verifyForgotPasswordOtp } from "./forgot-pswd.service";
import bcrypt from 'bcrypt';
import { clearAllOTPs, resetRateLimit } from "./redis/redis.util.js";

export async function resetPasswordWithToken(
  userId: string,
  email: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) throw new Error('New password must be different from the old password');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, updated_at: new Date() },
    });

    await clearAllOTPs(email);

    return { success: true, message: 'Password has been reset successfully' };
  } catch (error) {
    throw error;
  }
}