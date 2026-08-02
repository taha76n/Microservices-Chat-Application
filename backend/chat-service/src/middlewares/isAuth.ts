import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { config } from "../configs/index.js";

export interface IUser extends Document {
  _id: string,
  userName: string,
  email: string
}

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Please Login - No Auth Header" });
      return;
    }

    const token = authHeader.split(" ")[1]!;

    const decoded = jwt.verify(
      token,
      config.JWT_SECRET as string
    ) as JwtPayload;

    if (!decoded || !decoded.user) {
      res.status(401).json({ message: "Token expired or invalid" });
      return;
    }

    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Please Login - JWT Error" });
    console.log(error);
  }
};
