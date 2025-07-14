import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>접근 권한이 없습니다.</div>;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleLogout = () => {
    window.location.href = `${API_BASE_URL}/auth/logout`;
  };

  return (
    <div>
      <h1>환영합니다, {user.nickname}님!</h1>
      <p>이메일: {user.email}</p>
      <button onClick={handleLogout}>로그아웃</button>

      <h2>서버 목록</h2>
      <ul>
        {/* TODO: 실제 서버 목록을 API 호출로 불러오세요 */}
        <li><Link to="/servers/1">서버 1 상세보기</Link></li>
      </ul>
    </div>
  );
};

export default Dashboard;