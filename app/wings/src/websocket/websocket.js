// src/websocket/websocket.js
// Claude 추가: WebSocket 서버 설정 및 로그 스트리밍 관리
const WebSocket = require('ws');
const dockerService = require('../services/docker.service');
const serverStore = require('../store/server.store');

class WebSocketManager {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // serverId -> Set of WebSocket connections
    this.logStreams = new Map(); // serverId -> log stream
  }

  init(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', (ws, req) => {
      console.log('WebSocket 연결 생성:', req.url);
      
      ws.on('message', (message) => {
        this.handleMessage(ws, message);
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket 에러:', error);
      });
    });

    console.log('WebSocket 서버 초기화 완료');
  }

  handleMessage(ws, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'subscribe_logs':
          this.subscribeToLogs(ws, data.serverId, data.options);
          break;
        case 'unsubscribe_logs':
          this.unsubscribeFromLogs(ws, data.serverId);
          break;
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
        default:
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Unknown message type' 
          }));
      }
    } catch (error) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Invalid JSON message' 
      }));
    }
  }

  subscribeToLogs(ws, serverId, options = {}) {
    const server = serverStore.getServer(serverId);
    if (!server) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Server not found' 
      }));
      return;
    }

    // 클라이언트 연결 저장
    if (!this.clients.has(serverId)) {
      this.clients.set(serverId, new Set());
    }
    this.clients.get(serverId).add(ws);
    ws.serverId = serverId;

    // 로그 스트림이 없으면 생성
    if (!this.logStreams.has(serverId)) {
      try {
        const logStream = dockerService.streamContainerLogs(server.containerId, options);
        this.logStreams.set(serverId, logStream);

        logStream.on('log', (logData) => {
          this.broadcastLog(serverId, logData);
        });

        logStream.on('error', (error) => {
          console.error(`로그 스트림 에러 (${serverId}):`, error);
          this.broadcastError(serverId, error.message);
          this.cleanupLogStream(serverId);
        });

        logStream.on('end', () => {
          console.log(`로그 스트림 종료 (${serverId})`);
          this.cleanupLogStream(serverId);
        });

        console.log(`로그 스트림 시작: ${serverId}`);
      } catch (error) {
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: `Failed to start log stream: ${error.message}` 
        }));
        return;
      }
    }

    ws.send(JSON.stringify({ 
      type: 'subscribed', 
      serverId,
      message: `Subscribed to logs for server: ${serverId}` 
    }));
  }

  unsubscribeFromLogs(ws, serverId) {
    if (this.clients.has(serverId)) {
      this.clients.get(serverId).delete(ws);
      
      // 더 이상 클라이언트가 없으면 로그 스트림 정리
      if (this.clients.get(serverId).size === 0) {
        this.cleanupLogStream(serverId);
        this.clients.delete(serverId);
      }
    }

    ws.send(JSON.stringify({ 
      type: 'unsubscribed', 
      serverId 
    }));
  }

  handleDisconnect(ws) {
    if (ws.serverId) {
      this.unsubscribeFromLogs(ws, ws.serverId);
    }
  }

  broadcastLog(serverId, logData) {
    const clients = this.clients.get(serverId);
    if (clients) {
      const message = JSON.stringify({
        type: 'log',
        serverId,
        data: logData
      });

      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  broadcastError(serverId, errorMessage) {
    const clients = this.clients.get(serverId);
    if (clients) {
      const message = JSON.stringify({
        type: 'error',
        serverId,
        message: errorMessage
      });

      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  cleanupLogStream(serverId) {
    const logStream = this.logStreams.get(serverId);
    if (logStream) {
      logStream.destroy();
      this.logStreams.delete(serverId);
    }
  }

  // 서버 종료 시 정리
  cleanup() {
    this.logStreams.forEach((stream, serverId) => {
      this.cleanupLogStream(serverId);
    });
    
    if (this.wss) {
      this.wss.close();
    }
  }
}

module.exports = new WebSocketManager();