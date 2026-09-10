import { apiClient } from "./client";
import { AuthResponse, LoginDto, RegisterDto, User } from "./types";

export const authApi = {
  /**
   * Register a new user account
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/register", data, { skipAuth: true });
  },

  /**
   * Log into an existing account
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/login", data, { skipAuth: true });
  },

  /**
   * Refresh session using the httpOnly refresh_token cookie
   */
  async refresh(): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/refresh", {}, { skipAuth: true });
  },

  /**
   * Log out and revoke refresh session
   */
  async logout(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/logout");
  },

  /**
   * Get the current authenticated user's profile
   */
  async getMe(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>("/auth/me");
  },
};
