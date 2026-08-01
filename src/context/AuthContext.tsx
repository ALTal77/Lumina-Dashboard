import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n/i18n';
import { UserRole, User } from '../types';
import { mockPatients } from '../data/mockData';

interface AuthContextType {
  role: UserRole;
  user: User;
  isAuthenticated: boolean;
  dir: 'ltr' | 'rtl';
  loginAs: (role: UserRole, customUser?: User) => void;
  logout: () => void;
  toggleRTL: () => void;
  setDir: (dir: 'ltr' | 'rtl') => void;
}

const defaultAdminUser: User = {
  id: 'admin-001',
  name: 'Chief Admin (Dr. Arthur Pendelton)',
  email: 'admin@stjudehospital.org',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  phone: '+1 (800) 555-0100',
  status: 'active',
};

const defaultDoctorUser: User = {
  id: 'doc-1',
  name: 'Dr. Robert Vance',
  email: 'robert.vance@hospital.org',
  role: 'doctor',
  avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
  phone: '+1 (555) 901-2345',
  status: 'active',
};

const defaultPatientUser: User = mockPatients[0]; // Sarah Jenkins

// Session persistence: keeps the active role/user/direction across page refreshes.
const SESSION_STORAGE_KEY = 'lumina-auth-session';

const defaultUserForRole = (role: UserRole): User => {
  if (role === 'doctor') return defaultDoctorUser;
  if (role === 'admin') return defaultAdminUser;
  return defaultPatientUser;
};

const readStoredSession = (): { role: UserRole; user: User; dir: 'ltr' | 'rtl' } | null => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { role?: UserRole; user?: User; dir?: 'ltr' | 'rtl' };
    if (
      !parsed.role ||
      !['patient', 'doctor', 'admin'].includes(parsed.role) ||
      !parsed.user?.id ||
      parsed.user.role !== parsed.role
    ) {
      return null;
    }
    return {
      role: parsed.role,
      user: parsed.user,
      dir: parsed.dir === 'rtl' ? 'rtl' : 'ltr',
    };
  } catch {
    return null;
  }
};

const storedSession = readStoredSession();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(storedSession?.role ?? 'patient');
  const [user, setUser] = useState<User>(storedSession?.user ?? defaultUserForRole(role));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [dir, setDirState] = useState<'ltr' | 'rtl'>(storedSession?.dir ?? 'ltr');

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.lang = dir === 'rtl' ? 'ar' : 'en';
  }, [dir]);

  // Keep the session in sync with state so a refresh restores the same role/user/direction.
  useEffect(() => {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ role, user, dir }));
    } catch {
      // Storage unavailable (private mode / quota) - session simply won't persist.
    }
  }, [role, user, dir]);

  const loginAs = (newRole: UserRole, customUser?: User) => {
    // TODO: connect to Express API for real JWT token validation (POST /api/auth/login)
    setRole(newRole);
    setIsAuthenticated(true);
    setUser(customUser ?? defaultUserForRole(newRole));
  };

  const logout = () => {
    // TODO: connect to Express API (POST /api/auth/logout)
    setIsAuthenticated(false);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

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

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        isAuthenticated,
        dir,
        loginAs,
        logout,
        toggleRTL,
        setDir,
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
