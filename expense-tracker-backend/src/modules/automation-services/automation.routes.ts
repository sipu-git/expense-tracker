import express from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { asyncHandler } from '../../shared/middlewares/asyncHandler.middleware';
import { autoCategorize } from './controllers/categorize.controller';

const router = express.Router()

router.post("/suggest-category", authMiddleware, asyncHandler(autoCategorize))
export default router;