import express from 'express'
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js'
import { validate } from '../../shared/middlewares/validate.middileware.js'
import { createExpenseSchema } from './expenses.validation.js'
import { asyncHandler } from '../../shared/middlewares/asyncHandler.middleware.js'
import { addExpense, dropALlExpenses, fetchAllExpenses, fetchExpenseById, fetchExpensesByFilter, modifyExpenses, removeExpense } from './expenses.controller.js'

const router = express.Router()

router.post("/add-expense", authMiddleware, validate({ body: createExpenseSchema }), asyncHandler(addExpense))
router.get("/view-all-expenses", authMiddleware, asyncHandler(fetchAllExpenses))
router.get("/view-expense-id/:expenseId", authMiddleware, asyncHandler(fetchExpenseById))
router.patch("/modify-expense/:expenseId", authMiddleware, validate({ body: createExpenseSchema }), asyncHandler(modifyExpenses))
router.delete("/delete-expense/:expenseId", authMiddleware, asyncHandler(removeExpense))
router.delete("/delete-all-expenses", authMiddleware, asyncHandler(dropALlExpenses))
router.get("/filter-expense", authMiddleware, asyncHandler(fetchExpensesByFilter))

export default router;
