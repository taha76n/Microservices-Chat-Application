import {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from "express";

export const TryCatch = (handler: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
    }
  };
};
