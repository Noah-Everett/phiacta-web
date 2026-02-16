"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Agent } from "./types";
import {
  loginApi,
  registerApi,
  getMeApi,
  setStoredToken,
  clearStoredToken,
  getStoredToken,
} from "./api";

interface AuthContextValue {
  agent: Agent | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<Agent | null>(null);
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
        setAgent(me);
        setToken(stored);
      })
      .catch(() => {
        clearStoredToken();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginApi(email, password);
    setStoredToken(data.access_token);
    setToken(data.access_token);
    setAgent(data.agent);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await registerApi(name, email, password);
      setStoredToken(data.access_token);
      setToken(data.access_token);
      setAgent(data.agent);
    },
    []
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setAgent(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ agent, token, isLoading, login, register, logout }}
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
