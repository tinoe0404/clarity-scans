export class BlobValidationError extends Error {
  code: "FILE_TOO_LARGE" | "INVALID_TYPE" | "INVALID_URL" | "UPLOAD_FAILED";
  statusCode: number;

  constructor(
    code: "FILE_TOO_LARGE" | "INVALID_TYPE" | "INVALID_URL" | "UPLOAD_FAILED",
    message: string,
    statusCode: number = 400
  ) {
    super(message);
    this.name = "BlobValidationError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class DatabaseError extends Error {
  code: string;
  query?: string;

  constructor(message: string, code: string = "DB_ERROR", query?: string) {
    super(message);
    this.name = "DatabaseError";
    this.code = code;
    if (query) this.query = query;
  }
}

export class AuthError extends Error {
  code: "UNAUTHORIZED" | "FORBIDDEN" | "INVALID_CREDENTIALS" | "SESSION_EXPIRED";

  constructor(
    message: string,
    code: "UNAUTHORIZED" | "FORBIDDEN" | "INVALID_CREDENTIALS" | "SESSION_EXPIRED" = "UNAUTHORIZED"
  ) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export class NotFoundError extends Error {
  resource: string;

  constructor(message: string, resource: string = "Resource") {
    super(message);
    this.name = "NotFoundError";
    this.resource = resource;
  }
}

export function isAppError(error: unknown): boolean {
  return (
    error instanceof BlobValidationError ||
    error instanceof DatabaseError ||
    error instanceof AuthError ||
    error instanceof NotFoundError
  );
}

export function handleApiError(error: unknown): { message: string; statusCode: number } {
  // Structured logging with error classification
  const errorInfo = {
    name: error instanceof Error ? error.name : 'UnknownError',
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  };

  // Use structured logger instead of raw console.error
  const { logger } = require('./logger');
  logger.error('API Error:', errorInfo);

  if (error instanceof BlobValidationError) {
    return { message: error.message, statusCode: error.statusCode };
  }

  if (error instanceof AuthError) {
    const statusCode = error.code === "FORBIDDEN" ? 403 : 401;
    return { message: error.message, statusCode };
  }

  if (error instanceof NotFoundError) {
    return { message: error.message, statusCode: 404 };
  }

  // Obscure database/unknown errors from end users in production
  if (error instanceof DatabaseError) {
    return { message: "An internal database error occurred.", statusCode: 500 };
  }

  return { message: "An unexpected error occurred.", statusCode: 500 };
}

/**
 * Maps NextAuth error codes to human-readable messages
 */
export function getAuthErrorMessage(error: string): string {
  switch (error) {
    case "CredentialsSignin":
      return "Invalid username or password";
    case "SessionRequired":
      return "Please sign in to access this page";
    case "SESSION_EXPIRED":
      return "Your session has expired. Please sign in again.";
    case "Default":
    default:
      return "An authentication error occurred";
  }
}
