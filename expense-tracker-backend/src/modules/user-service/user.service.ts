import { AppError } from "../../../lib/AppError.js";
import { prisma } from "../../../lib/prisma.js";
import { CreateUserInput, ModifyUserInput } from "./user.validation.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function createUser(data: CreateUserInput) {
    const { full_name, email, phone, password } = data;
    return await prisma.$transaction(async (prisma: any) => {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new AppError("Email already in use", 402);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                full_name,
                email,
                phone,
                password: hashedPassword,
            },
        });
        return user;
    });
}

export async function loginUser(email: string, password: string) {
    const findUser = await prisma.user.findUnique({
        where: { email: email },
    });
    if (!findUser) {
        throw new AppError("User doesn't exist!", 404);
    }
    const isPasswordValid = await bcrypt.compare(password, findUser.password);
    if (!isPasswordValid) {
        throw new AppError("Invalid password field", 400);
    }

    const token = await jwt.sign({ id: findUser.id, role: findUser.role }, process.env.JWT_SECRET as string, { expiresIn: "15d" });

    return { findUser, token };
}

export async function getUserById(id: string) {
    return await prisma.$transaction(async (prisma: any) => {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new AppError("User not found", 404);
        }
        return user;
    });
}

export async function signedOutuser(userId: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })
    if (!user) {
        throw new AppError("User not found", 404);
    }
    return user;
}


export async function modifyProfile(userId: string, payload: ModifyUserInput) {
    return await prisma.$transaction(async (prisma: any) => {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new AppError("User not found", 404);
        }
        const updatedata: Partial<{
            full_name: string;
            email: string;
            phone: string;
            password: string;
        }> = {};
        if (payload.full_name) {
            if (payload.full_name) {
                if (payload.full_name.trim().length < 2) {
                    throw new AppError("Full name must be at least 2 characters", 400);
                }
                updatedata.full_name = payload.full_name.trim();
            }
        }
        if (payload.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(payload.email)) {
                throw new AppError("Invalid email format", 400);
            }
            const existingUser = await prisma.user.findUnique({
                where: { email: payload.email },
            });
            if (existingUser) {
                throw new AppError("Email is already in use", 402);
            }
            updatedata.email = payload.email;
        }
        if (payload.phone) {
            const phoneRegex = /^[0-9]{10,15}$/;
            if (!phoneRegex.test(payload.phone)) {
                throw new AppError("Invalid phone number format", 400);
            }
            updatedata.phone = payload.phone;
        }
        if (payload.newPassword) {
            if (!payload.currentPassword) {
                throw new AppError("Current password is required to set a new password", 400);
            }
            const isCurrentPasswordValid = await bcrypt.compare(
                payload.currentPassword,
                user.password
            );
            if (!isCurrentPasswordValid) {
                throw new AppError("Current password is incorrect", 400);
            }
            const isSamePassword = await bcrypt.compare(payload.newPassword, user.password);
            if (isSamePassword) {
                throw new AppError("New password must be different from current password", 400);
            }
            if (payload.newPassword.length < 8) {
                throw new AppError("New password must be at least 8 characters", 400);
            }
            updatedata.password = await bcrypt.hash(payload.newPassword, 10);
        }
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updatedata,
            select: {
                id: true,
                full_name: true,
                email: true,
                phone: true,
                created_at: true,
                // modified_at: true,
            }
        });
        return updatedUser;
    })
}

export async function dropProfile(userId: string) {
    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) {
            throw new AppError("User doesn't exist", 404)
        }
        return await tx.user.delete({
            where: {
                id: userId
            }
        })
    })
}