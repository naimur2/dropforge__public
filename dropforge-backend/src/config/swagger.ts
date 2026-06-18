import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { env } from '@config/env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'DropForge API',
      version: '1.0.0',
      description:
        'Enterprise-grade real-time inventory reservation platform for high-concurrency merch and sneaker drops.',
    },
    servers: [{ url: `http://localhost:${env.PORT}`, description: 'Development server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterDto: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: { type: 'string', minLength: 3 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
          },
        },
        LoginDto: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        CreateDropDto: {
          type: 'object',
          required: ['name', 'imageUrl', 'totalStock', 'startAt'],
          properties: {
            name: { type: 'string' },
            imageUrl: { type: 'string', format: 'uri' },
            totalStock: { type: 'integer', minimum: 1 },
            startAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateReservationDto: {
          type: 'object',
          required: ['dropId'],
          properties: {
            dropId: { type: 'string', format: 'uuid' },
          },
        },
        CreatePurchaseDto: {
          type: 'object',
          required: ['reservationId'],
          properties: {
            reservationId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, '../modules/**/routes/*.{ts,js}')],
};

export const swaggerSpec = swaggerJsdoc(options);
