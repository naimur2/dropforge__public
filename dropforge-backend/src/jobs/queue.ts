import { Queue, Worker, Job } from 'bullmq';
import { env } from '@config/env';
import { logger } from '@logger/winston';

// BullMQ manages its own ioredis connection internally when given a URL string
// This avoids the ioredis version conflict between bullmq's bundled ioredis and standalone ioredis
const redisUrl = new URL(env.REDIS_URL);
const connection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port || '6379', 10),
  password: redisUrl.password || undefined,
  maxRetriesPerRequest: null as null, // Required by BullMQ
};

const QUEUE_NAME = 'reservation-expiry';

export const reservationExpiryQueue = new Queue(QUEUE_NAME, { connection });

export async function enqueueReservationExpiry(
  reservationId: string,
  delaySeconds: number,
): Promise<void> {
  await reservationExpiryQueue.add(
    'expire',
    { reservationId },
    {
      delay: delaySeconds * 1000,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: true,
      removeOnFail: 100,
    },
  );
  logger.debug('Expiry job enqueued', { reservationId, delaySeconds });
}

let worker: Worker | null = null;

export function startReservationExpiryWorker(): void {
  // Lazy import to avoid circular deps at module load time
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { ReservationService } = require('@modules/reservation/services/reservation.service') as {
    ReservationService: new () => { expireReservation(id: string): Promise<void> };
  };

  const reservationService = new ReservationService();

  worker = new Worker(
    QUEUE_NAME,
    async (job: Job<{ reservationId: string }>) => {
      const { reservationId } = job.data;
      logger.info('Processing reservation expiry', { reservationId, jobId: job.id });
      await reservationService.expireReservation(reservationId);
    },
    { connection },
  );

  worker.on('completed', (job) => {
    logger.info('Expiry job completed', { jobId: job.id });
  });

  worker.on('failed', (job, err) => {
    logger.error('Expiry job failed', { jobId: job?.id, error: err.message });
  });

  logger.info('Reservation expiry worker started');
}

export async function closeJobQueue(): Promise<void> {
  await worker?.close();
  await reservationExpiryQueue.close();
}
