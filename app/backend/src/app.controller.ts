import { Controller, Get } from '@nestjs/common';
import { Connection } from 'typeorm';
import { WingsService } from './wings/wings.service'; // WingsService import
import { User } from './users/user.entity';

@Controller()
export class AppController {
  constructor(
    private readonly connection: Connection,
    private readonly wingsService: WingsService, // WingsService 주입
  ) {}

  @Get('/ping-wings')
  async pingWings() {
    try {
      return await this.wingsService.ping();
    } catch (error) {
      return { error: 'Wings에 연결할 수 없습니다.', details: error.message };
    }
  }

  @Get('/db-health')
  async dbHealth() {
    try {
      // DB 타입에 따라 다른 쿼리 사용
      const isOracle = this.connection.options.type === 'oracle';
      const query = isOracle ? 'SELECT 1 FROM DUAL' : 'SELECT 1';
      const result = await this.connection.query(query);
      return { 
        connected: true, 
        dbType: this.connection.options.type,
        result 
      };
    } catch (error) {
      return { 
        connected: false, 
        dbType: this.connection.options.type,
        error: error.message 
      };
    }
  }

  @Get('/users')
  async getAllUsers() {
    // 개발 테스트용: 전체 사용자 목록 반환
    const users = await this.connection.query('SELECT * FROM USERS');
    return users;
  }

  @Get('/seed')
  async seedTestUser() {
    // Direct SQL insert to Oracle USERS table for testing
    const sql = `INSERT INTO USERS (PROVIDER, PROVIDERID, EMAIL, NICKNAME, ROLE, CREATED_AT) \
      VALUES ('seed', 'seed123', 'seed@example.com', 'SeedUser', 'USER', SYSDATE)`;
    try {
      await this.connection.query(sql);
      return { success: true, message: 'Seed user inserted via raw SQL' };
    } catch (error) {
      console.error('Seed SQL failed:', error);
      return { success: false, message: (error as Error).message };
    }
  }
}