import { createClient } from "redis";
import { config } from "./index.js";

const connectRedis = async () => {
  if (!config.REDIS_URI) {
    throw new Error("REDIS_URI is missing");
  }
  const client = createClient({ url: config.REDIS_URI });
  try {
    await client.connect();
    console.log("Redis Connected successfully");
    client.on("connection", () => {
      console.log("Redis Connected ");
    });
  } catch (error) {
    console.log("Redis Connection Failed");
    client.on("error", () => {
      console.log("Error Connecting redis", error);
    });
  }
};

export default connectRedis;
