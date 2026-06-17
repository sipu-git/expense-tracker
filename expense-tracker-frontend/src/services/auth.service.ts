import { api } from "@/utils/api"

const subUrl = '/auth/forgot-password'
export const authApis = {
    sendOtp: (data: { email: string }) => api.post(`${subUrl}/send-otp`, data),
    verifyOtp: (data: { email: string, otp: string }) => api.post(`${subUrl}/verify-otp`, data),
    resetPassword: (data: { resetToken: string; password: string }) =>
        api.patch(`${subUrl}/reset-password`,
            { newPassword: data.password },
            {
                headers: {
                    Authorization: `Bearer ${data.resetToken}`
                }
            }
        )
}