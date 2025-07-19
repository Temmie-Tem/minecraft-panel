// src/middleware/auth.middleware.js
const { logError, logWarn } = require('../utils/loggerUtils');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const apiKey = process.env.INTERNAL_API_KEY;

  // API 키가 설정되지 않은 경우 경고
  if (!apiKey) {
    logWarn('INTERNAL_API_KEY is not configured. API endpoints are unprotected!');
    return next();
  }

  // Authorization 헤더가 없는 경우
  if (!authHeader) {
    logError('Missing Authorization header');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Missing Authorization header'
    });
  }

  // Bearer 토큰 형식 확인
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    logError('Invalid Authorization header format');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid Authorization header format. Expected: Bearer <token>'
    });
  }

  // API 키 검증
  if (token !== apiKey) {
    logError('Invalid API key provided');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid API key'
    });
  }

  // 인증 성공
  next();
};

module.exports = authMiddleware;