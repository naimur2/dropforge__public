import { Request, Response } from 'express';
import { AuthService } from '@modules/auth/services/auth.service';
import type { ApiResponse } from '@contracts/types';
import type { AuthResponseDto } from '@contracts/dto';
import { env } from '@config/env';
import jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@exceptions/index';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  register = async (req: Request, res: Response<ApiResponse<AuthResponseDto>>) => {
    const { user, accessToken, refreshToken } = await this.authService.register(req.body);
    
    this.setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      data: { user },
    });
  };

  login = async (req: Request, res: Response<ApiResponse<AuthResponseDto>>) => {
    const { user, accessToken, refreshToken } = await this.authService.login(req.body);

    this.setCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      data: { user },
    });
  };

  refresh = async (req: Request, res: Response<ApiResponse<AuthResponseDto>>) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
      
      const newAccessToken = jwt.sign({ userId: decoded.userId }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      });
      
      const newRefreshToken = jwt.sign({ userId: decoded.userId }, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      });

      this.setCookies(res, newAccessToken, newRefreshToken);

      res.json({
        success: true,
        data: null as any, // Not strictly used by frontend, just returns 200 OK
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  };

  logout = async (req: Request, res: Response<ApiResponse<null>>) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.json({
      success: true,
      data: null,
    });
  };

  me = async (req: Request, res: Response<ApiResponse<any>>) => {
    res.json({
      success: true,
      data: req.user,
    });
  };
}
