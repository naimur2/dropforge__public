import request from 'supertest';
import { app } from '../../../app';
import { prismaMock } from '../../../shared/database/__mocks__/prisma';
import bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthController (e2e)', () => {
  const mockUser = {
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('POST /api/auth/register', () => {
    it('should register a user and return 201', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prismaMock.user.create.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('testuser');
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'te', // Too short
          email: 'not-an-email',
          password: '123', // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 409 if email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login and set HttpOnly cookie', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.headers['set-cookie'][0]).toMatch(/accessToken=/);
    });

    it('should return 401 for invalid credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
