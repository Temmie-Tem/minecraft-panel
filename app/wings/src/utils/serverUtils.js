// src/utils/serverUtils.js
// Claude 추가: 서버 관련 공통 유틸리티
const crypto = require('crypto');
const serverStore = require('../store/server.store');
const config = require('../config/config');

/**
 * 서버 상태 업데이트
 * @param {Object} server - 서버 객체
 * @param {string} action - 액션 타입 (예: 'start', 'stop', 'restart')
 * @param {string} status - 새로운 상태
 */
const updateServerStatus = (server, action, status) => {
  server.status = status;
  server.lastAction = action;
  server.updatedAt = new Date().toISOString();
  serverStore.addServer(server);
};

/**
 * 고유한 서버 ID 생성
 * @param {string} name - 서버 이름
 * @returns {string} 생성된 서버 ID
 */
const generateServerId = (name) => {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/gi, '-');
  const randomSuffix = crypto.randomBytes(config.security.cryptoHashBytes).toString('hex');
  return `${cleanName}-${randomSuffix}`;
};

/**
 * 포트 충돌 확인
 * @param {number} port - 확인할 포트
 * @param {string} excludeServerId - 제외할 서버 ID (업데이트 시 사용)
 * @returns {boolean} 충돌 여부
 */
const isPortConflict = (port, excludeServerId = null) => {
  const allServers = serverStore.getAllServers();
  return allServers.some(server => {
    if (excludeServerId && server.id === excludeServerId) {
      return false;
    }
    return server.port === port;
  });
};

/**
 * RCON 포트 계산
 * @param {number} mainPort - 메인 포트
 * @returns {number} RCON 포트
 */
const calculateRconPort = (mainPort) => {
  return mainPort + config.minecraft.rconPortOffset;
};

/**
 * 메모리 문자열을 바이트로 변환
 * @param {string} memory - 메모리 문자열 (예: '1024m', '2g')
 * @returns {number} 바이트 단위 메모리
 */
const parseMemoryToBytes = (memory) => {
  const unit = memory.slice(-1).toLowerCase();
  const value = parseInt(memory.slice(0, -1), 10);
  
  if (isNaN(value)) {
    throw new Error('Invalid memory value');
  }

  switch (unit) {
    case 'm':
      return value * 1024 * 1024;
    case 'g':
      return value * 1024 * 1024 * 1024;
    default:
      throw new Error(`Unsupported memory unit: ${unit}`);
  }
};

/**
 * CPU 개수를 NanoCPU로 변환
 * @param {string|number} cpus - CPU 개수
 * @returns {number} NanoCPU 값
 */
const parseCpuToNano = (cpus) => {
  const cpuFloat = parseFloat(cpus);
  if (isNaN(cpuFloat)) {
    throw new Error('Invalid CPU value');
  }
  return cpuFloat * 1e9;
};

/**
 * 컨테이너 이름 생성
 * @param {string} serverId - 서버 ID
 * @returns {string} 컨테이너 이름
 */
const generateContainerName = (serverId) => {
  return `mc-${serverId}`;
};

/**
 * 환경 변수 배열 생성
 * @param {Object} envVars - 환경 변수 객체
 * @returns {Array} 환경 변수 배열
 */
const generateEnvArray = (envVars) => {
  return Object.entries(envVars).map(([key, value]) => `${key}=${value}`);
};

/**
 * 서버 데이터 경로 생성
 * @param {string} serverId - 서버 ID
 * @returns {string} 서버 데이터 경로
 */
const generateServerDataPath = (serverId) => {
  return `${config.paths.serverDataBasePath}/${serverId}`;
};

module.exports = {
  updateServerStatus,
  generateServerId,
  isPortConflict,
  calculateRconPort,
  parseMemoryToBytes,
  parseCpuToNano,
  generateContainerName,
  generateEnvArray,
  generateServerDataPath
};