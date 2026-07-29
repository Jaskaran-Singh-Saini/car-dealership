import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import * as api from '../api/vehicles';
import type { AuthUser, LoginPayload, RegisterPayload } from '../api/types';

interface AuthContextValue {
  user: AuthUser | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  function persistSession(tokens: { access: string; refresh: string }, authUser: AuthUser) {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('auth_user', JSON.stringify(authUser));
    setUser(authUser);
  }

  async function login(payload: LoginPayload) {
    const { tokens, user: authUser } = await api.login(payload);
    persistSession(tokens, authUser);
  }

  async function register(payload: RegisterPayload) {
    const { tokens, user: authUser } = await api.register(payload);
    persistSession(tokens, authUser);
  }

  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  }

  const value: AuthContextValue = {
    user,
    isAdmin: user?.role === 'ADMIN',
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}