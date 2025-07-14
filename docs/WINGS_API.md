# Wings 데몬 API 명세

Wings는 Panel로부터 명령을 받아 현장(자택 서버)에서 도커 컨테이너 기반의 Minecraft 서버를 관리하고, 상태 및 로그를 보고하는 역할을 수행합니다.

## 1. Docker 및 서버 관리 API

### 1.1 서버 생성
- **Endpoint**: `POST /api/v1/servers`
- **설명**: Panel로부터 서버 종류(version, memory 등)를 받아 새로운 컨테이너를 생성합니다.
- **Request**:
  ```json
  {
    "name": "MyMinecraftServer",
    "version": "1.19.2",
    "memory": "2G",
    "additionalArgs": ["--foo", "--bar"]
  }
  ```
- **Response**:
  ```json
  {
    "id": "container-id",
    "status": "created"
  }
  ```

### 1.2 서버 제어
- **Endpoint**:
  - `POST /api/v1/servers/:id/start`
  - `POST /api/v1/servers/:id/stop`
  - `POST /api/v1/servers/:id/restart`
  - `DELETE /api/v1/servers/:id/kill`
- **설명**: 특정 컨테이너를 시작/중지/재시작 또는 강제 종료합니다.
- **Response**:
  ```json
  { "status": "running" }
  ```

### 1.3 콘솔 명령어 전송
- **Endpoint**: `POST /api/v1/servers/:id/command`
- **설명**: `docker exec`를 이용해 컨테이너 내 서버 콘솔에 명령어를 전달합니다.
- **Request**:
  ```json
  { "command": "say Hello World" }
  ```
- **Response**:
  ```json
  { "output": "[Server] Hello World" }
  ```

### 1.4 서버 목록 조회
- **Endpoint**: `GET /api/v1/servers`
- **설명**: 현재 관리 중인 서버 컨테이너 목록을 반환합니다.
- **Response**:
  ```json
  [
    { "id": "abc123", "name": "MyServer", "status": "running" },
    { "id": "def456", "name": "TestServer", "status": "stopped" }
  ]
  ```

### 1.5 서버 상세 조회
- **Endpoint**: `GET /api/v1/servers/:id`
- **설명**: 특정 서버 컨테이너의 상세 정보를 반환합니다.
- **Response**:
  ```json
  {
    "id": "abc123",
    "name": "MyServer",
    "status": "running",
    "createdAt": 1625678901234,
    "ip": "172.17.0.2",
    "memory": 2048
  }
  ```

### 1.6 서버 삭제
- **Endpoint**: `DELETE /api/v1/servers/:id`
- **설명**: 서버 컨테이너 및 연관된 볼륨을 제거합니다.
- **Response**:
  ```json
  { "status": "deleted" }
  ```

## 2. 상태 보고 API

### 2.1 노드 상태
- **Endpoint**: `GET /api/v1/status/node`
- **설명**: 현장 머신의 CPU 및 메모리 사용량을 반환합니다.
- **Response**:
  ```json
  {
    "cpuUsage": 35.2,
    "memoryUsage": 6144
  }
  ```

### 2.2 컨테이너 상태
- **Endpoint**: `GET /api/v1/status/containers`
- **설명**: 관리 중인 Minecraft 서버 컨테이너별 CPU/메모리 사용량을 반환합니다.
- **Response**:
  ```json
  [
    { "id": "abc123", "cpu": 12.5, "memory": 1024 },
    { "id": "def456", "cpu": 5.3, "memory": 512 }
  ]
  ```

## 3. 실시간 로그 및 이벤트 API

### 3.1 로그 스트리밍 (WebSocket)
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

### 3.2 이벤트 보고
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

## 4. 데이터 마이그레이션 API

### 4.1 과거 로그 임포트
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
