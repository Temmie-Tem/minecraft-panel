# Wings 데몬 아키텍처 문서

## 📋 개요

Wings는 마인크래프트 패널 시스템의 핵심 구성요소로, 실제 마인크래프트 서버들을 Docker 컨테이너로 관리하는 데몬입니다. 백엔드 Panel과 HTTP API 및 WebSocket을 통해 통신하며, 서버 생성/삭제/제어 및 실시간 모니터링을 담당합니다.

### 🎯 주요 기능
- **Docker 기반 서버 관리**: 마인크래프트 서버를 Docker 컨테이너로 생성/제어
- **실시간 통신**: WebSocket을 통한 실시간 로그 스트리밍 및 상태 업데이트
- **Panel 연동**: HTTP API를 통한 백엔드 Panel과의 통신
- **상태 동기화**: 컨테이너 상태를 Panel DB와 실시간 동기화
- **리소스 관리**: CPU, 메모리, 포트 등 서버 리소스 관리

---

## 🏗️ 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Wings Daemon                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   HTTP API  │  │  WebSocket  │  │ Sync Module │         │
│  │             │  │             │  │             │         │
│  │ - REST      │  │ - Real-time │  │ - Container │         │
│  │   Endpoints │  │   Logs      │  │   Scanning  │         │
│  │ - Server    │  │ - Status    │  │ - Panel     │         │
│  │   Control   │  │   Updates   │  │   Sync      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                  Docker Service Layer                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Container Management: Create, Start, Stop, Delete      │ │
│  │ Resource Control: CPU, Memory, Port Mapping           │ │
│  │ Log Streaming: Real-time container logs               │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Docker Engine                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ MC Server 1 │  │ MC Server 2 │  │ MC Server N │         │
│  │ Container   │  │ Container   │  │ Container   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 디렉터리 구조

```
app/wings/
├── index.js                      # 메인 진입점
├── package.json                  # 의존성 및 스크립트
├── .env.example                  # 환경변수 예시
├── server-sync.json              # 동기화 데이터 저장
├── REFACTOR_SUMMARY.md           # 리팩토링 완료 보고서
│
└── src/
    ├── index.js                  # Express 서버 및 WebSocket 초기화
    │
    ├── config/
    │   └── config.js             # 중앙 집중식 환경설정 관리
    │
    ├── controllers/
    │   └── server.controller.js  # 서버 관리 API 컨트롤러
    │
    ├── services/
    │   └── docker.service.js     # Docker 엔진 연동 서비스
    │
    ├── routes/
    │   └── server.routes.js      # API 라우팅 정의
    │
    ├── store/
    │   └── server.store.js       # 메모리 기반 서버 상태 저장소
    │
    ├── websocket/
    │   └── websocket.js          # WebSocket 서버 관리
    │
    └── utils/
        ├── responseUtils.js      # API 응답 표준화
        ├── errorUtils.js         # 에러 처리 및 커스텀 에러
        ├── loggerUtils.js        # 구조화된 로깅 시스템
        ├── validationUtils.js    # 입력 검증 유틸리티
        ├── serverUtils.js        # 서버 관련 유틸리티
        └── syncUtils.js          # Panel 동기화 유틸리티
```

---

## 🔧 핵심 모듈 상세

### 1. Main Application (src/index.js)

**주요 기능**:
- Express 서버 초기화
- Docker 데몬 연결 확인
- WebSocket 서버 설정
- 라우팅 및 미들웨어 설정

**시작 프로세스**:
```javascript
1. Docker 데몬 연결 확인 (pingDocker)
   ↓
2. 연결 실패 시 프로세스 종료
   ↓
3. HTTP 서버 생성 및 WebSocket 초기화
   ↓
4. 포트 8080에서 서버 시작
   ↓
5. SIGINT 신호 처리 (graceful shutdown)
```

### 2. Configuration Management (config/config.js)

**환경변수 기반 설정**:
- **서버 설정**: 포트, 환경
- **Docker 설정**: 이미지, 소켓 경로
- **마인크래프트 기본값**: 포트, 메모리, CPU, 버전
- **보안 설정**: 포트 범위, 암호화
- **경로 설정**: 데이터 마운트 경로

**주요 설정값**:
```javascript
{
  server: { port: 8080 },
  docker: { image: 'itzg/minecraft-server' },
  minecraft: { 
    defaultPort: 25565,
    defaultMemory: '1g',
    supportedTypes: ['VANILLA', 'PAPER', 'SPIGOT', ...]
  }
}
```

### 3. Docker Service (services/docker.service.js)

**주요 기능**:
- Docker 컨테이너 생명주기 관리
- 리소스 제한 설정 (CPU, 메모리)
- 포트 매핑 및 볼륨 마운트
- 실시간 로그 스트리밍

**핵심 메서드**:
```javascript
- pingDocker(): Docker 데몬 연결 확인
- createServerContainer(): 새 서버 컨테이너 생성
- startContainer(): 컨테이너 시작
- stopContainer(): 컨테이너 중지
- removeContainer(): 컨테이너 삭제
- getContainerInfo(): 컨테이너 정보 조회
- streamContainerLogs(): 실시간 로그 스트리밍
```

### 4. Server Controller (controllers/server.controller.js)

**API 엔드포인트**:
```javascript
GET    /api/v1/servers           # 모든 서버 목록 조회
GET    /api/v1/servers/:id       # 특정 서버 정보 조회
POST   /api/v1/servers           # 새 서버 생성
DELETE /api/v1/servers/:id       # 서버 삭제
POST   /api/v1/servers/:id/start # 서버 시작
POST   /api/v1/servers/:id/stop  # 서버 중지
POST   /api/v1/servers/:id/restart # 서버 재시작
PUT    /api/v1/servers/:id/resources # 리소스 업데이트
POST   /api/v1/servers/:id/command # 명령어 전송
GET    /api/v1/servers/:id/status # 서버 상태 조회
```

**요청/응답 처리**:
- 입력 검증 (포트, 메모리, CPU 형식)
- Docker 서비스 호출
- 표준화된 응답 형식 반환
- 에러 처리 및 로깅

### 5. WebSocket Manager (websocket/websocket.js)

**주요 기능**:
- 실시간 서버 로그 스트리밍
- 서버 상태 변경 알림
- 클라이언트 연결 관리

**WebSocket 이벤트**:
```javascript
- 'server_logs': 실시간 서버 로그
- 'server_status': 서버 상태 변경
- 'container_event': Docker 컨테이너 이벤트
```

### 6. Synchronization (utils/syncUtils.js)

**동기화 프로세스**:
```javascript
1. scanDockerContainers(): Docker 컨테이너 스캔
   ↓
2. scanServerDirectories(): 서버 디렉토리 스캔
   ↓
3. 동기화 데이터 생성 (containers, directories, summary)
   ↓
4. saveSyncData(): 로컬 파일에 저장
   ↓
5. sendSyncDataToPanel(): Panel API로 전송 (TODO)
```

---

## 🔄 주요 작동 흐름

### 1. 서버 생성 흐름

```
1. POST /api/v1/servers 요청 수신
   ↓
2. 입력 검증 (포트, 메모리, CPU, 서버 타입)
   ↓
3. 포트 충돌 확인
   ↓
4. Docker 컨테이너 생성
   - 이미지: itzg/minecraft-server
   - 환경변수: EULA, TYPE, VERSION 등
   - 포트 매핑: 게임 포트, RCON 포트
   - 볼륨 마운트: 서버 데이터 디렉토리
   ↓
5. 서버 정보를 메모리 스토어에 저장
   ↓
6. 성공 응답 반환 (201 Created)
```

### 2. 서버 제어 흐름

```
1. POST /api/v1/servers/:id/start 요청
   ↓
2. 서버 존재 확인 (메모리 스토어)
   ↓
3. Docker 컨테이너 시작
   ↓
4. 상태 업데이트 (running)
   ↓
5. WebSocket으로 상태 변경 브로드캐스트
   ↓
6. 성공 응답 반환
```

### 3. 실시간 로그 스트리밍

```
1. WebSocket 클라이언트 연결
   ↓
2. 서버 ID 기반 로그 스트림 시작
   ↓
3. Docker 컨테이너 로그 실시간 수신
   ↓
4. WebSocket으로 클라이언트에 전송
   ↓
5. 연결 종료 시 스트림 정리
```

### 4. Panel 동기화 흐름

```
1. 주기적 또는 이벤트 기반 동기화 시작
   ↓
2. Docker 컨테이너 목록 스캔
   ↓
3. 서버 디렉토리 스캔
   ↓
4. 동기화 데이터 생성
   ↓
5. Panel API로 상태 전송 (POST /sync/wings-to-panel)
   ↓
6. Panel에서 DB 상태 업데이트
```

---

## 🔗 백엔드 Panel과의 연동

### 1. API 통신

**Wings → Panel**:
```javascript
// 동기화 데이터 전송
POST http://panel:3001/sync/wings-to-panel
{
  "timestamp": "2025-01-17T...",
  "containers": [...],
  "directories": [...],
  "summary": { ... }
}
```

**Panel → Wings**:
```javascript
// 서버 제어 요청
POST http://wings:8080/api/v1/servers/server-id/start
GET  http://wings:8080/api/v1/servers/server-id
DELETE http://wings:8080/api/v1/servers/server-id
```

### 2. 데이터 매핑

**Wings 서버 정보 → Panel DB**:
```javascript
Wings: {
  id: "generated-uuid",
  name: "My Server",
  status: "running",
  port: 25565,
  memory: "2g",
  cpu: "1.5"
}

Panel DB (SERVERS 테이블): {
  id: "generated-uuid",
  name: "My Server", 
  wings_server_id: "generated-uuid",
  port: 25565,
  memory: "2g",
  cpus: "1.5",
  node_id: 1  // Wings 노드 ID
}
```

### 3. 상태 동기화

**실시간 상태 업데이트**:
1. Wings에서 컨테이너 상태 변경 감지
2. Panel로 동기화 데이터 전송
3. Panel에서 DB 업데이트
4. 프론트엔드에서 최신 상태 조회

---

## ⚙️ 환경 설정

### 필수 환경변수 (.env)

```bash
# 서버 설정
PORT=8080
NODE_ENV=development

# Docker 설정
DOCKER_IMAGE=itzg/minecraft-server
DOCKER_SOCKET=/var/run/docker.sock

# 마인크래프트 기본값
MC_DEFAULT_PORT=25565
MC_DEFAULT_MEMORY=1g
MC_DEFAULT_CPU=1.0
MC_DEFAULT_VERSION=latest
MC_DEFAULT_TYPE=PAPER

# 경로 설정
SERVER_DATA_BASE_PATH=/home/temmie/minecraft_server
DATA_MOUNT_PATH=/data

# 로깅
LOG_LEVEL=info

# 보안
PORT_RANGE_MIN=25565
PORT_RANGE_MAX=25600
```

### Docker 요구사항

```bash
# Docker 설치 확인
docker --version

# Docker 데몬 실행 확인
docker info

# 권한 설정 (Linux)
sudo usermod -aG docker $USER
```

---

## 🔍 주요 API 엔드포인트

### 서버 관리
- `GET /api/v1/servers` - 모든 서버 목록
- `GET /api/v1/servers/:id` - 서버 정보 조회
- `POST /api/v1/servers` - 서버 생성
- `DELETE /api/v1/servers/:id` - 서버 삭제

### 서버 제어
- `POST /api/v1/servers/:id/start` - 서버 시작
- `POST /api/v1/servers/:id/stop` - 서버 중지
- `POST /api/v1/servers/:id/restart` - 서버 재시작

### 리소스 관리
- `PUT /api/v1/servers/:id/resources` - 리소스 업데이트
- `GET /api/v1/servers/:id/status` - 상태 조회

### 명령어 및 로그
- `POST /api/v1/servers/:id/command` - 명령어 전송
- `WebSocket /ws` - 실시간 로그 스트리밍

### 헬스체크
- `GET /ping` - Wings 데몬 상태 확인

---

## 🚨 주요 고려사항

### 1. 보안
- Docker 소켓 접근 권한 관리
- 포트 범위 제한으로 충돌 방지
- 입력 검증으로 인젝션 공격 방지
- 컨테이너 리소스 제한으로 시스템 보호

### 2. 성능
- 메모리 기반 서버 스토어 (향후 Redis 고려)
- Docker API 호출 최적화
- WebSocket 연결 관리
- 로그 스트리밍 버퍼링

### 3. 안정성
- Docker 데몬 연결 실패 시 graceful shutdown
- 컨테이너 생성 실패 시 롤백
- WebSocket 연결 끊김 처리
- 에러 로깅 및 모니터링

### 4. 확장성
- 다중 노드 지원 가능한 구조
- 환경변수 기반 설정으로 배포 유연성
- 모듈화된 구조로 기능 추가 용이
- Panel과의 느슨한 결합

---

## 📝 개발 시 참고사항

### 1. 새로운 API 추가
1. `controllers/server.controller.js`에 핸들러 추가
2. `routes/server.routes.js`에 라우트 정의
3. `services/docker.service.js`에 Docker 로직 구현
4. `utils/validationUtils.js`에 검증 로직 추가

### 2. 환경변수 추가
1. `config/config.js`에 설정 추가
2. `.env.example`에 예시 값 추가
3. 관련 서비스에서 config 사용

### 3. 에러 처리 추가
1. `utils/errorUtils.js`에 커스텀 에러 정의
2. 컨트롤러에서 적절한 에러 응답 사용
3. 로깅으로 디버깅 정보 기록

### 4. WebSocket 이벤트 추가
1. `websocket/websocket.js`에 이벤트 핸들러 추가
2. 클라이언트 연결 관리 로직 구현
3. 적절한 에러 처리 및 정리 로직

---

## 🔄 향후 개선 계획

### 1. 데이터 영속성
- 메모리 스토어 → Redis/PostgreSQL 전환
- 서버 설정 및 상태 영구 저장
- 백업 및 복구 기능

### 2. 모니터링 강화
- 서버 성능 메트릭 수집
- 리소스 사용량 모니터링
- 알림 시스템 구축

### 3. 보안 강화
- API 인증 토큰 시스템
- 컨테이너 보안 정책 강화
- 네트워크 격리

### 4. 기능 확장
- 서버 백업/복원 기능
- 플러그인 관리 시스템
- 다중 버전 지원 확대

---

이 문서는 Wings 데몬의 현재 구조와 백엔드 Panel과의 연동 방식을 정확히 파악하기 위해 작성되었습니다. 
리팩토링이나 기능 확장 시 이 구조를 기반으로 개선점을 식별하고 적용하시기 바랍니다.