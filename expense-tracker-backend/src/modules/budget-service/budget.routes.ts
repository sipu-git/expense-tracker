import express from "express";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";
import {
    addBudget,
    fetchAllBudgets,
    fetchBudgetById,
    modifyBudget,
    removeBudget,
    removeBudgetByCategory,
} from "./budget.controller.js";

const router = express.Router();

router.post("/add-budget", authMiddleware, asyncHandler(addBudget));
router.get("/view-all-budgets", authMiddleware, asyncHandler(fetchAllBudgets));
router.get("/view-budget-id/:budgetId", authMiddleware, asyncHandler(fetchBudgetById));
router.patch("/modify-budget/:budgetId", authMiddleware, asyncHandler(modifyBudget));
router.delete("/delete-budget/:budgetId", authMiddleware, asyncHandler(removeBudget));
router.delete("/delete-budget-category/:category", authMiddleware, asyncHandler(removeBudgetByCategory));

export default router;
