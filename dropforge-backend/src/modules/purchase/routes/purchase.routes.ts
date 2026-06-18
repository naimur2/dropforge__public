import { Router } from 'express';
import { PurchaseController } from '@modules/purchase/controllers/purchase.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { createPurchaseSchema } from '@contracts/schemas';

const router = Router();
const controller = new PurchaseController();

router.use(authMiddleware);

/**
 * @swagger
 * /api/purchases:
 *   post:
 *     summary: Complete purchase using an active reservation
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePurchaseDto'
 *     responses:
 *       201:
 *         description: Purchase completed
 *       403:
 *         description: Not your reservation
 *       409:
 *         description: Reservation expired or already used
 */
router.post('/', validate({ body: createPurchaseSchema }), controller.create);

export { router as purchaseRouter };
