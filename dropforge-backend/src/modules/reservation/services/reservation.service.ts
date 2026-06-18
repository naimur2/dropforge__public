import { prisma } from '@database/prisma';
import { ReservationRepository } from '@modules/reservation/repositories/reservation.repository';
import { DropRepository } from '@modules/drop/repositories/drop.repository';
import { ReservationMapper } from '@modules/reservation/mappers/reservation.mapper';
import { ConflictException, NotFoundException } from '@exceptions/index';
import { logger } from '@logger/winston';
import { enqueueReservationExpiry } from '@jobs/queue';
import { socketServer } from '@websocket/socket.server';
import { SOCKET_EVENTS, RESERVATION_DURATION_SECONDS } from '@contracts/constants';
import type { ReservationDto, CreateReservationDto } from '@contracts/dto';

export class ReservationService {
  private reservationRepository: ReservationRepository;
  private dropRepository: DropRepository;

  constructor() {
    this.reservationRepository = new ReservationRepository();
    this.dropRepository = new DropRepository();
  }

  async create(dto: CreateReservationDto, userId: string): Promise<ReservationDto> {
    // Check for existing active reservation first (fast path, outside transaction)
    const existingReservation = await this.reservationRepository.findActiveByUserAndDrop(
      userId,
      dto.dropId,
    );
    if (existingReservation) {
      throw new ConflictException('You already have an active reservation for this drop');
    }

    // ── Transactional section ────────────────────────────────────────────────
    const { reservation, availableStock } = await prisma.$transaction(async (tx) => {
      // SELECT FOR UPDATE — acquires row-level lock, prevents overselling
      const drop = await this.dropRepository.findByIdForUpdate(dto.dropId, tx as typeof prisma);

      if (!drop) throw new NotFoundException('Drop');
      if (drop.availableStock <= 0) {
        throw new ConflictException('No stock available for this drop');
      }

      // Decrement stock atomically inside transaction
      const updatedDrop = await this.dropRepository.decrementStock(dto.dropId, tx as typeof prisma);

      const expiresAt = new Date(Date.now() + RESERVATION_DURATION_SECONDS * 1000);
      const created = await this.reservationRepository.create(
        { userId, dropId: dto.dropId, expiresAt },
        tx as typeof prisma,
      );

      return { reservation: created, availableStock: updatedDrop.availableStock };
    });
    // ────────────────────────────────────────────────────────────────────────

    // Schedule expiry job after transaction commits
    await enqueueReservationExpiry(reservation.id, RESERVATION_DURATION_SECONDS);

    logger.info('Reservation created', { reservationId: reservation.id, userId, dropId: dto.dropId });

    // Broadcast to all connected clients
    socketServer.emit(SOCKET_EVENTS.STOCK_UPDATED, {
      dropId: dto.dropId,
      availableStock,
    });
    socketServer.emit(SOCKET_EVENTS.RESERVATION_CREATED, {
      dropId: dto.dropId,
      reservationId: reservation.id,
      userId,
      expiresAt: reservation.expiresAt.toISOString(),
      availableStock,
    });

    // Reload with drop relation for the DTO
    const full = await this.reservationRepository.findById(reservation.id);
    return ReservationMapper.toDto(full!);
  }

  async getMyReservations(userId: string): Promise<ReservationDto[]> {
    const reservations = await this.reservationRepository.findByUserId(userId);
    return reservations.map(ReservationMapper.toDto);
  }

  async expireReservation(reservationId: string): Promise<void> {
    const reservation = await this.reservationRepository.findById(reservationId);

    if (!reservation || reservation.status !== 'ACTIVE') {
      // Already purchased or previously expired — nothing to do
      return;
    }

    const { availableStock } = await prisma.$transaction(async (tx) => {
      await this.reservationRepository.updateStatus(reservationId, 'EXPIRED', tx as typeof prisma);
      const updatedDrop = await this.dropRepository.incrementStock(
        reservation.dropId,
        tx as typeof prisma,
      );
      return { availableStock: updatedDrop.availableStock };
    });

    logger.info('Reservation expired', { reservationId, dropId: reservation.dropId });

    socketServer.emit(SOCKET_EVENTS.STOCK_UPDATED, {
      dropId: reservation.dropId,
      availableStock,
    });
    socketServer.emit(SOCKET_EVENTS.RESERVATION_EXPIRED, {
      dropId: reservation.dropId,
      reservationId,
      availableStock,
    });
  }
}
