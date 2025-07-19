import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ServerInfo, ServerActionResponse, ServerDeleteResponse, ServerDeleteOptions } from './dto/wings.dto';

@Injectable()
export class WingsService {
  private readonly logger = new Logger(WingsService.name);
  private readonly wingsApiUrl: string;
  private readonly internalApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.wingsApiUrl = this.configService.get<string>('WINGS_API_URL') || 'http://localhost:8080';
    this.internalApiKey = this.configService.get<string>('INTERNAL_API_KEY');
    
    if (!this.internalApiKey) {
      this.logger.warn('INTERNAL_API_KEY is not configured. Wings API calls may fail due to authentication.');
    }
  }

  private getApiUrl(serverId: string, path: string = ''): string {
    return `${this.wingsApiUrl}/api/v1/servers/${serverId}${path}`;
  }

  private getAuthHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.internalApiKey) {
      headers['Authorization'] = `Bearer ${this.internalApiKey}`;
    }

    return headers;
  }

  async getServerInfo(serverId: string): Promise<ServerInfo> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.getApiUrl(serverId), {
          headers: this.getAuthHeaders(),
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get server info for ${serverId}`, error.stack);
      throw new InternalServerErrorException('Failed to communicate with Wings service');
    }
  }

  async startServer(serverId: string): Promise<ServerActionResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(this.getApiUrl(serverId, '/start'), {}, {
          headers: this.getAuthHeaders(),
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to start server ${serverId}`, error.stack);
      throw new InternalServerErrorException('Failed to communicate with Wings service');
    }
  }

  async stopServer(serverId: string): Promise<ServerActionResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(this.getApiUrl(serverId, '/stop'), {}, {
          headers: this.getAuthHeaders(),
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to stop server ${serverId}`, error.stack);
      throw new InternalServerErrorException('Failed to communicate with Wings service');
    }
  }

  async deleteServer(serverId: string, options: ServerDeleteOptions = {}): Promise<ServerDeleteResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (options.removeData) queryParams.append('removeData', 'true');
      if (options.force) queryParams.append('force', 'true');
      
      const url = this.getApiUrl(serverId) + (queryParams.toString() ? `?${queryParams.toString()}` : '');
      
      const response = await firstValueFrom(
        this.httpService.delete(url, {
          headers: this.getAuthHeaders(),
        }),
      );
      
      this.logger.log(`Successfully deleted server ${serverId}`, { 
        removeData: options.removeData, 
        force: options.force 
      });
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to delete server ${serverId}`, error.stack);
      throw new InternalServerErrorException('Failed to communicate with Wings service');
    }
  }

  async ping(): Promise<{ status: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.wingsApiUrl}/ping`, {
          headers: this.getAuthHeaders(),
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to ping Wings service', error.stack);
      throw new InternalServerErrorException('Failed to communicate with Wings service');
    }
  }
}
