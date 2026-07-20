import { AppError } from "../../../lib/AppError.js";
import { prisma } from "../../../lib/prisma.js";
import { GroupRole } from "../../shared/configs/rbac.role.js";
import { cacheQuery } from "../../shared/redis/cacheQuery.js";
import { ExpenseFilter, getExpenseDateRange } from "../../shared/util/expenses.util.js";
import { CreateExpenseInputs, UpdateExpenseInputs } from "./expenses.validation.js";
import redisService from '../../shared/redis/services/db-caching.service.js';
import { categorizeExpense } from "../automation-services/services/categorize-expenses.service.js";
import { deleteReceiptObeject, uploadReceiptFile } from "../../shared/repository/receipt.repo.js";
import { extractReceiptData } from "../automation-services/services/receiptExtraction.service.js";

export async function extractReceiptFormExpense(userId: string, file: Express.Multer.File) {
    const [uploadResult, extractResult] = await Promise.allSettled([
        uploadReceiptFile(file, userId),
        extractReceiptData(file.buffer, file.mimetype)
    ])
    if (uploadResult.status == "rejected") {
        throw new AppError("Failed to upload the receipt file", 500)
    }
    const receipt = uploadResult.value;
    const extractedData = extractResult.status === "fulfilled" ? extractResult.value : null;

    return {
        receiptKey: receipt.fileKey,
        receiptUrl: receipt.fileUrl,
        extractedData,
        extractionFailed: extractResult.status === "rejected",
    };
}

export async function createExpenses(data: CreateExpenseInputs, userId: string) {
    const exactData = new Date(data.bought_at)
    const today = new Date()

    if (exactData > today) {
        throw new AppError("Expense cann't added for future time!", 400)
    }
    if (!data.type) {
        data.type = await categorizeExpense(data.name, Number(data.amount))
    }
    return await prisma.$transaction(async (tx: any) => {
        if (data.groupId) {
            const member = await tx.groupMembers.findFirst({
                where: {
                    userId,
                    groupId: data.groupId
                }
            })
            if (!member) {
                throw new AppError("You are not a member of this group")
            }
        }
        const expenses = await tx.expenses.create({
            data: {
                name: data.name,
                amount: data.amount,
                type: data.type,
                quantity: data.quantity ?? null,
                bought_at: new Date(data.bought_at),
                created_by: userId,
                groupId: data.groupId,
                receiptKey: data.receiptKey ?? null
            }
        })
        await Promise.all([
            redisService.delete(`expenses:${userId}:all`),
            redisService.deleteByPattern(`expenses:${userId}:filters:*`)
        ])
        return expenses;
    }, {
        maxWait: 5000,
        timeout: 10000
    })
}


export async function viewAllExpenses(userId: string) {
    const cacheKey = `expenses:${userId}:all`;
    return cacheQuery(cacheKey, 300, async () => {
        return await prisma.expenses.findMany({
            where: {
                OR: [{ created_by: userId, groupId: null },
                {
                    group: {
                        members: {
                            some: { userId }
                        }
                    }
                }
                ]
            },
            include: {
                creator: {
                    select: {
                        full_name: true,
                        email: true
                    }
                },
                group: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                created_at: "desc"
            }
        },)
    })

}

export async function ViewExpenseById(expenseId: string, userId: string) {
    const cacheKey = `expense:${userId}:${expenseId}`;
    return cacheQuery(cacheKey, 300, async () => {
        return await prisma.$transaction(async (tx: any) => {
            const expense = await tx.expenses.findUnique({
                where: {
                    id: expenseId
                },
                include: {
                    group: true
                }
            })
            if (!expense) throw new Error("Expense not found")
            if (!expense.groupId) {
                if (expense.created_by !== userId) {
                    throw new AppError("You don't have access to this expense")
                }
                return expense
            }

            const members = await tx.groupMembers.findFirst({
                where: {
                    groupId: expense.groupId,
                    userId
                },
                select: {
                    user: {
                        select: {
                            full_name: true,
                            email: true
                        }
                    }
                }
            })
            if (!members) throw new AppError("You don't have access to this expense")
            return expense
        })
    })
}

export async function updateExpenses(expenseId: string, data: UpdateExpenseInputs, userId: string) {
    return await prisma.$transaction(async (tx: any) => {
        const expense = await tx.expenses.findUnique({
            where: {
                id: expenseId
            }
        })
        if (!expense) throw new AppError("Expense not found")

        if (!expense.groupId) {
            if (expense.created_by !== userId) throw new Error("You don't have access to this expense")
        }
        else {
            const member = await tx.groupMembers.findFirst({
                where: {
                    userId,
                    groupId: expense.groupId
                }
            })
            if (!member) {
                throw new AppError("You are not a member of this group")
            }

            const canUpdate = expense.created_by === userId || member.role === GroupRole.ADMIN;

            if (!canUpdate) {
                throw new AppError("You don't have permission to update this expense");
            }
        }

        const updatedExpense = await tx.expenses.update({
            where: {
                id: expenseId
            },
            data: {
                ...data,
                ...(data.amount !== undefined && { amount: Number(data.amount) }),
            }
        })
        await Promise.all([
            redisService.delete(`expense:${userId}:${expenseId}`),
            redisService.delete(`expenses:${userId}:all`),
            redisService.deleteByPattern(`expenses:${userId}:filters:*`),
        ])

        return updatedExpense
    })
}

export async function deleteExpense(expenseId: string, userId: string) {
    return await prisma.$transaction(async (tx: any) => {
        const expense = await tx.expenses.findUnique({
            where: {
                id: expenseId
            }
        })
        if (!expense) throw new AppError("Expense not found")
        if (!expense.groupId) {
            if (expense.created_by !== userId) throw new AppError("You don't have access to this expense")
        }
        else {
            const member = await tx.groupMembers.findFirst({
                where: {
                    userId,
                    groupId: expense.groupId
                }
            })
            if (!member) {
                throw new AppError("You are not a member of this group")
            }

            const canDelete = expense.created_by === userId || member.role === GroupRole.ADMIN;
            if (!canDelete) {
                throw new AppError("You don't have permission to delete this expense");
            }

        }
        if (expense.receipt_key) {
            await deleteReceiptObeject(expense.receipt_key);
        }
        const deletedExpense = await tx.expenses.delete({
            where: {
                id: expenseId
            }
        })
        await Promise.all([
            redisService.delete(`expense:${userId}:${expenseId}`),
            redisService.delete(`expenses:${userId}:all`),
            redisService.deleteByPattern(`expenses:${userId}:filters:*`),
        ])
        return deletedExpense;
    })
}


export async function removeAllExpenses(userId: string) {
    const dropAll = await prisma.$transaction(async (tx) => {
        const findUser = await tx.user.findUnique({ where: { id: userId } })
        if (!findUser) throw new AppError("User doesn't exist!")

        const expensesWithReceipts = await tx.expenses.findMany({
            where: { created_by: userId, receiptKey: { not: null } },
            select: { receiptKey: true }
        })

        const deleted = await tx.expenses.deleteMany({ where: { created_by: userId } })
        return { deleted, receiptKeys: expensesWithReceipts.map((e: any) => e.receipt_key) }
    })

    // Clean up S3 after transaction commits
    await Promise.all(
        dropAll.receiptKeys.map((key: string) =>
            deleteReceiptObeject(key).catch((err) =>
                console.error(`Failed to delete S3 receipt ${key}:`, err)))
    )

    await Promise.all([
        redisService.delete(`expenses:${userId}:all`),
        redisService.deleteByPattern(`expenses:${userId}:filters:*`),
    ])
    return dropAll.deleted;
}

export async function getExpensesByFilter(userId: string, filters: ExpenseFilter, groupId?: string) {
    const { startDate, endDate } = getExpenseDateRange(filters)
    const cacheKey = `expense:filters:${userId}:filters:${filters}`;
    return cacheQuery(cacheKey, 300, async () => {
        return await prisma.$transaction(async (tx: any) => {
            if (groupId) {
                const members = await tx.groupMembers.findFirst({
                    where: {
                        userId,
                        groupId
                    }
                })

                if (!members) throw new AppError("You are not a member of this group")

                const results = await tx.expenses.aggregate({
                    where: {
                        groupId,
                        created_at: {
                            gte: startDate,
                            lte: endDate
                        }
                    },
                    _sum: {
                        amount: true
                    },
                    _count: {
                        id: true
                    }
                })
                return {
                    scope: "GROUP",
                    filters, groupId,
                    totalExpenses: results._count.id,
                    totalAmount: results._sum.amount
                }
            }
            const anyltics = await tx.expenses.aggregate({
                where: {
                    groupId,
                    created_by: userId,
                    created_at: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _sum: {
                    amount: true
                },
                _count: {
                    id: true
                }
            })
            return {
                scope: "PERSONAL",
                filters,
                totalExpenses: anyltics._count.id,
                totalAmount: anyltics._sum.amount,
            }
        })
    })

}

