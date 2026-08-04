import mongoose from "mongoose";
import { config } from "./index.js";
import { logger } from "./logger.js";

const connectDb = async () => {
  if (!config.DATABASE_URI) {
    throw new Error("DATA_URI is missing");
  }

  try {
    await mongoose.connect(config.DATABASE_URI, {
      dbName: "microservicechatapp-user-service",
    });
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection Failed");
    logger.error(error);

    process.exit(1);
  }
};

export default connectDb;
