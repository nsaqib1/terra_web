"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "@/lib/api/auth";
import { tokenStorage } from "@/lib/api/token";
import { LoginDto, RegisterDto, User } from "@/lib/api/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (dto: RegisterDto) => Promise<User>;
  login: (dto: LoginDto) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = useCallback(async (): Promise<User | null> => {
    try {
      const existingToken = tokenStorage.getAccessToken();

      if (existingToken) {
        try {
          const response = await authApi.getMe();
          setUser(response.user);
          return response.user;
        } catch {
          // Access token might be expired, proceed to refresh attempt
        }
      }

      // Try silent refresh using httpOnly cookie
      try {
        const refreshRes = await authApi.refresh();
        if (refreshRes.accessToken) {
          tokenStorage.setAccessToken(refreshRes.accessToken);
          setUser(refreshRes.user);
          return refreshRes.user;
        }
      } catch {
        // No valid session cookie found
        tokenStorage.clear();
        setUser(null);
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const signup = useCallback(async (dto: RegisterDto): Promise<User> => {
    const res = await authApi.register(dto);
    tokenStorage.setAccessToken(res.accessToken);
    setUser(res.user);
    return res.user;
  }, []);

  const login = useCallback(async (dto: LoginDto): Promise<User> => {
    const res = await authApi.login(dto);
    tokenStorage.setAccessToken(res.accessToken);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      signup,
      login,
      logout,
      checkAuth,
      setUser,
    }),
    [user, isLoading, signup, login, logout, checkAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
