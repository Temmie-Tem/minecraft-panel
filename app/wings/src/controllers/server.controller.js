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
    environment = {} 
  } = req.body;
  
  validateRequiredFields({ name, hostPath }, ['name', 'hostPath']);

  const serverId = generateServerId(name);

  if (serverStore.hasServer(serverId)) {
    throw createResourceConflictError('Server ID conflict, please try again.');
  }

  const serverConfig = { name, serverType, version, memory, cpus, port, hostPath, environment, serverId };
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
};
