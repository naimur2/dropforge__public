import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '@config/env';
import { logger } from '@logger/winston';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '@contracts/events';
import { SOCKET_EVENTS } from '@contracts/constants';

export let socketServer: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export function initSocketServer(httpServer: HttpServer): void {
  socketServer = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });

  // Middleware for JWT authentication
  socketServer.use((socket, next) => {
    let token = socket.handshake.auth.token;

    // Fallback to parsing cookies if auth.token isn't provided explicitly
    if (!token && socket.request.headers.cookie) {
      const cookies = socket.request.headers.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'accessToken') {
          token = value;
          break;
        }
      }
    }

    if (!token) {
      logger.warn('Socket connection rejected: No token provided');
      return next(new Error('Authentication error'));
    }

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      socket.data.userId = payload.userId;
      next();
    } catch (error) {
      logger.error('Socket connection rejected: Invalid token');
      next(new Error('Authentication error'));
    }
  });

  socketServer.on('connection', (socket) => {
    logger.info('Socket connected', { socketId: socket.id, userId: socket.data.userId });

    // socket.io event maps use string keys — cast to accept typed handlers
    socket.on(SOCKET_EVENTS.JOIN_DROP, ((data: { dropId: string }) => {
      socket.join(`drop:${data.dropId}`);
      logger.debug('Socket joined drop room', { socketId: socket.id, dropId: data.dropId });
    }) as (data: unknown) => void);

    socket.on(SOCKET_EVENTS.LEAVE_DROP, ((data: { dropId: string }) => {
      socket.leave(`drop:${data.dropId}`);
    }) as (data: unknown) => void);

    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected', { socketId: socket.id, reason });
    });
  });
}
