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

module.exports = {
  addServer,
  getServer,
  getAllServers,
  hasServer,
};
// Claude: 향후 Redis나 PostgreSQL 연동으로 확장 가능
