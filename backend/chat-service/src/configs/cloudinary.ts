import { v2 as cloudinary } from "cloudinary"; // const v2 = {}  const cloudinary = v2
import { config } from "./index.js";

if (!config.CLOUDINARY_CLOUD_NAME) {
  throw new Error("CLOUDINARY_CLOUD_NAME is missing");
}

if (!config.CLOUDINARY_API_KEY) {
  throw new Error("CLOUDINARY_API_KEY is missing");
}

if (!config.CLOUDINARY_API_SECRET) {
  throw new Error("CLOUDINARY_API_SECRET is missing");
}

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

export default cloudinary;
