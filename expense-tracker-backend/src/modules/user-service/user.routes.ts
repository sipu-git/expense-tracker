import express from "express";
import { registerUser, signInUser, getUserProfile, logOutUser, updateProfile } from "./user.controller.js";
import { validate } from "../../shared/middlewares/validate.middileware.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";
import { userSchema } from "./user.validation.js";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", validate({ body: userSchema }), asyncHandler(registerUser));
router.post("/login", asyncHandler(signInUser));
router.post("/logout", authMiddleware, asyncHandler(logOutUser));
router.get("/profile", authMiddleware, asyncHandler(getUserProfile));
router.patch("/modify-profile", authMiddleware, asyncHandler(updateProfile));

export default router;