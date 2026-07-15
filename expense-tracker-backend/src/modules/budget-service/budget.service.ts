import { AppError } from "../../../lib/AppError.js";
import { prisma } from "../../../lib/prisma.js";
import redisService from "../../shared/redis/services/db-caching.service.js";
import { CreateBudgetInputs, UpdateBudgetInputs } from "./budget.validation.js";

const mapPeriodToDb = (period?: string) => (period === "weekly" ? "WEEKLY" : "MONTHLY");
const mapPeriodFromDb = (period: string) => period.toLowerCase();

const formatBudget = (budget: any) => ({
    id: budget.id,
    category: budget.type,
    limit: Number(budget.limitAmount),
    period: mapPeriodFromDb(budget.period),
    created_by: budget.created_by,
    created_at: budget.created_at,
    updated_at: budget.updated_at,
});

const clearBudgetCache = async (userId: string) => {
    await redisService.delete(`budgets:${userId}:all`);
};

export async function createBudget(data: CreateBudgetInputs, userId: string) {
    const budget = await prisma.budgets.upsert({
        where: {
            created_by_type: {
                created_by: userId,
                type: data.category,
            },
        },
        update: {
            limitAmount: data.limit,
            period: mapPeriodToDb(data.period),
        },
        create: {
            type: data.category,
            limitAmount: data.limit,
            period: mapPeriodToDb(data.period),
            created_by: userId,
        },
    });

    await clearBudgetCache(userId);
    return formatBudget(budget);
}

export async function viewAllBudgets(userId: string) {
    const budgets = await prisma.budgets.findMany({
        where: { created_by: userId },
        orderBy: { created_at: "desc" },
    });

    return budgets.map(formatBudget);
}

export async function viewBudgetById(budgetId: string, userId: string) {
    const budget = await prisma.budgets.findFirst({
        where: {
            id: budgetId,
            created_by: userId,
        },
    });

    if (!budget) throw new AppError("Budget not found", 404);
    return formatBudget(budget);
}

export async function updateBudget(budgetId: string, data: UpdateBudgetInputs, userId: string) {
    const budget = await prisma.budgets.findFirst({
        where: {
            id: budgetId,
            created_by: userId,
        },
    });

    if (!budget) throw new AppError("Budget not found", 404);

    const updatedBudget = await prisma.budgets.update({
        where: { id: budgetId },
        data: {
            ...(data.category !== undefined && { type: data.category }),
            ...(data.limit !== undefined && { limitAmount: data.limit }),
            ...(data.period !== undefined && { period: mapPeriodToDb(data.period) }),
        },
    });

    await clearBudgetCache(userId);
    return formatBudget(updatedBudget);
}

export async function deleteBudget(budgetId: string, userId: string) {
    const budget = await prisma.budgets.findFirst({
        where: {
            id: budgetId,
            created_by: userId,
        },
    });

    if (!budget) throw new AppError("Budget not found", 404);

    const deletedBudget = await prisma.budgets.delete({
        where: { id: budgetId },
    });

    await  clearBudgetCache(userId);
    return formatBudget(deletedBudget);
}

export async function deleteBudgetByCategory(category: string, userId: string) {
    const budget = await prisma.budgets.findUnique({
        where: {
            created_by_type: {
                created_by: userId,
                type: category as any,
            },
        },
    });

    if (!budget) throw new AppError("Budget not found", 404);

    const deletedBudget = await prisma.budgets.delete({
        where: { id: budget.id },
    });

    await clearBudgetCache(userId);
    return formatBudget(deletedBudget);
}
