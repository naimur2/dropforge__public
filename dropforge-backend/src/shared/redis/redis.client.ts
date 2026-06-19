import Redis from 'ioredis';
import { env } from '@config/env';
import { logger } from '@logger/winston';

export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis server');
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error', err);
});
