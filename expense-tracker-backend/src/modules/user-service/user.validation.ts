import z from "zod";

export const userSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits long"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});

export const modifyUserSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters long").optional(),
    email: z.string().email("Invalid email address").optional(),
    phone: z.string().min(10, "Phone number must be at least 10 digits long").optional(),
    newPassword: z.string().min(6, "Password must be at least 6 characters long").optional(),
    currentPassword: z.string().min(6, "Password must be at least 6 characters long").optional()
});

export type CreateUserInput = z.infer<typeof userSchema>;
export type ModifyUserInput = z.infer<typeof modifyUserSchema>;