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
