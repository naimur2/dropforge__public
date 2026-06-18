import { prisma } from '@database/prisma';
import type { Drop } from '@prisma/client';

const DROP_WITH_PURCHASERS = {
  purchases: {
    orderBy: { createdAt: 'desc' as const },
    take: 3,
    include: { user: { select: { username: true } } },
  },
} as const;

export interface FindAllDropsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export class DropRepository {
  async findAll(options: FindAllDropsOptions = {}) {
    const { page = 1, limit = 12, search, status } = options;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (status === 'available') {
      where.startAt = { lte: new Date() };
      where.availableStock = { gt: 0 };
    } else if (status === 'coming soon') {
      where.startAt = { gt: new Date() };
    } else if (status === 'soldout') {
      where.availableStock = 0;
    }

    const [data, total] = await Promise.all([
      prisma.drop.findMany({
        where,
        orderBy: { startAt: 'desc' },
        include: DROP_WITH_PURCHASERS,
        skip,
        take: limit,
      }),
      prisma.drop.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return prisma.drop.findUnique({
      where: { id },
      include: DROP_WITH_PURCHASERS,
    });
  }

  async findByIdForUpdate(id: string, tx: typeof prisma) {
    // Raw query for SELECT FOR UPDATE row lock (Prisma doesn't natively support it)
    const result = await tx.$queryRaw<Drop[]>`
      SELECT * FROM drops WHERE id = ${id}::text FOR UPDATE
    `;
    return result[0] ?? null;
  }

  async create(data: {
    name: string;
    imageUrl: string;
    totalStock: number;
    availableStock: number;
    startAt: Date;
  }) {
    return prisma.drop.create({ data, include: DROP_WITH_PURCHASERS });
  }

  async decrementStock(id: string, tx: typeof prisma): Promise<Drop> {
    return tx.drop.update({
      where: { id },
      data: { availableStock: { decrement: 1 } },
    });
  }

  async incrementStock(id: string, tx: typeof prisma): Promise<Drop> {
    return tx.drop.update({
      where: { id },
      data: { availableStock: { increment: 1 } },
    });
  }

  async update(id: string, data: Partial<{
    name: string;
    imageUrl: string;
    totalStock: number;
    availableStock: number;
    startAt: Date;
  }>) {
    return prisma.drop.update({
      where: { id },
      data,
      include: DROP_WITH_PURCHASERS,
    });
  }

  async delete(id: string) {
    return prisma.drop.delete({
      where: { id },
    });
  }
}
