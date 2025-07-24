import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../types/api.types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Google OAuth에서 반환된 프로필 정보로 사용자 생성 또는 조회
   */
  async validateUser(profile: any): Promise<User> {
    const { id: providerId, emails, displayName } = profile;
    const email = emails[0].value;
    
    // 먼저 provider와 providerId로 조회
    let user = await this.userRepository.findOne({ where: { provider: 'google', providerId } });
    
    if (!user) {
      // providerId로 찾지 못했으면 이메일로도 조회 (기존 계정이 있을 수 있음)
      user = await this.userRepository.findOne({ where: { email } });
      
      if (!user) {
        // 완전히 새로운 사용자 생성
        user = this.userRepository.create({
          provider: 'google',
          providerId,
          email,
          nickname: displayName,
          role: 'USER',
        });
        
        try {
          await this.userRepository.save(user);
        } catch (error) {
          // 중복 제약 위반 등의 경우 다시 조회
          console.warn('User save failed, attempting to find existing user:', error.message);
          user = await this.userRepository.findOne({ where: { email } }) ||
                 await this.userRepository.findOne({ where: { provider: 'google', providerId } });
          
          if (!user) {
            throw new Error('Failed to create or find user after save error');
          }
        }
      } else {
        // 이메일로 찾은 기존 사용자의 provider 정보 업데이트
        user.provider = 'google';
        user.providerId = providerId;
        try {
          await this.userRepository.save(user);
        } catch (error) {
          console.warn('Failed to update provider info:', error.message);
          // 업데이트 실패해도 기존 user 객체는 유효하므로 계속 진행
        }
      }
    }
    
    return user;
  }

  /**
   * JWT 토큰 생성
   */
  async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    
    return this.jwtService.sign(payload);
  }

  /**
   * 사용자 ID로 사용자 정보 조회
   */
  async findUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}
