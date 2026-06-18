import type { Purchase } from '@prisma/client';
import type { PurchaseDto } from '@contracts/dto';

type PurchaseWithDrop = Purchase & {
  drop: { id: string; name: string; imageUrl: string };
};

export class PurchaseMapper {
  static toDto(purchase: PurchaseWithDrop): PurchaseDto {
    return {
      id: purchase.id,
      userId: purchase.userId,
      dropId: purchase.dropId,
      reservationId: purchase.reservationId,
      createdAt: purchase.createdAt.toISOString(),
      drop: purchase.drop,
    };
  }
}
