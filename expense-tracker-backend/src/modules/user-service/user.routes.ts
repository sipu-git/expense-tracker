import express from "express";
import { registerUser, signInUser, getUserProfile, logOutUser, updateProfile, removeProfile, getProfilePicture } from "./user.controller.js";
import { validate } from "../../shared/middlewares/validate.middileware.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";
import { userSchema } from "./user.validation.js";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import multer from 'multer';

const uploadProfile = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
})
const router = express.Router();

router.post("/register", validate({ body: userSchema }), asyncHandler(registerUser));
router.post("/login", asyncHandler(signInUser));
router.post("/logout", authMiddleware, asyncHandler(logOutUser));
router.get("/profile", authMiddleware, asyncHandler(getUserProfile));
router.delete("/drop-profile", authMiddleware, asyncHandler(removeProfile));
router.patch("/modify-profile", authMiddleware, uploadProfile.single('profilePic'), asyncHandler(updateProfile));
router.get("/profile-picture", authMiddleware, asyncHandler(getProfilePicture));

export default router;