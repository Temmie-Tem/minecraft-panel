import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from '../entities/server.entity';
import { WingsService } from '../wings/wings.service';
import { MockWingsService } from '../mock/services/mock-wings.service';
import { ConfigService } from '@nestjs/config';
import { CreateServerDto, ServerInfo } from '../wings/dto/wings.dto';
import { User } from '../entities/user.entity';

export interface ServerWithStatus {
  id: string;
  name: string;
  serverType: string;
  version: string;
  memoryConfig: string; // DB의 memory 필드 (설정값)
  cpus: string;
  port: number;
  hostPath: string;
  dockerImage: string;
  environment: string;
  wingsServerId: string;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Wings API에서 오는 실시간 데이터
  status?: 'running' | 'stopped' | 'starting' | 'stopping' | 'unknown';
  cpu?: number;
  memory?: { current: number; limit: number; }; // 실시간 메모리 사용량
  disk?: { current: number; limit: number; };
  network?: { rx: number; tx: number; };
  uptime?: number;
}

@Injectable()
export class ServersService {
  private readonly logger = new Logger(ServersService.name);
  private readonly wingsServiceInstance: WingsService | MockWingsService;

  constructor(
    @InjectRepository(Server)
    private readonly serverRepository: Repository<Server>,
    private readonly wingsService: WingsService,
    private readonly mockWingsService: MockWingsService,
    private readonly configService: ConfigService,
  ) {
    const useMock = this.configService.get<boolean>('useMock', false);
    this.wingsServiceInstance = useMock ? this.mockWingsService : this.wingsService;
    
    this.logger.log(`Using ${useMock ? 'Mock' : 'Real'} Wings Service`);
  }

  async createServer(createServerDto: CreateServerDto, owner: User): Promise<ServerWithStatus> {
    try {
      // 1. Wings API로 서버 생성
      const wingsResponse = await this.wingsServiceInstance.createServer(createServerDto);
      const wingsServer = wingsResponse.server;

      // 2. DB에 서버 정보 저장
      const server = this.serverRepository.create({
        name: createServerDto.name,
        serverType: createServerDto.serverType,
        version: createServerDto.version,
        memory: createServerDto.memory,
        cpus: createServerDto.cpus,
        port: createServerDto.port,
        hostPath: createServerDto.hostPath,
        dockerImage: createServerDto.dockerImage,
        environment: createServerDto.environment ? JSON.stringify(createServerDto.environment) : undefined,
        wingsServerId: wingsServer.id,
        owner,
      });

      const savedServer = await this.serverRepository.save(server);

      // 3. Wings 상태 정보와 결합
      return this.combineServerWithWingsData(savedServer, wingsServer);
    } catch (error) {
      this.logger.error('Failed to create server', error.stack);
      throw new InternalServerErrorException('Failed to create server');
    }
  }

  async getAllServers(userId?: number): Promise<ServerWithStatus[]> {
    try {
      const queryBuilder = this.serverRepository.createQueryBuilder('server')
        .leftJoinAndSelect('server.owner', 'owner');

      if (userId) {
        queryBuilder.where('server.owner.id = :userId', { userId });
      }

      const servers = await queryBuilder.getMany();

      // Wings API에서 실시간 상태 정보 가져오기
      const serversWithStatus = await Promise.all(
        servers.map(async (server) => {
          try {
            if (server.wingsServerId) {
              const wingsData = await this.wingsServiceInstance.getServerInfo(server.wingsServerId);
              return this.combineServerWithWingsData(server, wingsData);
            } else {
              return this.convertServerToServerWithStatus(server, 'unknown');
            }
          } catch (error) {
            this.logger.warn(`Failed to get Wings data for server ${server.id}`, error.message);
            return this.convertServerToServerWithStatus(server, 'unknown');
          }
        })
      );

      return serversWithStatus;
    } catch (error) {
      this.logger.error('Failed to get all servers', error.stack);
      throw new InternalServerErrorException('Failed to retrieve servers');
    }
  }

  async getServerById(id: string, userId?: number): Promise<ServerWithStatus> {
    try {
      const queryBuilder = this.serverRepository.createQueryBuilder('server')
        .leftJoinAndSelect('server.owner', 'owner')
        .where('server.id = :id', { id });

      if (userId) {
        queryBuilder.andWhere('server.owner.id = :userId', { userId });
      }

      const server = await queryBuilder.getOne();

      if (!server) {
        throw new NotFoundException('Server not found');
      }

      // Wings API에서 실시간 상태 정보 가져오기
      if (server.wingsServerId) {
        try {
          const wingsData = await this.wingsServiceInstance.getServerInfo(server.wingsServerId);
          return this.combineServerWithWingsData(server, wingsData);
        } catch (error) {
          this.logger.warn(`Failed to get Wings data for server ${server.id}`, error.message);
          return this.convertServerToServerWithStatus(server, 'unknown');
        }
      }

      return this.convertServerToServerWithStatus(server, 'unknown');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get server ${id}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve server');
    }
  }

  async startServer(id: string, userId?: number) {
    const server = await this.getServerById(id, userId);
    
    if (!server.wingsServerId) {
      throw new InternalServerErrorException('Server is not properly configured');
    }

    return await this.wingsServiceInstance.startServer(server.wingsServerId);
  }

  async stopServer(id: string, userId?: number) {
    const server = await this.getServerById(id, userId);
    
    if (!server.wingsServerId) {
      throw new InternalServerErrorException('Server is not properly configured');
    }

    return await this.wingsServiceInstance.stopServer(server.wingsServerId);
  }

  async deleteServer(id: string, userId?: number, options: { removeData?: boolean; force?: boolean } = {}) {
    const server = await this.getServerById(id, userId);

    try {
      // 1. Wings에서 서버 삭제
      if (server.wingsServerId) {
        await this.wingsServiceInstance.deleteServer(server.wingsServerId, options);
      }

      // 2. DB에서 서버 삭제 (Entity가 아닌 ID로 삭제)
      await this.serverRepository.delete(server.id);

      return { success: true, message: 'Server deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete server ${id}`, error.stack);
      throw new InternalServerErrorException('Failed to delete server');
    }
  }

  private combineServerWithWingsData(server: Server, wingsData: ServerInfo): ServerWithStatus {
    return {
      id: server.id,
      name: server.name,
      serverType: server.serverType,
      version: server.version,
      memoryConfig: server.memory,
      cpus: server.cpus,
      port: server.port,
      hostPath: server.hostPath,
      dockerImage: server.dockerImage,
      environment: server.environment,
      wingsServerId: server.wingsServerId,
      ownerId: server.owner.id,
      createdAt: server.createdAt,
      updatedAt: server.updatedAt,
      
      // Wings 실시간 데이터
      status: wingsData.status,
      cpu: wingsData.cpu,
      memory: wingsData.memory,
      disk: wingsData.disk,
      network: wingsData.network,
      uptime: wingsData.uptime,
    };
  }

  private convertServerToServerWithStatus(server: Server, status: 'unknown'): ServerWithStatus {
    return {
      id: server.id,
      name: server.name,
      serverType: server.serverType,
      version: server.version,
      memoryConfig: server.memory,
      cpus: server.cpus,
      port: server.port,
      hostPath: server.hostPath,
      dockerImage: server.dockerImage,
      environment: server.environment,
      wingsServerId: server.wingsServerId,
      ownerId: server.owner.id,
      createdAt: server.createdAt,
      updatedAt: server.updatedAt,
      status,
    };
  }

  // Sync Controller에서 사용하는 메서드들
  async findAll(): Promise<Server[]> {
    return this.serverRepository.find({
      relations: ['owner', 'node'],
    });
  }

  async findByWingsId(wingsServerId: string): Promise<Server | null> {
    return this.serverRepository.findOne({
      where: { wingsServerId },
      relations: ['owner', 'node'],
    });
  }

  async updateStatus(serverId: string, status: string): Promise<void> {
    try {
      await this.serverRepository.update(serverId, {
        updatedAt: new Date(),
      });
      this.logger.debug(`Updated server ${serverId} status to ${status}`);
    } catch (error) {
      this.logger.error(`Failed to update server ${serverId} status`, error.stack);
      throw error;
    }
  }
}