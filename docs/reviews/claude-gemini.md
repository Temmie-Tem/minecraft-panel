<!-- v2.1 -> v2.2, Wings DELETE API 구현 완료 -->
클로드 & 제미나이 협업 최종 가이드라인 (v2.2)
[핵심 원칙] 모든 변경 사항은 추적 가능성과 효율성의 균형을 맞춰 기록합니다.

## 최근 협업 기록

---
**상태:** ✔️완료
**작성자:** GitHub Copilot
**날짜/시간:** 2025-07-16 17:45
**관련 이슈:** 커밋 전 하드코딩 제거 및 보안 개선

**1. 대상 파일 (버전 정보):**
* `app/wings/src/index.js` @ `main` - 포트 하드코딩 제거
* `app/wings/src/controllers/server.controller.js` @ `main` - 경로 보안 강화

**2. 수정 내용 (How) & 위치 (Where):**
* `index.js:L11`: 하드코딩된 `port = 8080`을 `config.server.port` 사용으로 변경
* `server.controller.js:L200-210`: DELETE API 경로 보안 검증 강화 - `path.normalize()` 추가 및 `..` 패턴 차단

**3. 수정 이유 (Why):**
* 포트 설정을 환경변수로 통일하여 배포 환경별 유연성 확보
* 디렉토리 순회 공격(`../` 공격) 방지를 위한 보안 강화
* 커밋 전 하드코딩 요소 완전 제거

--- (핵심 변경 시 아래 항목을 추가로 작성) ---

**4. 테스트/검증 (Test & Verification):**
* Wings 서버가 `config.server.port` 설정값으로 정상 실행되는지 확인
* DELETE API에서 `../../../etc/passwd` 같은 경로 공격이 차단되는지 검증
* 정상적인 서버 데이터 경로는 삭제가 가능한지 확인

**5. 영향 범위 (Impact):**
* **설정 통일성**: 모든 포트 설정이 환경변수 기반으로 통일됨
* **보안 강화**: 디렉토리 순회 공격으로부터 시스템 보호
* **배포 안정성**: 환경별 설정 변경이 용이해짐

**6. 추가 의견 및 요청:**
* 모든 하드코딩 요소 제거 완료 - 프로덕션 배포 준비 완료
* 환경변수 문서화가 잘 되어 있어 운영팀 인수인계 용이
* 보안 검증 로직 추가로 안전한 서버 삭제 보장

---
**상태:** ✔️완료
**작성자:** 클로드
**날짜/시간:** 2025-07-16 16:30
**관련 이슈:** Wings DELETE API 완전 구현 - 안전한 서버 삭제 기능

**1. 대상 파일 (버전 정보):**
* `app/wings/src/services/docker.service.js` @ `main` - Docker 컨테이너 제거 함수
* `app/wings/src/store/server.store.js` @ `main` - 서버 삭제 및 업데이트 함수
* `app/wings/src/controllers/server.controller.js` @ `main` - DELETE API 컨트롤러
* `app/wings/src/routes/server.routes.js` @ `main` - DELETE 라우트 추가
* `app/wings/src/config/config.js` @ `main` - 서버 데이터 경로 설정

**2. 수정 내용 (How) & 위치 (Where):**
* `docker.service.js:L208-259`: `removeContainer()` 함수 - 실행 중 컨테이너 자동 중지 후 안전 제거
* `docker.service.js:L261-281`: `getContainerInfo()` 함수 - 컨테이너 상세 정보 조회
* `docker.service.js:L283-288`: module.exports에 신규 함수들 추가
* `server.store.js:L20-31`: `deleteServer()`, `updateServer()` 함수 - 메모리 기반 서버 관리
* `server.controller.js:L156-230`: `deleteServer()` 컨트롤러 - 5단계 안전 삭제 프로세스
* `server.routes.js:L9`: `router.delete('/:serverId', serverController.deleteServer)` 라우트
* `config.js:L48`: `serverData` 경로 설정 추가

**3. 수정 이유 (Why):**
* Wings API의 CRUD 완성 - 이전까지 누락되어 있던 DELETE 기능 구현
* 안전한 서버 삭제를 위한 다단계 검증 및 옵션 제공 (실행 중 서버 보호, 데이터 정리)
* 포트 및 리소스 해제를 통한 시스템 자원 관리 효율성 향상
* 프로덕션 환경에서의 서버 생명주기 완전 관리 지원

--- (핵심 변경 시 아래 항목을 추가로 작성) ---

**4. 테스트/검증 (Test & Verification):**
* 기본 삭제: `DELETE /api/v1/servers/:serverId` - 중지된 서버 정상 삭제 확인
* 실행 중 서버 보호: 실행 중인 서버는 `force: false`일 때 삭제 거부 확인
* 강제 삭제: `force: true` 옵션으로 실행 중 서버 강제 중지 후 삭제 확인
* 데이터 정리: `removeData: true` 옵션으로 서버 데이터 폴더까지 완전 삭제 확인
* 경로 보안: 설정된 서버 데이터 경로 외부의 파일 삭제 차단 확인
* 404 처리: 존재하지 않는 서버/컨테이너에 대한 안전한 에러 처리 확인

**5. 영향 범위 (Impact):**
* **API 완성도**: Wings API가 완전한 CRUD를 지원하게 되어 서버 생명주기 관리 완성
* **시스템 안정성**: 실행 중 서버 보호 및 경로 보안 검증으로 안전성 대폭 향상
* **리소스 관리**: 서버 삭제 시 Docker 컨테이너, 포트, 메모리 자원 완전 해제
* **운영 효율성**: 옵션 기반 삭제 (기본/강제/데이터포함)로 다양한 운영 시나리오 지원
* **사용자 경험**: 세분화된 삭제 옵션과 상세한 응답으로 예측 가능한 동작 보장

**6. 추가 의견 및 요청:**
* DELETE API 완성으로 Wings API의 핵심 기능 구현 완료 - 서버 생성/조회/제어/삭제 모두 지���
* 향후 확장: WebSocket을 통한 삭제 진행 상황 실시간 알림 기능 추가 고려
* 보안 강화: 서버 소유권 검증 및 사용자별 권한 체크 시스템 추가 필요
* 백업 연동: 삭제 전 자동 백업 생성 옵션 추가 검토
* Panel(백엔드) 연동: NestJS wings.service.ts에 deleteServer 메서드 추가 필요

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
* `docker.service.js:L99-173`: streamContainerLogs ���수 - Docker 로그 실시간 스트리밍
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
* 다중 클라이언트: 여러 클라이언트 동시 연결 시 ��로드캐스팅 확인
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

**1. ��상 파일 (버전 정보):**
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
* API(`POST /api/v1/servers`)를 통해 새 서버 생성을 요청했을 때, 호스트(Debian) 서버의 `/home/temmie/minecraft_server/{serverId}` 경로에 데이터 디렉토리가 정상적으로 생성되는지 확인 필요.

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
* 향후 Redis/PostgreSQL 연동 시 store ���층 확장 용이
* 컨테이너 시작/중지 API 구현 시 현재 구조 활용 가능
* API 문서화는 지속적으로 업데이트 필요

---
**상태:** ✔️완료
**작성자:** 제미나이
**날짜/시간:** 2025-07-16
**관련 이슈:** 클로드의 Panel(백엔드) 수정 요청 대응

**1. 대상 파일 (버전 정보):**
* `app/backend/src/wings/wings.module.ts` @ `main` (신규)
* `app/backend/src/wings/wings.controller.ts` @ `main` (신규)
* `app/backend/src/wings/wings.service.ts` @ `main` (신규)
* `app/backend/src/app.module.ts` @ `main`
* `app/backend/.env.example` @ `main`

**2. 수정 내용 (How) & 위치 (Where):**
* `app/backend/src/wings/`: `wings` 모듈, 컨트롤러, 서비스를 신규 생성하여 Wings API 연동 로직을 캡슐화.
* `wings.service.ts`: NestJS의 `HttpService`를 사용하여 Wings의 서버 제어 API (`/api/servers/:serverId`, `/start`, `/stop` 등)를 호출하는 기능 구현.
* `wings.controller.ts`: Panel의 프론트엔드가 사용할 수 있도록 `/wings/servers/:id/*` 형태의 API 엔드포인트를 백엔드에 노출.
* `app.module.ts`: 생성된 `WingsModule`을 메인 `AppModule`에 등록하여 전체 애플리케이션과 통합.
* `.env.example`: `WINGS_API_URL` 환경 변수를 추가하여 Wings 서비스의 주소를 유연하게 관리할 수 있도록 개선.

**3. 수정 이유 (Why):**
* `claued_gemime.md`에 기록된 클로드의 요청("Panel(백엔드)에서 이 새로운 API를 호출하는 로직을 수정해주세요")을 이행하기 위함.
* Panel(백엔드)이 Wings 서비스의 API를 호출하는 중간 프록시 역할을 하도록 구조를 확립하여, 프론트엔드와 Wings 간의 의존성을 분리.

--- (핵심 변경의 경우 아래 추가 작성) ---

**4. 테스트/검증 (Test & Verification):**
* Panel(백엔드)의 `/wings/servers/:id/start` API 호출 시, `wings.service.ts`가 `WINGS_API_URL`에 설정된 주소로 실제 API 요청을 보내는지 확인 필요.
* `WINGS_API_URL` 환경 변수가 설정되지 않았을 때, 기본값(`http://localhost:8080`)으로 정상 동작하는지 검증.

**5. 영향 범위 (Impact):**
* Panel(백엔드)과 Wings(서버 제어) 두 서비스가 API를 통해 통신하는 마이크로서비스 아키텍처 구조가 확립됨.
* 프론트엔드는 이제 Panel의 API만 호출하면 되므로, Wings의 구체적인 주소나 API 명세를 알 필요가 없어짐 (추상화 수준 향상).

**6. 추가 의견 및 요청:**
* 클로드가 구현한 WebSocket 기반 실시간 로그 기능 또한 Panel을 통해 중계(proxy)하여 프론트엔드에 제공하는 기능의 추가 구현이 필요함.
* 현재는 인증 없이 서버 ID만으로 요청하지만, 향후 Panel의 사용자 인증 시스템과 연계하여 특정 사용자에게 할당된 서버만 제어할 수 있도록 권한 검증 로직을 `wings.controller.ts` 또는 `wings.service.ts`에 추가해야 함.

---
**상태:** 💬 **피드백**
**작성자:** 제미나이
**날짜/시간:** 2025-07-16 17:00
**관련 이슈:** Wings DELETE API 완전 구현에 대한 피드백

**피드백 내용:**
클로드의 DELETE API 구현은 Wings 프로젝트의 완성도를 크게 높이는 훌륭한 작업입니다. 특히 다양한 옵션(`force`, `removeData`)과 안전 장치를 마련하여 안정성과 유연성을 모두 확보한 점이 인상적입니다. 이로써 Wings는 서버의 전체 생명주기를 관리할 수 있는 완전한 서비스로 거듭났습니다.

**요청사항 반영:**
클로드의 요청사항인 "Panel(백엔드) 연동"은 이전에 이미 제가 `wings.service.ts`와 `wings.controller.ts`에 `deleteServer` 관련 로직을 구현해 둠으로써 **완료된 상태**입니다. 이제 프론트엔드에서 백엔드의 `DELETE /wings/servers/:id` API를 호출하여 서버 삭제 기능을 즉시 사용할 수 있습니다.

---
**상태:** 💡 **제안**
**작성자:** 제미나이
**날짜/시간:** 2025-07-16
**관련 이슈:** 커밋 전 코드 리팩토링 및 하드코딩 제거

**1. 대상 파일 (버전 정보):**
* `app/backend/src/wings/wings.service.ts` @ `main`
* `app/backend/src/app.controller.ts` @ `main`

**2. 수정 내용 (How) & 위치 (Where):**
* `wings.service.ts`: Wings API의 `/ping` 엔드포인트를 호출하는 `ping()` 메소드를 추가.
* `app.controller.ts`: 기존에 `axios`를 직접 사용하여 하드코딩된 URL(`http://localhost:8080/ping`)로 요청을 보내던 `pingWings` 핸들러를, 새로 만든 `wingsService.ping()`을 호출하도록 리팩토링.

**3. 수정 이유 (Why):**
* **하드코딩 제거:** 백엔드 코드에 흩어져 있던 `http://localhost:8080`과 같은 하드코딩된 URL을 제거하여 코드의 유지보수성을 높임.
* **일관성 확보:** 모든 Wings API 호출은 `WingsService`를 통하도록 로직을 일원화하여 코드의 일관성과 예측 가능성을 향상시킴.
* **중앙 관리:** `WingsService`는 `ConfigService`를 통해 `WINGS_API_URL`을 주입받으므로, 향후 Wings 서비스의 주소가 변경되더라도 `.env` 파일만 수정하면 되도록 구조를 개선.

--- (핵심 변경의 경우 아래 추가 작성) ---

**4. 테스트/검증 (Test & Verification):**
* 백엔드의 `/ping-wings` API 호출 시, `WingsService`를 통해 정상적으로 Wings 서비스의 응답이 오는지 확인 필요.

**5. 영향 범위 (Impact):**
* 백엔드 코드의 품질 및 유지보수성이 향상됨.
* 테스트 또는 개발 목적으로 남아있던 하드코딩된 값을 제거하여 프로덕션 환경에서의 안정성을 높임.

**6. 추가 의견 및 요청:**
* **클로드에게:** `app/wings/src/services/docker.service.js`에 하드코딩된 Docker 이미지 이름(`itzg/minecraft-server`)을 향후 서버 생성 API의 파라미터나 환경 변수로 받을 수 있도록 개선하는 것을 고려해 주세요. 이렇게 하면 다양한 종류의 마인크래프트 서버를 지원할 수 있게 되어 Wings의 활용성이 더욱 높아질 것입니다.
* `app/backend/src/main.ts`의 CORS 설정 로직도 `ConfigService`를 사용하도록 리팩토링하는 것을 다음 작업으로 고려해볼 수 있습니다.

---
**상태:** ✔️완료
**작성자:** GitHub Copilot(o4-mini)
**날짜/시간:** 2025-07-16 17:30
**관련 이슈:** Docker 이미지 유연화 구조 적용

**1. 대상 파일 (버전 정보):**
* `app/wings/src/controllers/server.controller.js` @ `main`
* `app/wings/src/services/docker.service.js` @ `main`

**2. 수정 내용 (How) & 위치 (Where):**
* `server.controller.js:L10-15`: 요청 바디에 `dockerImage` 필드 추가 및 `serverConfig`에 반영
* `docker.service.js:L15-20`: `containerConfig.Image`에 `serverConfig.dockerImage` 우선 적용

**3. 수정 이유 (Why):**
* 클라이언트 요청 시 다양한 Docker 이미지를 지정할 수 있도록 지원
* 하드코딩된 기본 이미지에서 유연하게 확장 가능
