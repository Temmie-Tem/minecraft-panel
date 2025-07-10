# 백엔드 개발 트러블슈팅 가이드

## Oracle DB 연결 문제

### 문제: ORA-28759: failure to open file

#### 증상
```
[TypeOrmModule] Unable to connect to the database. Retrying (1)...
Error: ORA-28759: failure to open file
Help: https://docs.oracle.com/error-help/db/ora-28759/
```

#### 원인 분석
이 오류는 Oracle 클라이언트가 Wallet 파일(cwallet.sso, ewallet.p12 등)을 찾거나 열 수 없을 때 발생합니다.

#### ✅ **최종 해결방법** (2025.07.10 해결완료)

**핵심 문제**: `sqlnet.ora` 파일의 `WALLET_LOCATION` 경로가 잘못되어 있었음

**해결 과정**:
1. **sqlnet.ora 파일 수정**:
```plaintext
# 문제 있던 설정
WALLET_LOCATION = (SOURCE = (METHOD = file) (METHOD_DATA = (DIRECTORY="?/network/admin")))

# ✅ 올바른 설정으로 수정
WALLET_LOCATION = (SOURCE = (METHOD = file) (METHOD_DATA = (DIRECTORY="C:/minecraft-panel/app/backend/Wallet_temmieATP")))
```

2. **app.module.ts에서 TNS_ADMIN 환경변수 명시적 설정**:
```typescript
// TNS_ADMIN 환경변수를 명시적으로 설정 (중요!)
process.env.TNS_ADMIN = configDir;
oracledb.initOracleClient({ libDir, configDir });
```

**검증 결과**: ✅ Oracle DB 연결 성공, TypeORM 정상 작동

---

#### 시도한 해결방법

##### 1. 경로 설정 문제
**시도한 방법들**:
```typescript
// 방법 1: 절대 경로
const walletPath = 'C:/minecraft-panel/app/backend/Wallet_temmieATP';

// 방법 2: 상대 경로
const walletPath = './Wallet_temmieATP';

// 방법 3: path.resolve 사용
const walletPath = path.resolve(__dirname, '../Wallet_temmieATP');

// 방법 4: 환경변수 사용
process.env.TNS_ADMIN = walletPath;
```

##### 2. TypeORM 설정 변경
```typescript
// 시도 1: configDir 매개변수
{
  type: 'oracle',
  connectString: 'temmieATP_high',
  username: 'ADMIN',
  password: process.env.DB_PASS,
  extra: {
    configDir: walletPath,
    libDir: instantClientPath,
  }
}

// 시도 2: TNS_ADMIN 환경변수
process.env.TNS_ADMIN = walletPath;
process.env.LD_LIBRARY_PATH = instantClientPath; // Linux용
```

##### 3. 파일 권한 확인
```powershell
# Windows에서 파일 권한 확인
Get-Acl "C:\minecraft-panel\app\backend\Wallet_temmieATP\*"

# 파일 존재 여부 확인
dir "C:\minecraft-panel\app\backend\Wallet_temmieATP"
```

#### 현재 상태
- **Wallet 파일들**: 모두 존재 확인됨
  - `cwallet.sso`
  - `ewallet.p12`
  - `tnsnames.ora`
  - `sqlnet.ora`
- **권한**: 읽기 권한 확인됨
- **경로**: 절대 경로, 상대 경로 모두 시도
- **결과**: 여전히 동일한 오류 발생

#### 추가 확인이 필요한 사항
1. **Oracle Instant Client 버전 호환성**
2. **Windows 환경에서의 특별한 설정**
3. **TNS_ADMIN 환경변수의 우선순위**
4. **Wallet 파일의 내부 구조 검증**

---

## TypeScript 타입 오류

### 문제: Request 객체에 user 속성 없음

#### 증상
```typescript
Property 'user' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'
```

#### 해결방법
```bash
npm install @types/passport
```

```typescript
// auth.controller.ts
import { Request } from 'express';

// Passport가 Request 객체에 user 속성을 추가함
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@Request() req: any) {
  return req.user; // 이제 타입 오류 없음
}
```

---

## 환경변수 로딩 문제

### 문제: .env 파일이 로드되지 않음

#### 증상
```
process.env.DB_PASS가 undefined
```

#### 해결방법
```typescript
// app.module.ts
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 다른 모듈들...
  ],
})
```

---

## JWT 토큰 관련 문제

### 문제: JWT 서명 검증 실패

#### 증상
```
JsonWebTokenError: invalid signature
```

#### 해결방법
```typescript
// JWT 시크릿이 일관되게 사용되는지 확인
JwtModule.register({
  secret: process.env.JWT_SECRET, // 동일한 시크릿 사용
  signOptions: { expiresIn: '1h' },
})
```

---

## Google OAuth 설정 문제

### 문제: redirect_uri_mismatch

#### 증상
```
Error 400: redirect_uri_mismatch
```

#### 해결방법
Google Cloud Console에서 승인된 리디렉션 URI 확인:
```
http://localhost:3000/auth/google/callback
```

정확히 일치해야 함 (포트, 경로 포함)

---

## 데이터베이스 마이그레이션 문제

### 문제: 엔티티 동기화 실패

#### 증상
```
QueryFailedError: ORA-00942: table or view does not exist
```

#### 해결방법 (임시)
```typescript
// app.module.ts - 개발 환경에서만 사용
TypeOrmModule.forRoot({
  // ...
  synchronize: true, // 프로덕션에서는 false
  dropSchema: false, // 데이터 삭제 방지
})
```

#### 정식 해결방법
```bash
# 마이그레이션 생성
npm run typeorm migration:generate -- -n CreateUserTable

# 마이그레이션 실행
npm run typeorm migration:run
```

---

## SQLite 임시 해결책

### 목적
Oracle DB 연결 문제 해결 전까지 개발 진행

### 설정
```properties
# .env
DB_TYPE=sqlite
DB_DATABASE=./dev.sqlite
```

### 장점
- 빠른 개발 및 테스트 가능
- 파일 기반이므로 설정 간단
- TypeORM과 완벽 호환

### 단점
- 프로덕션 환경과 다름
- Oracle 특화 기능 테스트 불가

---

## 성능 및 메모리 문제

### 문제: 메모리 사용량 증가

#### 모니터링
```bash
# Node.js 메모리 사용량 확인
node --max-old-space-size=4096 dist/main.js
```

#### 해결방법
```typescript
// 연결 풀 설정
{
  type: 'oracle',
  // ...
  extra: {
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1,
  }
}
```

---

## 로깅 및 디버깅

### 개발 중 유용한 로깅
```typescript
// app.module.ts
TypeOrmModule.forRoot({
  // ...
  logging: ['query', 'error', 'schema'],
  logger: 'advanced-console',
})
```

### 환경변수 디버깅
```typescript
// main.ts
console.log('Environment variables:', {
  DB_TYPE: process.env.DB_TYPE,
  DB_TNS_ADMIN: process.env.DB_TNS_ADMIN,
  // DB_PASS는 보안상 로그하지 않음
});
```

---

## 배포 환경 고려사항

### Windows vs Linux
```typescript
// 경로 처리
const isWindows = process.platform === 'win32';
const libDir = isWindows 
  ? 'C:/oracle/instantclient_21_3'
  : '/opt/oracle/instantclient_21_3';
```

### Docker 환경
```dockerfile
# Oracle Instant Client 설치
RUN wget https://download.oracle.com/otn_software/linux/instantclient/...
RUN unzip instantclient-basic-linux.x64-21.3.0.0.0.zip
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_21_3:$LD_LIBRARY_PATH
```

---

## 추천 디버깅 단계

### Oracle DB 연결 문제 해결 순서
1. **SQLite로 기본 기능 검증**
2. **Oracle 클라이언트 도구로 직접 연결 테스트**
3. **환경변수 및 경로 재확인**
4. **다른 연결 방식 시도 (Easy Connect)**
5. **Oracle 로그 파일 확인**
6. **Windows 전용 설정 검토**

### 일반적인 문제 해결 순서
1. **로그 확인**: 정확한 에러 메시지 파악
2. **환경 분리**: 개발/테스트 환경에서 재현
3. **단계별 테스트**: 작은 부분부터 확인
4. **문서 참조**: 공식 문서 및 커뮤니티
5. **대안 마련**: 임시 해결책 준비

---