import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, me as apiMe, register as apiRegister, type User } from "@/api/auth";
import { setAccessToken } from "@/api/client";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; full_name?: string; phone?: string; role: User["role"] }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

const ACCESS_KEY = "medivault.accessToken";
const REFRESH_KEY = "medivault.refreshToken";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(localStorage.getItem(ACCESS_KEY));
  const [refreshToken, setRefreshTokenState] = useState<string | null>(localStorage.getItem(REFRESH_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    const boot = async () => {
      try {
        if (!accessToken) return;
        const res = await apiMe();
        setUser(res.user);
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    // If there's no token on first load, we still need to end the loading state.
    if (!accessToken) setLoading(false);
  }, [accessToken]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      accessToken,
      refreshToken,
      loading,
      login: async (email, password) => {
        const res = await apiLogin({ email, password });
        setUser(res.user);
        setAccessTokenState(res.access_token);
        setRefreshTokenState(res.refresh_token);
        localStorage.setItem(ACCESS_KEY, res.access_token);
        localStorage.setItem(REFRESH_KEY, res.refresh_token);
      },
      register: async (payload) => {
        const res = await apiRegister(payload);
        setUser(res.user);
        setAccessTokenState(res.access_token);
        setRefreshTokenState(res.refresh_token);
        localStorage.setItem(ACCESS_KEY, res.access_token);
        localStorage.setItem(REFRESH_KEY, res.refresh_token);
      },
      logout: () => {
        setUser(null);
        setAccessTokenState(null);
        setRefreshTokenState(null);
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        setAccessToken(null);
      },
    }),
    [user, accessToken, refreshToken, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

