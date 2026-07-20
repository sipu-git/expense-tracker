import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { generateImageUrl } from "../util/bucket.util.js";
import { s3 } from "../configs/s3.config.js";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];

export const uploadReceiptFile = async (file: Express.Multer.File, userId: string) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
        throw new Error("Only image or PDF files are allowed for receipts");
    }
    const extract = file.mimetype.split("/")[1];
    const fileKey = `receipts/${userId}-${crypto.randomUUID()}.${extract}`;
    const fileUrl = await generateImageUrl(fileKey)

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype
    })
    await s3.send(command)
    return { fileKey, fileUrl }
}

export const deleteReceiptObeject = async (key: string) => {
    if (!key) return;
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key
    })
    await s3.send(command)
}