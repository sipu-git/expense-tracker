import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });

interface SendOtpEmailProps {
  email: string;
  otp: string;
  type: "FORGOT_PASSWORD" | "CHANGE_PASSWORD";
}

export async function sendOtpEmail({
  email,
  otp,
  type,
}: SendOtpEmailProps): Promise<boolean> {
  try {
    const subject =
      type === "FORGOT_PASSWORD"
        ? "Password Reset OTP - Expense Tracking System"
        : "Change Password OTP - Expense Tracking System";

    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent: getEmailTemplate(otp, type),
      sender: {
        name: "Expense Tracker",
        email: process.env.BREVO_SENDER_EMAIL!,
      },
      to: [{ email }],
    });

    console.log(`OTP email sent to ${email}, messageId: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
}

export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await brevo.account.getAccount();
    console.log("Email connection verified successfully");
    return true;
  } catch (error) {
    console.error("Email connection verification failed:", error);
    return false;
  }
}

function getEmailTemplate(
  otp: string,
  type: "FORGOT_PASSWORD" | "CHANGE_PASSWORD"
): string {
  const title =
    type === "FORGOT_PASSWORD" ? "Reset Your Password" : "Change Your Password";
  const message =
    type === "FORGOT_PASSWORD"
      ? "You requested to reset your password. Use the OTP below:"
      : "You requested to change your password. Use the OTP below:";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { background-color: #ffffff; margin: 20px auto; padding: 30px; max-width: 500px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; color: #2c3e50; }
          .content { color: #555; line-height: 1.6; margin-bottom: 20px; }
          .otp-box { background-color: #f8f9fa; border: 2px solid #3498db; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #3498db; letter-spacing: 5px; margin: 0; }
          .expiry { color: #e74c3c; font-size: 14px; margin-top: 10px; }
          .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; font-size: 13px; color: #856404; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>${title}</h1></div>
          <div class="content">
            <p>Hello,</p>
            <p>${message}</p>
          </div>
          <div class="otp-box">
            <p class="otp-code">${otp}</p>
            <p class="expiry">This OTP will expire in 10 minutes</p>
          </div>
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone.
            We will never ask you for this code via email or phone.
          </div>
          <div class="content">
            <p>If you did not request this ${type === "FORGOT_PASSWORD" ? "password reset" : "password change"}, please ignore this email.</p>
            <p>Best regards,<br />Expense Tracker Support Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply.</p>
            <p>&copy; 2024 Expense Tracker. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>`;
}