// src/pages/HomePage.tsx

import './HomePage.css'; // 기본 CSS 파일

function HomePage() {
  return (
    <div className="App">
      {/* 1. 헤더 영역 */}
      <header className="header">
        <h1>☁️ 사우론 비콘 (Sauron Beacon)</h1>
        <nav>
          <a href="/" className="login-button">Google로 로그인</a>
        </nav>
      </header>

      {/* 2. 히어로 영역 */}
      <section className="hero">
        <h2>당신만의 마인크래프트 서버,<br />이제 더 스마트하게 관리하세요.</h2>
        <p>비용 걱정 없는 클라우드와 강력한 자동화 기능으로 서버 운영의 수준을 높여보세요.</p>
        <a href="/login" className="cta-button">지금 시작하기</a>
      </section>

      {/* 3. 기능 소개 영역 */}
      <section className="features">
        <h3>주요 기능</h3>
        <div className="feature-list">
          <div className="feature-item">
            <h4>📊 통합 대시보드</h4>
            <p>여러 서버의 상태와 리소스를 한눈에 모니터링하세요.</p>
          </div>
          <div className="feature-item">
            <h4>🎮 원격 제어</h4>
            <p>웹 어디서든 서버를 시작, 중지하고 명령어를 전송하세요.</p>
          </div>
          <div className="feature-item">
            <h4>📈 데이터 분석</h4>
            <p>플레이어 접속 기록, 서버 성능(TPS) 등을 분석하여 서버를 최적화하세요.</p>
          </div>
        </div>
      </section>
      
      {/* 4. 푸터 영역 */}
      <footer className="footer">
        <p>&copy; 2025 [사용자님 닉네임]. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;