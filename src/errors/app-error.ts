export type AppErrorOptions = {
  statusCode: number;
  code: string;
  message: string;
  details?: Record<string, unknown> | undefined;
  cause?: unknown;
};

/**
 * Base application error for API-safe failures.
 */
export class AppError extends Error {
  statusCode: number;
  code: string;
  details: Record<string, unknown> | undefined;

  /**
   * @param options Defines the HTTP status, API error code, and safe response data.
   */
  constructor(options: AppErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = this.constructor.name;
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
  }
}

/**
 * Error for invalid client input.
 */
export class BadRequestError extends AppError {
  /**
   * @param message Human-readable validation failure message.
   * @param details Optional machine-readable validation context.
   */
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      statusCode: 400,
      code: 'BAD_REQUEST',
      message,
      details: details,
    });
  }
}

/**
 * Error for unknown routes or missing resources.
 */
export class NotFoundError extends AppError {
  /**
   * @param message Message describing the missing route or resource.
   */
  constructor(message = 'Resource not found') {
    super({
      statusCode: 404,
      code: 'NOT_FOUND',
      message,
    });
  }
}

/**
 * Error for database or persistence failures.
 */
export class DatabaseError extends AppError {
  /**
   * @param message Human-readable database failure message.
   * @param details Optional safe metadata for the API response.
   * @param cause Original thrown error for logging.
   */
  constructor(message = 'Database unavailable', details?: Record<string, unknown>, cause?: unknown) {
    super({
      statusCode: 503,
      code: 'DATABASE_ERROR',
      message,
      details: details,
      cause,
    });
  }
}
