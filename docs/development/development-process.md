# 마인크래프트 패널 백엔드 개발 과정 및 트러블슈팅

## 프로젝트 개요
- **목표**: NestJS 기반 백엔드 서버 구축
- **주요 기능**: Oracle DB 연동, Google OAuth 2.0 인증, JWT 토큰 기반 보안
- **개발 기간**: 2025년 7월 10일
- **개발자**: Temmie-tem

## 개발 단계별 진행 과정

### 1단계: 기본 프로젝트 구조 설정
**커밋**: `ecfdb6b - 핑퐁 API`

**작업 내용**:
- NestJS 기본 프로젝트 구조 생성
- 기본 API 엔드포인트 테스트

### 2단계: Google OAuth + JWT 인증 시스템 구현
**커밋**: `362ffdc - feat: Google OAuth + JWT 인증 시스템 구현`

**구현된 기능**:
- Google OAuth 2.0 전략 구현
- JWT 토큰 발급 및 검증
- 인증이 필요한 라우트 보호
- 사용자 엔티티 모델 설계

**주요 파일**:
- `src/auth/google.strategy.ts` - Google OAuth 전략
- `src/auth/jwt.strategy.ts` - JWT 검증 전략  
- `src/auth/auth.service.ts` - 인증 로직
- `src/auth/auth.controller.ts` - 인증 API 엔드포인트
- `src/users/user.entity.ts` - 사용자 엔티티

### 3단계: Oracle DB 연동 및 전체 시스템 통합
**커밋**: `bde945c - feat: NestJS 백엔드 Oracle DB 연동 및 Google OAuth JWT 인증 시스템 구현`

**구현된 기능**:
- TypeORM을 통한 Oracle DB 연결 설정
- Oracle Instant Client 23.8 통합
- Oracle Cloud ATP (Autonomous Transaction Processing) 지원
- Wallet 기반 보안 연결 설정
- DB 헬스체크 API (`/db-health`)
- SQLite 임시 테스트 환경 구축

**설치된 패키지**:
```bash
npm install @nestjs/typeorm typeorm oracledb
npm install @nestjs/passport passport passport-google-oauth20
npm install @nestjs/jwt passport-jwt
npm install @nestjs/config dotenv
npm install sqlite3  # 임시 테스트용
```

## 환경 설정

### .env 파일 구성
```properties
# Database connection details
DB_TYPE=oracle                    # 또는 sqlite (테스트용)
DB_TNS_ADMIN=<YOUR_TNS_ADMIN_PATH>
DB_CONNECT_STRING=<YOUR_CONNECT_STRING>
DB_USER=<YOUR_DB_USER>
DB_PASS=<YOUR_DB_PASSWORD>

# Google OAuth
GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>
GOOGLE_CALLBACK_URL=<YOUR_REDIRECT_URI>

# JWT
JWT_SECRET=<YOUR_JWT_SECRET>
```

### Oracle DB 설정
- **Oracle Instant Client**: 23.8 버전 사용
- **위치**: `app/backend/OracleDB/instantclient_23_8/`
- **Wallet 파일**: `app/backend/Wallet_temmieATP/`
- **연결 방식**: TNS 기반 연결 (tnsnames.ora 사용)

## 인증 플로우

### Google OAuth 인증 과정
1. **로그인 요청**: `GET /auth/google`
2. **Google 인증**: 사용자가 Google에서 인증
3. **콜백 처리**: `GET /auth/google/callback`
4. **JWT 토큰 발급**: 인증 성공 시 JWT 토큰 반환
5. **보호된 리소스 접근**: `Authorization: Bearer <token>` 헤더 사용

### API 엔드포인트
- `GET /auth/google` - Google 로그인 시작
- `GET /auth/google/callback` - Google OAuth 콜백
- `GET /auth/profile` - 사용자 프로필 조회 (JWT 필요)
- `GET /db-health` - 데이터베이스 연결 상태 확인

## 트러블슈팅

### 1. TypeScript 타입 오류
**문제**: Google OAuth 전략에서 타입 오류 발생
```
Property 'user' does not exist on type 'Request'
```

**해결방법**: 
- `@types/passport` 설치
- `Request` 인터페이스 확장을 통한 타입 정의

### 2. 환경변수 로딩 문제
**문제**: `.env` 파일의 환경변수가 로드되지 않음

**해결방법**:
```typescript
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // ...
  ],
})
```

### 3. Oracle DB 연결 오류 (진행 중)
**문제**: `ORA-28759: failure to open file`
```
[TypeOrmModule] Unable to connect to the database. Retrying (1)...
Error: ORA-28759: failure to open file
```

**시도한 해결방법**:
1. **Wallet 경로 설정**: 
   - 절대 경로 사용: `C:/minecraft-panel/app/backend/Wallet_temmieATP`
   - 상대 경로 시도: `./Wallet_temmieATP`
   - 환경변수 설정: `DB_TNS_ADMIN`

2. **Oracle Instant Client 설정**:
   - libDir 경로 지정: `C:/minecraft-panel/app/backend/OracleDB/instantclient_23_8`
   - 동적 경로 처리를 통한 OS 호환성 확보

3. **연결 문자열 변경**:
   - TNS 기반 연결: `temmieATP_high`
   - configDir 매개변수 추가

**현재 상태**: SQLite 환경에서는 모든 기능 정상 동작, Oracle 연결 문제만 남음

### 4. SQLite 임시 해결방안
**목적**: Oracle DB 연결 문제 해결 전까지 개발 진행

**설정 변경**:
```properties
# SQLite 사용 시
DB_TYPE=sqlite
DB_DATABASE=./dev.sqlite
```

**결과**: 
- ✅ Google OAuth 로그인 정상 동작
- ✅ JWT 토큰 발급 및 검증 정상
- ✅ 사용자 데이터 저장/조회 정상
- ✅ 모든 API 엔드포인트 정상 동작

## 테스트 결과

### API 테스트 (SQLite 환경)
```powershell
# DB 헬스체크
Invoke-RestMethod -Uri "http://localhost:3000/db-health"
# 결과: {"status":"ok","database":"sqlite","message":"Database connection is healthy"}

# Google OAuth 테스트
# 브라우저에서 http://localhost:3000/auth/google 접속
# → Google 로그인 → JWT 토큰 획득 성공

# 프로필 조회 테스트 (JWT 토큰 필요)
$headers = @{ "Authorization" = "Bearer <JWT_TOKEN>" }
Invoke-RestMethod -Uri "http://localhost:3000/auth/profile" -Headers $headers
# 결과: 사용자 정보 정상 반환
```

## 다음 단계

### 우선순위 1: Oracle DB 연결 문제 해결
- Wallet 파일 권한 확인
- Oracle Instant Client 환경변수 점검
- 다른 연결 방식 시도 (Easy Connect 등)

### 우선순위 2: 프론트엔드 연동
- React 프론트엔드와 백엔드 API 연결
- 인증 플로우 프론트엔드 구현
- 사용자 인터페이스 개발

### 우선순위 3: 배포 환경 준비
- Docker 컨테이너화
- 환경별 설정 분리 (dev/prod)
- CI/CD 파이프라인 구축

## 파일 구조
```
app/backend/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts     # 인증 API 컨트롤러
│   │   ├── auth.module.ts         # 인증 모듈
│   │   ├── auth.service.ts        # 인증 서비스 로직
│   │   ├── google.strategy.ts     # Google OAuth 전략
│   │   └── jwt.strategy.ts        # JWT 검증 전략
│   ├── users/
│   │   └── user.entity.ts         # 사용자 엔티티
│   ├── app.controller.ts          # 메인 컨트롤러 (헬스체크)
│   ├── app.module.ts              # 메인 모듈
│   └── main.ts                    # 애플리케이션 진입점
├── OracleDB/
│   └── instantclient_23_8/        # Oracle Instant Client
├── Wallet_temmieATP/              # Oracle Wallet 파일
├── .env                           # 환경변수 설정
├── package.json                   # 프로젝트 의존성
└── dev.sqlite                     # SQLite 테스트 DB
```

## 학습 및 개발 노트

### 배운 점
1. **TypeORM 설정**: 다중 데이터베이스 지원을 위한 동적 설정
2. **Passport 전략**: Google OAuth와 JWT 전략의 조합 사용
3. **NestJS 모듈 구조**: 인증 관련 기능의 모듈화
4. **Oracle 연결**: TNS 기반 연결과 Wallet 보안의 복잡성

### 개선할 점
1. **에러 핸들링**: 더 구체적인 에러 메시지와 로깅
2. **테스트 코드**: 유닛 테스트 및 통합 테스트 추가
3. **문서화**: API 문서 자동 생성 (Swagger)
4. **보안**: 더 강화된 JWT 토큰 관리
