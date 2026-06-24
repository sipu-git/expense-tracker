import { Request, Response } from "express";
import { createUser, dropProfile, getUserById, loginUser, modifyProfile, signedOutuser } from "./user.service.js";
import { errorResponse, successResponse } from "../../shared/util/ApiResponses.js";
import { modifyUserSchema } from "./user.validation.js";
import { getProfileImageUrl } from "../../aws/bucket.service.js";

export const registerUser = async (req: Request, res: Response) => {
        const { full_name, email, phone, password } = req.body;
        // Call the service function to create a user
        const user = await createUser({ full_name, email, phone, password });
        return res.status(201).json(successResponse("User registered successfully", user));
}

export const signInUser = async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const { token, findUser } = await loginUser(email, password);
        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax",
                maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        });
        return res.status(200).json(successResponse("User logged in successfully", { findUser, token }));
}

export const logOutUser = async (req: Request, res: Response) => {
        if (!req.user) {
                return res.status(401).json(errorResponse("Unauthorized!"))
        }
        const { id } = req.user;
        const result = await signedOutuser(id);
        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie("token", {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax",
        });
        return res.status(200).json(successResponse("User signed out successfully", result));
}

export const getUserProfile = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
                return res.status(401).json(errorResponse("Unauthorized"));
        }
        const user = await getUserById(userId);
        return res.status(200).json(successResponse("User profile retrieved successfully", user));
}

export const updateProfile = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const file = req.file;
        const payload = req.body;
        const parsedInfos = await modifyUserSchema.safeParse(payload)
        if (!userId) {
                return res.status(401).json(errorResponse("Unauthorized"));
        }
        if (!parsedInfos.success) {
                return res.status(400).json({
                        success: false, message: "Validation failed", errors: parsedInfos.error.format()
                });
        }
        // const responseData = parsedInfos.data;
        const results = await modifyProfile(userId, parsedInfos.data,file)
        return res.status(200).json(successResponse("User profile updated successfully", results));
}

export const viewProfilePicture = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json(errorResponse("Unauthorized"));
  }

  const url = await getProfileImageUrl(userId);

  if (!url) {
    return res.status(404).json(errorResponse("No profile picture found"));
  }

  return res.status(200).json(successResponse("Profile picture URL", { url }));
};

export const removeProfile = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
                return res.status(400).json(errorResponse("Unauthrozed user!"))
        }
        const response = await dropProfile(userId)
        return res.status(201).json(successResponse("Account removed successfully!", response))
}