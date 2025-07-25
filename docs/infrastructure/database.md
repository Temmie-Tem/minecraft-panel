## 💾 데이터베이스 최종 설계 (v2.2)

저희는 Oracle Cloud의 **Always Free 등급 Autonomous Transaction Processing (ATP) Database**를 사용하기로 결정했습니다. 이 DB는 애플리케이션(VM)과 분리되어 관리되며, 확장성과 보안, 안정성을 극대화합니다.

### 최종 테이블 관계도 (ERD)

```
+-----------+       +-----------+       +-------------------+
|   USERS   |--(1:N)--|  SERVERS  |--(1:N)--|  PLAYER_SESSIONS  |
| (관리자)  |       | (MC 서버) |       +-------------------+
+-----------+       +-----------+       |   PUNISHMENTS     |
    |                   |               |  (처벌 기록)      |
   (1:N)               (1:N)            +-------------------+
    |                   |               | PERFORMANCE_LOGS  |
+-----------+       +-----------+       |   (성능 기록)     |
|   NODES   |       |  PLAYERS  |       +-------------------+
| (Wings)   |       | (플레이어)|
+-----------+       +-----------+
                        |
                       (1:N)
                        |
               +-------------------+
               |   COMMAND_LOGS    |
               |   (명령어 기록)   |
               +-------------------+
               |   GAMEMODE_LOGS   |
               | (게임모드 기록)   |
               +-------------------+
```

-----

### 1. `USERS` 테이블 (Panel 관리자)
**역할:** Panel 웹사이트에 로그인하고 시스템을 관리하는 사용자의 정보를 저장합니다.

| 컬럼명 | 데이터 타입 (Oracle) | 설명 |
| :--- | :--- | :--- |
| `ID` | `NUMBER(19)` | **(PK)** 관리자 고유 번호 |
| `PROVIDER` | `VARCHAR2(20)` | 로그인 제공자 (예: 'google') |
| `PROVIDER_ID`| `VARCHAR2(255)`| 해당 서비스의 사용자 고유 ID |
| `EMAIL` | `VARCHAR2(100)` | 사용자 이메일 (중복 불가) |
| `NICKNAME` | `VARCHAR2(50)` | 사용자가 직접 설정한 닉네임 (중복 불가) |
| `ROLE` | `VARCHAR2(20)` | 권한 등급 (예: 'SUPER_ADMIN') |
| `CREATED_AT`| `TIMESTAMP` | 계정 생성일 |

### 2. `NODES` 테이블 (Wings 데몬 서버)
**역할:** Wings 데몬이 설치된 물리 서버(자택 서버 등)의 접속 정보를 관리합니다.

| 컬럼명 | 데이터 타입 (Oracle) | 설명 |
| :--- | :--- | :--- |
| `ID` | `NUMBER(19)` | **(PK)** 노드 고유 번호 |
| `NAME` | `VARCHAR2(100)` | 노드 이름 (예: '자택 데비안 서버') |
| `FQDN` | `VARCHAR2(255)` | 접속 주소 (IP 또는 도메인) |
| `AUTH_TOKEN`| `CLOB` | Panel과 Wings 인증용 비밀 키 |
| `CREATED_AT`| `TIMESTAMP` | 생성일 |

### 3. `SERVERS` 테이블 (마인크래프트 서버)
**역할:** Panel에서 관리할 마인크래프트 서버의 핵심 정보를 저장합니다.

| 컬럼명 | 데이터 타입 (Oracle) | 설명 |
| :--- | :--- | :--- |
| `ID` | `NUMBER(19)` | **(PK)** 서버 고유 번호 |
| `UUID` | `VARCHAR2(36)` | 서버 식별용 고유 UUID |
| `NAME` | `VARCHAR2(100)` | 서버 이름 (예: '친구들과 야생서버') |
| `NODE_ID` | `NUMBER(19)` | **(FK)** 이 서버가 속한 `NODES` 테이블의 ID |
| `OWNER_ID` | `NUMBER(19)` | **(FK)** 이 서버를 소유한 `USERS` 테이블의 ID |
| `SERVER_VERSION`| `VARCHAR2(20)` | 게임 버전 (예: '1.20.1') |
| `SERVER_TYPE`| `VARCHAR2(20)` | 서버 종류 (예: 'FORGE', 'PAPER') |
| `MEMORY` | `NUMBER(10)` | 할당된 메모리 (MB 단위) |

### 4. `PLAYERS` 테이블 (마인크래프트 플레이어)
**역할:** 게임 서버에 접속한 모든 플레이어의 고유 정보와 핵심 통계를 저장합니다.

| 컬럼명 | 데이터 타입 (Oracle) | 설명 |
| :--- | :--- | :--- |
| `ID` | `NUMBER(19)` | **(PK)** 플레이어 고유 번호 |
| `UUID` | `VARCHAR2(36)` | 마인크래프트 고유 UUID (중복 불가) |
| `LAST_KNOWN_NAME` | `VARCHAR2(16)` | 마지막으로 확인된 닉네임 |
| `IS_OP` | `NUMBER(1)` | OP 권한 여부 (0: false, 1: true) |
| `FIRST_SEEN_AT` | `TIMESTAMP` | 최초 접속 시간 |
| `LAST_SEEN_AT` | `TIMESTAMP` | 마지막 접속 시간 |
| `TOTAL_PLAYTIME`| `NUMBER(19)` | 총 플레이 시간 (초 단위) |

### 5. `PLAYER_SESSIONS` 테이블 (플레이어 접속 기록)
**역할:** 플레이어의 접속 및 퇴장 시간을 기록합니다.

| 컬럼명 | 데이터 타입 (Oracle) | 설명 |
| :--- | :--- | :--- |
| `ID` | `NUMBER(19)` | **(PK)** 세션 고유 ID |
| `PLAYER_ID` | `NUMBER(19)` | **(FK)** `PLAYERS` 테이블의 ID |
| `SERVER_ID` | `NUMBER(19)` | **(FK)** 접속한 `SERVERS` 테이블의 ID |
| `LOGIN_AT` | `TIMESTAMP` | 접속 시간 |
| `LOGOUT_AT` | `TIMESTAMP` | 퇴장 시간 (로그아웃 전까지 NULL) |

### 6. `PUNISHMENTS` 테이블 (처벌 기록)
**역할:** 서버에서 발생한 모든 처벌(밴, 킥 등) 이력을 관리합니다.

| 컬럼명 | 데이터 타입 (Oracle) | 설명 |
| :--- | :--- | :--- |
| `ID` | `NUMBER(19)` | **(PK)** 처벌 기록 고유 번호 |
| `SERVER_ID` | `NUMBER(19)` | **(FK)** 처벌이 발생한 `SERVERS`의 ID |
| `TARGET_PLAYER_ID`| `NUMBER(19)` | **(FK)** 처벌받은 `PLAYERS`의 ID |
| `MODERATOR_ID` | `NUMBER(19)` | **(FK)** 처벌을 내린 `USERS`의 ID |
| `PUNISHMENT_TYPE`| `VARCHAR2(20)`| 처벌 종류 (예: 'BAN', 'KICK') |
| `REASON` | `CLOB` | 처벌 사유 |
| `EXPIRES_AT`| `TIMESTAMP` | 처벌 만료 시간 (영구 처벌 시 NULL) |
| `CREATED_AT`| `TIMESTAMP` | 처벌 기록 시간 |

### 7. `COMMAND_LOGS` 테이블 (명령어 사용 기록)
**역할:** 플레이어가 사용한 명령어를 기록합니다.

| 컬럼명 | 데이터 타입 (Oracle) | 설명 |
| :--- | :--- | :--- |
| `ID` | `NUMBER(19)` | **(PK)** 로그 고유 ID |
| `PLAYER_ID` | `NUMBER(19)` | **(FK)** `PLAYERS` 테이블의 ID |
| `SERVER_ID` | `NUMBER(19)` | **(FK)** 명령어를 실행한 `SERVERS`의 ID |
| `COMMAND` | `CLOB` | 사용한 명령어 전체 내용 |
| `EXECUTED_AT`| `TIMESTAMP` | 명령어 실행 시간 |

### 8. `GAMEMODE_LOGS` 테이블 (게임모드 변경 기록)
**역할:** 게임모드 변경 이력을 추적합니다.

| 컬럼명 | 데이터 타입 (Oracle) | 설명 |
| :--- | :--- | :--- |
| `ID` | `NUMBER(19)` | **(PK)** 로그 고유 ID |
| `PLAYER_ID` | `NUMBER(19)` | **(FK)** `PLAYERS` 테이블의 ID |
| `SERVER_ID` | `NUMBER(19)` | **(FK)** 게임모드가 변경된 `SERVERS`의 ID |
| `FROM_GAMEMODE`| `VARCHAR2(20)` | 이전 게임모드 |
| `TO_GAMEMODE`| `VARCHAR2(20)` | 변경된 게임모드 |
| `CHANGED_AT`| `TIMESTAMP` | 변경 시간 |

### 9. `PERFORMANCE_LOGS` 테이블 (서버 성능 기록)
**역할:** 서버의 핵심 성능 지표인 TPS를 주기적으로 기록합니다.

| 컬럼명 | 데이터 타입 (Oracle) | 설명 |
| :--- | :--- | :--- |
| `ID` | `NUMBER(19)` | **(PK)** 성능 로그 고유 번호 |
| `SERVER_ID` | `NUMBER(19)` | **(FK)** 성능을 측정한 `SERVERS`의 ID |
| `TPS` | `NUMBER(4, 2)` | 측정된 TPS 값 (예: 19.98) |
| `MSPT` | `NUMBER(10, 2)`| Tick 당 평균 소요 시간 (ms) |
| `LOGGED_AT` | `TIMESTAMP` | 성능 기록 시간 |
