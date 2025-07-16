import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { WingsController } from './wings.controller';
import { WingsService } from './wings.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [WingsController],
  providers: [WingsService],
  exports: [WingsService],
})
export class WingsModule {}
