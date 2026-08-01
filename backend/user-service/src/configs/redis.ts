import { createClient } from "redis";
import { config } from "./index.js";

if (!config.REDIS_URI) {
  throw new Error("REDIS_URI is missing")
}
export const redisClient = createClient({
    url: config.REDIS_URI,
});

redisClient.on("connect", () => {
    console.log("Redis Connected");
});

redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
});

export const connectRedis = async () => {
    await redisClient.connect();
};