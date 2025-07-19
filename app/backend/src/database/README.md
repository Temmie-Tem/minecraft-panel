# TypeORM 마이그레이션 가이드

이 프로젝트는 프로덕션 환경에서 안전한 데이터베이스 스키마 관리를 위해 TypeORM 마이그레이션을 사용합니다.

## 📋 개요

- **개발환경**: `synchronize: true` 사용 (자동 스키마 동기화)
- **프로덕션환경**: 마이그레이션 사용 (수동 스키마 관리)

## 🛠️ 마이그레이션 명령어

### 1. 마이그레이션 생성
엔티티 변경 후 마이그레이션 파일 생성:
```bash
npm run migration:generate
```

### 2. 마이그레이션 실행
대기 중인 마이그레이션을 데이터베이스에 적용:
```bash
npm run migration:run
```

### 3. 마이그레이션 되돌리기
마지막 마이그레이션을 롤백:
```bash
npm run migration:revert
```

### 4. 마이그레이션 상태 확인
현재 마이그레이션 상태 보기:
```bash
npm run migration:show
```

### 5. 스키마 삭제 (주의!)
전체 스키마 삭제 (개발환경에서만 사용):
```bash
npm run schema:drop
```

## 🔄 워크플로우

### 개발 중 엔티티 변경
1. 엔티티 파일 수정 (예: `src/entities/server.entity.ts`)
2. 개발환경에서 테스트 (`synchronize: true`로 자동 스키마 업데이트)
3. 프로덕션 배포 전 마이그레이션 생성:
   ```bash
   npm run migration:generate
   ```
4. 생성된 마이그레이션 파일 검토
5. 프로덕션 배포 시 마이그레이션 자동 실행

### 프로덕션 배포
프로덕션 환경에서는 `migrationsRun: true` 설정으로 자동 마이그레이션 실행됩니다.

## ⚠️ 주의사항

1. **마이그레이션 파일 검토**: 생성된 마이그레이션 파일을 항상 검토하세요
2. **백업**: 프로덕션 배포 전 데이터베이스 백업 필수
3. **테스트**: 스테이징 환경에서 마이그레이션 테스트
4. **버전 관리**: 마이그레이션 파일을 Git에 커밋하세요

## 📁 파일 구조

```
src/database/
├── data-source.ts          # TypeORM DataSource 설정
├── migrations/             # 마이그레이션 파일들
│   ├── 1640000000000-Migration.ts
│   └── ...
└── README.md              # 이 파일
```

## 🔧 환경변수 설정

마이그레이션을 위해 다음 환경변수가 필요합니다:

```env
# 데이터베이스 설정
DB_TYPE=oracle              # 또는 sqlite
DB_CONNECT_STRING=...       # Oracle 연결 문자열
DB_USER=...                 # 데이터베이스 사용자
DB_PASS=...                 # 데이터베이스 비밀번호
NODE_ENV=production         # 프로덕션 환경
```