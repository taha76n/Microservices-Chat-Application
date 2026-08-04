import type { NextFunction, Request, Response } from "express";
import { logger } from "../configs/logger.js";

export function requestLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Start timing
  const startTime = Date.now();

  // Create a child logger just for this request
  // (you can later add a requestId here if needed)
  req.log = logger.child({
    reqId: req.headers["x-request-id"] ?? undefined,
  });

  // After the response finishes, log the essential info
  res.on("finish", () => {
    const responseTime = Date.now() - startTime;

    // Get the matched route path if Express has determined it,
    // otherwise fall back to the raw URL
    const route = req.route?.path ?? req.originalUrl;

    req.log.info(
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime, // time taken in milliseconds
        route, // e.g. "/users/:id" or "/api/health"
      },
      "request completed"
    );
  });

  next();
}
