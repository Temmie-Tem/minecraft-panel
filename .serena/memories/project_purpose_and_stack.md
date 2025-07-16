# Minecraft Panel 프로젝트 정보

## 프로젝트 목적
- 클라우드 기반 마인크래프트 통합 관리 패널
- Oracle Cloud와 개인 서버를 연동하여 비용 부담 없이 다수의 마인크래프트 서버를 웹을 통해 관리, 모니터링, 제어
- 3-Tier 하이브리드 모델: Oracle Cloud VM(Panel), Oracle ATP(DB), 자택 서버(Wings)

## 기술 스택
**Backend**: NestJS, Node.js, TypeScript
**Frontend**: React, Vite, TypeScript  
**Database**: Oracle Cloud ATP (Always Free)
**Infrastructure**: Docker
**Auth**: Google OAuth 2.0, JWT

## 프로젝트 구조
- `/app/backend` - NestJS 백엔드 서버
- `/app/mc-panel-frontend` - React 프론트엔드
- `/app/wings` - Wings 데몬 (마인크래프트 서버 관리)
- `/app/discord-bot` - 디스코드 봇
- `/docs` - 프로젝트 문서들
