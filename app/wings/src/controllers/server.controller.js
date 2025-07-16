// src/controllers/server.controller.js
const dockerService = require('../services/docker.service');
const serverStore = require('../store/server.store');
const config = require('../config/config');
const { successResponse, errorResponse, createdResponse, notFoundResponse, badRequestResponse, conflictResponse } = require('../utils/responseUtils');
const { validateMemoryFormat, validateCpuFormat, validatePortRange, validateServerType, validateRequiredFields } = require('../utils/validationUtils');
const { generateServerId, isPortConflict, updateServerStatus } = require('../utils/serverUtils');
const { logServerAction, logServerError } = require('../utils/loggerUtils');
const { createValidationError, createServerNotFoundError, createDockerError, createResourceConflictError, asyncErrorHandler } = require('../utils/errorUtils');

const validateServerConfig = (serverConfig) => {
  const { memory, cpus, port, serverType } = serverConfig;
  
  validateMemoryFormat(memory);
  validateCpuFormat(cpus);
  validatePortRange(port);
  validateServerType(serverType);

  if (isPortConflict(port)) {
    throw createResourceConflictError(`Port ${port} is already in use`);
  }
};

const createServer = asyncErrorHandler(async (req, res) => {
  const { 
    name, 
    serverType = config.minecraft.defaultType, 
    version = config.minecraft.defaultVersion, 
    memory = config.minecraft.defaultMemory, 
    cpus = config.minecraft.defaultCpu, 
    port = config.minecraft.defaultPort, 
    hostPath,
    environment = {}, 
    dockerImage = config.docker.image  // optional Docker image override
  } = req.body;
  
  validateRequiredFields({ name, hostPath }, ['name', 'hostPath']);

  const serverId = generateServerId(name);

  if (serverStore.hasServer(serverId)) {
    throw createResourceConflictError('Server ID conflict, please try again.');
  }

  const serverConfig = { name, serverType, version, memory, cpus, port, hostPath, environment, dockerImage, serverId };
  validateServerConfig(serverConfig);

  const container = await dockerService.createServerContainer(serverConfig);
  
  const newServer = {
    id: serverId,
    containerId: container.id,
    status: 'created',
    port,
    hostPath,
    ...serverConfig,
    createdAt: new Date().toISOString()
  };

  serverStore.addServer(newServer);
  logServerAction('create', serverId, 'created', { containerId: container.id });
  
  return createdResponse(res, { server: newServer });
});

const getAllServers = (req, res) => {
  return successResponse(res, { servers: serverStore.getAllServers() });
};

const getServerById = (req, res) => {
  const { serverId } = req.params;
  const server = serverStore.getServer(serverId);
  
  if (!server) {
    return notFoundResponse(res, 'Server');
  }
  
  return successResponse(res, { server });
};

const startServer = asyncErrorHandler(async (req, res) => {
  const { serverId } = req.params;
  const server = serverStore.getServer(serverId);
  
  if (!server) {
    throw createServerNotFoundError(serverId);
  }

  const result = await dockerService.startContainer(server.containerId);
  updateServerStatus(server, 'start', result.status);
  logServerAction('start', serverId, result.status);
  
  return successResponse(res, { serverId, status: result.status });
});

const stopServer = asyncErrorHandler(async (req, res) => {
  const { serverId } = req.params;
  const server = serverStore.getServer(serverId);
  
  if (!server) {
    throw createServerNotFoundError(serverId);
  }

  const result = await dockerService.stopContainer(server.containerId);
  updateServerStatus(server, 'stop', result.status);
  logServerAction('stop', serverId, result.status);
  
  return successResponse(res, { serverId, status: result.status });
});

const restartServer = asyncErrorHandler(async (req, res) => {
  const { serverId } = req.params;
  const server = serverStore.getServer(serverId);
  
  if (!server) {
    throw createServerNotFoundError(serverId);
  }

  const result = await dockerService.restartContainer(server.containerId);
  updateServerStatus(server, 'restart', result.status);
  logServerAction('restart', serverId, result.status);
  
  return successResponse(res, { serverId, status: result.status });
});

const getServerStatus = asyncErrorHandler(async (req, res) => {
  const { serverId } = req.params;
  const server = serverStore.getServer(serverId);
  
  if (!server) {
    throw createServerNotFoundError(serverId);
  }

  const containerStatus = await dockerService.getContainerStatus(server.containerId);
  
  server.status = containerStatus.status;
  server.updatedAt = new Date().toISOString();
  serverStore.addServer(server);

  return successResponse(res, {
    serverId,
    server: {
      ...server,
      containerStatus
    }
  });
});

// Claude 추가: RCON 명령 전송 라우트
const sendCommand = (req, res) => {
    res.status(501).json({ message: 'Not Implemented' });
};

// Claude 추가: 리소스 업데이트 라우트
const updateServerResources = (req, res) => {
    res.status(501).json({ message: 'Not Implemented' });
};

const getServerResources = (req, res) => {
    res.status(501).json({ message: 'Not Implemented' });
};

// Claude 추가: 서버 삭제 API
const deleteServer = asyncErrorHandler(async (req, res) => {
  const { serverId } = req.params;
  const { removeData = false, force = false } = req.body;
  
  const server = serverStore.getServer(serverId);
  
  if (!server) {
    throw createServerNotFoundError(serverId);
  }

  try {
    // 1. 컨테이너 상태 확인 및 중지
    logServerAction('delete', serverId, 'starting_deletion', { removeData, force });
    
    let containerStatus = 'not_found';
    try {
      const status = await dockerService.getContainerStatus(server.containerId);
      containerStatus = status.status;
      
      if (status.running && !force) {
        // 실행 중인 서버는 force 옵션 없이는 삭제 불가
        return badRequestResponse(res, 'Server is running. Stop the server first or use force option.');
      }
    } catch (error) {
      // 컨테이너가 이미 없는 경우는 계속 진행
      logServerAction('delete', serverId, 'container_not_found', { error: error.message });
    }

    // 2. 컨테이너 제거
    const removeResult = await dockerService.removeContainer(server.containerId, {
      force: force,
      removeVolumes: false  // 데이터 보존을 위해 볼륨은 별도 처리
    });

    // 3. 서버 데이터 정리 (옵션)
    if (removeData && server.hostPath) {
      const fs = require('fs');
      const path = require('path');
      
      try {
        if (fs.existsSync(server.hostPath)) {
          // 안전한 경로인지 확인 (보안상 중요)
          const serverDataPath = path.resolve(path.normalize(server.hostPath));
          const configDataPath = path.resolve(config.paths.serverData || '/minecraft-servers');
          
          // 정규화된 경로가 설정된 경로 내부에 있는지 확인
          if (serverDataPath.startsWith(configDataPath) && 
              !serverDataPath.includes('..') && 
              serverDataPath !== configDataPath) {
            fs.rmSync(serverDataPath, { recursive: true, force: true });
            logServerAction('delete', serverId, 'data_removed', { path: serverDataPath });
          } else {
            logServerError('delete', serverId, 'unsafe_path', { path: serverDataPath });
          }
        }
      } catch (fsError) {
        logServerError('delete', serverId, 'data_removal_failed', { error: fsError.message });
        // 데이터 삭제 실패는 전체 삭제를 중단시키지 않음
      }
    }

    // 4. 메모리에서 서버 정보 제거
    const deleted = serverStore.deleteServer(serverId);
    
    if (!deleted) {
      logServerError('delete', serverId, 'store_deletion_failed');
    }

    // 5. WebSocket 연결 정리 (있다면)
    // WebSocket 서비스에서 해당 서버의 연결들을 정리
    
    logServerAction('delete', serverId, 'completed', {
      containerRemoved: removeResult.status,
      dataRemoved: removeData,
      force: force
    });

    return successResponse(res, {
      serverId,
      message: 'Server deleted successfully',
      details: {
        containerStatus: removeResult.status,
        dataRemoved: removeData,
        force: force
      }
    });

  } catch (error) {
    logServerError('delete', serverId, 'deletion_failed', { error: error.message });
    throw createDockerError(`Failed to delete server: ${error.message}`, serverId, error);
  }
});

module.exports = {
  createServer,
  getAllServers,
  getServerById,
  startServer,
  stopServer,
  restartServer,
  getServerStatus,
  sendCommand,
  updateServerResources,
  getServerResources,
  deleteServer,
};
