// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. react-router-dom에서 BrowserRouter를 가져옵니다.
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. App 컴포넌트 전체를 BrowserRouter로 감싸줍니다. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);