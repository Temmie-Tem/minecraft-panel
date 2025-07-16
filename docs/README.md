# 📚 Documentation Guide

Minecraft Panel 프로젝트의 문서 가이드입니다.

## 📂 문서 구조

```
docs/
├── api/                    # API 관련 문서
├── infrastructure/         # 인프라 & 시스템 문서
├── development/           # 개발 프로세스 문서
├── features/             # 기능별 상세 문서
├── reviews/              # 검토 및 개선사항
└── README.md            # 이 파일
```

## 🔗 빠른 링크

### 📡 API 문서
- **[API.md](./api/API.md)** - 전체 API 명세서
- **[WINGS_API.md](./api/WINGS_API.md)** - Wings API 상세 문서

### 🏗️ 인프라 문서
- **[hardware-infrastructure.md](./infrastructure/hardware-infrastructure.md)** - 하드웨어 및 인프라 구성
- **[DATABASE.md](./infrastructure/DATABASE.md)** - 데이터베이스 설정 및 구조
- **[Oracle-Setup.md](./infrastructure/Oracle-Setup.md)** - Oracle DB 설정 가이드
- **[SYSTEM_HEALTH_CHECK.md](./infrastructure/SYSTEM_HEALTH_CHECK.md)** - 시스템 상태 점검
- **[PORT_MANAGEMENT.md](./infrastructure/PORT_MANAGEMENT.md)** - 포트 관리 및 충돌 방지 가이드

### 🛠️ 개발 문서
- **[DEVELOPMENT_PROCESS.md](./development/DEVELOPMENT_PROCESS.md)** - 개발 프로세스 및 워크플로우
- **[TROUBLESHOOTING.md](./development/TROUBLESHOOTING.md)** - 문제 해결 가이드

### 🎯 기능별 문서
#### Wings 연동
- **[wings-integration-complete.md](./features/wings/wings-integration-complete.md)** - Wings 연동 완료 문서
- **[wings-improvements-applied.md](./features/wings/wings-improvements-applied.md)** - 개선사항 적용 내역
- **[wings-integration-review.md](./features/wings/wings-integration-review.md)** - 초기 검토 보고서

### 📝 검토 문서
- **[claued_gemime.md](./reviews/claued_gemime.md)** - 코드 리뷰 및 개선사항

## 🚀 시작하기

### 새로운 기여자라면?
1. **[DEVELOPMENT_PROCESS.md](./development/DEVELOPMENT_PROCESS.md)** - 개발 프로세스 이해
2. **[API.md](./api/API.md)** - API 구조 파악
3. **[hardware-infrastructure.md](./infrastructure/hardware-infrastructure.md)** - 시스템 아키텍처 이해

### 문제가 발생했다면?
1. **[TROUBLESHOOTING.md](./development/TROUBLESHOOTING.md)** - 일반적인 문제 해결
2. **[SYSTEM_HEALTH_CHECK.md](./infrastructure/SYSTEM_HEALTH_CHECK.md)** - 시스템 진단

### API를 사용하고 싶다면?
1. **[API.md](./api/API.md)** - 전체 API 개요
2. **[WINGS_API.md](./api/WINGS_API.md)** - Wings 전용 API

## 📋 문서 작성 가이드

### 파일명 규칙
- **영문 소문자 + 하이픈 사용**: `feature-name.md`
- **한글 파일명 금지**: 호환성 문제 방지
- **의미있는 이름 사용**: 내용을 쉽게 파악할 수 있도록

### 디렉토리별 용도
| 디렉토리 | 용도 | 예시 |
|----------|------|------|
| `api/` | API 명세, 엔드포인트 문서 | API.md, endpoints.md |
| `infrastructure/` | 시스템, DB, 하드웨어 설정 | database.md, server-setup.md |
| `development/` | 개발 프로세스, 디버깅 | coding-standards.md, testing.md |
| `features/` | 각 기능별 상세 구현 | auth/, wings/, dashboard/ |
| `reviews/` | 코드 리뷰, 개선사항 검토 | code-review-2024-01.md |

### 문서 템플릿
새로운 문서 작성 시 다음 구조를 권장합니다:

```markdown
# 문서 제목

작성일: YYYY-MM-DD
작성자: 이름
버전: 1.0

## 개요
간단한 설명

## 상세 내용
...

## 관련 문서
- [관련 문서 링크](./path/to/doc.md)
```

## 🔄 업데이트 이력

| 날짜 | 변경사항 | 작성자 |
|------|----------|--------|
| 2025-01-16 | 문서 구조 재정리 및 README 생성 | Claude Code |
| 2025-01-16 | Wings 연동 문서 완료 | Claude Code |

---

**📞 문의사항이 있으시면 개발팀에 연락해 주세요.**