import { Navigate } from 'react-router-dom';

// 이 컴포넌트의 역할은 '로그인 상태'를 확인하고,
// 로그인하지 않았다면 로그인 페이지로 쫓아내는 것입니다.
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // TODO: 나중에 Zustand를 이용해 실제 로그인 상태를 가져와야 합니다.
  // 지금은 테스트를 위해 임시로 '로그인 안 됨' 상태로 가정합니다.
  const isAuthenticated = false; 

  if (!isAuthenticated) {
    // 로그인이 안되어 있다면, /login 페이지로 강제 이동시킵니다.
    return <Navigate to="/login" replace />;
  }

  // 로그인이 되어 있다면, 자식 컴포넌트(예: Dashboard)를 그대로 보여줍니다.
  return <>{children}</>;
};

export default ProtectedRoute;