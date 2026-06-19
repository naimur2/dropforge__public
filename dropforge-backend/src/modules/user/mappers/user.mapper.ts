import type { User } from '@prisma/client';
import type { UserDto } from '@contracts/dto';

export class UserMapper {
  static toDto(user: User): UserDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
