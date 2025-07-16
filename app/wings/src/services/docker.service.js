// src/services/docker.service.js
const Docker = require('dockerode');
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const config = require('../config/config');
const { logInfo, logError, logDockerAction } = require('../utils/loggerUtils');
const { parseMemoryToBytes, parseCpuToNano, calculateRconPort, generateContainerName, generateEnvArray, generateServerDataPath } = require('../utils/serverUtils');
const { createDockerError, createServiceUnavailableError } = require('../utils/errorUtils');

const docker = new Docker();

const createServerContainer = async (serverConfig) => {
const { serverId, name, serverType, version, memory, cpus, port, hostPath, environment, dockerImage } = serverConfig;

  const dataPath = hostPath || generateServerDataPath(serverId);
  
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
    logInfo(`Server data directory created: ${dataPath}`);
  }
  
  const envVars = {
    EULA: 'TRUE',
    TYPE: serverType.toUpperCase(),
    VERSION: version,
    ...environment
  };

  const containerConfig = {
    Image: dockerImage || config.docker.image,
    name: generateContainerName(serverId),
    HostConfig: {
      Memory: parseMemoryToBytes(memory),
      NanoCpus: parseCpuToNano(cpus),
      PortBindings: {
        '25565/tcp': [{ HostPort: `${port}` }],
        '25575/tcp': [{ HostPort: `${calculateRconPort(port)}` }]
      },
      Binds: [`${dataPath}:${config.paths.dataMountPath}`]
    },
    ExposedPorts: {
      '25565/tcp': {},
      '25575/tcp': {},
    },
    Env: generateEnvArray(envVars)
  };

  try {
    const container = await docker.createContainer(containerConfig);
    logDockerAction('create', container.id, { serverId, image: config.docker.image });
    return container;
  } catch (error) {
    if (error.message.includes('No such image')) {
      logInfo(`Docker image not found: ${config.docker.image}. Attempting to pull...`);
      await docker.pull(config.docker.image);
      logInfo('Pull completed. Retrying container creation.');
      const container = await docker.createContainer(containerConfig);
      logDockerAction('create', container.id, { serverId, image: config.docker.image });
      return container;
    }
    throw createDockerError(`Failed to create container: ${error.message}`, null, error);
  }
};

const pingDocker = async () => {
  try {
    await docker.ping();
    return true;
  } catch (error) {
    logError('Docker daemon ping failed', { error: error.message });
    return false;
  }
};

// Claude 추가: 컨테이너 로그 스트리밍 함수
const streamContainerLogs = (containerId, options = {}) => {
  const logStream = new EventEmitter();
  
  try {
    const container = docker.getContainer(containerId);
    
    const logOptions = {
      follow: true,
      stdout: true,
      stderr: true,
      timestamps: true,
      since: options.since || Math.floor(Date.now() / 1000) - 300, // 기본 5분 전부터
      tail: options.tail || 100, // 기본 최근 100줄
      ...options
    };

    const logStreamDocker = container.logs(logOptions);
    
    logStreamDocker.on('data', (chunk) => {
      // Docker 로그 형식 파싱 (8바이트 헤더 제거)
      const logData = chunk.toString().substring(8);
      const lines = logData.split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        if (line.trim()) {
          try {
            // 타임스탬프 파싱
            const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s(.+)$/);
            if (timestampMatch) {
              logStream.emit('log', {
                timestamp: timestampMatch[1],
                message: timestampMatch[2],
                containerId
              });
            } else {
              logStream.emit('log', {
                timestamp: new Date().toISOString(),
                message: line,
                containerId
              });
            }
          } catch (parseError) {
            logStream.emit('log', {
              timestamp: new Date().toISOString(),
              message: line,
              containerId
            });
          }
        }
      });
    });

    logStreamDocker.on('error', (error) => {
      logStream.emit('error', error);
    });

    logStreamDocker.on('end', () => {
      logStream.emit('end');
    });

    // 스트림 종료 함수 제공
    logStream.destroy = () => {
      logStreamDocker.destroy();
    };

    return logStream;

  } catch (error) {
    const errorStream = new EventEmitter();
    process.nextTick(() => {
      errorStream.emit('error', error);
    });
    return errorStream;
  }
};

// Claude 추가: 컨테이너 상태 확인 함수
const getContainerStatus = async (containerId) => {
  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    return {
      status: info.State.Status,
      running: info.State.Running,
      paused: info.State.Paused,
      restarting: info.State.Restarting,
      startedAt: info.State.StartedAt,
      finishedAt: info.State.FinishedAt
    };
  } catch (error) {
    if (error.statusCode === 404) {
      throw new Error('Container not found');
    }
    throw error;
  }
};

// Claude 추가: 컨테이너 제어 함수들
const startContainer = async (containerId) => {
  try {
    const container = docker.getContainer(containerId);
    await container.start();
    return { success: true, status: 'running' };
  } catch (error) {
    if (error.statusCode === 304) {
      return { success: true, status: 'already_running' };
    }
    throw error;
  }
};

const stopContainer = async (containerId) => {
  try {
    const container = docker.getContainer(containerId);
    await container.stop();
    return { success: true, status: 'stopped' };
  } catch (error) {
    if (error.statusCode === 304) {
      return { success: true, status: 'already_stopped' };
    }
    throw error;
  }
};

const restartContainer = async (containerId) => {
  try {
    const container = docker.getContainer(containerId);
    await container.restart();
    return { success: true, status: 'restarted' };
  } catch (error) {
    throw error;
  }
};

// Claude 추가: 컨테이너 제거 함수
const removeContainer = async (containerId, options = {}) => {
  try {
    const container = docker.getContainer(containerId);
    
    // 컨테이너가 실행 중이면 먼저 중지
    try {
      const containerInfo = await container.inspect();
      if (containerInfo.State.Running) {
        logInfo(`Stopping container ${containerId} before removal`);
        await container.stop({ t: 10 }); // 10초 대기 후 강제 종료
      }
    } catch (inspectError) {
      // 컨테이너가 이미 존재하지 않는 경우 무시
      if (inspectError.statusCode === 404) {
        logInfo(`Container ${containerId} not found, skipping removal`);
        return { success: true, status: 'not_found' };
      }
    }

    // 컨테이너 제거 (볼륨도 함께 제거할지 옵션으로 결정)
    await container.remove({
      force: options.force || true,  // 강제 제거
      v: options.removeVolumes || false  // 볼륨 제거 여부
    });

    logDockerAction('remove', containerId, { 
      force: options.force, 
      removeVolumes: options.removeVolumes 
    });
    
    return { success: true, status: 'removed' };
  } catch (error) {
    if (error.statusCode === 404) {
      return { success: true, status: 'not_found' };
    }
    throw createDockerError(`Failed to remove container: ${error.message}`, containerId, error);
  }
};

// Claude 추가: 컨테이너 정보 조회 함수
const getContainerInfo = async (containerId) => {
  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    return {
      id: info.Id,
      name: info.Name,
      image: info.Config.Image,
      created: info.Created,
      state: info.State,
      networkSettings: info.NetworkSettings,
      mounts: info.Mounts
    };
  } catch (error) {
    if (error.statusCode === 404) {
      throw new Error('Container not found');
    }
    throw createDockerError(`Failed to get container info: ${error.message}`, containerId, error);
  }
};

module.exports = {
  createServerContainer,
  pingDocker,
  streamContainerLogs,
  getContainerStatus,
  getContainerInfo,
  startContainer,
  stopContainer,
  restartContainer,
  removeContainer,
};