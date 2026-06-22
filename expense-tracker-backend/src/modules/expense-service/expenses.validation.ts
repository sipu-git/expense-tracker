import z from "zod";
import { ExpenseType } from "../../../generated/prisma/client.js";

export const createExpenseSchema = z.object({
    name: z.string().min(3, "Expense name must be at least 3 characters long"),
    amount: z.union([z.string(), z.number()]).refine((value) => {
        const numericValue = Number(value);
        return (
            !isNaN(numericValue) &&
            numericValue > 0
        );
    }, { message: "Price must be a positive decimal value" }),
    type: z.nativeEnum(ExpenseType),
    quantity: z.string().trim().min(1, "Quantity must be at least 1 character long")
        .max(50, "Quantity cannot exceed 50 characters").optional(),
    bought_at: z.string().datetime("Invalid date format"),
    groupId: z.string().uuid("Invalid group id").optional(),
})


export const expenseFilterSchema = z.enum(["day", "month", "year"]);

export type ExpenseFilter = z.infer<typeof expenseFilterSchema>;
export type CreateExpenseInputs = z.infer<typeof createExpenseSchema>;
