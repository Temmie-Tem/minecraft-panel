// src/utils/validationUtils.js
// Claude 추가: 공통 유효성 검증 유틸리티
const config = require('../config/config');

/**
 * 메모리 형식 검증
 * @param {string} memory - 메모리 문자열 (예: '1024m', '2g')
 * @returns {boolean} 유효성 여부
 * @throws {Error} 유효하지 않은 형식일 경우
 */
const validateMemoryFormat = (memory) => {
  const memoryRegex = /^(\d+)(m|g|M|G)$/;
  if (!memoryRegex.test(memory)) {
    throw new Error(`Invalid memory format: ${memory}. Use format like "1024m" or "2g"`);
  }
  return true;
};

/**
 * CPU 형식 검증
 * @param {string|number} cpus - CPU 개수 (예: '1.5', 2.0)
 * @returns {boolean} 유효성 여부
 * @throws {Error} 유효하지 않은 형식일 경우
 */
const validateCpuFormat = (cpus) => {
  const cpuFloat = parseFloat(cpus);
  if (isNaN(cpuFloat) || cpuFloat <= 0) {
    throw new Error(`Invalid CPU format: ${cpus}. Must be a positive number`);
  }
  return true;
};

/**
 * 포트 범위 검증
 * @param {number} port - 포트 번호
 * @returns {boolean} 유효성 여부
 * @throws {Error} 유효하지 않은 범위일 경우
 */
const validatePortRange = (port) => {
  const portNum = parseInt(port);
  if (isNaN(portNum) || portNum < config.security.portRangeMin || portNum > config.security.portRangeMax) {
    throw new Error(`Invalid port: ${port}. Must be between ${config.security.portRangeMin} and ${config.security.portRangeMax}`);
  }
  return true;
};

/**
 * 서버 타입 검증
 * @param {string} serverType - 서버 타입 (예: 'PAPER', 'SPIGOT')
 * @returns {boolean} 유효성 여부
 * @throws {Error} 지원하지 않는 타입일 경우
 */
const validateServerType = (serverType) => {
  if (!config.minecraft.supportedTypes.includes(serverType.toUpperCase())) {
    throw new Error(`Unsupported server type: ${serverType}. Supported types: ${config.minecraft.supportedTypes.join(', ')}`);
  }
  return true;
};

/**
 * 필수 필드 검증
 * @param {Object} data - 검증할 데이터 객체
 * @param {Array} requiredFields - 필수 필드 배열
 * @returns {boolean} 유효성 여부
 * @throws {Error} 필수 필드가 누락된 경우
 */
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  return true;
};

/**
 * 서버 ID 형식 검증
 * @param {string} serverId - 서버 ID
 * @returns {boolean} 유효성 여부
 * @throws {Error} 유효하지 않은 형식일 경우
 */
const validateServerId = (serverId) => {
  const serverIdRegex = /^[a-zA-Z0-9-_]+$/;
  if (!serverId || !serverIdRegex.test(serverId)) {
    throw new Error(`Invalid server ID format: ${serverId}. Only alphanumeric characters, hyphens, and underscores are allowed`);
  }
  return true;
};

/**
 * 문자열 길이 검증
 * @param {string} value - 검증할 문자열
 * @param {number} minLength - 최소 길이
 * @param {number} maxLength - 최대 길이
 * @param {string} fieldName - 필드명
 * @returns {boolean} 유효성 여부
 * @throws {Error} 길이가 범위를 벗어난 경우
 */
const validateStringLength = (value, minLength, maxLength, fieldName = 'Field') => {
  if (typeof value !== 'string' || value.length < minLength || value.length > maxLength) {
    throw new Error(`${fieldName} must be between ${minLength} and ${maxLength} characters`);
  }
  return true;
};

module.exports = {
  validateMemoryFormat,
  validateCpuFormat,
  validatePortRange,
  validateServerType,
  validateRequiredFields,
  validateServerId,
  validateStringLength
};