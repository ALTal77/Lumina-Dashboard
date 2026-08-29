import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import i18n from '../i18n/i18n';
import { UserRole, User } from '../types';
import { login as apiLogin, getMe } from '../api/auth';
import { setToken, clearToken } from '../api/client';

interface AuthContextType {
  role: UserRole;
  user: User;
  isAuthenticated: boolean;
  isRestoring: boolean;
  dir: 'ltr' | 'rtl';
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  toggleRTL: () => void;
  setDir: (dir: 'ltr' | 'rtl') => void;
  updateUser: (patch: Partial<User>) => void;
}

// Session persistence: keeps the active role/user/direction across page refreshes.
const SESSION_STORAGE_KEY = 'lumina-auth-session';
const TOKEN_STORAGE_KEY = 'lumina-auth-token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('patient');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(() => !!localStorage.getItem(TOKEN_STORAGE_KEY));
  const [dir, setDirState] = useState<'ltr' | 'rtl'>(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.dir === 'rtl' || parsed?.dir === 'ltr') return parsed.dir;
      }
    } catch {
      // ignore
    }
    return 'ltr';
  });

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.lang = dir === 'rtl' ? 'ar' : 'en';
  }, [dir]);

  // Restore session: if a token exists, validate it against /api/auth/me.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setIsRestoring(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { user: me } = await getMe();
        if (cancelled) return;
        setUser(me);
        setRole(me.role);
        setIsAuthenticated(true);
        try {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ role: me.role, user: me, dir }));
        } catch {
          // ignore
        }
      } catch {
        if (cancelled) return;
        clearToken();
        localStorage.removeItem(SESSION_STORAGE_KEY);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        if (!cancelled) setIsRestoring(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const { token, user: loggedInUser } = await apiLogin(email, password);
    setToken(token);
    setUser(loggedInUser);
    setRole(loggedInUser.role);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ role: loggedInUser.role, user: loggedInUser, dir }));
    } catch {
      // Storage unavailable - session won't persist across refresh.
    }
    return loggedInUser;
  }, [dir]);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setIsAuthenticated(false);
    setUser(null);
    setRole('patient');
  }, []);

  const toggleRTL = () => {
    setDirState((prev) => {
      const next = prev === 'ltr' ? 'rtl' : 'ltr';
      i18n.changeLanguage(next === 'rtl' ? 'ar' : 'en');
      return next;
    });
  };

  const setDir = (newDir: 'ltr' | 'rtl') => {
    setDirState(newDir);
    i18n.changeLanguage(newDir === 'rtl' ? 'ar' : 'en');
  };

  // Merge updated fields into the in-memory user so the UI reflects profile
  // changes immediately without requiring a full page reload.
  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        role,
        user: user ?? ({
          id: '',
          name: '',
          email: '',
          role,
          avatar: '',
          status: 'active',
        } as User),
        isAuthenticated,
        isRestoring,
        dir,
        login,
        logout,
        toggleRTL,
        setDir,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
