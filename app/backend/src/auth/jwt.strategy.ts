import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 쿠키에서 JWT 추출 (우선순위)
        (request: Request) => {
          return request?.cookies?.jwt || null;
        },
        // Authorization 헤더에서도 추출 (fallback)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    // JWT 토큰에서 추출한 정보로 사용자 검증
    const user = await this.authService.findUserById(payload.sub);
    
    if (!user) {
      console.warn('JWT validation failed: User not found for ID:', payload.sub);
      return null;
    }
    
    return user;
  }
}
