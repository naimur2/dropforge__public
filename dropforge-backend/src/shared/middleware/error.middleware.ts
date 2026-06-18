import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { BaseException, ValidationException } from '@exceptions/index';
import { logger } from '@logger/winston';
import type { ApiErrorResponse } from '@contracts/types';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation error
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    const response: ApiErrorResponse = {
      success: false,
      error: { code: 'VALIDATION_ERROR', message },
    };
    res.status(400).json(response);
    return;
  }

  // Known application error
  if (err instanceof BaseException) {
    if (err.statusCode >= 500) {
      logger.error(err.message, { stack: err.stack, code: err.code });
    }
    const response: ApiErrorResponse = {
      success: false,
      error: { code: err.code, message: err.message },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Unknown error — never expose internals
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  const response: ApiErrorResponse = {
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
  };
  res.status(500).json(response);
}
