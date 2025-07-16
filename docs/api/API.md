### API 최종 설계안(v1.1)

이 문서는 프론트엔드와 백엔드 개발의 기준이 되는 '설계도'입니다.

---

### API 공통 규칙

* **기본 경로(Base Path):** 모든 API 요청은 `/api` 접두사로 시작합니다.
* **인증(Authentication):** 인증이 필요한 모든 API는 요청 헤더에 `Authorization: Bearer [JWT]` 토큰을 포함해야 합니다.
* **응답 형식(Response Format):** 모든 응답은 아래의 표준화된 JSON 형식을 따릅니다.
    * **성공:** `{ "success": true, "data": { ... } }`
    * **실패:** `{ "success": false, "error": { "code": "오류코드", "message": "오류 메시지" } }`
* **페이지네이션(Pagination):** 목록을 반환하는 API는 쿼리 파라미터 `?page=1&limit=20`을 지원합니다.

---

### 1. 인증 API (`/auth`)

**역할:** 소셜 로그인 및 사용자 인증을 처리합니다.

| 기능 | 메서드 | 엔드포인트 | 인증 |
| :--- | :--- | :--- | :-: |
| 구글 로그인 시작 | `GET` | `/auth/google` | X |
| 구글 로그인 콜백 | `GET` | `/auth/google/callback`| X |
| 내 프로필 조회 | `GET` | `/auth/profile` | O |
| 로그아웃 | `POST` | `/auth/logout` | O |

---

### 2. 사용자 API (`/users`)

**역할:** 사용자 관련 정보를 관리합니다.

| 기능 | 메서드 | 엔드포인트 | 인증 |
| :--- | :--- | :--- | :-: |
| 닉네임 설정/수정 | `PUT` | `/users/me/nickname` | O |

---

### 3. 노드 API (`/nodes`)

**역할:** Wings 데몬이 설치된 물리 서버(자택 서버 등)를 등록하고 관리합니다.

| 기능 | 메서드 | 엔드포인트 | 인증 |
| :--- | :--- | :--- | :-: |
| 노드 목록 조회 | `GET` | `/nodes` | O |
| 노드 등록 | `POST`| `/nodes` | O |
| 노드 상세 조회 | `GET` | `/nodes/:id` | O |
| 노드 정보 수정 | `PUT` | `/nodes/:id` | O |
| 노드 삭제 | `DELETE`| `/nodes/:id` | O |

---

### 4. 서버 API (`/servers`)

**역할:** 마인크래프트 서버의 정보를 관리하고 원격으로 제어합니다. 모든 요청은 현재 로그인한 사용자의 소유(`OWNER_ID`)인 서버에 대해서만 동작해야 합니다.

| 기능 | 메서드 | 엔드포인트 | 인증 |
| :--- | :--- | :--- | :-: |
| **서버 목록 조회** | `GET` | `/servers` | O |
| **서버 등록** | `POST` | `/servers` | O |
| **서버 고정 정보 조회** | `GET` | `/servers/:id` | O |
| **서버 정보 수정** | `PUT` | `/servers/:id` | O |
| **서버 삭제** | `DELETE`| `/servers/:id` | O |
| **서버 실시간 상태 조회** | `GET` | `/servers/:id/status`| O |
| **서버 동작 제어** | `POST` | `/servers/:id/actions`| O |
| **콘솔 명령어 전송** | `POST` | `/servers/:id/commands`| O |
| **실시간 콘솔 연결** | `WebSocket`| `(별도 소켓 엔드포인트)`| O |
