<!-- v2.0 -> v2.1, 제목 버전 수정 -->
클로드 & 제미나이 협업 최종 가이드라인 (v2.1)
[핵심 원칙] 모든 변경 사항은 추적 가능성과 효율성의 균형을 맞춰 기록합니다.

## 최근 협업 기록

---
**상태:** ✔️완료
**작성자:** 클로드
**날짜/시간:** 2025-01-15
**관련 이슈:** Wings WebSocket 기반 실시간 로그 스트리밍 구현

**1. 대상 파일 (버전 정보):**
* `app/wings/package.json` @ `latest` - ws 패키지 추가
* `app/wings/src/services/docker.service.js` @ `latest` - 로그 스트리밍 및 컨테이너 제어 함수
* `app/wings/src/websocket/websocket.js` @ `latest` - WebSocket 서버 및 연결 관리 (신규)
* `app/wings/src/index.js` @ `latest` - HTTP 서버와 WebSocket 통합
* `app/wings/src/controllers/server.controller.js` @ `latest` - 서버 제어 함수 재구현
* `app/wings/src/routes/server.routes.js` @ `latest` - 서버 제어 라우트 확인

**2. 수정 내용 (How) & 위치 (Where):**
* `docker.service.js:L99-173`: streamContainerLogs 함수 - Docker 로그 실시간 스트리밍
* `docker.service.js:L175-241`: 컨테이너 제어 함수들 (start, stop, restart, getStatus)
* `websocket/websocket.js`: WebSocket 서버 클래스 - 연결 관리, 메시지 처리, 브로드캐스팅
* `index.js:L3,L6,L38-39`: HTTP 서버 생성 및 WebSocket 서버 초기화
* `server.controller.js:L129-274`: 제미나이 변경사항에 맞춘 서버 제어 함수 재구현

**3. 수정 이유 (Why):**
* 웹 기반 관리 패널에서 실시간 서버 로그 모니터링 필요
* Docker 컨테이너 로그의 실시간 스트리밍을 통한 디버깅 효율성 향상
* 여러 클라이언트의 동시 로그 모니터링 지원
* 제미나이의 API 구조 변경에 따른 기존 기능 호환성 유지

--- (핵심 변경 시 아래 항목을 추가로 작성) ---

**4. 테스트/검증 (Test & Verification):**
* WebSocket 연결: `ws://localhost:8080/ws` 연결 성공 확인
* 로그 구독: `subscribe_logs` 메시지로 서버 로그 실시간 수신 확인
* 로그 구독 해제: `unsubscribe_logs` 메시지로 스트리밍 중단 확인
* 다중 클라이언트: 여러 클라이언트 동시 연결 시 브로드캐스팅 확인
* 연결 관리: 클라이언트 disconnect 시 자동 정리 확인
* 서버 제어: start/stop/restart API 정상 동작 확인

**5. 영향 범위 (Impact):**
* 실시간 모니터링 혁신 - 웹 기반 로그 스트리밍으로 운영 효율성 극대화
* 디버깅 효율성 향상 - 실시간 로그 추적을 통한 문제 해결 속도 증가
* 사용자 경험 개선 - 별도 SSH 접속 없이 웹에서 로그 확인 가능
* 시스템 안정성 - 연결 관리 및 자동 정리를 통한 메모리 누수 방지

**6. 추가 의견 및 요청:**
* WebSocket 메시지 프로토콜 표준화 (subscribe_logs, unsubscribe_logs, ping/pong)
* 로그 필터링 기능 추가 고려 (ERROR, WARN 등 로그 레벨별)
* 제미나이 변경사항과 완전 호환 - 새로운 API 구조에 맞춘 함수 재구현
* 향후 확장: 실시간 성능 메트릭 스트리밍 기능 추가 검토
* 보안 강화: WebSocket 인증 및 권한 검증 시스템 추가 필요

---
**상태:** ✔️완료
**작성자:** 제미나이
**날짜/시간:** 2025-07-15
**관련 이슈:** Wings 서버 생성 API 개선 (WINGS_API.md 명세 반영)

**1. 대상 파일 (버전 정보):**
* `app/wings/src/controllers/server.controller.js` @ `main`
* `app/wings/src/services/docker.service.js` @ `main`

**2. 수정 내용 (How) & 위치 (Where):**
* **`server.controller.js`**:
  - `POST /api/v1/servers`의 요청 본문을 `WINGS_API.md` 명세에 맞춰 `name`, `serverType`, `cpus`, `hostPath` 등을 받도록 변경.
  - `serverId`를 내부에서 `crypto`를 이용해 고유하게 생성하도록 변경.
  - `validateServerConfig`에 `cpus`, `serverType` 등 신규 파라미터 검증 로직 추가.
* **`docker.service.js`**:
  - `itzg/minecraft-server` 이미지를 사용하도록 고정.
  - `serverType`, `version` 및 사용자 정의 `environment`를 컨테이너 환경 변수로 동적 주입.
  - `cpus` 값을 `NanoCpus`로, `memory` 값을 바이트로 변환하여 자원 제한 설정.
  - `hostPath`를 컨테이너의 `/data` 볼륨으로 마운트.
  - RCON 포트(25575)를 자동으로 개방하여 향후 명령어 기능 지원.
  - 이미지 pull이 안 되어 있을 경우, 자동으로 pull을 시도하는 로직 추가.

**3. 수정 이유 (Why):**
* `wings`의 핵심 기능인 서버 생성 API를 공식 API 문서(`WINGS_API.md`)의 최종 명세와 일치시키기 위함.
* 단순 컨테이너 생성을 넘어, 마인크래프트 서버 타입, 버전, CPU/메모리, 데이터 경로 등 세부적인 설정을 완벽하게 제어할 수 있는 기반을 마련.

---

**4. 테스트/검증 (Test & Verification):**
* `POST /api/v1/servers`에 새로운 형식의 JSON 페이로드로 요청하여 서버가 정상 생성되는지 확인.
* 생성된 Docker 컨테이너의 `inspect` 결과를 통해 메모리/CPU 제한, 포트 매핑, 환경 변수, 볼륨 마운트가 정확히 설정되었는지 검증.
* `hostPath`로 지정한 경로에 서버 데이터 파일이 생성되는지 확인.

**5. 영향 범위 (Impact):**
* **Breaking Change**: 서버 생성 API의 요청 형식이 완전히 변경되었으므로, 이 API를 호출하는 Panel(백엔드) 측의 수정이 반드시 필요함.
* `wings` 서비스가 `itzg/minecraft-server` Docker 이미지에 강하게 의존하게 됨.

**6. 추가 의견 및 요청:**
* 클로드: Panel(백엔드)에서 이 새로운 API를 호출하는 로직을 수정해주세요. `WINGS_API.md`의 요청 예시를 참고하면 됩니다.
* RCON 포트는 `(서버 포트 + 10)`으로 임시 설정했는데, 더 나은 충돌 방지 로직에 대한 논의가 필요할 수 있습니다.

---
**상태:** ✔️완료
**작성자:** 제미나이
**날짜/시간:** 2025-07-15 
**관련 이슈:** 생략

**1. 대상 파일 (버전 정보):**
* `app/wings/src/services/docker.service.js` @ `main`

**2. 수정 내용 (How) & 위치 (Where):**
* `docker.service.js`의 `createServerContainer` 함수 내 `serverDataPath` 변수 경로 수정
  - `path.join(process.cwd(), 'data', 'servers', serverId)` -> `path.join('/home/temmie/minecraft_server', serverId)`

**3. 수정 이유 (Why):**
* 실제 `wings`가 구동되는 Debian 서버의 환경과 사용자의 기존 데이터 관리 정책을 반영하기 위함.
* 신규 생성되는 모든 마인크래프트 서버의 데이터를 중앙 디렉토리(`/home/temmie/minecraft_server/`)로 통합하여 관리 효율성을 높임.

---

**4. 테스트/검증 (Test & Verification):**
* API(`POST /api/v1/servers`)를 통해 새 서버 생성을 요청했을 때, 호스트(Debian) 서버의 `/home/temmie/minecraft_server/{serverId}` 경로에 데이터 디렉토��가 정상적으로 생성되는지 확인 필요.

**5. 영향 범위 (Impact):**
* `wings`를 통해 생성되는 모든 서버의 데이터 저장 위치가 변경됨.
* 이 변경으로 인해 `wings` 서비스는 특정 디렉토리 구조(` /home/temmie/minecraft_server`)에 의존하게 됨.

**6. 추가 의견 및 요청:**
* 이 경로는 하드코딩되어 있으므로, 향후 다른 환경에서 사용할 경우를 대비해 환경 변수나 설정 파일을 통해 주입받는 방식으로 개선하는 것을 고려해볼 수 있음.

---
**상태:** ✔️완료
**작성자:** 클로드
**날짜/시간:** 2025-07-15 
**관련 이슈:** Wings 서버 생성 API 안정성 개선

**1. 대상 파일 (버전 정보):**
* `app/wings/index.js` @ `main`  
* `app/wings/routes/servers.js` (추후 분리 예정)  
* `docs/WINGS_API.md` @ `main`  

**2. 수정 내용 (How) & 위치 (Where):**
* `index.js`: Docker 연결 검증, 메모리/포트 형식 검증 함수 추가
* `servers.js`: 에러 타입별 세분화된 HTTP 상태코드 처리 추가
* `WINGS_API.md`: API 명세 업데이트 및 예제 추가

**3. 수정 이유 (Why):**
* 제미나이의 MVC 패턴 리팩토링 후 클로드가 안정성 개선을 위한 검증 로직 강화
* 프로덕션 환경에서의 예외 처리 및 사용자 친화적 오류 메시지 제공
* API 문서화 작업을 통한 개발자 편의성 증대

--- (핵심 변경 시 아래 항목을 추가로 작성) ---

**4. 테스트/검증 (Test & Verification):**
* Docker 데몬 미실행 시 애플리케이션 graceful shutdown 확인
* 잘못된 메모리 형식(`1024x`) 입력 시 400 에러 반환 확인
* 포트 범위 초과(`99999`) 시 적절한 에러 메시지 반환 확인
* 변경된 API 명세에 따른 클라이언트 코드 호환성 검증

**5. 영향 범위 (Impact):**
* 시스템 안정성 대폭 향상 - 잘못된 입력값으로 인한 서버 크래시 방지
* 사용자 경험 개선 - 구체적이고 이해하기 쉬운 에러 메시지 제공
* 디버깅 효율성 증대 - 에러 타입별 세분화된 로깅
* 문서화 작업으로 인한 개발 효율성 증대

**6. 추가 의견 및 요청:**
* 제미나이의 깔끔한 MVC 구조 위에 안정성 레이어가 잘 추가됨
* 향후 Redis/PostgreSQL 연동 시 store 계층 확장 용이
* 컨테이너 시작/중지 API 구현 시 현재 구조 활용 가능
* API 문서화는 지속적으로 업데이트 필요

---

**3. 통합 템플릿**
**상태:** [✔️완료, ⏳검토 중, ❓질문 있음, 💡제안]  
**작성자:** [클로드 또는 제미나이]  
**날짜/시간:** YYYY-MM-DD HH:MM  
**관련 이슈:** #[이슈 번호 또는 생략]  

**1. ���상 파일 (버전 정보):**
* `[파일명]` @ `[커밋 해시 or 브랜치명]`  

**2. 수정 내용 (How) & 위치 (Where):**
* [GitHub/GitLab 라인 링크]: [간략 설명]  

**3. 수정 이유 (Why):**
* [수정 이유]  

--- (핵심 변경의 경우 아래 추가 작성) ---
**4. 테스트/검증:** [검증 방법 및 결과]  
**5. 영향 범위:** [영향 설명]  
**6. 추가 의견 및 요청:** [추가 논의사항]