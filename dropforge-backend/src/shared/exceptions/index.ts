// ─── Base Exception ───────────────────────────────────────────────────────────

export class BaseException extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── 400 ──────────────────────────────────────────────────────────────────────

export class ValidationException extends BaseException {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

// ─── 401 ──────────────────────────────────────────────────────────────────────

export class UnauthorizedException extends BaseException {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// ─── 403 ──────────────────────────────────────────────────────────────────────

export class ForbiddenException extends BaseException {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

// ─── 404 ──────────────────────────────────────────────────────────────────────

export class NotFoundException extends BaseException {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

// ─── 409 ──────────────────────────────────────────────────────────────────────

export class ConflictException extends BaseException {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

// ─── 500 ──────────────────────────────────────────────────────────────────────

export class InternalServerException extends BaseException {
  constructor(message = 'Internal server error') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}
