// src/utils/loggerUtils.js
// Claude 추가: 로깅 시스템 유틸리티
const config = require('../config/config');

/**
 * 로그 레벨 정의
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

/**
 * 현재 설정된 로그 레벨 가져오기
 * @returns {number} 로그 레벨
 */
const getCurrentLogLevel = () => {
  return LOG_LEVELS[config.logging.level.toUpperCase()] || LOG_LEVELS.INFO;
};

/**
 * 로그 메시지 포맷팅
 * @param {string} level - 로그 레벨
 * @param {string} message - 메시지
 * @param {Object} metadata - 추가 메타데이터
 * @returns {string} 포맷된 로그 메시지
 */
const formatLogMessage = (level, message, metadata = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : '';
  return `[${timestamp}] [${level}] ${message} ${metaString}`.trim();
};

/**
 * 로그 출력 함수
 * @param {string} level - 로그 레벨
 * @param {string} message - 메시지
 * @param {Object} metadata - 추가 메타데이터
 */
const log = (level, message, metadata = {}) => {
  const levelValue = LOG_LEVELS[level];
  const currentLevel = getCurrentLogLevel();

  if (levelValue <= currentLevel) {
    const formattedMessage = formatLogMessage(level, message, metadata);
    
    switch (level) {
      case 'ERROR':
        console.error(formattedMessage);
        break;
      case 'WARN':
        console.warn(formattedMessage);
        break;
      case 'INFO':
        console.info(formattedMessage);
        break;
      case 'DEBUG':
        console.debug(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  }
};

/**
 * 에러 로그
 * @param {string} message - 메시지
 * @param {Object} metadata - 추가 메타데이터
 */
const logError = (message, metadata = {}) => {
  log('ERROR', message, metadata);
};

/**
 * 경고 로그
 * @param {string} message - 메시지
 * @param {Object} metadata - 추가 메타데이터
 */
const logWarn = (message, metadata = {}) => {
  log('WARN', message, metadata);
};

/**
 * 정보 로그
 * @param {string} message - 메시지
 * @param {Object} metadata - 추가 메타데이터
 */
const logInfo = (message, metadata = {}) => {
  log('INFO', message, metadata);
};

/**
 * 디버그 로그
 * @param {string} message - 메시지
 * @param {Object} metadata - 추가 메타데이터
 */
const logDebug = (message, metadata = {}) => {
  log('DEBUG', message, metadata);
};

/**
 * 서버 액션 로그
 * @param {string} action - 액션 타입
 * @param {string} serverId - 서버 ID
 * @param {string} status - 상태
 * @param {Object} metadata - 추가 메타데이터
 */
const logServerAction = (action, serverId, status, metadata = {}) => {
  logInfo(`Server ${action}`, { serverId, status, ...metadata });
};

/**
 * 서버 에러 로그
 * @param {string} action - 액션 타입
 * @param {string} serverId - 서버 ID
 * @param {Error} error - 에러 객체
 * @param {Object} metadata - 추가 메타데이터
 */
const logServerError = (action, serverId, error, metadata = {}) => {
  logError(`Server ${action} failed`, { 
    serverId, 
    error: error.message, 
    stack: error.stack,
    ...metadata 
  });
};

/**
 * Docker 액션 로그
 * @param {string} action - 액션 타입
 * @param {string} containerId - 컨테이너 ID
 * @param {Object} metadata - 추가 메타데이터
 */
const logDockerAction = (action, containerId, metadata = {}) => {
  logInfo(`Docker ${action}`, { containerId, ...metadata });
};

/**
 * WebSocket 연결 로그
 * @param {string} event - 이벤트 타입
 * @param {string} serverId - 서버 ID (선택사항)
 * @param {Object} metadata - 추가 메타데이터
 */
const logWebSocketEvent = (event, serverId = null, metadata = {}) => {
  const logData = { event, ...metadata };
  if (serverId) {
    logData.serverId = serverId;
  }
  logInfo('WebSocket event', logData);
};

module.exports = {
  LOG_LEVELS,
  logError,
  logWarn,
  logInfo,
  logDebug,
  logServerAction,
  logServerError,
  logDockerAction,
  logWebSocketEvent
};