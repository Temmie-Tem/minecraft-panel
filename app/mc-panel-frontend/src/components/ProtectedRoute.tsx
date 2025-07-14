import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// 이 컴포넌트의 역할은 '로그인 상태'를 확인하고,
// 로그인하지 않았다면 로그인 페이지로 쫓아내는 것입니다.
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;