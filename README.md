# ☁️ 클라우드 기반 마인크래프트 통합 관리 패널

> Oracle Cloud와 개인 서버를 연동하여, 비용 부담 없이 다수의 마인크래프트 서버를 웹을 통해 관리, 모니터링, 제어하는 개인용 관리 패널 프로젝트입니다.

---

## 🎯 1. 프로젝트 목표 (Purpose)

- **중앙 관리:** 여러 마인크래프트 서버를 단일 웹 대시보드에서 통합 관리합니다.
- **비용 효율성:** Oracle Cloud 'Always Free' 등급을 최대한 활용하여 인프라 비용 '0원'을 목표로 합니다.
- **안정성 및 분리:** 24시간 동작하는 Panel(관리 웹)은 클라우드에, 실제 게임 서버(Wings)는 자택 서버에 배치하여 역할을 분리하고 안정성을 높입니다.
- **확장성:** 디스코드 봇 등 다른 서비스와 쉽게 연동할 수 있는 구조를 지향합니다.

---

## 🏛️ 2. 아키텍처 (Architecture)

본 프로젝트는 **3-Tier 하이브리드 모델**을 기반으로 합니다.

- **`Oracle Cloud VM`**: Panel(백엔드/프론트엔드) 및 추가 서비스(디스코드 봇 등) 실행
- **`Oracle ATP`**: 중앙 데이터베이스 (관리/설치 불필요)
- **`자택 서버`**: Wings 데몬을 통해 실제 마인크래프트 서버(Docker) 실행

---

## 🛠️ 3. 기술 스택 (Tech Stack)

**Backend:**
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

**Frontend:**
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**Database:**
![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)

**Core & Infra:**
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

---

## ⚙️ 4. 시작하기 (Getting Started)

이 프로젝트를 로컬 환경에서 실행하는 방법을 설명합니다.

### 전제 조건

- Node.js v18 이상 (LTS 권장)
- npm 또는 yarn
- Docker 20+ (선택 사항, 로컬 서버용)
- Git


### 설치
```bash
# 저장소 클론
git clone <repository-url>
cd minecraft-panel

# 백엔드 의존성 설치
cd app/backend
npm install

# 프론트엔드 의존성 설치
cd ../frontend
npm install
```

### 실행 방법

#### 백엔드
1. `app/backend` 디렉터리에서 `.env` 파일을 생성해 데이터베이스 정보 등을 설정합니다.
2. 개발 모드를 실행하려면:
```bash
npm run start:dev
```

#### 프론트엔드
1. `app/frontend` 디렉터리에서 `.env` 파일을 생성하고 `VITE_API_BASE_URL` 등 필요한 값을 입력합니다.
2. 개발 서버를 실행하려면:
```bash
npm run dev
```

---

## 📚 문서

- [데이터베이스 설계](docs/DATABASE.md)
- [API 설계](docs/API.md)