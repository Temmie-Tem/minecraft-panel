# Wings 연동 완료 문서

작성일: 2025-01-16  
작성자: Claude Code  
프로젝트: Minecraft Panel  
버전: 1.0

## 📋 개요

Minecraft Panel 백엔드에 Wings API 연동을 완료했습니다. Wings는 Minecraft 서버 제어를 위한 서비스로, 서버 상태 조회, 시작, 중지 기능을 제공합니다.

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│   Backend       │───▶│   Wings API     │
│                 │    │                 │    │                 │
│ - React App     │    │ - NestJS        │    │ - Port: 8080    │
│ - Port: 5173    │    │ - Port: 3001    │    │ - Minecraft     │
│                 │    │ - Wings Module  │    │   Server Control│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📂 파일 구조

```
app/backend/src/wings/
├── dto/
│   └── wings.dto.ts           # 타입 정의
├── wings.controller.ts        # API 엔드포인트
├── wings.module.ts           # 모듈 설정
└── wings.service.ts          # 비즈니스 로직

app/backend/src/config/
└── environment.config.ts     # 환경 설정 (WINGS_API_URL 포함)

app/backend/.env.example
└── WINGS_API_URL=http://localhost:8080
```

## 🔧 구현 상세

### 1. Wings Module (`wings.module.ts`)

```typescript
@Module({
  imports: [
    HttpModule,      // HTTP 통신용
    ConfigModule,    // 환경변수 관리
  ],
  controllers: [WingsController],
  providers: [WingsService],
  exports: [WingsService],  // 다른 모듈에서 사용 가능
})
export class WingsModule {}
```

### 2. Wings Service (`wings.service.ts`)

**주요 기능:**
- Wings API와 HTTP 통신
- ConfigService를 통한 환경변수 관리
- 에러 처리 및 로깅
- 타입 안전성 확보

**메서드:**
```typescript
async getServerInfo(serverId: string): Promise<ServerInfo>
async startServer(serverId: string): Promise<ServerActionResponse>
async stopServer(serverId: string): Promise<ServerActionResponse>
```

### 3. Wings Controller (`wings.controller.ts`)

**API 엔드포인트:**
- `GET /wings/servers/:id` - 서버 정보 조회
- `POST /wings/servers/:id/start` - 서버 시작
- `POST /wings/servers/:id/stop` - 서버 중지

### 4. 타입 정의 (`dto/wings.dto.ts`)

```typescript
interface ServerInfo {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'starting' | 'stopping';
  cpu: number;
  memory: { current: number; limit: number; };
  disk: { current: number; limit: number; };
  network: { rx: number; tx: number; };
  uptime?: number;
}

interface ServerActionResponse {
  success: boolean;
  message: string;
  data?: any;
}
```

## ⚙️ 환경 설정

### .env 파일
```bash
# Wings API URL (Minecraft server control service)
WINGS_API_URL=http://localhost:8080
```

### 환경변수 검증
```typescript
// environment.config.ts
WINGS_API_URL: Joi.string().uri().default('http://localhost:8080'),
```

## 🚀 사용 방법

### 1. 서버 정보 조회
```bash
GET http://localhost:3001/wings/servers/server-123
```

**응답 예시:**
```json
{
  "id": "server-123",
  "name": "My Minecraft Server",
  "status": "running",
  "cpu": 45.2,
  "memory": {
    "current": 2048,
    "limit": 4096
  },
  "disk": {
    "current": 1024,
    "limit": 10240
  },
  "network": {
    "rx": 1024,
    "tx": 512
  },
  "uptime": 3600
}
```

### 2. 서버 시작
```bash
POST http://localhost:3001/wings/servers/server-123/start
```

**응답 예시:**
```json
{
  "success": true,
  "message": "Server started successfully"
}
```

### 3. 서버 중지
```bash
POST http://localhost:3001/wings/servers/server-123/stop
```

## 🔒 보안 고려사항

1. **환경변수 보호**
   - `.env` 파일은 `.gitignore`에 포함
   - `.env.example`로 템플릿 제공

2. **에러 정보 제한**
   - 내부 에러 정보를 클라이언트에 노출하지 않음
   - 로그는 서버 사이드에만 기록

3. **입력 검증**
   - 서버 ID 파라미터 검증 필요 (향후 추가 권장)

## 🧪 테스트

### 수동 테스트
```bash
# 1. Wings API 서버 실행 확인
curl http://localhost:8080/health

# 2. 백엔드 서버 실행
npm run start:dev

# 3. 엔드포인트 테스트
curl http://localhost:3001/wings/servers/test-server
```

### 자동 테스트 (권장 추가 작업)
- 유닛 테스트: WingsService, WingsController
- 통합 테스트: Wings API 연동
- E2E 테스트: 전체 플로우

## 📊 성능 고려사항

1. **HTTP 타임아웃**
   - 현재: NestJS 기본값 사용
   - 권장: Wings API 응답 시간에 맞춰 조정

2. **연결 풀링**
   - HttpModule이 기본 연결 풀링 제공
   - 대량 요청 시 추가 최적화 검토

3. **캐싱**
   - 서버 정보는 캐싱 가능 (TTL: 30초 권장)
   - Redis 또는 메모리 캐시 활용

## 🐛 에러 처리

### 일반적인 에러 케이스
1. **Wings API 서버 다운**
   - 에러: `InternalServerErrorException`
   - 로그: "Failed to communicate with Wings service"

2. **잘못된 서버 ID**
   - Wings API에서 404 반환
   - 백엔드에서 적절한 에러 처리

3. **네트워크 타임아웃**
   - HTTP 클라이언트 타임아웃 설정
   - 재시도 로직 권장

## 📈 모니터링

### 로그 모니터링
```typescript
// 로그 예시
[WingsService] Failed to get server info for server-123
[WingsService] Successfully started server server-123
```

### 메트릭 (권장 추가)
- API 응답 시간
- 에러율
- Wings API 가용성

## 🔄 향후 개선사항

### 우선순위 높음
1. **유닛/통합 테스트 작성**
2. **Swagger API 문서화**
3. **입력 검증 강화** (DTO validation)

### 우선순위 중간
1. **캐싱 시스템 도입**
2. **재시도 로직 추가**
3. **성능 메트릭 수집**

### 우선순위 낮음
1. **배치 작업 지원** (여러 서버 동시 제어)
2. **WebSocket 실시간 상태 업데이트**
3. **서버 로그 스트리밍**

## ✅ 체크리스트

- [x] Wings Module 구현
- [x] Wings Service 구현  
- [x] Wings Controller 구현
- [x] 타입 정의 (DTO) 추가
- [x] 환경변수 설정 및 검증
- [x] ConfigService 적용
- [x] 에러 처리 및 로깅
- [x] App Module 통합
- [x] 문서화 완료
- [ ] 유닛 테스트 작성 (권장)
- [ ] 통합 테스트 작성 (권장)
- [ ] Swagger 문서화 (권장)

## 📞 문의사항

Wings 연동 관련 문의사항이 있으시면 개발팀에 연락해 주세요.

---

**마지막 업데이트**: 2025-01-16  
**문서 상태**: 완료 ✅