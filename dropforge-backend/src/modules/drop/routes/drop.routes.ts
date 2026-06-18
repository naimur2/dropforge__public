import { Router } from 'express';
import { DropController } from '@modules/drop/controllers/drop.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { createDropSchema, updateDropSchema } from '@contracts/schemas';
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
 *     summary: Create a new drop
 *     description: You must be logged in to create a drop. Just authenticate and provide the required fields to add a drop to the store.
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

/**
 * @swagger
 * /api/drops/{id}:
 *   put:
 *     summary: Update an existing drop
 *     tags: [Drops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDropDto'
 *     responses:
 *       200:
 *         description: Drop updated
 *       404:
 *         description: Drop not found
 */
router.put('/:id', authMiddleware, validate({ params: idParamSchema, body: updateDropSchema }), controller.update);

/**
 * @swagger
 * /api/drops/{id}:
 *   delete:
 *     summary: Delete a drop
 *     tags: [Drops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Drop deleted
 *       404:
 *         description: Drop not found
 */
router.delete('/:id', authMiddleware, validate({ params: idParamSchema }), controller.delete);

export { router as dropRouter };
