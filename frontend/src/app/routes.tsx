import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useAdminAuth } from './AdminAuthContext';
import './routes.css';

export function AuthLoading() {
  return (
    <div className="auth-loading" role="status">
      <span className="auth-loading-spinner" aria-hidden="true" />
      <span className="auth-loading-text">Carregando…</span>
    </div>
  );
}

/** Rotas que exigem sessão autenticada; sem sessão, redireciona para o login. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  if (status === 'loading') return <AuthLoading />;
  if (status === 'anonymous') return <Navigate to="/login" replace />;

  return children;
}

/**
 * Proteção do Onboarding (RN19):
 * - sem sessão ativa → Home;
 * - sessão ativa que já completou o onboarding → Dashboard;
 * - sessão ativa sem onboarding concluído → acesso liberado.
 */
export function OnboardingRoute({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();

  if (status === 'loading') return <AuthLoading />;
  if (status === 'anonymous') return <Navigate to="/" replace />;
  if (user?.onboarding_completed_at) return <Navigate to="/dashboard" replace />;

  return children;
}

/**
 * RN20 — rotas do painel administrativo: exigem sessão de admin
 * (guard próprio, isolado da sessão do aluno).
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { status } = useAdminAuth();

  if (status === 'loading') return <AuthLoading />;
  if (status === 'anonymous') return <Navigate to="/admin/login" replace />;

  return children;
}
