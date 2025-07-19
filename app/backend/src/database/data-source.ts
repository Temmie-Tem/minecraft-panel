// src/database/data-source.ts
// TypeORM 마이그레이션용 DataSource 설정
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';
import * as entities from '../entities';

// 환경변수 로드
config();

const isProduction = process.env.NODE_ENV === 'production';
const dbType = process.env.DB_TYPE;
const isSqlite = dbType === 'sqlite';

export const AppDataSource = new DataSource({
  ...(isSqlite
    ? {
        type: 'sqlite' as const,
        database: process.env.DB_DATABASE || 'dev.sqlite',
      }
    : {
        type: 'oracle' as const,
        connectString: process.env.DB_CONNECT_STRING,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        logging: ['error', 'warn', 'info'],
        connectTimeout: 60000,
        requestTimeout: 30000,
      }),
  entities: Object.values(entities),
  migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false, // 마이그레이션 사용 시 false로 설정
  logging: isProduction ? ['error'] : ['error', 'warn', 'info', 'log'],
});