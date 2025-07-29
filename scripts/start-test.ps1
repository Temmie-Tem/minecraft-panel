# PowerShell 테스트 시작 스크립트
Write-Host "🚀 마인크래프트 패널 통합 테스트 시작" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# 1. 의존성 설치 확인
Write-Host "📦 의존성 설치 확인 중..." -ForegroundColor Yellow
npm run bootstrap

# 2. 개발 환경 Docker Compose 실행
Write-Host "🐳 Docker Compose 개발 환경 시작..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up --build -d

# 3. 서비스 상태 확인
Write-Host "⏳ 서비스 시작 대기 중 (30초)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "🔍 서비스 상태 확인 중..." -ForegroundColor Yellow

# Backend 확인
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 5
    Write-Host "✅ Backend API 응답 정상" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend API 응답 없음" -ForegroundColor Red
}

# Wings 확인
try {
    $wingsResponse = Invoke-WebRequest -Uri "http://localhost:8080/health" -TimeoutSec 5
    Write-Host "✅ Wings API 응답 정상" -ForegroundColor Green
} catch {
    Write-Host "❌ Wings API 응답 없음" -ForegroundColor Red
}

# Frontend 확인
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5
    if ($frontendResponse.Content -match "title") {
        Write-Host "✅ Frontend 응답 정상" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend 응답 이상" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Frontend 응답 없음" -ForegroundColor Red
}

# 4. 로그 확인
Write-Host "📋 서비스 로그 확인..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml logs --tail=10

Write-Host "==================================" -ForegroundColor Green
Write-Host "✅ 테스트 환경 준비 완료!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "⚙️ Wings API: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 테스트 종료: .\scripts\stop-test.ps1" -ForegroundColor Yellow
