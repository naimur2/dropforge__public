import { Request, Response } from 'express';
import { PurchaseService } from '@modules/purchase/services/purchase.service';
import type { ApiResponse } from '@contracts/types';
import type { PurchaseDto } from '@contracts/dto';

export class PurchaseController {
  private purchaseService: PurchaseService;

  constructor() {
    this.purchaseService = new PurchaseService();
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const data = await this.purchaseService.create(
      req.body,
      req.user!.userId,
      req.user!.username,
    );
    const response: ApiResponse<PurchaseDto> = { success: true, data };
    res.status(201).json(response);
  };
}
