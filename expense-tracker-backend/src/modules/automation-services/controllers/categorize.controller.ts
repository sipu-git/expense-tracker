import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../../lib/AppError.js";
import { categorizeExpense } from "../categorize-expenses.service.js";

export const autoCategorize = async (req: Request, res: Response,next:NextFunction) => {
    try {
        const { name, amount } = req.body;
        if (!name || !amount) {
            throw new AppError("Name and amount are required", 400);
        }
        const type = await categorizeExpense(name, Number(amount));
        res.json({ success: true, type });
    } catch (error) {
        console.error("categorize error:", error);
        next(error);  
        throw new AppError("AI Automation internal error", 500)
    }
}