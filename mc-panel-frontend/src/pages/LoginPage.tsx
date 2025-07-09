// src/pages/LoginPage.tsx

import './LoginPage.css';

const LoginPage = () => {
  // 나중에 이 함수는 백엔드의 '/api/auth/google' 주소로 이동시킵니다.
  const handleLogin = () => {
    window.location.href = 'http://[백엔드_서버_주소]/api/auth/google';
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