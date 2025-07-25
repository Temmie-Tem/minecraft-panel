# 🔌 Port Management & Conflict Prevention Guide

> **작성일**: 2025-07-16  
> **목적**: Minecraft Panel 시스템의 포트 사용 현황 및 충돌 방지 가이드  
> **대상**: 개발자, DevOps, 시스템 관리자, AI 협업 시스템

## 📊 현재 포트 사용 현황

### 🎯 주요 서비스 포트

| 포트 | 서비스 | 상태 | 프로세스 | 설명 |
|------|--------|------|----------|------|
| **8080** | Wings API | 🟢 Active | `node` (PID: 8234) | Minecraft 서버 관리 API |
| **25565** | Minecraft Server | 🟢 Active | `java` (Docker) | 기본 Minecraft 게임 포트 |
| **25575** | Minecraft RCON | 🟢 Active | `java` (Docker) | 서버 원격 제어 포트 |
| **80** | Nginx | 🟢 Active | `nginx` | 웹 서버 (리버스 프록시) |
| **3306** | MariaDB | 🟢 Active | `mariadb` | 데이터베이스 서버 |
| **22** | SSH | 🟢 Active | `sshd` | 원격 접속 |

### 🔄 동적 포트

| 포트 범위 | 용도 | 관리 주체 |
|-----------|------|-----------|
| **6010** | SSH 포트 포워딩 | SSH 서비스 |
| **43581** | 임시/동적 할당 | 시스템 |
| **25566-25599** | 추가 Minecraft 서버 | Wings API |

## ⚠️ 충돌 위험성 분석

### 🔴 **높은 위험** - 즉시 주의 필요

#### 1. **Docker 포트 관리 충돌**
```bash
# 현재 Docker 프록시 프로세스들
docker-proxy: 25565, 25575 (Minecraft 컨테이너용)
```
- **위험**: Wings API가 새 Minecraft 서버 생성 시 포트 충돌
- **해결**: Wings API에서 포트 할당 전 중복 검사 필수
- **모니터링**: `docker ps --format "table {{.Names}}\t{{.Ports}}"`
- **상태**: 🟢 **해결됨** - DELETE API 구현으로 자동 포트 해제 가능

#### 2. **Nginx 리버스 프록시**
```nginx
# /etc/nginx/sites-enabled/default
server {
    listen 80;
    # Wings API 프록시 설정 시 주의
}
```
- **위험**: Wings API 프론트엔드 서빙 시 포트 80 사용 충돌
- **해결**: Nginx에서 8080으로 프록시 패스 설정
- **권장**: `proxy_pass http://localhost:8080;`
- **상태**: 🟢 **안정적** - 현재 정상 작동 중

### 🟡 **중간 위험** - 모니터링 필요

#### 3. **MariaDB 연결 경합**
- **현재**: MariaDB 10.11.11 (메모리 ~220MB)
- **위험**: Wings API와 Backend API 동시 DB 접근
- **해결**: 연결 풀 관리, 트랜잭션 격리
- **모니터링**: `SHOW PROCESSLIST;`
- **상태**: 🟡 **주의** - 연결 풀 설정 필요

#### 4. **Java 메모리 사용량**
```bash
# 현재 Minecraft 서버
java -Xmx1G -Xms1G  # 1GB 힙 메모리
CPU: 48.4% 사용 중
```
- **위험**: 추가 서버 생성 시 메모리 부족
- **해결**: 서버별 메모리 할당량 제한
- **권장**: 총 메모리의 70% 이하 사용
- **상태**: 🟡 **모니터링** - 메모리 사용량 증가 추세

### 🟢 **낮은 위험** - 정기 점검

#### 5. **Node.js 프로세스**
- **현재**: Wings API (메모리 ~75MB)
- **위험**: 메모리 누수, 좀비 프로세스
- **모니터링**: PM2 또는 시스템 모니터링
- **상태**: 🟢 **안정적** - 현재 정상 작동 중

## 🛡️ 충돌 방지 전략

### 1. **포트 할당 정책**

```javascript
// Wings API 포트 할당 로직 예시
const RESERVED_PORTS = [22, 80, 443, 3306, 8080];
const MINECRAFT_PORT_RANGE = { start: 25565, end: 25599 };

function getAvailablePort() {
    // 1. 예약된 포트 제외
    // 2. 현재 사용 중인 포트 검사
    // 3. Docker 컨테이너 포트 확인
    // 4. 사용 가능한 포트 반환
}
```

### 2. **모니터링 스크립트**

```bash
#!/bin/bash
# port-monitor.sh - 포트 사용량 모니터링

echo "=== Port Usage Report ==="
ss -tlnp | grep -E "(80|8080|3306|25565|25575)"

echo -e "\n=== Docker Container Ports ==="
docker ps --format "table {{.Names}}\t{{.Ports}}"

echo -e "\n=== High Memory Processes ==="
ps aux --sort=-%mem | head -10
```

### 3. **자동 복구 메커니즘**

```yaml
# docker-compose.yml 예시
version: '3.8'
services:
  minecraft-server:
    image: itzg/minecraft-server
    ports:
      - "${MC_PORT:-25565}:25565"  # 환경변수로 포트 설정
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mc-health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 📋 운영 체크리스트

### 🔄 **정기 점검** (매일)
- [ ] Wings API 상태 확인 (`curl http://localhost:8080/ping`)
- [ ] Docker 컨테이너 상태 (`docker ps`)
- [ ] 포트 사용량 체크 (`ss -tlnp`)
- [ ] 메모리 사용량 (`free -h`)

### 🔍 **주간 점검**
- [ ] Nginx 로그 분석
- [ ] MariaDB 성능 점검
- [ ] 디스크 공간 확인
- [ ] 백업 상태 점검

### 🚨 **긴급 대응**
- [ ] 포트 충돌 감지 시 즉시 알림
- [ ] 서비스 다운 시 자동 재시작
- [ ] 메모리 부족 시 우선순위 기반 서비스 정리

## 🔧 트러블슈팅

### 포트 충돌 해결

```bash
# 1. 충돌 포트 확인
sudo lsof -i :포트번호

# 2. 프로세스 종료 (주의!)
sudo kill -9 PID

# 3. 서비스 재시작
sudo systemctl restart 서비스명
```

### Wings API 포트 변경

```javascript
// src/config/server.js
const PORT = process.env.WINGS_PORT || 8080;
```

```bash
# 환경변수 설정
export WINGS_PORT=8081
```

### 🚨 **알려진 이슈 및 해결 방안**

#### DELETE API 구현 완료 ✅
- **문제**: Wings API에서 서버 삭제 시 포트 해제 불가
- **해결**: DELETE /api/v1/servers/:id 구현 완료 (2025-07-16)
```bash
# 새로운 서버 삭제 API 사용
curl -X DELETE http://localhost:3001/wings/servers/server-123

# 데이터 포함 삭제
curl -X DELETE "http://localhost:3001/wings/servers/server-123?removeData=true"
```
- **상태**: 🟢 **해결됨** - 자동 포트 해제 가능

#### WebSocket 다중 연결 불안정
- **문제**: 동시 WebSocket 연결 시 API 응답 지연
- **해결**: 연결 수 제한 및 풀링 구현

## 📞 비상 연락처

| 상황 | 담당자/시스템 | 연락처/액션 |
|------|---------------|-------------|
| 포트 충돌 | 시스템 관리자 | 즉시 슬랙 알림 |
| 서버 다운 | DevOps | 자동 재시작 후 점검 |
| DB 연결 실패 | DBA | 연결 풀 재설정 |

---

## 📚 관련 문서

- [SYSTEM_HEALTH_CHECK.md](./SYSTEM_HEALTH_CHECK.md) - 시스템 상태 점검
- [DATABASE.md](./DATABASE.md) - 데이터베이스 설정
- [WINGS_API.md](../api/WINGS_API.md) - Wings API 명세

---

## 📋 **최근 업데이트 내역**

### 2025-07-16 (최신)
- ✅ 포트 충돌 위험 상태 표시 추가
- ✅ DELETE API 구현 완료 - 자동 포트 해제 가능
- ✅ WebSocket 다중 연결 불안정 이슈 추가
- ✅ 알려진 이슈 및 해결 방안 섹션 추가

### 향후 개선 계획
- ✅ DELETE API 구현 (완료: 2025-07-16)
- 🔄 WebSocket 연결 안정성 개선
- 🔄 자동화된 포트 모니터링 시스템 구축

---

**⚡ 중요**: 이 문서는 시스템 변경 시 반드시 업데이트하며, AI 협업 시스템이 참조할 수 있도록 최신 상태를 유지합니다.
