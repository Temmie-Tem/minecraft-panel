import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { WingsModule } from './wings/wings.module';
import * as oracledb from 'oracledb';
import * as path from 'path';
import { User } from './users/user.entity';
import { configValidationSchema, databaseConfig, jwtConfig, googleConfig, appConfig } from './config/environment.config';

// Oracle 클라이언트 초기화 함수
const initializeOracleClient = (configService: ConfigService) => {
  const dbType = configService.get<string>('DB_TYPE');
  const tnsAdmin = configService.get<string>('DB_TNS_ADMIN');
  
  if (dbType === 'oracle' && tnsAdmin) {
    try {
      // Wallet(TNS) 설정 디렉터리
      const configDir = path.isAbsolute(tnsAdmin) ? tnsAdmin : path.join(process.cwd(), tnsAdmin);
      // Instant Client 라이브러리 디렉터리 (Windows용 경로)
      const libDir = path.join(process.cwd(), 'OracleDB', 'instantclient_23_8');
      
      console.log('Initializing Oracle Client with:');
      console.log('  libDir:', libDir);
      console.log('  configDir:', configDir);
      
      // TNS_ADMIN 환경변수 설정 (중요!)
      process.env.TNS_ADMIN = configDir;
      // 추가적인 Oracle 환경변수 설정
      process.env.ORACLE_HOME = libDir;
      
      oracledb.initOracleClient({ libDir, configDir });
      console.log('Oracle Instant Client initialized successfully');
      console.log('TNS_ADMIN set to:', process.env.TNS_ADMIN);
    } catch (err) {
      console.error('Failed to initialize Oracle Instant Client:', err);
      throw err;
    }
  }
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      load: [databaseConfig, jwtConfig, googleConfig, appConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Oracle 클라이언트 초기화를 여기서 수행
        initializeOracleClient(configService);
        
        const dbType = configService.get<string>('DB_TYPE');
        const isSqlite = dbType === 'sqlite';
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        
        console.log('Database configuration:');
        console.log('  DB_TYPE:', dbType);
        console.log('  isSqlite:', isSqlite);
        
        return {
          ...(isSqlite
            ? {
                type: 'sqlite' as const,
                database: configService.get<string>('DB_DATABASE'),
              }
            : {
                type: 'oracle' as const,
                connectString: configService.get<string>('DB_CONNECT_STRING'),
                username: configService.get<string>('DB_USER'),
                password: configService.get<string>('DB_PASS'),
                logging: ['error', 'warn', 'info'],
                connectTimeout: 60000,
                requestTimeout: 30000,
              }),
          entities: [User],
          // In development, drop schema and synchronize to recreate tables from entities
          dropSchema: !isProduction,
          synchronize: !isProduction,
          retryAttempts: 3,
          retryDelay: 3000,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    WingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
