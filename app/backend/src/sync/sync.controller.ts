import { Controller, Post, Get, Body, Logger, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { ServersService } from '../servers/servers.service';
import { WingsService } from '../wings/wings.service';

interface SyncData {
  timestamp: string;
  wingsVersion: string;
  containers: Array<{
    serverId: string;
    containerId: string;
    status: string;
    createdAt: string;
    image: string;
  }>;
  directories: Array<{
    name: string;
    path: string;
    hasServerProperties: boolean;
  }>;
  summary: {
    totalContainers: number;
    totalDirectories: number;
    runningContainers: number;
  };
}

export interface WingsSyncData {
  containers: Array<{
    id: string;
    name: string;
    state: string;
    created: string;
    image: string;
    ports: string;
    command: string;
    status: string;
  }>;
  directories: string[];
  timestamp: string;
}

@Controller('sync')
export class SyncController {
  private readonly logger = new Logger(SyncController.name);

  constructor(
    private readonly serversService: ServersService,
    private readonly wingsService: WingsService,
  ) {}

  @Post('wings-to-panel')
  async receiveSyncFromWings(@Body() syncData: SyncData) {
    try {
      this.logger.log(`Received sync data from Wings: ${syncData.containers.length} containers`);
      
      // Wings 컨테이너 상태를 DB와 동기화
      for (const container of syncData.containers) {
        await this.updateServerStatus(container.serverId, container.status);
      }

      return {
        success: true,
        processed: syncData.containers.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to process sync data from Wings', error.stack);
      throw new InternalServerErrorException('Sync processing failed');
    }
  }

  @Get('status')
  async getSyncStatus() {
    try {
      // Wings에서 현재 서버 목록 가져오기
      const wingsServers = await this.wingsService.getAllServers();
      
      // DB에서 서버 목록 가져오기
      const dbServers = await this.serversService.findAll();

      return {
        wings: {
          servers: wingsServers.servers.length,
          running: wingsServers.servers.filter(s => s.status === 'running').length,
        },
        database: {
          servers: dbServers.length,
        },
        lastSync: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get sync status', error.stack);
      throw new InternalServerErrorException('Failed to get sync status');
    }
  }

  private async updateServerStatus(wingsServerId: string, status: string) {
    try {
      // wingsServerId로 DB에서 서버 찾기
      const server = await this.serversService.findByWingsId(wingsServerId);
      if (server) {
        this.logger.debug(`Updating server ${server.name} status to ${status}`);
        await this.serversService.updateStatus(server.id, status);
        this.logger.log(`Successfully updated server ${server.name} (${wingsServerId}) status to ${status}`);
      } else {
        this.logger.warn(`Server with Wings ID ${wingsServerId} not found in database`);
      }
    } catch (error) {
      this.logger.warn(`Failed to update server status for Wings ID ${wingsServerId}`, error.message);
    }
  }
}
