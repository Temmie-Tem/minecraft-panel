import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 쿠키 파싱 미들웨어 추가
  app.use(cookieParser());
  
  // CORS 설정: 환경변수 기반
  const isProduction = process.env.NODE_ENV === 'production';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const corsOrigins = process.env.CORS_ALLOWED_ORIGINS 
    ? process.env.CORS_ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];
  
  const allowedOrigins = isProduction ? [frontendUrl] : corsOrigins;
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = parseInt(process.env.PORT || '3001', 10);
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server listening on http://localhost:${port}`);
}
bootstrap();
