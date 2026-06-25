import z from "zod";
import { ExpenseType } from "../../../generated/prisma/client.js";

export const budgetPeriodSchema = z.enum(["monthly", "weekly"]);

export const createBudgetSchema = z.object({
    category: z.nativeEnum(ExpenseType),
    limit: z.union([z.string(), z.number()]).refine((value) => {
        const numericValue = Number(value);
        return !isNaN(numericValue) && numericValue > 0;
    }, { message: "Budget limit must be a positive decimal value" }),
    period: budgetPeriodSchema.default("monthly"),
});

export const updateBudgetSchema = createBudgetSchema.partial().refine(
    (value) => value.category !== undefined || value.limit !== undefined || value.period !== undefined,
    { message: "At least one budget field is required" }
);

export const budgetCategorySchema = z.object({
    category: z.nativeEnum(ExpenseType),
});

export const budgetIdSchema = z.object({
    budgetId: z.string().uuid("Invalid budget id"),
});

export type CreateBudgetInputs = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInputs = z.infer<typeof updateBudgetSchema>;
