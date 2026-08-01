import jwt from "jsonwebtoken";
import { config } from "../configs/index.js";

if (!config.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing");
}

export const generateToken = (user: any) => {
  return jwt.sign({ user }, config.JWT_SECRET as string, { expiresIn: "7d" });
};
