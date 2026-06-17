import express from 'express'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { validate } from '../../shared/middlewares/validate.middileware'
import { createExpenseSchema } from './expenses.validation'
import { asyncHandler } from '../../shared/middlewares/asyncHandler.middleware'
import { addExpense, fetchAllExpenses, fetchExpenseById, fetchExpensesByFilter, modifyExpenses, removeExpense } from './expenses.controller'

const router = express.Router()

router.post("/add-expense", authMiddleware, validate({ body: createExpenseSchema }), asyncHandler(addExpense))
router.get("/view-all-expenses", authMiddleware, asyncHandler(fetchAllExpenses))
router.get("/view-expense-id/:expenseId", authMiddleware, asyncHandler(fetchExpenseById))
router.put("/modify-expense/:expenseId", authMiddleware, validate({ body: createExpenseSchema }), asyncHandler(modifyExpenses))
router.delete("/delete-expense/:expenseId", authMiddleware, asyncHandler(removeExpense))
router.get("/filter-expense", authMiddleware, asyncHandler(fetchExpensesByFilter))

export default router;
