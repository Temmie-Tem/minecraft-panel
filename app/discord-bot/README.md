# 디스코드 봇

Node.js와 TypeScript를 사용한 간단한 디스코드 봇입니다.

## 설정

1. `.env` 파일 복사 및 토큰 설정:
   ```powershell
   cp .env .env.local
   # .env.local 파일을 열어 YOUR_DISCORD_BOT_TOKEN을 실제 토큰으로 교체하세요
   ```
2. 의존성 설치:
   ```powershell
   npm install
   ```

## 스크립트

- `npm run dev` - 자동 재시작 개발 모드로 봇 실행
- `npm start` - ts-node로 봇 실행
- `npm run build` - TypeScript를 JavaScript로 컴파일

## 사용법

1. 봇 토큰으로 서버에 봇을 초대하세요.
2. 봇 실행:
   ```powershell
   npm run dev
   ```
3. 채널에 `!ping`을 입력하면 봇이 `Pong!`으로 응답합니다.
