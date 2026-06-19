import { Request, Response, NextFunction } from 'express';
import { redisClient } from '@shared/redis/redis.client';
import { logger } from '@logger/winston';

interface RateLimiterOptions {
  limit: number;
  windowSeconds: number;
}

export const rateLimiter = ({ limit, windowSeconds }: RateLimiterOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const key = `rate_limit:${req.route?.path || req.path}:${ip}`;
      const now = Date.now();
      const windowStart = now - windowSeconds * 1000;

      // Use a Redis pipeline for atomicity
      const pipeline = redisClient.pipeline();
      
      // Remove elements older than the sliding window
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Add the current request timestamp
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      
      // Count the number of requests in the current window
      pipeline.zcard(key);
      
      // Set the expiration on the key to automatically clean up
      pipeline.expire(key, windowSeconds);

      const results = await pipeline.exec();
      if (!results) {
        return next();
      }

      // zcard result is at index 2 (third command in pipeline)
      const requestCount = results[2][1] as number;

      if (requestCount > limit) {
        logger.warn(`Rate limit exceeded for IP: ${ip} on route ${req.path}`);
        return res.status(429).json({
          status: 'error',
          message: 'Too many requests. Please try again later.',
        });
      }

      next();
    } catch (error) {
      logger.error('Rate limiter middleware error', error);
      // Fail open to avoid blocking valid requests if Redis is down
      next();
    }
  };
};
