import z from "zod";

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be under 50 characters")
      .regex(
        /^[a-zA-Z\s'-]+$/,
        "Only letters, spaces, hyphens, and apostrophes allowed"
      ),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
          phone: z.string().min(10, "Phone number must be at least 10 digits long"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number")
      .regex(/[^a-zA-Z0-9]/, "Include at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, "You must accept the terms to continue"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
