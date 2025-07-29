#!/bin/bash

echo "🚀 마인크래프트 패널 통합 테스트 시작"
echo "=================================="

# 1. 의존성 설치 확인
echo "📦 의존성 설치 확인 중..."
npm run bootstrap

# 2. 개발 환경 Docker Compose 실행
echo "🐳 Docker Compose 개발 환경 시작..."
docker-compose -f docker-compose.dev.yml up --build -d

# 3. 서비스 상태 확인
echo "⏳ 서비스 시작 대기 중 (30초)..."
sleep 30

echo "🔍 서비스 상태 확인 중..."
echo "Backend API 확인..."
curl -s http://localhost:3001/health || echo "❌ Backend 응답 없음"

echo "Wings API 확인..."
curl -s http://localhost:8080/health || echo "❌ Wings 응답 없음"

echo "Frontend 확인..."
curl -s http://localhost:5173 | grep -q "title" && echo "✅ Frontend 응답 정상" || echo "❌ Frontend 응답 없음"

# 4. 로그 확인
echo "📋 서비스 로그 확인..."
docker-compose -f docker-compose.dev.yml logs --tail=10

echo "=================================="
echo "✅ 테스트 환경 준비 완료!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3001"
echo "⚙️ Wings API: http://localhost:8080"
echo ""
echo "💡 테스트 종료: ./scripts/stop-test.sh"
