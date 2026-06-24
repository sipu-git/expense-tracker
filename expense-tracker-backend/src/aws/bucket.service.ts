import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { s3 } from "./s3.config.js";
import { generateImageUrl } from "./bucket.util.js";
import { prisma } from "../../lib/prisma.js";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export const uploadProfileImage = async (
  file: Express.Multer.File,
  userId: string
) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new Error("Only image files are allowed");
  }
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { profilePic: true },
  });

  if (existingUser?.profilePic) {
    await deleteImageObject(existingUser.profilePic);
  }

  const ext = file.mimetype.split("/")[1];
  const fileKey = `profile-images/${userId}-${crypto.randomUUID()}.${ext}`;
  const imageUrl = await generateImageUrl(fileKey)

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3.send(command);

  // ── Save new S3 key to user.profilePic in DB ───────────────────────────────
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { profilePic: imageUrl },
    select: {
      id: true,
      profilePic: true,
    },
  });

  return updatedUser;
};


export const deleteImageObject = async (key: string) => {
  if (!key) return;

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  });

  await s3.send(command);
};

// ── Get profile picture URL for a user ────────────────────────────────────────
export const getProfileImageUrl = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profilePic: true },
  });

  if (!user?.profilePic) return null;

  return generateImageUrl(user.profilePic);
};

// ── Remove profile picture (S3 + DB) ─────────────────────────────────────────
export const removeProfileImage = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profilePic: true },
  });

  if (user?.profilePic) {
    await deleteImageObject(user.profilePic);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { profilePic: null },
  });
};