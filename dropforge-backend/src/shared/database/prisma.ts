import { PrismaClient } from '@prisma/client';
import { logger } from '@logger/winston';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    log: [
      { emit: 'stdout', level: 'warn' },
      { emit: 'stdout', level: 'error' },
      ...(process.env.NODE_ENV === 'development'
        ? [{ emit: 'stdout' as const, level: 'query' as const }]
        : []),
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

// Graceful disconnect helper
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}

export type { PrismaClient };
