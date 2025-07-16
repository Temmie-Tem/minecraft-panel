# 작업 완료 후 수행사항

## 코드 품질 검사
1. **린팅 및 포매팅**
   ```bash
   # 백엔드
   cd app/backend
   npm run lint
   npm run format
   
   # 프론트엔드  
   cd app/mc-panel-frontend
   npm run lint
   ```

2. **빌드 테스트**
   ```bash
   # 루트에서 전체 빌드
   npm run build
   ```

3. **테스트 실행**
   ```bash
   # 백엔드 테스트
   cd app/backend
   npm run test
   npm run test:e2e
   ```

## 배포 준비
1. **환경 변수 확인**
   - `.env` 파일들이 올바르게 설정되었는지 확인
   - 프로덕션 환경 변수와 개발 환경 변수 분리

2. **의존성 보안 검사**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Git 커밋**
   ```bash
   git add .
   git commit -m "feat: 작업 내용 요약"
   git push
   ```

## 문서 업데이트
- 새로운 API가 추가된 경우 `docs/API.md` 업데이트
- DB 스키마 변경 시 `docs/DATABASE.md` 업데이트
- 개발 과정에서 발생한 이슈는 `docs/TROUBLESHOOTING.md`에 기록
