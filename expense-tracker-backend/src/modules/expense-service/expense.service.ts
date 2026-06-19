import { AppError } from "../../../lib/AppError.js";
import { prisma } from "../../../lib/prisma.js";
import { GroupRole } from "../../shared/configs/rbac.role.js";
import { ExpenseFilter, getExpenseDateRange } from "../../shared/util/expenses.util.js";
import { CreateExpenseInputs } from "./expenses.validation.js";

export async function createExpenses(data: CreateExpenseInputs, userId: string) {
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
                quantity: data.quantity,
                bought_at: new Date(data.bought_at),
                created_by: userId,
                groupId: data.groupId
            }
        })
        return expenses;
    })
}


export async function viewAllExpenses(userId: string) {
    return await prisma.expenses.findMany({
        where: {
            OR: [
                {
                    created_by: userId,
                    groupId: null
                },
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
    })
}

export async function ViewExpenseById(expenseId: string, userId: string) {
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
}

export async function updateExpenses(expenseId: string, data: CreateExpenseInputs, userId: string) {
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
            data
        })
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
        const deletedExpense = await tx.expenses.delete({
            where: {
                id: expenseId
            }
        })
        return deletedExpense
    })
}


export async function removeAllExpenses(userId: string) {
    return await prisma.$transaction(async (tx) => {
        const findUser = await tx.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!findUser) {
            throw new AppError("User doesn't exist!")
        }
        const dropAll = await tx.expenses.deleteMany({
            where: {
                created_by: userId
            }
        })
        return dropAll;
    })
}
export async function getExpensesByFilter(userId: string, filters: ExpenseFilter, groupId?: string) {
    const { startDate, endDate } = getExpenseDateRange(filters)

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
}

