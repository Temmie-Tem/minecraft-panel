# Oracle Instant Client 설치 안내

이 문서는 Windows 및 Linux 환경에서 Oracle Instant Client를 설치하고 사용하기 위한 가이드입니다.

## 1. Windows 설치

1. Oracle [Instant Client 다운로드 페이지](https://www.oracle.com/database/technologies/instant-client.html)에서
   - "Instant Client Package - Basic" ZIP 파일(예: `instantclient-basic-windows.x64-23.8.0.25.04.zip`)을 다운로드합니다.
2. 프로젝트 내 디렉터리 생성 후 압축 해제:
   ```powershell
   cd c:\minecraft-panel\app\backend\OracleDB
   Expand-Archive -Path ..\instantclient-basic-windows.x64-23.8.0.25.04.zip -DestinationPath instantclient_23_8
   ```
3. 시스템 환경변수 설정 (제어판 → 시스템 → 고급 시스템 설정 → 환경 변수)
   - `PATH`에 `C:\minecraft-panel\app\backend\OracleDB\instantclient_23_8` 추가
   - `TNS_ADMIN`에 `C:\minecraft-panel\app\backend\Wallet_temmieATP` 추가
4. PowerShell을 다시 열고 다음을 실행하여 설치 확인:
   ```powershell
   cd c:\minecraft-panel\app\backend
   node test-oracle-connection.js
   ```

## 2. Linux 설치

1. 필수 패키지 설치 (예: Ubuntu):
   ```bash
   sudo apt-get update
   sudo apt-get install -y libaio1 unzip
   ```
2. Instant Client ZIP 다운로드 후 압축 해제:
   ```bash
   mkdir -p /opt/oracle
   unzip instantclient-basic-linux.x64-23_8.zip -d /opt/oracle
   mv /opt/oracle/instantclient_23_8 /opt/oracle/instantclient_23_8
   ```
3. 환경변수 설정:
   ```bash
   echo 'export LD_LIBRARY_PATH=/opt/oracle/instantclient_23_8:$LD_LIBRARY_PATH' >> ~/.bashrc
   echo 'export TNS_ADMIN=/opt/oracle/Wallet_temmieATP' >> ~/.bashrc
   source ~/.bashrc
   ```
4. 설치 확인:
   ```bash
   cd ~/minecraft-panel/app/backend
   node test-oracle-connection.js
   ```

## 3. .gitignore 설정
레포지토리 루트의 `.gitignore`에 Instant Client 및 Wallet 바이너리가 커밋되지 않도록 아래 패턴을 추가하세요:

```gitignore
# Oracle Wallet
/app/backend/Wallet_temmieATP

# Oracle Instant Client
/app/backend/OracleDB/instantclient_*
/app/backend/OracleDB/*.zip
/app/backend/OracleDB/*.dll
```

## 4. 기존 바이너리 제거

이미 Git에 커밋된 대용량 파일을 제거하려면:

```bash
cd app/backend
git rm --cached OracleDB/instantclient-basic-*.zip
git rm --cached OracleDB/instantclient_23_8/*.dll
git commit -m "Remove Instant Client binaries; add to .gitignore"
git push
```

---

이제 각자 OS에 맞춰 Instant Client를 설치하고, 백엔드 서비스를 실행하세요!

## 5. 보안 모범 사례

### 5.1 환경변수 관리
- **절대 금지**: 코드에 비밀정보(DB 비밀번호, API 키 등) 하드코딩
- **권장 방식**: `.env` 파일과 환경변수 사용
```bash
# .env.example 파일 생성 (템플릿용)
DB_TYPE=oracle
DB_TNS_ADMIN=<YOUR_TNS_ADMIN_PATH>
DB_CONNECT_STRING=<YOUR_CONNECT_STRING>
DB_USER=<YOUR_DB_USER>
DB_PASS=<YOUR_DB_PASSWORD>
GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>
JWT_SECRET=<YOUR_JWT_SECRET>
```

### 5.2 Oracle Wallet 보안
**Windows**:
```powershell
# Wallet 디렉터리 권한 제한
icacls "C:\minecraft-panel\app\backend\Wallet_temmieATP" /inheritance:d
icacls "C:\minecraft-panel\app\backend\Wallet_temmieATP" /grant:r "%USERNAME%:(OI)(CI)F"
```

**Linux**:
```bash
# Wallet 디렉터리 권한 제한 (소유자만 읽기/쓰기)
chmod 700 /opt/oracle/Wallet_temmieATP
chown $USER:$USER /opt/oracle/Wallet_temmieATP
```

### 5.3 운영 환경 시크릿 관리
- **개발**: 로컬 `.env` 파일 사용
- **테스트/운영**: 
  - AWS Secrets Manager
  - Azure Key Vault  
  - Google Secret Manager
  - Kubernetes Secrets
  - Docker Swarm Secrets

### 5.4 Git 보안 체크리스트
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] Oracle Wallet 파일이 `.gitignore`에 포함되어 있는가?
- [ ] 코드에 하드코딩된 비밀정보가 없는가?
- [ ] 커밋 전 `git log --oneline -p` 로 비밀정보 유출 확인
- [ ] GitHub/GitLab Secret Scanning 활성화

---
