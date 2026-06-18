import { Request, Response } from 'express';
import { DropService } from '@modules/drop/services/drop.service';
import type { ApiResponse } from '@contracts/types';
import type { DropDto } from '@contracts/dto';

export class DropController {
  private dropService: DropService;

  constructor() {
    this.dropService = new DropService();
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 12;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;

    const result = await this.dropService.getAll({ page, limit, search, status });
    // result contains { data, meta }
    res.status(200).json({ success: true, ...result });
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

  update = async (req: Request, res: Response): Promise<void> => {
    const data = await this.dropService.update(req.params.id, req.body);
    const response: ApiResponse<DropDto> = { success: true, data };
    res.status(200).json(response);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    await this.dropService.delete(req.params.id);
    res.status(204).send();
  };
}
