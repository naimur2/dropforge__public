import type { Reservation } from '@prisma/client';
import type { ReservationDto } from '@contracts/dto';
import { ReservationStatus } from '@contracts/enums';

type ReservationWithDrop = Reservation & {
  drop: { id: string; name: string; imageUrl: string };
};

export class ReservationMapper {
  static toDto(reservation: ReservationWithDrop): ReservationDto {
    return {
      id: reservation.id,
      userId: reservation.userId,
      dropId: reservation.dropId,
      status: reservation.status as ReservationStatus,
      expiresAt: reservation.expiresAt.toISOString(),
      createdAt: reservation.createdAt.toISOString(),
      drop: reservation.drop,
    };
  }
}
