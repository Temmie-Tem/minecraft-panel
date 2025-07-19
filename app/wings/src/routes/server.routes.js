// src/routes/server.routes.js  
// Claude 개선: RESTful API 라우팅 구조 + 서버 제어 라우트 추가
const express = require('express');
const router = express.Router();
const serverController = require('../controllers/server.controller');
const authMiddleware = require('../middleware/auth.middleware');

// 모든 API 엔드포인트에 인증 미들웨어 적용
router.use(authMiddleware);

// 서버 CRUD
router.post('/', serverController.createServer);
router.get('/', serverController.getAllServers);
router.get('/:serverId', serverController.getServerById);
router.delete('/:serverId', serverController.deleteServer);  // Claude 추가: DELETE API

// Claude 추가: 서버 제어 라우트
router.post('/:serverId/start', serverController.startServer);
router.post('/:serverId/stop', serverController.stopServer);
router.post('/:serverId/restart', serverController.restartServer);
router.get('/:serverId/status', serverController.getServerStatus);

// Claude 추가: RCON 명령 전송 라우트
router.post('/:serverId/command', serverController.sendCommand);

// Claude 추가: 리소스 업데이트 라우트
router.patch('/:serverId/resources', serverController.updateServerResources);
router.get('/:serverId/resources', serverController.getServerResources);

module.exports = router;
