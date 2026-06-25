import express from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { asyncHandler } from '../../shared/middlewares/asyncHandler.middleware.js';
import { autoCategorize } from './controllers/categorize.controller.js';

const router = express.Router()

router.post("/suggest-category", authMiddleware, asyncHandler(autoCategorize))
export default router;