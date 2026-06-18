import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '@config/env';
import { ConflictException, UnauthorizedException } from '@exceptions/index';
import { UserRepository } from '@modules/user/repositories/user.repository';
import { UserMapper } from '@modules/user/mappers/user.mapper';
import type { RegisterDto, LoginDto, AuthResponseDto, UserDto } from '@contracts/dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: UserDto;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    const [existingEmail, existingUsername] = await Promise.all([
      this.userRepository.findByEmail(dto.email),
      this.userRepository.findByUsername(dto.username),
    ]);

    if (existingEmail) {
      throw new ConflictException('Email is already registered');
    }
    if (existingUsername) {
      throw new ConflictException('Username is already taken');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.userRepository.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
    });

    const tokens = this.generateTokens(user.id);
    return { user: UserMapper.toDto(user), ...tokens };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = this.generateTokens(user.id);
    return { user: UserMapper.toDto(user), ...tokens };
  }

  private generateTokens(userId: string) {
    const accessToken = jwt.sign({ userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    return { accessToken, refreshToken };
  }
}
