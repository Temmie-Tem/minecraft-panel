// src/index.js
const express = require('express');
const http = require('http');
const serverRoutes = require('./routes/server.routes');
const { pingDocker } = require('./services/docker.service');
const redisService = require('./services/redis.service');
const websocketManager = require('./websocket/websocket');
const { logInfo, logError } = require('./utils/loggerUtils'); // Gemini: logInfo, logError import 추가
const config = require('./config/config'); // Gemini: config import 추가

const app = express();
// config에서 포트 설정 사용
const port = config.server.port;

app.use(express.json());

// 인증이 필요한 엔드포인트들
const authMiddleware = require('./middleware/auth.middleware');

app.get('/ping', authMiddleware, (req, res) => {
  console.log("Panel로부터 'ping' 요청 수신!");
  res.json({ message: 'pong from wings' });
});

app.use('/api/v1/servers', serverRoutes);

/**
 * Gemini 주석:
 * 클로드의 피드백을 반영하여 애플리케이션 시작 시 Docker 데몬과의
 * 연결을 확인하는 로직을 추가합니다. 연결에 실패하면 오류를 출력하고
 * 프로세스를 종료하여, 비정상 상태�� 서비스가 실행되는 것을 방지합니다.
 */
const startServer = async () => {
  logInfo('Checking Docker daemon connection');
  const isDockerRunning = await pingDocker();

  if (!isDockerRunning) {
    logError('Could not connect to Docker daemon. Is it running?');
    process.exit(1);
  }

  logInfo('Docker daemon connection successful');
  
  // Redis 연결 시도 (실패해도 계속 진행 - 폴백 스토어 사용)
  logInfo('Connecting to Redis...');
  const redisConnected = await redisService.connect();
  if (redisConnected) {
    logInfo('Redis connection successful');
  } else {
    logError('Redis connection failed - using fallback in-memory store');
  }
  
  // Claude 추가: HTTP 서버 생성 및 WebSocket 서버 초기화
  const server = http.createServer(app);
  websocketManager.init(server);
  
  server.listen(config.server.port, () => {
    logInfo(`Wings daemon is listening on port ${config.server.port}`);
    logInfo(`WebSocket server is available at ws://localhost:${config.server.port}${config.websocket.path}`);
  });

  process.on('SIGINT', async () => {
    logInfo('Shutting down server...');
    websocketManager.cleanup();
    await redisService.disconnect();
    process.exit(0);
  });
};

startServer();
