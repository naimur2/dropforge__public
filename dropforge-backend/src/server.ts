import 'dotenv/config';
import http from 'http';
import { app } from './app';
import { env } from '@config/env';
import { logger } from '@logger/winston';
import { initSocketServer } from '@websocket/socket.server';
import { startReservationExpiryWorker, closeJobQueue } from '@jobs/queue';
import { prisma } from '@database/prisma';

async function bootstrap(): Promise<void> {
  // Verify DB connection before starting
  await prisma.$connect();
  logger.info('Database connected');

  const httpServer = http.createServer(app);

  // Attach Socket.io to the HTTP server
  initSocketServer(httpServer);
  logger.info('Socket.io server initialized');

  // Start BullMQ worker
  startReservationExpiryWorker();
  logger.info('BullMQ reservation expiry worker started');

  httpServer.listen(env.PORT, () => {
    logger.info(`DropForge API running on port ${env.PORT}`, {
      env: env.NODE_ENV,
      docs: `http://localhost:${env.PORT}/api/docs`,
    });
  });

  // ── Graceful Shutdown ─────────────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    await closeJobQueue();
    await prisma.$disconnect();
    httpServer.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
