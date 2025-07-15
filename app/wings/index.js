// apps/wings/index.js
const express = require('express');
const Docker = require('dockerode');
const fs = require('fs');
const path = require('path');
const app = express();
const docker = new Docker();
const port = 8080; // Wings가 사용할 포트

app.use(express.json());

const servers = new Map();

app.get('/ping', (req, res) => {
  console.log("Panel로부터 'ping' 요청 수신!");
  res.json({ message: 'pong from wings' });
});

app.post('/api/v1/servers', async (req, res) => {
  try {
    const { serverId, image = 'openjdk:11-jre-slim', memory = '1024m', ports = ['25565:25565'] } = req.body;
    
    if (!serverId) {
      return res.status(400).json({ error: 'serverId is required' });
    }

    if (servers.has(serverId)) {
      return res.status(409).json({ error: 'Server already exists' });
    }

    const serverDataPath = path.join(process.cwd(), 'data', 'servers', serverId);
    
    // 서버 데이터 디렉토리 생성
    if (!fs.existsSync(serverDataPath)) {
      fs.mkdirSync(serverDataPath, { recursive: true });
      console.log(`서버 데이터 디렉토리 생성: ${serverDataPath}`);
    }
    
    const containerConfig = {
      Image: image,
      name: `minecraft-server-${serverId}`,
      HostConfig: {
        Memory: parseInt(memory.replace('m', '')) * 1024 * 1024,
        PortBindings: {},
        Binds: [`${process.cwd()}/data/servers/${serverId}:/data`]
      },
      ExposedPorts: {},
      Env: [
        'EULA=TRUE',
        'ONLINE_MODE=true'
      ],
      WorkingDir: '/data'
    };

    ports.forEach(portMapping => {
      const [hostPort, containerPort] = portMapping.split(':');
      containerConfig.ExposedPorts[`${containerPort}/tcp`] = {};
      containerConfig.HostConfig.PortBindings[`${containerPort}/tcp`] = [{ HostPort: hostPort }];
    });

    const container = await docker.createContainer(containerConfig);
    
    servers.set(serverId, {
      id: serverId,
      containerId: container.id,
      status: 'created',
      image,
      memory,
      ports,
      createdAt: new Date().toISOString()
    });

    console.log(`서버 생성 완료: ${serverId} (컨테이너 ID: ${container.id})`);
    
    res.status(201).json({
      success: true,
      server: servers.get(serverId)
    });

  } catch (error) {
    console.error('서버 생성 실패:', error);
    res.status(500).json({ 
      error: 'Failed to create server',
      details: error.message 
    });
  }
});

app.get('/api/v1/servers', (req, res) => {
  res.json({
    servers: Array.from(servers.values())
  });
});

app.get('/api/v1/servers/:serverId', (req, res) => {
  const { serverId } = req.params;
  const server = servers.get(serverId);
  
  if (!server) {
    return res.status(404).json({ error: 'Server not found' });
  }
  
  res.json({ server });
});

app.listen(port, () => {
  console.log(`Wings 데몬이 ${port}번 포트에서 대기 중...`);
});