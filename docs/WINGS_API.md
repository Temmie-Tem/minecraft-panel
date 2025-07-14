# Wings 데몬 API 명세

Wings는 Panel로부터 명령을 받아 현장(자택 서버)에서 도커 컨테이너 기반의 Minecraft 서버를 관리하고, 상태 및 로그를 보고하는 역할을 수행합니다.

## 1. Docker 제어 및 서버 관리 (⭐가장 중요⭐)

Wings의 핵심 기능으로, Panel의 지시에 따라 마인크래프트 서버 컨테이너의 생명 주기를 완벽하게 관리합니다.

### 1.0 Docker 서버 관리 아키텍처

#### 데이터 영속성 (Data Persistence)
- **볼륨 마운트**: `-v [호스트 경로]:/data` 옵션으로 월드 데이터와 플러그인을 호스트에 안전하게 보존
- **백업 지원**: 호스트 파일시스템에 직접 접근하여 월드 데이터 백업 및 복원 가능
- **설정 파일 관리**: server.properties, plugins 폴더 등을 호스트에서 직접 관리

#### 네트워크 격리 (Network Isolation)
- **포트 포워딩**: `-p [외부 포트]:25565` 옵션으로 각 서버가 충돌 없이 통신
- **동적 포트 할당**: 새 서버 생성 시 사용 가능한 포트 자동 할당
- **방화벽 연동**: 필요 시 iptables 규칙 자동 설정

#### 자원 할당 (Resource Management)
- **메모리 제한**: `--memory` 옵션으로 각 서버의 RAM 사용량 제한
- **CPU 제한**: `--cpus` 옵션으로 CPU 코어 할당량 제한
- **디스크 I/O 제한**: `--device-read-bps`, `--device-write-bps` 옵션 지원

## 2. 서버 관리 API

### 2.1 서버 생성 (고급)
- **Endpoint**: `POST /api/v1/servers`
- **설명**: Panel로부터 서버 설정을 받아 완전히 격리된 Docker 컨테이너를 생성합니다.
- **Docker 명령어 예시**:
  ```bash
  docker run -d \
    --name minecraft-server-{id} \
    --memory {memory} \
    --cpus {cpus} \
    -p {port}:25565 \
    -v {host_path}/data:/data \
    -v {host_path}/plugins:/plugins \
    -e EULA=true \
    -e SERVER_TYPE={server_type} \
    -e VERSION={version} \
    itzg/minecraft-server
  ```
- **Request**:
  ```json
  {
    "name": "MyMinecraftServer",
    "serverType": "PAPER", 
    "version": "1.19.2",
    "memory": "2G",
    "cpus": "2.0",
    "port": 25565,
    "hostPath": "/opt/minecraft/servers/server-001",
    "environment": {
      "DIFFICULTY": "normal",
      "SPAWN_PROTECTION": "16",
      "MAX_PLAYERS": "20"
    },
    "additionalArgs": ["--restart=unless-stopped"]
  }
  ```
- **Response**:
  ```json
  {
    "id": "server-001",
    "containerId": "docker-container-abc123",
    "status": "created",
    "port": 25565,
    "hostPath": "/opt/minecraft/servers/server-001",
    "createdAt": "2025-07-14T10:30:00Z"
  }
  ```

### 2.2 고급 서버 제어
- **Endpoint**:
  - `POST /api/v1/servers/:id/start` - 서버 시작
  - `POST /api/v1/servers/:id/stop` - 정상 종료 (save-all 후 종료)
  - `POST /api/v1/servers/:id/restart` - 재시작
  - `POST /api/v1/servers/:id/kill` - 강제 종료
  - `POST /api/v1/servers/:id/pause` - 컨테이너 일시정지
  - `POST /api/v1/servers/:id/unpause` - 컨테이너 재개
- **Docker 명령어 매핑**:
  - Start: `docker start {container_id}`
  - Stop: `docker exec {container_id} rcon-cli stop` → `docker stop {container_id}`
  - Restart: `docker restart {container_id}`
  - Kill: `docker kill {container_id}`
  - Pause: `docker pause {container_id}`
  - Unpause: `docker unpause {container_id}`
- **Response**:
  ```json
  { 
    "status": "running",
    "timestamp": "2025-07-14T10:31:00Z",
    "message": "Server started successfully" 
  }
  ```

### 2.3 RCON 명령어 전송
- **Endpoint**: `POST /api/v1/servers/:id/command`
- **설명**: RCON을 통해 마인크래프트 서버 콘솔에 명령어를 직접 전송합니다.
- **Docker 명령어**:
  ```bash
  docker exec {container_id} rcon-cli {command}
  ```
- **Request**:
  ```json
  { 
    "command": "say Welcome to the server!",
    "timeout": 30
  }
  ```
- **Response**:
  ```json
  { 
    "output": "[Server] Welcome to the server!",
    "success": true,
    "executedAt": "2025-07-14T10:32:00Z"
  }
  ```

### 2.4 자원 할당 업데이트
- **Endpoint**: `PATCH /api/v1/servers/:id/resources`
- **설명**: 실행 중인 서버의 메모리, CPU 할당량을 동적으로 조정합니다.
- **Docker 명령어**:
  ```bash
  docker update --memory {new_memory} --cpus {new_cpus} {container_id}
  ```
- **Request**:
  ```json
  {
    "memory": "4G",
    "cpus": "3.0"
  }
  ```
- **Response**:
  ```json
  {
    "status": "updated",
    "resources": {
      "memory": "4G",
      "cpus": "3.0"
    }
  }
  ```

### 2.5 서버 목록 조회 (확장)
- **Endpoint**: `GET /api/v1/servers`
- **설명**: 현재 관리 중인 서버 컨테이너 목록과 상세 상태를 반환합니다.
- **Query Parameters**:
  - `status`: running, stopped, paused (필터링)
  - `limit`: 페이지당 결과 수
  - `offset`: 페이지 오프셋
- **Response**:
  ```json
  {
    "servers": [
      { 
        "id": "server-001", 
        "name": "MyServer", 
        "containerId": "abc123",
        "status": "running",
        "port": 25565,
        "memory": "2G",
        "cpus": "2.0",
        "players": {
          "online": 5,
          "max": 20
        },
        "uptime": 3600,
        "lastSeen": "2025-07-14T10:33:00Z"
      }
    ],
    "total": 1,
    "page": 1
  }
  ```

### 2.6 서버 상세 조회 (고급)
- **Endpoint**: `GET /api/v1/servers/:id`
- **설명**: 특정 서버의 완전한 상태 정보와 Docker 메타데이터를 반환합니다.
- **Response**:
  ```json
  {
    "id": "server-001",
    "name": "MyServer",
    "containerId": "abc123",
    "status": "running",
    "docker": {
      "image": "itzg/minecraft-server:latest",
      "created": "2025-07-14T10:30:00Z",
      "started": "2025-07-14T10:30:30Z"
    },
    "network": {
      "port": 25565,
      "ip": "172.17.0.2"
    },
    "resources": {
      "memory": {
        "allocated": "2G",
        "usage": "1.2G",
        "percentage": 60
      },
      "cpu": {
        "allocated": "2.0",
        "usage": 1.2,
        "percentage": 60
      }
    },
    "storage": {
      "hostPath": "/opt/minecraft/servers/server-001",
      "size": "500MB"
    },
    "minecraft": {
      "version": "1.19.2",
      "serverType": "PAPER",
      "players": {
        "online": 5,
        "max": 20,
        "list": ["Steve", "Alex", "Notch"]
      }
    }
  }
  ```

### 2.7 서버 완전 삭제
- **Endpoint**: `DELETE /api/v1/servers/:id`
- **설명**: 서버 컨테이너, 이미지, 볼륨을 완전히 제거합니다.
- **Query Parameters**:
  - `removeData`: true/false (월드 데이터 삭제 여부)
  - `force`: true/false (강제 삭제 여부)
- **Docker 명령어 시퀀스**:
  ```bash
  # 1. 컨테이너 중지 및 삭제
  docker stop {container_id}
  docker rm {container_id}
  
  # 2. 볼륨 삭제 (removeData=true인 경우)
  docker volume rm {volume_name}
  
  # 3. 호스트 데이터 삭제 (removeData=true인 경우)
  rm -rf {host_path}
  ```
- **Response**:
  ```json
  { 
    "status": "deleted",
    "deletedAt": "2025-07-14T10:35:00Z",
    "dataRemoved": true
  }
  ```

## 3. 상태 모니터링 및 보고 API

### 3.1 노드 상태
- **Endpoint**: `GET /api/v1/status/node`
- **설명**: 현장 머신의 CPU 및 메모리 사용량을 반환합니다.
- **Response**:
  ```json
  {
    "cpuUsage": 35.2,
    "memoryUsage": 6144
  }
  ```

### 3.2 컨테이너 상태
- **Endpoint**: `GET /api/v1/status/containers`
- **설명**: 관리 중인 Minecraft 서버 컨테이너별 CPU/메모리 사용량을 반환합니다.
- **Response**:
  ```json
  [
    { "id": "abc123", "cpu": 12.5, "memory": 1024 },
    { "id": "def456", "cpu": 5.3, "memory": 512 }
  ]
  ```

## 4. 실시간 로그 및 이벤트 API

### 4.1 로그 스트리밍 (WebSocket)
- **URL**: `ws://<wings-host>:<port>/ws/logs`
- **설명**: 컨테이너 로그를 실시간으로 스트리밍하여 Panel에 전달합니다.
- **메시지 형식**:
  ```json
  {
    "serverId": "abc123",
    "timestamp": 1625678901234,
    "message": "Player joined the game"
  }
  ```

### 4.2 이벤트 보고
- **Endpoint**: `POST /api/v1/events`
- **설명**: 로그 파싱을 통해 감지된 플레이어 접속/명령어 사용 등 이벤트를 Panel에 전송합니다.
- **Payload**:
  ```json
  {
    "serverId": "abc123",
    "eventType": "player_join",
    "player": "Steve",
    "timestamp": 1625678901234
  }
  ```

## 5. 데이터 마이그레이션 API

### 5.1 과거 로그 임포트
- **Endpoint**: `POST /api/v1/migrate/logs`
- **설명**: 지정된 서버의 과거 로그 파일을 읽어 분석 후 Panel로 전송합니다.
- **Request**:
  ```json
  { "serverId": "abc123", "logPath": "/path/to/logs" }
  ```
- **Response**:
  ```json
  { "migrated": true, "entries": 3456 }
  ```

---
*문서 위치*: `docs/WINGS_API.md`
