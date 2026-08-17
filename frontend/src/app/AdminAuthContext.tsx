import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import * as adminService from '@/services/adminService';
import { hasAdminToken, setAdminAuthToken } from '@/services/adminHttp';
import type { Admin } from '@/services/types';

type AdminAuthStatus = 'loading' | 'authenticated' | 'anonymous';

type AdminAuthContextValue = {
  status: AdminAuthStatus;
  admin: Admin | null;
  login: (data: { email: string; password: string }) => Promise<Admin>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

/** RN20 — sessão de admin separada da sessão do aluno. */
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [status, setStatus] = useState<AdminAuthStatus>('loading');

  useEffect(() => {
    if (!hasAdminToken()) {
      setStatus('anonymous');
      return;
    }

    adminService
      .getMe()
      .then((me) => {
        setAdmin(me);
        setStatus('authenticated');
      })
      .catch(() => {
        setAdminAuthToken(null);
        setAdmin(null);
        setStatus('anonymous');
      });
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const { admin: loggedAdmin } = await adminService.login(data);
    setAdmin(loggedAdmin);
    setStatus('authenticated');
    return loggedAdmin;
  };

  const logout = async () => {
    try {
      await adminService.logout();
    } finally {
      setAdmin(null);
      setStatus('anonymous');
    }
  };

  return (
    <AdminAuthContext.Provider value={{ status, admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth deve ser usado dentro de <AdminAuthProvider>.');
  }
  return context;
}
