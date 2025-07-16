export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  role: string;
  createdAt: Date;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
