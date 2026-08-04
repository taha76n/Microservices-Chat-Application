export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean; // helps distinguish expected vs unexpected

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "FORBIDDEN") {
    super(message, 403);
  }
}

export {
  NotFoundError,
  BadRequestError,
  TooManyRequestsError,
  UnauthorizedError,
  ForbiddenError,
};
