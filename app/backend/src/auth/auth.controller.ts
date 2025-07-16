import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { ApiResponse, UserProfile } from '../types/api.types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // 구글 로그인 시작
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const user = req.user;
    const token = await this.authService.generateToken(user);
    
    // JWT cookie 설정
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    
    res.cookie('jwt', token, { 
      httpOnly: true, 
      secure: isProduction, 
      sameSite: isProduction ? 'none' : 'lax',
      domain: isProduction ? undefined : 'localhost',
      path: '/'
    });
    
    // 리디렉션: 프론트엔드 대시보드로 이동
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/dashboard`);
  }
  
  @Get('logout')
  async logout(@Res() res: Response) {
    // JWT 쿠키 삭제 후 프론트엔드로 리디렉션
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    res.clearCookie('jwt', { 
      httpOnly: true, 
      sameSite: isProduction ? 'none' : 'lax'
    });
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    return res.redirect(frontendUrl);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req): Promise<ApiResponse<UserProfile>> {
    // 인증된 사용자의 프로필 정보 반환
    const user = req.user;
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }
}
