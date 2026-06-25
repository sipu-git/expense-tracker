import { ExpenseType } from "../../../generated/prisma";
import { geminiModel } from "../../shared/configs/gemini.config";

export async function categorizeExpense(
    name: string,
    amount: number
): Promise<ExpenseType> {
    const validTypes = Object.values(ExpenseType).join(", ");

    const prompt = `Categorize this expense into ONLY one of these categories: ${validTypes}.
    Expense name: "${name}"
    Amount: ${amount}
    Reply with ONLY the category name, nothing else.`;

    const result = await geminiModel.generateContent(prompt);
    const category = result.response.text().trim().toUpperCase();

    return (Object.values(ExpenseType).includes(category as ExpenseType) ? category : ExpenseType.OTHER) as ExpenseType;
}