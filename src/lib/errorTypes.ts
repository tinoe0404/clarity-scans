export type ErrorCategory =
  | 'NetworkError'
  | 'ServerError'
  | 'NotFoundError'
  | 'AuthError'
  | 'ValidationError'
  | 'DatabaseError'
  | 'BlobError'
  | 'SessionError'
  | 'QuotaError'
  | 'UnknownError';

export interface AppErrorBase {
  type: ErrorCategory;
  message: string;
  originalError?: unknown;
}

export interface NetworkError extends AppErrorBase {
  type: 'NetworkError';
}

export interface ServerError extends AppErrorBase {
  type: 'ServerError';
  statusCode?: number;
}

export interface NotFoundError extends AppErrorBase {
  type: 'NotFoundError';
  resource?: string;
}

export interface AuthError extends AppErrorBase {
  type: 'AuthError';
}

export interface ValidationError extends AppErrorBase {
  type: 'ValidationError';
  fields?: Record<string, string[]>;
}

export interface DatabaseError extends AppErrorBase {
  type: 'DatabaseError';
  query?: string;
}

export interface BlobError extends AppErrorBase {
  type: 'BlobError';
  blobUrl?: string;
}

export interface SessionError extends AppErrorBase {
  type: 'SessionError';
}

export interface QuotaError extends AppErrorBase {
  type: 'QuotaError';
}

export interface UnknownError extends AppErrorBase {
  type: 'UnknownError';
}

export type AppErrorType =
  | NetworkError
  | ServerError
  | NotFoundError
  | AuthError
  | ValidationError
  | DatabaseError
  | BlobError
  | SessionError
  | QuotaError
  | UnknownError;

/**
 * Classifies an unknown error into a specific AppErrorType.
 */
export function classifyError(error: unknown): AppErrorType {
  // If it's already an AppErrorType (duck typing check), return it
  if (
    error &&
    typeof error === 'object' &&
    'type' in error &&
    typeof (error as Record<string, unknown>).type === 'string'
  ) {
    const type = (error as Record<string, unknown>).type as string;
    const validTypes: ErrorCategory[] = [
      'NetworkError',
      'ServerError',
      'NotFoundError',
      'AuthError',
      'ValidationError',
      'DatabaseError',
      'BlobError',
      'SessionError',
      'QuotaError',
      'UnknownError',
    ];
    if (validTypes.includes(type as ErrorCategory)) {
      return error as AppErrorType;
    }
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

  // Network Errors
  if (
    error instanceof TypeError &&
    (errorMessage.includes('fetch') || errorMessage.includes('Network request failed'))
  ) {
    return { type: 'NetworkError', message: 'Network connection failed', originalError: error };
  }
  if (error instanceof DOMException && error.name === 'AbortError') {
    return { type: 'NetworkError', message: 'Request timed out', originalError: error };
  }

  // Database Errors (Neon/Postgres common signatures)
  if (
    errorMessage.includes('database') ||
    errorMessage.includes('relation') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('terminating connection') ||
    errorMessage.includes('pool')
  ) {
    return { type: 'DatabaseError', message: 'Database operation failed', originalError: error };
  }

  // Blob Errors
  if (errorMessage.includes('blob') || errorMessage.includes('storage')) {
    return { type: 'BlobError', message: 'Storage operation failed', originalError: error };
  }

  // Session Errors
  if (errorMessage.includes('session expired') || errorMessage.includes('invalid session')) {
    return { type: 'SessionError', message: 'Session invalid or expired', originalError: error };
  }

  // Auth Errors
  if (errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
    return { type: 'AuthError', message: 'Authentication required', originalError: error };
  }

  // Validation Errors (e.g., Zod)
  if (errorMessage.includes('validation') || error instanceof Error && error.name === 'ZodError') {
    return { type: 'ValidationError', message: 'Validation failed', originalError: error };
  }

  // Fallback map standard HTTP-like structures if present
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as Record<string, unknown>).status;
    if (status === 404) return { type: 'NotFoundError', message: 'Resource not found', originalError: error };
    if (status === 401 || status === 403) return { type: 'AuthError', message: 'Unauthorized', originalError: error };
    if (typeof status === 'number' && status >= 500) return { type: 'ServerError', statusCode: status, message: 'Server error', originalError: error };
  }

  // Default fallback
  return { type: 'UnknownError', message: errorMessage, originalError: error };
}
