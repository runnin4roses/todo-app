import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ApiError, api, setUnauthorizedHandler } from '../api/client';

interface AuthState {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
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
  const [isInitializing, setIsInitializing] = useState(
    () => localStorage.getItem(TOKEN_KEY) !== null
  );

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setToken(null);
    setEmail(null);
  }, []);

  const persistAuth = useCallback((nextToken: string, nextEmail: string) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(EMAIL_KEY, nextEmail);
    setToken(nextToken);
    setEmail(nextEmail);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      return;
    }

    const sessionToken = storedToken;
    let cancelled = false;

    async function validateStoredSession() {
      try {
        const user = await api.me(sessionToken);
        if (cancelled) {
          return;
        }

        if (user.email) {
          localStorage.setItem(EMAIL_KEY, user.email);
          setEmail(user.email);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        if (err instanceof ApiError && err.status === 401) {
          clearAuth();
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    }

    void validateStoredSession();

    return () => {
      cancelled = true;
    };
  }, [clearAuth]);

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

  const value = useMemo(
    () => ({
      token,
      email,
      isAuthenticated: Boolean(token),
      isInitializing,
      login,
      register,
      logout,
    }),
    [token, email, isInitializing, login, register, logout]
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
