import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'admin' | 'assistant';

export interface User {
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isPinVerified: boolean;
  login: (email: string, password: string) => boolean;
  verifyPin: (pin: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const MOCK_USERS: Record<string, { password: string; pin: string; user: User }> = {
  'admin@okfarm.com': {
    password: 'admin123',
    pin: '1234',
    user: { email: 'admin@okfarm.com', name: 'Adekunle Ogundimu', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminOK' },
  },
  'assistant@okfarm.com': {
    password: 'assist123',
    pin: '5678',
    user: { email: 'assistant@okfarm.com', name: 'Ngozi Okafor', role: 'assistant', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AssistOK' },
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('okfarm_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isPinVerified, setIsPinVerified] = useState(() => localStorage.getItem('okfarm_pin') === 'true');

  const login = useCallback((email: string, password: string) => {
    const entry = MOCK_USERS[email];
    if (entry && entry.password === password) {
      setUser(entry.user);
      localStorage.setItem('okfarm_user', JSON.stringify(entry.user));
      setIsPinVerified(false);
      localStorage.removeItem('okfarm_pin');
      return true;
    }
    return false;
  }, []);

  const verifyPin = useCallback((pin: string) => {
    if (!user) return false;
    const entry = MOCK_USERS[user.email];
    if (entry && entry.pin === pin) {
      setIsPinVerified(true);
      localStorage.setItem('okfarm_pin', 'true');
      return true;
    }
    return false;
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    setIsPinVerified(false);
    localStorage.removeItem('okfarm_user');
    localStorage.removeItem('okfarm_pin');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isPinVerified, login, verifyPin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
