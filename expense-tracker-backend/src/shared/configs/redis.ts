import { createClient } from 'redis';
import "dotenv/config";

const redisURL = process.env.REDIS_URL;
if (!redisURL) {
    throw new Error("Redis url isn't defined in .env")
}
const isProduction = process.env.NODE_ENV === "production";

const redis = createClient({
    url: redisURL,
    socket: {
        ...(isProduction && {
            tls: true as const,
            rejectUnauthorized: false,
        }),
        reconnectStrategy: (retries) => {
            console.log(`Redis reconnect attempt: ${retries}`);
            if (retries > 10) {
                return new Error("Redis reconnection failed");
            }
            return Math.min(retries * 100, 3000);
        },
    },
});
redis.on('connect', () => {
    console.log('Connected to Redis successfully!');
})
redis.on("ready", () => {
    console.log("Redis is ready to use!")
})
redis.on('error', (err) => {
    console.error('Redis connection error:', err)
})
async function connectRedis() {
    try {
        await redis.connect();
        console.log("Redis connection established");
    } catch (error) {
        console.error("Failed to connect Redis:", error);
    }
}
connectRedis()

export default redis;

