import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import * as authService from '@/services/authService';
import { setAuthToken } from '@/services/http';
import type { User } from '@/services/types';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  login: (data: { email: string; password: string }) => Promise<User>;
  register: (data: authService.RegisterData) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    if (!localStorage.getItem('bm_token')) {
      setStatus('anonymous');
      return;
    }

    authService
      .getMe()
      .then((me) => {
        setUser(me);
        setStatus('authenticated');
      })
      .catch(() => {
        setAuthToken(null);
        setUser(null);
        setStatus('anonymous');
      });
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const { user: loggedUser } = await authService.login(data);
    setUser(loggedUser);
    setStatus('authenticated');
    return loggedUser;
  };

  const register = async (data: authService.RegisterData) => {
    const { user: registeredUser } = await authService.register(data);
    setUser(registeredUser);
    setStatus('authenticated');
    return registeredUser;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setStatus('anonymous');
    }
  };

  return (
    <AuthContext.Provider value={{ status, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  }
  return context;
}
