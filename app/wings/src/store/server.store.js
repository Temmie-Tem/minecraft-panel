// src/store/server.store.js
// Redis 기반 서버 상태 관리로 전환 - 영속성 보장
const redisService = require('../services/redis.service');
const { logInfo, logError, logWarn } = require('../utils/loggerUtils');

// 인메모리 폴백 스토어 (Redis 연결 실패 시 사용)
const fallbackStore = new Map();
let usingFallback = false;

const addServer = async (server) => {
  try {
    if (redisService.isReady()) {
      const success = await redisService.setServerState(server.id, server);
      if (success) {
        logInfo(`Server ${server.id} added to Redis store`);
        return true;
      }
    }
    
    // Redis 실패 시 폴백
    logWarn(`Using fallback store for server ${server.id}`);
    fallbackStore.set(server.id, server);
    usingFallback = true;
    return true;
  } catch (error) {
    logError(`Failed to add server ${server.id}:`, error.message);
    return false;
  }
};

const getServer = async (serverId) => {
  try {
    if (redisService.isReady()) {
      const server = await redisService.getServerState(serverId);
      if (server) {
        return server;
      }
    }
    
    // Redis에서 찾지 못했거나 연결 실패 시 폴백 확인
    return fallbackStore.get(serverId) || null;
  } catch (error) {
    logError(`Failed to get server ${serverId}:`, error.message);
    return fallbackStore.get(serverId) || null;
  }
};

const getAllServers = async () => {
  try {
    if (redisService.isReady()) {
      const servers = await redisService.getAllServerStates();
      if (servers.length > 0 || !usingFallback) {
        return servers;
      }
    }
    
    // Redis 실패 시 폴백
    return Array.from(fallbackStore.values());
  } catch (error) {
    logError('Failed to get all servers:', error.message);
    return Array.from(fallbackStore.values());
  }
};

const hasServer = async (serverId) => {
  try {
    if (redisService.isReady()) {
      const exists = await redisService.hasServer(serverId);
      if (exists || !usingFallback) {
        return exists;
      }
    }
    
    // Redis 실패 시 폴백
    return fallbackStore.has(serverId);
  } catch (error) {
    logError(`Failed to check server existence ${serverId}:`, error.message);
    return fallbackStore.has(serverId);
  }
};

const deleteServer = async (serverId) => {
  try {
    let redisSuccess = false;
    
    if (redisService.isReady()) {
      redisSuccess = await redisService.deleteServerState(serverId);
      if (redisSuccess) {
        logInfo(`Server ${serverId} deleted from Redis store`);
      }
    }
    
    // 폴백 스토어에서도 삭제
    const fallbackSuccess = fallbackStore.delete(serverId);
    
    return redisSuccess || fallbackSuccess;
  } catch (error) {
    logError(`Failed to delete server ${serverId}:`, error.message);
    return fallbackStore.delete(serverId);
  }
};

const updateServer = async (serverId, updates) => {
  try {
    if (redisService.isReady()) {
      const success = await redisService.updateServerState(serverId, updates);
      if (success) {
        // 업데이트된 서버 정보 반환
        const updatedServer = await redisService.getServerState(serverId);
        logInfo(`Server ${serverId} updated in Redis store`);
        return updatedServer;
      }
    }
    
    // Redis 실패 시 폴백
    const server = fallbackStore.get(serverId);
    if (server) {
      const updatedServer = { ...server, ...updates, updatedAt: new Date().toISOString() };
      fallbackStore.set(serverId, updatedServer);
      logWarn(`Server ${serverId} updated in fallback store`);
      return updatedServer;
    }
    
    return null;
  } catch (error) {
    logError(`Failed to update server ${serverId}:`, error.message);
    
    // 에러 시에도 폴백 시도
    const server = fallbackStore.get(serverId);
    if (server) {
      const updatedServer = { ...server, ...updates, updatedAt: new Date().toISOString() };
      fallbackStore.set(serverId, updatedServer);
      return updatedServer;
    }
    
    return null;
  }
};

// Redis 연결 상태 확인 함수
const getStoreStatus = () => {
  return {
    redis: redisService.isReady(),
    fallback: usingFallback,
    fallbackCount: fallbackStore.size
  };
};

module.exports = {
  addServer,
  getServer,
  getAllServers,
  hasServer,
  deleteServer,
  updateServer,
  getStoreStatus
};
