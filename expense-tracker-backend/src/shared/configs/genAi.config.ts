import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

const requiredAwsPairs = ["AWS_ACCESS_KEY", "AWS_SECRET_KEY", "AWS_REGION", "BEDROCK_MODEL_ID"];

for(const key of requiredAwsPairs) {
    if (!process.env[key]) {
        throw new Error(`${key} is required!`);
    }
}

export const bedRockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION as string,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_SECRET_KEY as string,
    },
}) 

export const MODEL_ID = process.env.BEDROCK_MODEL_ID as string;