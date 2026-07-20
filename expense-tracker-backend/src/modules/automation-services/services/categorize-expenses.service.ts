import { ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { bedRockClient, MODEL_ID } from "../../../shared/configs/genAi.config.js";
import { ExpenseType } from "../../../../generated/prisma/index.js";

export async function categorizeExpense(
    name: string,
    amount: number
): Promise<ExpenseType> {
    const validTypes = Object.values(ExpenseType).join(", ");

    const prompt = `Categorize this expense into ONLY one of these categories: ${validTypes}.
    Expense name: "${name}"
    Amount: ${amount}
    Reply with ONLY the category name, nothing else.`;

    const response = await bedRockClient.send(
        new ConverseCommand({
            modelId: MODEL_ID,
            messages: [{ role: "user", content: [{ text: prompt }] }],
            inferenceConfig: { maxTokens: 20, temperature: 0.1 },
        })
    );
    const category = response.output?.message?.content?.[0]?.text?.trim().toUpperCase() as ExpenseType;
    return (Object.values(ExpenseType).includes(category as ExpenseType) ? category : ExpenseType.OTHER) as ExpenseType;
}