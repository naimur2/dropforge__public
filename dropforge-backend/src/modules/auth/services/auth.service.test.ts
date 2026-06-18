import { AuthService } from './auth.service';
import { prismaMock } from '../../../shared/database/__mocks__/prisma';
import bcrypt from 'bcryptjs';
import { UnauthorizedException, ConflictException } from '../../../shared/exceptions';

jest.mock('bcryptjs');

describe('AuthService', () => {
  const mockUser = {
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(2); // One for email, one for username
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12); // AuthService uses salt 12
      expect(prismaMock.user.create).toHaveBeenCalled();
      expect(result.user.username).toBe('testuser');
    });

    it('should throw ConflictException if email is already in use', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);

      await expect(
        authService.register({
          username: 'newuser',
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(ConflictException);
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException with invalid password', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'notfound@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
