import { Request, Response } from "express";
import { createExpenseSchema, expenseFilterSchema } from "./expenses.validation";
import { createExpenses, deleteExpense, getExpensesByFilter, updateExpenses, viewAllExpenses, ViewExpenseById } from "./expense.service";
import { errorResponse, successResponse } from "../../shared/util/ApiResponses";

export const addExpense = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const parsedInfos = await createExpenseSchema.safeParse(req.body)

    if (!userId) {
        return res.status(401).json(errorResponse("Unauthorized access!"))
    }
    if (!parsedInfos.success) {
        return res.status(400).json({
            success: false, message: "Validation failed", errors: parsedInfos.error.format()
        });
    }
    const responseData = parsedInfos.data;

    const results = await createExpenses({
        name: responseData.name,
        amount: responseData.amount,
        type: responseData.type,
        quantity: responseData.quantity,
        bought_at: responseData.bought_at,
        groupId: responseData.groupId
    }, userId)

    return res.status(201).json(successResponse("Expenses created successfully!", results))
}

export const fetchAllExpenses = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json(errorResponse("Unauthorized access!"))
    }

    const response = await viewAllExpenses(userId)
    return res.status(200).json(successResponse("Expenses fetched successfully!", response))
}

export const fetchExpenseById = async (req: Request, res: Response) => {
    const expenseId = req.params.expenseId as any;
    const userId = req.user?.id;

    if (!expenseId) {
        return res.status(400).json(errorResponse("Expense id is required!"))
    }
    if (!userId) {
        return res.status(401).json(errorResponse("Unauthorized access!"))
    }
    const response = await ViewExpenseById(expenseId, userId)
    return res.status(200).json(successResponse("Expense fetched successfully!", response))
}

export const modifyExpenses = async (req: Request, res: Response) => {
    try {
        const expenseId = req.params.expenseId as any;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const infos = createExpenseSchema.safeParse(req.body);
        if (!infos.success) {
            res.status(400).json({ success: false, message: "Invalid data", errors: infos.error.flatten() });
            return;
        }

        const { name, amount, quantity, bought_at, type, groupId } = infos.data;
        const response = await updateExpenses(expenseId, { name, amount, quantity, bought_at, type, groupId }, userId);

        res.status(200).json({ success: true, data: response });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const removeExpense = async (req: Request, res: Response) => {
    try {
        const expenseId = req.params.expenseId as any;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const response = await deleteExpense(expenseId, userId);

        res.status(200).json({ success: true, data: response });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const fetchExpensesByFilter = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const { groupId, filter = "month" } = req.query;

        const filters = expenseFilterSchema.safeParse(filter);
        if (!filters.success) {
            res.status(400).json({ success: false, message: "Invalid filters", errors: filters.error.flatten() });
            return;
        }

        const response = await getExpensesByFilter(userId, filters.data, groupId as string | undefined);

        res.status(200).json({ success: true, data: response });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};
