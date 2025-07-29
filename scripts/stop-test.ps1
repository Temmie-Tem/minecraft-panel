# PowerShell 테스트 종료 스크립트
Write-Host "🛑 마인크래프트 패널 테스트 환경 종료" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow

# Docker Compose 환경 정리
Write-Host "🐳 Docker Compose 환경 정리 중..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml down

# 사용하지 않는 Docker 이미지 정리 (선택사항)
Write-Host "🧹 Docker 이미지 정리 중..." -ForegroundColor Yellow
docker system prune -f

Write-Host "==================================" -ForegroundColor Green
Write-Host "✅ 테스트 환경 정리 완료!" -ForegroundColor Green
