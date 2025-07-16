// src/utils/responseUtils.js
// Claude 추가: API 응답 형식 표준화 유틸리티

/**
 * 성공 응답 형식 생성
 * @param {Object} res - Express response 객체
 * @param {Object} data - 응답 데이터
 * @param {number} status - HTTP 상태 코드 (기본값: 200)
 * @returns {Object} Express response
 */
const successResponse = (res, data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    timestamp: new Date().toISOString(),
    ...data
  });
};

/**
 * 에러 응답 형식 생성
 * @param {Object} res - Express response 객체
 * @param {string} message - 에러 메시지
 * @param {number} status - HTTP 상태 코드 (기본값: 500)
 * @param {string} details - 에러 세부사항 (선택사항)
 * @returns {Object} Express response
 */
const errorResponse = (res, message, status = 500, details = null) => {
  const response = {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };

  if (details) {
    response.details = details;
  }

  return res.status(status).json(response);
};

/**
 * 생성 성공 응답 (201)
 * @param {Object} res - Express response 객체
 * @param {Object} data - 생성된 데이터
 * @returns {Object} Express response
 */
const createdResponse = (res, data) => {
  return successResponse(res, data, 201);
};

/**
 * 404 Not Found 응답
 * @param {Object} res - Express response 객체
 * @param {string} resource - 찾을 수 없는 리소스명
 * @returns {Object} Express response
 */
const notFoundResponse = (res, resource = 'Resource') => {
  return errorResponse(res, `${resource} not found`, 404);
};

/**
 * 400 Bad Request 응답
 * @param {Object} res - Express response 객체
 * @param {string} message - 에러 메시지
 * @param {string} details - 에러 세부사항
 * @returns {Object} Express response
 */
const badRequestResponse = (res, message, details = null) => {
  return errorResponse(res, message, 400, details);
};

/**
 * 409 Conflict 응답
 * @param {Object} res - Express response 객체
 * @param {string} message - 충돌 메시지
 * @returns {Object} Express response
 */
const conflictResponse = (res, message) => {
  return errorResponse(res, message, 409);
};

/**
 * 503 Service Unavailable 응답
 * @param {Object} res - Express response 객체
 * @param {string} service - 사용할 수 없는 서비스명
 * @returns {Object} Express response
 */
const serviceUnavailableResponse = (res, service = 'Service') => {
  return errorResponse(res, `${service} unavailable`, 503);
};

module.exports = {
  successResponse,
  errorResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse,
  conflictResponse,
  serviceUnavailableResponse
};