import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3 } from "../configs/s3.config.js"

export const generateImageUrl = async (fileKey: string) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey
    })
    return await getSignedUrl(s3, command, {
        expiresIn: 60 * 60 * 24 * 7  // 7 days instead of 10 minutes
    })
}