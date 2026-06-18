import { Request, Response } from 'express';
import { ReservationService } from '@modules/reservation/services/reservation.service';
import type { ApiResponse } from '@contracts/types';
import type { ReservationDto } from '@contracts/dto';

export class ReservationController {
  private reservationService: ReservationService;

  constructor() {
    this.reservationService = new ReservationService();
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const data = await this.reservationService.create(req.body, req.user!.userId);
    const response: ApiResponse<ReservationDto> = { success: true, data };
    res.status(201).json(response);
  };

  getMyReservations = async (req: Request, res: Response): Promise<void> => {
    const data = await this.reservationService.getMyReservations(req.user!.userId);
    const response: ApiResponse<ReservationDto[]> = { success: true, data };
    res.status(200).json(response);
  };
}
