// API 응답 타입 정의
export interface HealthResponse {
  connected: boolean;
  dbType: string;
  result?: any;
  error?: string;
}

export interface WingsResponse {
  status?: string;
  message?: string;
  error?: string;
}

export interface ServerInfo {
  id: string;
  name?: string;
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'unknown';
  cpu?: number;
  memory?: {
    current: number;
    limit: number;
  };
  disk?: {
    current: number;
    limit: number;
  };
  uptime?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode?: number;
}
