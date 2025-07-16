// src/utils/errorUtils.js
// Claude 추가: 에러 처리 표준화 유틸리티
const { logError, logServerError, logDockerAction } = require('./loggerUtils');

/**
 * 에러 타입 정의
 */
const ERROR_TYPES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_NOT_FOUND: 'SERVER_NOT_FOUND',
  DOCKER_ERROR: 'DOCKER_ERROR',
  RCON_ERROR: 'RCON_ERROR',
  WEBSOCKET_ERROR: 'WEBSOCKET_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};

/**
 * 커스텀 에러 클래스
 */
class AppError extends Error {
  constructor(message, type = ERROR_TYPES.INTERNAL_ERROR, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * 검증 에러 생성
 * @param {string} message - 에러 메시지
 * @param {string} details - 세부사항
 * @returns {AppError} 검증 에러
 */
const createValidationError = (message, details = null) => {
  return new AppError(message, ERROR_TYPES.VALIDATION_ERROR, 400, details);
};

/**
 * 서버 찾을 수 없음 에러 생성
 * @param {string} serverId - 서버 ID
 * @returns {AppError} 서버 찾을 수 없음 에러
 */
const createServerNotFoundError = (serverId) => {
  return new AppError(
    `Server not found: ${serverId}`, 
    ERROR_TYPES.SERVER_NOT_FOUND, 
    404,
    { serverId }
  );
};

/**
 * Docker 에러 생성
 * @param {string} message - 에러 메시지
 * @param {string} containerId - 컨테이너 ID
 * @param {Error} originalError - 원본 에러
 * @returns {AppError} Docker 에러
 */
const createDockerError = (message, containerId = null, originalError = null) => {
  const details = { containerId };
  if (originalError) {
    details.originalError = originalError.message;
  }
  
  return new AppError(message, ERROR_TYPES.DOCKER_ERROR, 500, details);
};

/**
 * RCON 에러 생성
 * @param {string} message - 에러 메시지
 * @param {string} serverId - 서버 ID
 * @param {Error} originalError - 원본 에러
 * @returns {AppError} RCON 에러
 */
const createRconError = (message, serverId = null, originalError = null) => {
  const details = { serverId };
  if (originalError) {
    details.originalError = originalError.message;
  }
  
  return new AppError(message, ERROR_TYPES.RCON_ERROR, 500, details);
};

/**
 * 리소스 충돌 에러 생성
 * @param {string} message - 에러 메시지
 * @param {string} resource - 충돌 리소스
 * @returns {AppError} 리소스 충돌 에러
 */
const createResourceConflictError = (message, resource = null) => {
  return new AppError(message, ERROR_TYPES.RESOURCE_CONFLICT, 409, { resource });
};

/**
 * 서비스 불가 에러 생성
 * @param {string} service - 서비스명
 * @returns {AppError} 서비스 불가 에러
 */
const createServiceUnavailableError = (service) => {
  return new AppError(
    `${service} service is currently unavailable`,
    ERROR_TYPES.SERVICE_UNAVAILABLE,
    503,
    { service }
  );
};

/**
 * 에러 핸들링 미들웨어
 * @param {Error} error - 에러 객체
 * @param {Object} req - Express request 객체
 * @param {Object} res - Express response 객체
 * @param {Function} next - Next 함수
 */
const errorHandler = (error, req, res, next) => {
  // AppError인 경우
  if (error instanceof AppError) {
    logError(`${error.type}: ${error.message}`, {
      type: error.type,
      statusCode: error.statusCode,
      details: error.details,
      path: req.path,
      method: req.method
    });

    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      type: error.type,
      timestamp: error.timestamp,
      details: error.details
    });
  }

  // 일반 에러인 경우
  logError(`Unhandled error: ${error.message}`, {
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    type: ERROR_TYPES.INTERNAL_ERROR,
    timestamp: new Date().toISOString()
  });
};

/**
 * 비동기 함수 에러 래퍼
 * @param {Function} fn - 비동기 함수
 * @returns {Function} 래핑된 함수
 */
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 서버 액션 에러 로깅
 * @param {string} action - 액션 타입
 * @param {string} serverId - 서버 ID
 * @param {Error} error - 에러 객체
 * @param {Object} metadata - 추가 메타데이터
 */
const logServerActionError = (action, serverId, error, metadata = {}) => {
  if (error instanceof AppError) {
    logServerError(action, serverId, error, { 
      type: error.type, 
      statusCode: error.statusCode,
      details: error.details,
      ...metadata 
    });
  } else {
    logServerError(action, serverId, error, metadata);
  }
};

/**
 * Docker 액션 에러 로깅
 * @param {string} action - 액션 타입
 * @param {string} containerId - 컨테이너 ID
 * @param {Error} error - 에러 객체
 * @param {Object} metadata - 추가 메타데이터
 */
const logDockerActionError = (action, containerId, error, metadata = {}) => {
  logError(`Docker ${action} failed`, {
    containerId,
    error: error.message,
    stack: error.stack,
    ...metadata
  });
};

module.exports = {
  ERROR_TYPES,
  AppError,
  createValidationError,
  createServerNotFoundError,
  createDockerError,
  createRconError,
  createResourceConflictError,
  createServiceUnavailableError,
  errorHandler,
  asyncErrorHandler,
  logServerActionError,
  logDockerActionError
};