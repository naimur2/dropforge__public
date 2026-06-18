import { Router } from 'express';
import { DropController } from '@modules/drop/controllers/drop.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { createDropSchema } from '@contracts/schemas';
import { z } from 'zod';

const router = Router();
const controller = new DropController();

const idParamSchema = z.object({ id: z.string().uuid() });

/**
 * @swagger
 * /api/drops:
 *   get:
 *     summary: Get all active drops
 *     tags: [Drops]
 *     responses:
 *       200:
 *         description: List of drops with latest purchasers
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/drops/{id}:
 *   get:
 *     summary: Get a drop by ID
 *     tags: [Drops]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Drop found
 *       404:
 *         description: Drop not found
 */
router.get('/:id', validate({ params: idParamSchema }), controller.getById);

/**
 * @swagger
 * /api/drops:
 *   post:
 *     summary: Create a new drop (admin)
 *     tags: [Drops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDropDto'
 *     responses:
 *       201:
 *         description: Drop created
 */
router.post('/', authMiddleware, validate({ body: createDropSchema }), controller.create);

export { router as dropRouter };
