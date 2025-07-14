// src/pages/LoginPage.tsx

import './LoginPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LoginPage = () => {
  // 백엔드 주소를 환경변수에서 가져와 로그인 엔드포인트로 이동
  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-logo">
          ☁️
        </div>
        <h2>사우론 비콘 (Sauron Beacon)</h2>
        <p>서비스를 이용하려면 구글 계정으로 로그인해주세요.</p>
        <button className="google-login-button" onClick={handleLogin}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google logo" />
          Google로 로그인
        </button>
      </div>
    </div>
  );
};

export default LoginPage;