# 주요 명령어 모음

## 프로젝트 레벨 명령어 (루트 디렉터리)
```bash
# 모든 의존성 설치
npm run bootstrap

# 모든 앱 빌드
npm run build

# 개별 앱 실행
npm run start:frontend     # 프론트엔드 개발 서버
npm run start:backend      # 백엔드 개발 서버  
npm run start:discord      # 디스코드 봇
npm run start:wings        # Wings 데몬
npm run start:all          # 모든 서비스 동시 실행
```

## 백엔드 명령어 (app/backend)
```bash
npm run build              # 프로덕션 빌드
npm run start              # 프로덕션 실행
npm run start:dev          # 개발 모드 (hot reload)
npm run start:debug        # 디버그 모드
npm run lint               # ESLint 검사 및 수정
npm run format             # Prettier 포매팅
npm run test               # 단위 테스트
npm run test:e2e           # E2E 테스트
npm run test:cov           # 테스트 커버리지
```

## 프론트엔드 명령어 (app/mc-panel-frontend)  
```bash
npm run dev                # 개발 서버 실행
npm run build              # 프로덕션 빌드
npm run lint               # ESLint 검사
npm run preview            # 빌드 결과 미리보기
```

## Windows 시스템 명령어
```cmd
dir                        # 디렉터리 목록 (ls 대신)
cd                         # 디렉터리 이동
copy                       # 파일 복사 (cp 대신)
del                        # 파일 삭제 (rm 대신)
findstr                    # 텍스트 검색 (grep 대신)
git                        # Git 명령어들
```
