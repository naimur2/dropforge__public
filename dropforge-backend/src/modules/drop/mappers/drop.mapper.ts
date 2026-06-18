import type { Drop, Purchase } from '@prisma/client';
import type { DropDto, LatestPurchaserDto } from '@contracts/dto';

type DropWithPurchasers = Drop & {
  purchases: Array<Purchase & { user: { username: string } }>;
};

export class DropMapper {
  static toDto(drop: DropWithPurchasers): DropDto {
    const latestPurchasers: LatestPurchaserDto[] = drop.purchases.map((p) => ({
      username: p.user.username,
    }));

    return {
      id: drop.id,
      name: drop.name,
      imageUrl: drop.imageUrl,
      totalStock: drop.totalStock,
      availableStock: drop.availableStock,
      startAt: drop.startAt.toISOString(),
      createdAt: drop.createdAt.toISOString(),
      latestPurchasers,
    };
  }
}
