// src/store/server.store.js
// Claude 개선: 메모리 기반 서버 상태 관리 (추후 DB 연동 고려)
const servers = new Map();

const addServer = (server) => {
  servers.set(server.id, server);
};

const getServer = (serverId) => {
  return servers.get(serverId);
};

const getAllServers = () => {
  return Array.from(servers.values());
};

const hasServer = (serverId) => {
  return servers.has(serverId);
};

// Claude 추가: 서버 삭제 함수
const deleteServer = (serverId) => {
  return servers.delete(serverId);
};

// Claude 추가: 서버 업데이트 함수
const updateServer = (serverId, updates) => {
  const server = servers.get(serverId);
  if (server) {
    const updatedServer = { ...server, ...updates, updatedAt: new Date().toISOString() };
    servers.set(serverId, updatedServer);
    return updatedServer;
  }
  return null;
};

module.exports = {
  addServer,
  getServer,
  getAllServers,
  hasServer,
  deleteServer,
  updateServer,
};
// Claude: 향후 Redis나 PostgreSQL 연동으로 확장 가능
