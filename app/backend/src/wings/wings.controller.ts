import { Controller, Get, Param, Post, Delete, Query } from '@nestjs/common';
import { WingsService } from './wings.service';
import { ServerInfo, ServerActionResponse, ServerDeleteResponse } from './dto/wings.dto';

@Controller('wings')
export class WingsController {
  constructor(private readonly wingsService: WingsService) {}

  @Get('servers/:id')
  async getServerInfo(@Param('id') id: string): Promise<ServerInfo> {
    return this.wingsService.getServerInfo(id);
  }

  @Post('servers/:id/start')
  async startServer(@Param('id') id: string): Promise<ServerActionResponse> {
    return this.wingsService.startServer(id);
  }

  @Post('servers/:id/stop')
  async stopServer(@Param('id') id: string): Promise<ServerActionResponse> {
    return this.wingsService.stopServer(id);
  }

  @Delete('servers/:id')
  async deleteServer(
    @Param('id') id: string,
    @Query('removeData') removeData?: string,
    @Query('force') force?: string,
  ): Promise<ServerDeleteResponse> {
    return this.wingsService.deleteServer(id, {
      removeData: removeData === 'true',
      force: force === 'true',
    });
  }
}
