import { Router } from 'express';
import { ReservationController } from '@modules/reservation/controllers/reservation.controller';
import { validate } from '@middleware/validate.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { createReservationSchema } from '@contracts/schemas';

const router = Router();
const controller = new ReservationController();

router.use(authMiddleware);

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Reserve inventory for a drop
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReservationDto'
 *     responses:
 *       201:
 *         description: Reservation created (60 second window)
 *       409:
 *         description: No stock available or already reserved
 */
router.post('/', validate({ body: createReservationSchema }), controller.create);

/**
 * @swagger
 * /api/reservations/me:
 *   get:
 *     summary: Get current user's reservations
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reservations
 */
router.get('/me', controller.getMyReservations);

export { router as reservationRouter };
