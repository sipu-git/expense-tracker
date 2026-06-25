import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../shared/util/ApiResponses.js";
import { createBudgetSchema, updateBudgetSchema } from "./budget.validation.js";
import {
    createBudget,
    deleteBudget,
    deleteBudgetByCategory,
    updateBudget,
    viewAllBudgets,
    viewBudgetById,
} from "./budget.service.js";
import { ExpenseType } from "../../../generated/prisma/index.js";

export const addBudget = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const parsedInfos = await createBudgetSchema.safeParse(req.body);

    if (!userId) {
        return res.status(401).json(errorResponse("Unauthorized access!"));
    }
    if (!parsedInfos.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: parsedInfos.error.format(),
        });
    }

    const response = await createBudget(parsedInfos.data, userId);
    return res.status(201).json(successResponse("Budget saved successfully!", response));
};

export const fetchAllBudgets = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json(errorResponse("Unauthorized access!"));
    }

    const response = await viewAllBudgets(userId);
    return res.status(200).json(successResponse("Budgets fetched successfully!", response));
};

export const fetchBudgetById = async (req: Request, res: Response) => {
    const budgetId = req.params.budgetId as string;
    const userId = req.user?.id;

    if (!budgetId) {
        return res.status(400).json(errorResponse("Budget id is required!"));
    }
    if (!userId) {
        return res.status(401).json(errorResponse("Unauthorized access!"));
    }

    const response = await viewBudgetById(budgetId, userId);
    return res.status(200).json(successResponse("Budget fetched successfully!", response));
};

export const modifyBudget = async (req: Request, res: Response) => {
    const budgetId = req.params.budgetId as string;
    const userId = req.user?.id;
    const parsedInfos = await updateBudgetSchema.safeParse(req.body);

    if (!userId) {
        return res.status(401).json(errorResponse("Unauthorized access!"));
    }
    if (!parsedInfos.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: parsedInfos.error.format(),
        });
    }

    const response = await updateBudget(budgetId, parsedInfos.data, userId);
    return res.status(200).json(successResponse("Budget updated successfully!", response));
};

export const removeBudget = async (req: Request, res: Response) => {
    const budgetId = req.params.budgetId as string;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json(errorResponse("Unauthorized access!"));
    }

    const response = await deleteBudget(budgetId, userId);
    return res.status(200).json(successResponse("Budget removed successfully!", response));
};

export const removeBudgetByCategory = async (req: Request, res: Response) => {
    const category = req.params.category as ExpenseType;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json(errorResponse("Unauthorized access!"));
    }

    const response = await deleteBudgetByCategory(category, userId);
    return res.status(200).json(successResponse("Budget removed successfully!", response));
};
