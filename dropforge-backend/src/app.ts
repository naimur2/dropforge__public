import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { env } from '@config/env';
import { requestLoggerMiddleware } from '@middleware/request-logger.middleware';
import { errorMiddleware } from '@middleware/error.middleware';
import { authRouter } from '@modules/auth/routes/auth.routes';
import { dropRouter } from '@modules/drop/routes/drop.routes';
import { reservationRouter } from '@modules/reservation/routes/reservation.routes';
import { purchaseRouter } from '@modules/purchase/routes/purchase.routes';
import { swaggerSpec } from '@config/swagger';

const app = express();

// ── Security & Performance ────────────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Request Logging ───────────────────────────────────────────────────────────
app.use(requestLoggerMiddleware);

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/drops', dropRouter);
app.use('/api/reservations', reservationRouter);
app.use('/api/purchases', purchaseRouter);

// ── Swagger ───────────────────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// ── Global Error Handler (must be last) ──────────────────────────────────────
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorMiddleware(err, req, res, next);
});

export { app };
