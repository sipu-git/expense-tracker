import { ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { bedRockClient, MODEL_ID } from "../../../shared/configs/genAi.config.js";

const VALID_EXPENSE_TYPES = [
    "FOOD",
    "TRANSPORTATION",
    "SHOPPING",
    "ENTERTAINMENT",
    "HEALTHCARE",
    "UTILITIES",
    "HOUSING",
    "TRAVEL",
    "EDUCATION",
    "OTHER",
] as const;

type ExpenseType = (typeof VALID_EXPENSE_TYPES)[number];

export interface ExtractedReceiptData {
    name: string | null;
    amount: number | null;
    quantity: string | null;
    bought_at: string | null;
    type: ExpenseType | null;
    confidence: "high" | "medium" | "low";
}

const EXTRACTION_PROMPT = `
Extract expense data from this receipt/invoice image. Return ONLY this JSON, no markdown, no explanation:

{"name":string|null,"amount":number|null,"quantity":string|null,"bought_at":"YYYY-MM-DD"|null,"type":string|null,"confidence":"high"|"medium"|"low"}

type must be exactly one of: FOOD, TRANSPORTATION, SHOPPING, ENTERTAINMENT, HEALTHCARE, UTILITIES, HOUSING, TRAVEL, EDUCATION, OTHER
(FOOD=restaurants/groceries, TRANSPORTATION=cabs/fuel/parking, HEALTHCARE=pharmacy/medical, UTILITIES=electricity/internet/phone, HOUSING=rent/home, TRAVEL=flights/hotels, else best fit or OTHER)

Rules: amount=final total paid, no symbols. name=merchant/item, max 60 chars. Use null if unclear — never guess. Not a receipt → all null, confidence "low".
`;

function getImageFormat(mimeType: string): "jpeg" | "png" | "webp" {
    if (mimeType === "image/png") return "png";
    if (mimeType === "image/webp") return "webp";
    return "jpeg";
}

function sanitizeExpenseType(type: unknown): ExpenseType | null {
    if (typeof type === "string" && VALID_EXPENSE_TYPES.includes(type as ExpenseType)) {
        return type as ExpenseType;
    }
    return null;
}

function sanitizeAmount(amount: unknown): number | null {
    if (typeof amount === "number" && !Number.isNaN(amount)) return amount;
    if (typeof amount === "string") {
        const parsed = parseFloat(amount.replace(/[^0-9.]/g, ""));
        return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
}

function sanitizeDate(date: unknown): string | null {
    if (typeof date !== "string") return null;
    const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(date);
    if (!isValidFormat) return null;
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? null : date;
}

export const extractReceiptData = async (fileBuffer: Buffer, mimeType: string): Promise<ExtractedReceiptData> => {
    const isPdf = mimeType === "application/pdf";

    const contentBlock = isPdf ? {
        document: {
            format: "pdf" as const,
            name: "receipt",
            source: { bytes: fileBuffer },
        },
    }
        : {
            image: {
                format: getImageFormat(mimeType),
                source: { bytes: fileBuffer },
            },
        };

    const command = new ConverseCommand({
        modelId: MODEL_ID,
        messages: [
            {
                role: "user",
                content: [contentBlock, { text: EXTRACTION_PROMPT }],
            },
        ],
        inferenceConfig: { maxTokens: 500, temperature: 0 },
    });

    const response = await bedRockClient.send(command);
    const rawText = response.output?.message?.content?.[0]?.text ?? "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let parsed: any;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error("Failed to parse extraction response as JSON");
    }

    // Sanitize every field before returning — never trust raw model output
    const result: ExtractedReceiptData = {
        name: typeof parsed.name === "string" ? parsed.name.slice(0, 60) : null,
        amount: sanitizeAmount(parsed.amount),
        quantity: typeof parsed.quantity === "string" ? parsed.quantity : null,
        bought_at: sanitizeDate(parsed.bought_at),
        type: sanitizeExpenseType(parsed.type),
        confidence: ["high", "medium", "low"].includes(parsed.confidence)
            ? parsed.confidence
            : "low",
    };

    return result;
};