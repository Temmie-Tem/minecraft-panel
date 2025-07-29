#!/bin/bash

echo "🛑 마인크래프트 패널 테스트 환경 종료"
echo "=================================="

# Docker Compose 환경 정리
echo "🐳 Docker Compose 환경 정리 중..."
docker-compose -f docker-compose.dev.yml down

# 사용하지 않는 Docker 이미지 정리 (선택사항)
echo "🧹 Docker 이미지 정리 중..."
docker system prune -f

echo "=================================="
echo "✅ 테스트 환경 정리 완료!"
