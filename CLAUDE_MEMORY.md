# Claude 장기 메모리 - Minecraft Panel 프로젝트

## 🎯 프로젝트 개요
**목적**: Minecraft 서버 관리를 위한 웹 패널 + Discord Bot 통합 시스템
**구조**: 3-Tier 아키텍처 (Panel/Bot + Wings/Game + Database)

## 🏗️ 시스템 아키텍처

### 하드웨어 구성
- **두뇌 (Brain)**: A90 5G 스마트폰 - Panel + Discord Bot (24시간 무중단)
- **팔다리 (Arms)**: AMD FX-8300 PC - Wings + Game Servers (실행 담당)  
- **은행 (Bank)**: Oracle Cloud ATP - 데이터베이스 (완전 관리형)

### 기술 스택
```
Frontend: React + Vite (Port 5173)
Backend: NestJS + TypeORM (Port 3001)
Database: Oracle ATP / SQLite
Auth: Google OAuth + JWT
Game Control: Wings API (Port 8080)
Container: Docker (Minecraft Servers)
```

## 📁 프로젝트 구조

```
minecraft-panel/
├── app/
│   ├── backend/           # NestJS API 서버
│   │   ├── src/
│   │   │   ├── auth/      # 인증 모듈
│   │   │   ├── wings/     # Wings 연동 모듈 ⭐
│   │   │   ├── config/    # 환경 설정
│   │   │   └── users/     # 사용자 관리
│   │   ├── .env.example   # 환경변수 템플릿
│   │   └── OracleDB/      # Oracle Client & Wallet
│   ├── discord-bot/       # Discord Bot
│   ├── mc-panel-frontend/ # React 웹 패널
│   └── wings/            # Wings 서비스 (별도 서버)
├── docs/                 # 📚 체계화된 문서
│   ├── api/              # API 명세서
│   ├── infrastructure/   # 인프라, DB 설정
│   ├── development/      # 개발 프로세스
│   ├── features/         # 기능별 문서
│   └── reviews/          # 코드 리뷰
└── .gitignore           # 강화된 ignore 규칙
```

## 🔧 핵심 설정

### 환경변수 (.env)
```bash
# Database
DB_TYPE=oracle|sqlite
DB_TNS_ADMIN=C:/path/to/wallet
DB_CONNECT_STRING=connection_string

# Auth  
GOOGLE_CLIENT_ID=google_oauth_id
JWT_SECRET=32char_minimum_secret

# Server
PORT=3001
FRONTEND_URL=http://localhost:5173

# Wings (⭐ 중요)
WINGS_API_URL=http://localhost:8080
```

### .gitignore 주요 제외 항목
```
node_modules/, *.env, *.sqlite, OracleDB/, Wallet_*/, 
dist/, build/, *.log, .vscode/, .DS_Store
```

## ⭐ Wings 연동 (최신 완료 사항)

### API 엔드포인트
```
GET  /wings/servers/:id        # 서버 정보 조회
POST /wings/servers/:id/start  # 서버 시작  
POST /wings/servers/:id/stop   # 서버 중지
```

### 타입 정의 (DTO)
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

### 구현 특징
- ✅ ConfigService 사용 (process.env 직접 접근 X)
- ✅ 환경변수 Joi 스키마 검증
- ✅ 타입 안전성 (Promise<any> → 명시적 타입)
- ✅ 적절한 에러 처리 및 로깅
- ✅ NestJS 모범 사례 준수

## 🔐 보안 고려사항

### 민감 정보 보호
- Oracle Wallet 파일들 (.p12, .sso, .jks)
- 환경변수 파일들 (.env*)
- 데이터베이스 파일들 (*.sqlite)
- 테스트 연결 파일들 (test-*-connection.js)

### 인증 시스템
- Google OAuth 2.0
- JWT 토큰 기반 세션 관리
- Oracle ATP 전용 접속 (Panel 서버만)

## 📚 문서화 체계

### 구조
```
docs/
├── README.md              # 문서 네비게이션
├── api/                   # API 명세서
├── infrastructure/        # 하드웨어, DB, Oracle 설정
├── development/           # 개발 프로세스, 트러블슈팅
├── features/wings/        # Wings 연동 상세 문서
└── reviews/               # 코드 리뷰, 개선사항
```

### 주요 문서
- `infrastructure/hardware-infrastructure.md` - 3-Tier 하드웨어 구성
- `features/wings/wings-integration-complete.md` - Wings 연동 완료 문서
- `development/session-summary-2025-01-16.md` - 개발 세션 요약

## 🚨 알려진 이슈 & 해결됨

### ✅ 해결된 문제들
1. **서브모듈 문제**: app/backend가 의도치않게 서브모듈 → 일반 디렉토리로 해결
2. **한글 파일명**: 호환성 문제 → 영문명으로 변경 (하드웨어&인프라.md → hardware-infrastructure.md)
3. **node_modules 추적**: .gitignore 강화로 해결
4. **타입 안전성**: any 타입 남용 → 명시적 인터페이스 도입

### ⚠️ 주의사항
- Oracle Instant Client 경로: `OracleDB/instantclient_23_8/`
- TNS_ADMIN 환경변수 자동 설정됨 (app.module.ts)
- Wings API는 별도 서버에서 실행 (Port 8080)

## 🧪 Wings API 테스트 결과 (2025-07-16)

### ✅ 성공적으로 작동하는 기능들:

**1. HTTP 기본 API**
- ✅ GET /ping - 정상 작동 (응답시간: ~4ms)
- ✅ GET /api/v1/servers - 서버 목록 조회 성공
- ✅ POST /api/v1/servers - 서버 생성 성공 (필수 필드: name, port, hostPath)
- ✅ GET /api/v1/servers/:id - 특정 서버 조회 성공
- ✅ POST /api/v1/servers/:id/start - 서버 시작 성공 (Docker 컨테이너 실행 확인)
- ✅ POST /api/v1/servers/:id/stop - 서버 중지 성공
- ✅ POST /api/v1/servers/:id/restart - 서버 재시작 성공
- ❌ DELETE /api/v1/servers/:id - 구현되지 않음

**2. WebSocket 통신**
- ✅ ws://localhost:8080/ws 연결 성공
- ✅ ping/pong 메시지 정상 작동
- ✅ subscribe_logs/unsubscribe_logs 메시지 처리 (부분적)
- ⚠️ 로그 스트리밍에 구현 오류 있음 (`logStreamDocker.on is not a function`)

**3. 오류/예외 처리**
- ✅ 존재하지 않는 서버 ID 요청 시 404 반환
- ⚠️ 필수 필드 누락 시 500 에러 (400이 더 적절)
- ✅ 잘못된 데이터 타입 검증 작동

**4. 성능/동시성**
- ✅ 동시 서버 생성 (5개) 성공적으로 처리
- ✅ API 안정성 확인
- ⚠️ WebSocket 다중 연결 테스트 시 API가 불안정함

### 🔧 개선이 필요한 부분:

**1. 에러 처리 개선**
- 400 Bad Request를 적절히 사용하도록 수정 필요
- 에러 응답 형식 일관성 개선 (HTML 대신 JSON)

**2. WebSocket 로그 스트리밍**
- Docker 로그 스트림 구현 수정 필요

**3. DELETE API 구현**
- 서버 삭제 기능 추가 필요

**4. 프로세스 안정성**
- 장시간 실행 시 안정성 개선 필요

**결론:** Wings API는 기본적인 마인크래프트 서버 관리 기능을 잘 구현하고 있으며, Docker 통합도 잘 되어 있습니다. 몇 가지 개선사항을 적용하면 더욱 안정적인 서비스가 될 것입니다.

## 🔄 향후 작업 우선순위

### High Priority
1. 유닛/통합 테스트 작성 (Wings 모듈)
2. Swagger API 문서화
3. 입력 검증 강화 (DTO validation)

### Medium Priority  
1. Redis 캐싱 시스템
2. 성능 모니터링 메트릭
3. 구체적 에러 타입 정의

## 💡 개발팀 인사이트

### 성공 요인
- 체계적인 모듈 분리 (auth, wings, users)
- 환경변수 중앙 관리 (ConfigService + 검증)
- 타입 안전성 확보 (TypeScript + DTO)
- 문서화 우선주의

### 배운 교훈
- 서브모듈 설정 주의 필요
- 한글 파일명 사용 금지
- .gitignore 설정의 중요성
- 타입 정의의 가치

## 🔌 포트 관리 현황 (2025-07-16 추가)

### 현재 사용 중인 포트
- **8080**: Wings API (node)
- **25565**: Minecraft 서버 (Docker)
- **25575**: Minecraft RCON (Docker)
- **80**: Nginx 웹서버
- **3306**: MariaDB 데이터베이스
- **22**: SSH

### 충돌 위험 요소
- Docker 포트 관리 충돌 (높은 위험)
- Nginx 리버스 프록시 충돌 (높은 위험)
- MariaDB 연결 경합 (중간 위험)
- Java 메모리 사용량 (중간 위험)

### 참조 문서
- `docs/infrastructure/PORT_MANAGEMENT.md` - 포트 관리 가이드
- 포트 할당 정책, 모니터링 스크립트, 트러블슈팅 방법 포함

## 🗑️ Wings DELETE API 구현 완료 (2025-07-16)

### 구현된 기능
- ✅ **DELETE /api/v1/servers/:serverId** 완전 구현
- ✅ Docker 컨테이너 안전 제거 (`removeContainer`, `getContainerInfo`)
- ✅ 서버 스토어 확장 (`deleteServer`, `updateServer`)
- ✅ 안전한 삭제 프로세스 (실행 중 서버 보호, 데이터 경로 검증)
- ✅ 강제 삭제 옵션 (`force: true`)
- ✅ 데이터 정리 옵션 (`removeData: true`)

### 완성된 CRUD
이제 Wings API는 완전한 CRUD를 지원합니다:
- CREATE: POST /api/v1/servers
- READ: GET /api/v1/servers, GET /api/v1/servers/:id  
- UPDATE: PATCH /api/v1/servers/:id/resources (구현됨)
- DELETE: DELETE /api/v1/servers/:id ✅ **NEW**

### 참조 문서
- `docs/features/wings/wings-delete-api-implementation.md` - DELETE API 상세 구현 문서

---

**마지막 업데이트**: 2025-07-16  
**프로젝트 상태**: Wings API CRUD 완전 구현 완료  
**다음 세션 시 우선 확인**: Wings DELETE API 테스트 및 최종 검증