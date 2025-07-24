# 마인크래프트 패널 백엔드 아키텍처 문서

## 📋 개요

이 문서는 NestJS 기반 마인크래프트 패널 백엔드의 전체 구조와 작동 방식을 설명합니다.

### 🎯 주요 기능
- **인증 시스템**: Google OAuth 2.0 + JWT 토큰 기반 인증
- **데이터베이스 관리**: Oracle ATP/SQLite 지원하는 TypeORM 기반 ORM
- **Wings 연동**: HTTP API를 통한 원격 서버 관리
- **실시간 동기화**: Wings와 Panel 간 서버 상태 동기화
- **서버 관리**: 마인크래프트 서버 CRUD 및 상태 관리

---

## 🏗️ 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                     NestJS Backend                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ AuthModule  │  │ WingsModule │  │ SyncModule  │         │
│  │             │  │             │  │             │         │
│  │ - Google    │  │ - HTTP      │  │ - Status    │         │
│  │   OAuth     │  │   Client    │  │   Sync      │         │
│  │ - JWT       │  │ - Server    │  │ - Real-time │         │
│  │   Strategy  │  │   Control   │  │   Updates   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                   TypeORM Layer                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Entities: User, Server, Node, Player, Logs, etc.       │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                  Database Layer                            │
│  ┌─────────────┐              ┌─────────────┐              │
│  │ Oracle ATP  │    또는      │   SQLite    │              │
│  │ (Production)│              │ (Development)│              │
│  └─────────────┘              └─────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 디렉터리 구조

```
src/
├── main.ts                    # 애플리케이션 진입점
├── app.module.ts              # 루트 모듈
├── app.controller.ts          # 기본 컨트롤러 (헬스체크, 테스트)
├── app.service.ts             # 기본 서비스
│
├── auth/                      # 인증 모듈
│   ├── auth.module.ts         # 인증 모듈 설정
│   ├── auth.controller.ts     # 인증 엔드포인트
│   ├── auth.service.ts        # 인증 비즈니스 로직
│   ├── google.strategy.ts     # Google OAuth 전략
│   └── jwt.strategy.ts        # JWT 검증 전략
│
├── wings/                     # Wings 연동 모듈
│   ├── wings.module.ts        # Wings 모듈 설정
│   ├── wings.controller.ts    # Wings API 엔드포인트
│   ├── wings.service.ts       # Wings HTTP 클라이언트
│   └── dto/
│       └── wings.dto.ts       # Wings API 타입 정의
│
├── sync/                      # 동기화 모듈
│   └── sync.controller.ts     # Wings-Panel 동기화
│
├── servers/                   # 서버 관리 모듈
│   └── servers.service.ts     # 서버 CRUD 서비스
│
├── entities/                  # TypeORM 엔티티
│   ├── index.ts              # 엔티티 통합 export
│   ├── user.entity.ts        # 사용자 엔티티
│   ├── server.entity.ts      # 서버 엔티티
│   ├── node.entity.ts        # 노드 엔티티
│   ├── player.entity.ts      # 플레이어 엔티티
│   ├── player-session.entity.ts
│   ├── punishment.entity.ts
│   ├── command-log.entity.ts
│   ├── gamemode-log.entity.ts
│   └── performance-log.entity.ts
│
├── config/                    # 설정 관리
│   ├── environment.config.ts  # 환경변수 검증 및 설정
│   └── validation.schema.ts   # 입력 검증 스키마
│
├── types/                     # 공통 타입 정의
│   └── api.types.ts          # API 응답 타입
│
├── seed-data.ts              # 개발용 시드 데이터
└── verify-data.ts            # 데이터 검증 스크립트
```

---

## 🔧 핵심 모듈 상세

### 1. AppModule (루트 모듈)

**파일**: `app.module.ts`

**주요 기능**:
- 전역 설정 관리 (ConfigModule)
- Oracle 클라이언트 초기화
- TypeORM 데이터베이스 연결 설정
- 모든 하위 모듈 통합

**핵심 로직**:
```typescript
// Oracle 클라이언트 초기화
const initializeOracleClient = (configService: ConfigService) => {
  const dbType = configService.get<string>('DB_TYPE');
  if (dbType === 'oracle') {
    // TNS_ADMIN 설정 및 Instant Client 초기화
    oracledb.initOracleClient({ libDir, configDir });
  }
};

// 환경별 데이터베이스 설정
TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => {
    const isSqlite = dbType === 'sqlite';
    return {
      // SQLite (개발) vs Oracle (운영) 분기
      type: isSqlite ? 'sqlite' : 'oracle',
      // 개발환경에서는 스키마 자동 동기화
      synchronize: !isProduction,
      entities: Object.values(entities),
    };
  }
})
```

### 2. AuthModule (인증 모듈)

**파일**: `auth/`

**주요 기능**:
- Google OAuth 2.0 인증
- JWT 토큰 생성 및 검증
- 사용자 생성/조회/업데이트

**인증 플로우**:
```
1. 사용자가 Google 로그인 요청
   ↓
2. GoogleStrategy가 Google OAuth 처리
   ↓
3. AuthService.validateUser()로 사용자 생성/조회
   ↓
4. JWT 토큰 생성 및 쿠키 설정
   ↓
5. 프론트엔드로 리다이렉트
```

**핵심 메서드**:
- `validateUser()`: Google 프로필로 사용자 생성/조회
- `generateToken()`: JWT 토큰 생성
- `findUserById()`: 토큰 검증 시 사용자 조회

### 3. WingsModule (Wings 연동 모듈)

**파일**: `wings/`

**주요 기능**:
- Wings API와 HTTP 통신
- 서버 시작/중지/삭제 제어
- 서버 상태 정보 조회

**API 엔드포인트**:
```typescript
GET  /wings/servers/:id        # 서버 정보 조회
POST /wings/servers/:id/start  # 서버 시작
POST /wings/servers/:id/stop   # 서버 중지
DELETE /wings/servers/:id      # 서버 삭제
GET  /wings/ping              # Wings 연결 상태 확인
```

**HTTP 클라이언트 구조**:
```typescript
class WingsService {
  private readonly wingsApiUrl: string;
  
  async getServerInfo(serverId: string): Promise<ServerInfo>
  async startServer(serverId: string): Promise<ServerActionResponse>
  async stopServer(serverId: string): Promise<ServerActionResponse>
  async deleteServer(serverId: string, options): Promise<ServerDeleteResponse>
}
```

### 4. SyncModule (동기화 모듈)

**파일**: `sync/sync.controller.ts`

**주요 기능**:
- Wings에서 Panel로 서버 상태 동기화
- 실시간 컨테이너 상태 업데이트
- 동기화 상태 모니터링

**동기화 플로우**:
```
Wings (Docker 컨테이너 상태 변경)
   ↓
POST /sync/wings-to-panel (상태 데이터 전송)
   ↓
SyncController.receiveSyncFromWings()
   ↓
ServersService.updateStatus() (DB 업데이트)
```

---

## 🗄️ 데이터베이스 스키마

### 핵심 엔티티 관계

```
User (사용자)
  ├── 1:N → Server (소유한 서버들)
  
Node (Wings 노드)
  ├── 1:N → Server (노드에 속한 서버들)
  
Server (마인크래프트 서버)
  ├── N:1 → User (소유자)
  ├── N:1 → Node (실행 노드)
  ├── 1:N → PlayerSession (플레이어 세션들)
  ├── 1:N → CommandLog (명령어 로그들)
  ├── 1:N → PerformanceLog (성능 로그들)
  └── 1:N → Punishment (처벌 기록들)
  
Player (플레이어)
  ├── 1:N → PlayerSession (세션 기록들)
  ├── 1:N → CommandLog (실행한 명령어들)
  └── 1:N → Punishment (받은 처벌들)
```

### 주요 테이블

1. **USERS**: 웹 패널 사용자
   - Google OAuth 정보 저장
   - 서버 소유권 관리

2. **SERVERS**: 마인크래프트 서버 정보
   - Docker 설정 (이미지, 메모리, CPU)
   - Wings 연동 정보 (wingsServerId)
   - 서버 설정 (포트, 버전, 타입)

3. **NODES**: Wings 데몬 노드
   - 물리 서버 정보
   - 인증 토큰 관리

4. **로그 테이블들**: 
   - COMMAND_LOGS: 명령어 실행 기록
   - PERFORMANCE_LOGS: 서버 성능 메트릭
   - GAMEMODE_LOGS: 게임모드 변경 기록

---

## 🔄 주요 작동 흐름

### 1. 애플리케이션 시작

```
1. main.ts에서 NestFactory.create(AppModule)
   ↓
2. AppModule에서 ConfigModule 로드 및 환경변수 검증
   ↓
3. Oracle 클라이언트 초기화 (운영환경)
   ↓
4. TypeORM 데이터베이스 연결
   ↓
5. 모든 모듈 (Auth, Wings, Sync) 초기화
   ↓
6. CORS 설정 및 서버 시작 (포트 3001)
```

### 2. 사용자 인증 흐름

```
1. GET /auth/google → GoogleStrategy 실행
   ↓
2. Google OAuth 인증 완료
   ↓
3. AuthService.validateUser() → 사용자 생성/조회
   ↓
4. JWT 토큰 생성 및 HTTP-only 쿠키 설정
   ↓
5. 프론트엔드로 리다이렉트
```

### 3. 서버 관리 흐름

```
1. 프론트엔드에서 서버 제어 요청
   ↓
2. JWT 토큰 검증 (JwtStrategy)
   ↓
3. WingsController → WingsService
   ↓
4. HTTP 요청으로 Wings API 호출
   ↓
5. Wings에서 Docker 컨테이너 제어
   ↓
6. 상태 변경 결과 반환
```

### 4. 실시간 동기화 흐름

```
1. Wings에서 컨테이너 상태 변경 감지
   ↓
2. POST /sync/wings-to-panel로 상태 데이터 전송
   ↓
3. SyncController에서 데이터 처리
   ↓
4. ServersService를 통해 DB 상태 업데이트
   ↓
5. 프론트엔드에서 최신 상태 조회 가능
```

---

## ⚙️ 환경 설정

### 필수 환경변수

```bash
# 데이터베이스
DB_TYPE=oracle|sqlite
DB_TNS_ADMIN=/path/to/wallet    # Oracle 전용
DB_CONNECT_STRING=connection    # Oracle 전용
DB_USER=username               # Oracle 전용
DB_PASS=password              # Oracle 전용

# 인증
JWT_SECRET=minimum_32_characters_secret
GOOGLE_CLIENT_ID=google_oauth_client_id
GOOGLE_CLIENT_SECRET=google_oauth_secret

# Wings 연동
WINGS_API_URL=http://localhost:8080

# 서버 설정
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 개발/운영 환경 차이

| 구분 | 개발환경 | 운영환경 |
|------|----------|----------|
| 데이터베이스 | SQLite | Oracle ATP |
| 스키마 동기화 | 자동 (synchronize: true) | 수동 관리 |
| 로깅 | 상세 로그 | 에러/경고만 |
| CORS | 모든 localhost 허용 | 특정 도메인만 |

---

## 🔍 주요 API 엔드포인트

### 인증 관련
- `GET /auth/google` - Google OAuth 시작
- `GET /auth/google/callback` - OAuth 콜백
- `GET /auth/profile` - 현재 사용자 정보
- `POST /auth/logout` - 로그아웃

### Wings 연동
- `GET /wings/servers/:id` - 서버 정보 조회
- `POST /wings/servers/:id/start` - 서버 시작
- `POST /wings/servers/:id/stop` - 서버 중지
- `DELETE /wings/servers/:id` - 서버 삭제

### 동기화
- `POST /sync/wings-to-panel` - Wings에서 상태 동기화
- `GET /sync/status` - 동기화 상태 확인

### 헬스체크
- `GET /ping-wings` - Wings 연결 상태
- `GET /db-health` - 데이터베이스 연결 상태

---

## 🚨 주요 고려사항

### 1. 보안
- JWT 토큰은 HTTP-only 쿠키로 저장
- Google OAuth만 지원 (추후 확장 가능)
- Wings API 인증 토큰 관리

### 2. 에러 처리
- 모든 외부 API 호출에 try-catch 적용
- 구체적인 에러 로깅 및 일반적인 에러 메시지 반환
- Wings 연결 실패 시 graceful degradation

### 3. 성능
- TypeORM 쿼리 최적화 필요
- Wings API 호출 타임아웃 설정
- 대용량 로그 데이터 처리 고려

### 4. 확장성
- 모듈화된 구조로 기능 추가 용이
- 환경변수 기반 설정으로 배포 환경 대응
- Wings 다중 노드 지원 가능

---

## 📝 개발 시 참고사항

### 1. 새로운 엔티티 추가
1. `src/entities/` 에 엔티티 파일 생성
2. `src/entities/index.ts` 에 export 추가
3. 관련 서비스 및 컨트롤러 구현

### 2. Wings API 확장
1. `wings/dto/wings.dto.ts` 에 타입 정의
2. `wings/wings.service.ts` 에 메서드 추가
3. `wings/wings.controller.ts` 에 엔드포인트 추가

### 3. 환경변수 추가
1. `config/environment.config.ts` 에 검증 스키마 추가
2. `.env.example` 에 예시 값 추가
3. 관련 config 함수 업데이트

---

이 문서는 백엔드 리팩토링 전 현재 구조를 정확히 파악하기 위해 작성되었습니다. 
리팩토링 시 이 구조를 기반으로 개선점을 식별하고 적용하시기 바랍니다.