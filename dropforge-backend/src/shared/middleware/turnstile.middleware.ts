import { Request, Response, NextFunction } from 'express';
import { env } from '@config/env';
import { logger } from '@logger/winston';

export const turnstileMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.body.turnstileToken;

    if (!token) {
      logger.warn('Turnstile verification failed: Token missing');
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Bot verification failed. Please refresh the page and try again.',
        }
      });
    }

    const formData = new URLSearchParams();
    formData.append('secret', env.TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (ip && typeof ip === 'string') {
      formData.append('remoteip', ip);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const data = (await response.json()) as { success: boolean; 'error-codes'?: string[] };

    if (!data.success) {
      logger.warn('Turnstile verification failed: Invalid token', { errorCodes: data['error-codes'] });
      const codes = data['error-codes']?.join(', ') || 'Unknown error';
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Bot verification failed (${codes}). Please refresh the page and try again.`,
        }
      });
    }

    next();
  } catch (error) {
    logger.error('Turnstile middleware error', error);
    // Fail closed for bot protection (or fail open depending on risk tolerance)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during bot verification.',
      }
    });
  }
};
