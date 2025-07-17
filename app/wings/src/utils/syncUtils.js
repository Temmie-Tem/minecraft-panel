// src/utils/syncUtils.js
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const { logInfo, logError } = require('./loggerUtils');

const SYNC_FILE_PATH = path.join(process.cwd(), 'server-sync.json');

// Docker 컨테이너에서 서버 정보 추출
async function scanDockerContainers() {
  try {
    const { stdout } = await execAsync('docker ps -a --format "{{json .}}" | grep mc-');
    const containers = stdout.trim().split('\n').filter(line => line);
    
    const servers = [];
    for (const line of containers) {
      try {
        const container = JSON.parse(line);
        // mc-{serverId} 형식에서 serverId 추출
        const match = container.Names.match(/^mc-(.+)$/);
        if (match) {
          const serverId = match[1];
          servers.push({
            serverId,
            containerId: container.ID,
            status: container.State,
            createdAt: container.CreatedAt,
            image: container.Image
          });
        }
      } catch (e) {
        logError('Failed to parse container info:', e.message);
      }
    }
    
    return servers;
  } catch (error) {
    logError('Failed to scan Docker containers:', error.message);
    return [];
  }
}

// 서버 디렉토리 스캔
async function scanServerDirectories(basePath) {
  try {
    const entries = await fs.readdir(basePath, { withFileTypes: true });
    const directories = entries.filter(entry => entry.isDirectory());
    
    const serverDirs = [];
    for (const dir of directories) {
      const dirPath = path.join(basePath, dir.name);
      const serverPropsPath = path.join(dirPath, 'server.properties');
      
      try {
        await fs.access(serverPropsPath);
        serverDirs.push({
          name: dir.name,
          path: dirPath,
          hasServerProperties: true
        });
      } catch {
        // server.properties가 없는 디렉토리도 포함
        serverDirs.push({
          name: dir.name,
          path: dirPath,
          hasServerProperties: false
        });
      }
    }
    
    return serverDirs;
  } catch (error) {
    logError('Failed to scan server directories:', error.message);
    return [];
  }
}

// 동기화 데이터 저장
async function saveSyncData(data) {
  try {
    await fs.writeFile(SYNC_FILE_PATH, JSON.stringify(data, null, 2));
    logInfo(`Sync data saved to ${SYNC_FILE_PATH}`);
    return true;
  } catch (error) {
    logError('Failed to save sync data:', error.message);
    return false;
  }
}

// 패널에 동기화 데이터 전송
async function sendSyncDataToPanel(panelUrl, data) {
  try {
    // 실제 구현에서는 패널 API를 호출
    logInfo(`Would send sync data to panel at ${panelUrl}`);
    // TODO: axios나 fetch를 사용하여 패널 API 호출
    return true;
  } catch (error) {
    logError('Failed to send sync data to panel:', error.message);
    return false;
  }
}

// 전체 동기화 프로세스
async function syncWithPanel(config) {
  logInfo('Starting server synchronization...');
  
  const containers = await scanDockerContainers();
  const directories = await scanServerDirectories(config.paths.serverDataBasePath);
  
  const syncData = {
    timestamp: new Date().toISOString(),
    wingsVersion: '1.0.0',
    containers: containers,
    directories: directories,
    summary: {
      totalContainers: containers.length,
      totalDirectories: directories.length,
      runningContainers: containers.filter(c => c.status === 'running').length
    }
  };
  
  // 임시 파일로 저장
  await saveSyncData(syncData);
  
  // 패널에 전송 (TODO: 실제 구현 필요)
  if (config.panel && config.panel.url) {
    await sendSyncDataToPanel(config.panel.url, syncData);
  }
  
  logInfo(`Synchronization complete. Found ${containers.length} containers and ${directories.length} directories.`);
  return syncData;
}

module.exports = {
  scanDockerContainers,
  scanServerDirectories,
  saveSyncData,
  sendSyncDataToPanel,
  syncWithPanel
};
