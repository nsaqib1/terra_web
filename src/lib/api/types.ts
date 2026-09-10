export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  bio?: string | null;
  points: number;
  status?: string;
  createdAt: string;
}

export interface RegisterDto {
  username: string;
  displayName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}
