import { prisma } from '@database/prisma';
import { PurchaseRepository } from '@modules/purchase/repositories/purchase.repository';
import { ReservationRepository } from '@modules/reservation/repositories/reservation.repository';
import { PurchaseMapper } from '@modules/purchase/mappers/purchase.mapper';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@exceptions/index';
import { logger } from '@logger/winston';
import { socketServer } from '@websocket/socket.server';
import { SOCKET_EVENTS } from '@contracts/constants';
import type { PurchaseDto, CreatePurchaseDto } from '@contracts/dto';

export class PurchaseService {
  private purchaseRepository: PurchaseRepository;
  private reservationRepository: ReservationRepository;

  constructor() {
    this.purchaseRepository = new PurchaseRepository();
    this.reservationRepository = new ReservationRepository();
  }

  async create(dto: CreatePurchaseDto, userId: string, username: string): Promise<PurchaseDto> {
    const reservation = await this.reservationRepository.findById(dto.reservationId);

    if (!reservation) throw new NotFoundException('Reservation');
    if (reservation.userId !== userId) throw new ForbiddenException('You do not own this reservation');
    if (reservation.status !== 'ACTIVE') {
      throw new ConflictException(
        reservation.status === 'EXPIRED'
          ? 'Reservation has expired'
          : 'Reservation has already been used',
      );
    }
    if (new Date() > reservation.expiresAt) {
      throw new ConflictException('Reservation has expired');
    }

    // Stock was already decremented at reservation time — no stock change needed here
    const { purchase, latestPurchasers } = await prisma.$transaction(async (tx) => {
      const created = await this.purchaseRepository.create(
        {
          userId,
          dropId: reservation.dropId,
          reservationId: dto.reservationId,
        },
        tx as typeof prisma,
      );

      await this.reservationRepository.updateStatus(
        dto.reservationId,
        'PURCHASED',
        tx as typeof prisma,
      );

      const latest = await this.purchaseRepository.findLatestByDrop(reservation.dropId, 3);

      return { purchase: created, latestPurchasers: latest };
    });

    logger.info('Purchase completed', {
      purchaseId: purchase.id,
      userId,
      dropId: reservation.dropId,
    });

    socketServer.emit(SOCKET_EVENTS.PURCHASE_COMPLETED, {
      dropId: reservation.dropId,
      reservationId: dto.reservationId,
      userId,
      username,
      purchaseId: purchase.id,
      latestPurchasers: latestPurchasers.map((p) => ({ username: p.user.username })),
    });

    return PurchaseMapper.toDto(purchase);
  }
}
