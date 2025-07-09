// src/App.tsx

import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute';

// 1. 앞으로 우리가 만들 페이지 컴포넌트들을 미리 import 합니다.
// (아직 파일이 없어서 빨간 줄이 표시되지만, 정상입니다.)
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ServerDetail from './pages/ServerDetail'
//import ProtectedRoute from './components/ProtectedRoute' // '경비원' 컴포넌트

function App() {
  return (
    <Routes>
      {/* --- 1. 공개 경로 (누구나 접속 가능) --- */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />


      {/* --- 2. 비공개 경로 (로그인한 사용자만 접속 가능) --- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/servers/:id"
        element={
          <ProtectedRoute>
            <ServerDetail />
          </ProtectedRoute>
        }
      />
      
      {/* TODO: 나중에 추가할 다른 페이지들 (노드 관리, 계정 설정 등) */}

    </Routes>
  )
}

export default App