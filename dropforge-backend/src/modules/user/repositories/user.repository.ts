import type { User } from '@prisma/client';
import { prisma } from '@database/prisma';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } });
  }

  async create(data: { username: string; email: string; passwordHash: string }): Promise<User> {
    return prisma.user.create({ data });
  }
}
