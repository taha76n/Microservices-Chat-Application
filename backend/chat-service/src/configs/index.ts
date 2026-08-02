import "dotenv/config";

export const config = {
  PORT: process.env.PORT || 5300,
  DATABASE_URI: process.env.MONGO_URI,
  REDIS_URI: process.env.REDIS_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  USER_SERVICE_URL: process.env.USER_SERVICE_URL,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};
