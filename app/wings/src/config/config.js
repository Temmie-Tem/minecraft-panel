// src/config/config.js
// Claude 추가: 환경 변수 설정 중앙 관리
require('dotenv').config();

const config = {
  // 서버 설정
  server: {
    port: parseInt(process.env.PORT) || 8080,
    env: process.env.NODE_ENV || 'development'
  },

  // Docker 설정
  docker: {
    image: process.env.DOCKER_IMAGE || 'itzg/minecraft-server',
    socket: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
  },

  // 마인크래프트 서버 기본 설정
  minecraft: {
    defaultPort: parseInt(process.env.MC_DEFAULT_PORT) || 25565,
    defaultMemory: process.env.MC_DEFAULT_MEMORY || '1g',
    defaultCpu: process.env.MC_DEFAULT_CPU || '1.0',
    defaultVersion: process.env.MC_DEFAULT_VERSION || 'latest',
    defaultType: process.env.MC_DEFAULT_TYPE || 'PAPER',
    rconPortOffset: parseInt(process.env.MC_RCON_PORT_OFFSET) || 10,
    supportedTypes: process.env.MC_SUPPORTED_TYPES 
      ? process.env.MC_SUPPORTED_TYPES.split(',') 
      : ['VANILLA', 'PAPER', 'SPIGOT', 'FORGE', 'FABRIC', 'BUKKIT']
  },

  // WebSocket 설정
  websocket: {
    path: process.env.WEBSOCKET_PATH || '/ws'
  },

  // 로그 설정
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    defaultTail: parseInt(process.env.LOG_DEFAULT_TAIL) || 100,
    defaultSince: parseInt(process.env.LOG_DEFAULT_SINCE) || 300
  },

  // 보안 설정
  security: {
    cryptoHashBytes: parseInt(process.env.CRYPTO_HASH_BYTES) || 4,
    portRangeMin: parseInt(process.env.PORT_RANGE_MIN) || 1,
    portRangeMax: parseInt(process.env.PORT_RANGE_MAX) || 65535
  },

  // 경로 설정
  paths: {
    dataMountPath: process.env.DATA_MOUNT_PATH || '/data',
    serverDataBasePath: process.env.SERVER_DATA_BASE_PATH || '/home/temmie/minecraft_server',
    serverData: process.env.SERVER_DATA_PATH || '/home/temmie/minecraft_server'
  },

  // API 설정
  api: {
    basePath: process.env.API_BASE_PATH || '/api/v1'
  },

  // 내부 서비스 인증 설정
  auth: {
    internalApiKey: process.env.INTERNAL_API_KEY,
    panelUrl: process.env.PANEL_URL || 'http://localhost:3001'
  }
};

module.exports = config;