// src/services/redis.service.js
const Redis = require('ioredis');
const { logInfo, logError, logWarn } = require('../utils/loggerUtils');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const config = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        db: parseInt(process.env.REDIS_DB) || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      };

      // 비밀번호가 설정된 경우에만 추가
      if (process.env.REDIS_PASSWORD) {
        config.password = process.env.REDIS_PASSWORD;
      }

      this.client = new Redis(config);

      // Redis 연결 이벤트 핸들러
      this.client.on('connect', () => {
        logInfo('Connected to Redis server');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        logError('Redis connection error:', err.message);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        logWarn('Redis connection closed');
        this.isConnected = false;
      });

      // 실제 연결 시도
      await this.client.ping();
      logInfo('Redis connection established successfully');
      
      return true;
    } catch (error) {
      logError('Failed to connect to Redis:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logInfo('Disconnected from Redis server');
    }
  }

  // 서버 상태 저장
  async setServerState(serverId, serverData) {
    if (!this.isConnected) {
      logWarn('Redis not connected, cannot save server state');
      return false;
    }

    try {
      const key = `server:${serverId}`;
      const data = {
        ...serverData,
        updatedAt: new Date().toISOString()
      };
      
      await this.client.hset(key, data);
      return true;
    } catch (error) {
      logError(`Failed to save server state for ${serverId}:`, error.message);
      return false;
    }
  }

  // 서버 상태 조회
  async getServerState(serverId) {
    if (!this.isConnected) {
      logWarn('Redis not connected, cannot retrieve server state');
      return null;
    }

    try {
      const key = `server:${serverId}`;
      const data = await this.client.hgetall(key);
      
      // 데이터가 없으면 null 반환
      if (Object.keys(data).length === 0) {
        return null;
      }
      
      return data;
    } catch (error) {
      logError(`Failed to get server state for ${serverId}:`, error.message);
      return null;
    }
  }

  // 모든 서버 상태 조회
  async getAllServerStates() {
    if (!this.isConnected) {
      logWarn('Redis not connected, cannot retrieve server states');
      return [];
    }

    try {
      const keys = await this.client.keys('server:*');
      const servers = [];

      for (const key of keys) {
        const data = await this.client.hgetall(key);
        if (Object.keys(data).length > 0) {
          servers.push(data);
        }
      }

      return servers;
    } catch (error) {
      logError('Failed to get all server states:', error.message);
      return [];
    }
  }

  // 서버 상태 삭제
  async deleteServerState(serverId) {
    if (!this.isConnected) {
      logWarn('Redis not connected, cannot delete server state');
      return false;
    }

    try {
      const key = `server:${serverId}`;
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      logError(`Failed to delete server state for ${serverId}:`, error.message);
      return false;
    }
  }

  // 서버 존재 여부 확인
  async hasServer(serverId) {
    if (!this.isConnected) {
      logWarn('Redis not connected, cannot check server existence');
      return false;
    }

    try {
      const key = `server:${serverId}`;
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      logError(`Failed to check server existence for ${serverId}:`, error.message);
      return false;
    }
  }

  // 서버 상태 업데이트 (부분 업데이트)
  async updateServerState(serverId, updates) {
    if (!this.isConnected) {
      logWarn('Redis not connected, cannot update server state');
      return false;
    }

    try {
      const key = `server:${serverId}`;
      const data = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await this.client.hset(key, data);
      return true;
    } catch (error) {
      logError(`Failed to update server state for ${serverId}:`, error.message);
      return false;
    }
  }

  // Redis 연결 상태 확인
  isReady() {
    return this.isConnected && this.client && this.client.status === 'ready';
  }
}

// 싱글톤 인스턴스 생성
const redisService = new RedisService();

module.exports = redisService;