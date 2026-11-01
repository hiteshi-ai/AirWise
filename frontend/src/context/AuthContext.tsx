import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isSuperAdminConfigured: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  checkSuperAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isSuperAdminConfigured: true,
  login: () => {},
  logout: () => {},
  checkSuperAdminStatus: async () => true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('airwise_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('airwise_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isSuperAdminConfigured, setIsSuperAdminConfigured] = useState<boolean>(true);

  const checkSuperAdminStatus = async () => {
    try {
      const res = await api.getSetupStatus();
      setIsSuperAdminConfigured(res.superAdminConfigured);
      return res.superAdminConfigured;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    checkSuperAdminStatus();
  }, []);

  const login = (jwtToken: string, userData: User) => {
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('airwise_token', jwtToken);
    localStorage.setItem('airwise_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('airwise_token');
    localStorage.removeItem('airwise_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isSuperAdminConfigured,
        login,
        logout,
        checkSuperAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

