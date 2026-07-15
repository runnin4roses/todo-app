import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../api/client';

interface AuthState {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = 'todo_app_token';
const EMAIL_KEY = 'todo_app_email';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );
  const [email, setEmail] = useState<string | null>(
    () => localStorage.getItem(EMAIL_KEY)
  );

  const persistAuth = useCallback((nextToken: string, nextEmail: string) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(EMAIL_KEY, nextEmail);
    setToken(nextToken);
    setEmail(nextEmail);
  }, []);

  const login = useCallback(
    async (userEmail: string, password: string) => {
      const response = await api.login(userEmail, password);
      persistAuth(response.token, response.email);
    },
    [persistAuth]
  );

  const register = useCallback(
    async (userEmail: string, password: string) => {
      const response = await api.register(userEmail, password);
      persistAuth(response.token, response.email);
    },
    [persistAuth]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setToken(null);
    setEmail(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      email,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, email, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
