import type { NextFunction, Request, Response } from "express";
import { logger } from "../configs/logger.js";
import { AppError } from "../utils/error.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Use request‑scoped logger if available (set by requestLoggerMiddleware)
  const log = req.log ?? logger;

  // Determine status code
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";

  // Log the error
  if (err instanceof AppError && err.isOperational) {
    // Expected errors – log as warn
    log.warn(
      {
        error: message,
        statusCode,
        route: req.route?.path ?? req.originalUrl,
        method: req.method,
      },
      "Operational error"
    );
  } else {
    // Unexpected / programmer errors – log as error with stack
    log.error(
      {
        error: message,
        stack: err.stack,
        statusCode,
        route: req.route?.path ?? req.originalUrl,
        method: req.method,
      },
      "Unhandled error"
    );
  }

  // Send JSON response
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal Server Error" : message,
  });
}
