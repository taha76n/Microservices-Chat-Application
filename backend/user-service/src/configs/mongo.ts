import mongoose from "mongoose";
import { config } from "./index.js";

const connectDb = async () => {
  if (!config.DATABASE_URI) {
    throw new Error("DATA_URI is missing");
  }
  
  try {
    await mongoose.connect(config.DATABASE_URI, {
      dbName: "microservicechatapp/user-service",
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("MongoDB connection Failed", error);
    process.exit(1);
  }
};

export default connectDb;
