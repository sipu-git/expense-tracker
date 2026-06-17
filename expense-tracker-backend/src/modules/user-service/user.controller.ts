import { Request, Response } from "express";
import { createUser, getUserById, loginUser, modifyProfile, signedOutuser } from "./user.service";
import { errorResponse, successResponse } from "../../shared/util/ApiResponses";
import { modifyUserSchema } from "./user.validation";

export const registerUser = async (req: Request, res: Response) => {
        const { full_name, email, phone, password } = req.body;
        // Call the service function to create a user
        const user = await createUser({ full_name, email, phone, password });
        return res.status(201).json(successResponse("User registered successfully", user));
}

export const signInUser = async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const { token, findUser } = await loginUser(email, password);
        res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        });
        return res.status(200).json(successResponse("User logged in successfully", findUser));
}

export const logOutUser = async (req: Request, res: Response) => {
        if (!req.user) {
                return res.status(401).json(errorResponse("Unauthorized!"))
        }
        const { id } = req.user;
        const result = await signedOutuser(id);
        res.clearCookie("token", {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
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
        const parsedInfos = await modifyUserSchema.safeParse(req.body)
        if (!userId) {
                return res.status(401).json(errorResponse("Unauthorized"));
        }
        if (!parsedInfos.success) {
                return res.status(400).json({
                        success: false, message: "Validation failed", errors: parsedInfos.error.format()
                });
        }
        const responseData = parsedInfos.data;
        const results = await modifyProfile(userId, responseData)
        return res.status(200).json(successResponse("User profile updated successfully", results));
}