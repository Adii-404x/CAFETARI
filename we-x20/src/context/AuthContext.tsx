import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updated: User) => void;
  refreshUser: () => Promise<void>;
  switchDemoAccount: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cafeteria_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const sanitizeUser = (u: User): User => {
    if (u.email === 'student@cafeteria.edu' || u.name === 'Aarav Sharma' || (u.role === 'student' && (!u.name || u.name === 'Aarav Sharma'))) {
      return {
        ...u,
        name: 'Aditya Singh',
        studentId: 'CS2023089',
        department: 'Computer Science & Engineering',
        walletBalance: typeof u.walletBalance === 'number' ? u.walletBalance : 500
      };
    }
    return u;
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await authApi.getMe();
        if (res.success && res.data) {
          setUser(sanitizeUser(res.data));
        }
      } catch {
        // keep existing state
      }
    }
  };

  // Restore session on mount
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.data) {
            setUser(sanitizeUser(res.data));
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data) {
      const cleanUser = sanitizeUser(res.data.user);
      setUser(cleanUser);
      setToken(res.data.token);
      localStorage.setItem('cafeteria_token', res.data.token);
      return { success: true, user: cleanUser, message: res.message };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (payload: any) => {
    const res = await authApi.register(payload);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('cafeteria_token', res.data.token);
      return { success: true, user: res.data.user, message: res.message };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cafeteria_token');
  };

  const updateUser = (updated: User) => {
    setUser(updated);
  };

  const switchDemoAccount = async (role: UserRole) => {
    let email = 'student@cafeteria.edu';
    let password = 'Student@123';

    if (role === 'admin') {
      email = 'admin@cafeteria.edu';
      password = 'Admin@123';
    } else if (role === 'staff') {
      email = 'staff@cafeteria.edu';
      password = 'Staff@123';
    }

    await login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
        switchDemoAccount
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
