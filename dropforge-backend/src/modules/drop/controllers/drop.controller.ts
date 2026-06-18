import { Request, Response } from 'express';
import { DropService } from '@modules/drop/services/drop.service';
import type { ApiResponse } from '@contracts/types';
import type { DropDto } from '@contracts/dto';

export class DropController {
  private dropService: DropService;

  constructor() {
    this.dropService = new DropService();
  }

  getAll = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.dropService.getAll();
    const response: ApiResponse<DropDto[]> = { success: true, data };
    res.status(200).json(response);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const data = await this.dropService.getById(req.params.id);
    const response: ApiResponse<DropDto> = { success: true, data };
    res.status(200).json(response);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const data = await this.dropService.create(req.body);
    const response: ApiResponse<DropDto> = { success: true, data };
    res.status(201).json(response);
  };
}
