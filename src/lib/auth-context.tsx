"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "./types";
import {
  loginApi,
  registerApi,
  getMeApi,
  setStoredToken,
  clearStoredToken,
  getStoredToken,
} from "./api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (handle: string, password: string) => Promise<void>;
  register: (handle: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredToken();
    if (!stored) {
      setIsLoading(false);
      return;
    }
    getMeApi()
      .then((me) => {
        setUser(me);
        setToken(stored);
      })
      .catch(() => {
        clearStoredToken();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (handle: string, password: string) => {
    const data = await loginApi(handle, password);
    setStoredToken(data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (handle: string, password: string) => {
      const data = await registerApi(handle, password);
      setStoredToken(data.access_token);
      setToken(data.access_token);
      setUser(data.user);
    },
    []
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
