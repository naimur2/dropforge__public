import { prisma } from '@database/prisma';
import type { Purchase } from '@prisma/client';

const PURCHASE_WITH_DROP = {
  drop: { select: { id: true, name: true, imageUrl: true } },
} as const;

export class PurchaseRepository {
  async findByUserId(userId: string) {
    return prisma.purchase.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: PURCHASE_WITH_DROP,
    });
  }

  async create(
    data: { userId: string; dropId: string; reservationId: string },
    tx: typeof prisma,
  ) {
    return tx.purchase.create({
      data,
      include: {
        ...PURCHASE_WITH_DROP,
        user: { select: { username: true } },
      },
    });
  }

  async findLatestByDrop(dropId: string, limit = 3) {
    return prisma.purchase.findMany({
      where: { dropId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { username: true } } },
    });
  }
}
