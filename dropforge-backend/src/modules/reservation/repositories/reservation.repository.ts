import { prisma } from '@database/prisma';
import type { Reservation, ReservationStatus } from '@prisma/client';

const RESERVATION_WITH_DROP = {
  drop: { select: { id: true, name: true, imageUrl: true } },
} as const;

export class ReservationRepository {
  async findById(id: string) {
    return prisma.reservation.findUnique({
      where: { id },
      include: RESERVATION_WITH_DROP,
    });
  }

  async findByUserId(userId: string) {
    return prisma.reservation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: RESERVATION_WITH_DROP,
    });
  }

  async findActiveByUserAndDrop(userId: string, dropId: string) {
    return prisma.reservation.findFirst({
      where: { userId, dropId, status: 'ACTIVE' },
    });
  }

  async create(
    data: { userId: string; dropId: string; expiresAt: Date },
    tx: typeof prisma,
  ) {
    return tx.reservation.create({
      data: {
        userId: data.userId,
        dropId: data.dropId,
        status: 'ACTIVE',
        expiresAt: data.expiresAt,
      },
    });
  }

  async updateStatus(
    id: string,
    status: ReservationStatus,
    tx: typeof prisma = prisma,
  ): Promise<Reservation> {
    return tx.reservation.update({ where: { id }, data: { status } });
  }
}
