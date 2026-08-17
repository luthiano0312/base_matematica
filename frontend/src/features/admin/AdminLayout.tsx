import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAdminAuth } from '@/app/AdminAuthContext';
import { cx } from '@/shared/utils/cx';
import './AdminLayout.css';

type AdminLayoutProps = {
  /** Itens do breadcrumb; o último (página atual) pode vir em <strong>. */
  breadcrumb: ReactNode;
  children: ReactNode;
};

function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Casca do painel administrativo: topbar lavender sticky com logo "· admin",
 * identificação do produtor de conteúdo e breadcrumb sobre o fundo azul-escuro
 * (Spec_Cadastro_Questoes.md — Cabeçalho/Breadcrumb).
 */
export function AdminLayout({ breadcrumb, children }: AdminLayoutProps) {
  const { admin, logout } = useAdminAuth();

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <Link to="/admin/questoes/nova" className="admin-logo" aria-label="Painel administrativo">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="admin-pyr" x1="0" y1="40" x2="40" y2="0">
                <stop offset="0" stopColor="#26E874" />
                <stop offset="0.5" stopColor="#258BFC" />
                <stop offset="1" stopColor="#DE4EE1" />
              </linearGradient>
            </defs>
            <path d="M20 4 L36 34 H4 Z" fill="url(#admin-pyr)" />
          </svg>
          <span>base matemática · admin</span>
        </Link>

        <div className="admin-tag">
          <div className="admin-tag-meta">
            <strong>{admin?.name ?? '—'}</strong>
            <span>Produtor(a) de conteúdo</span>
          </div>
          <div className={cx('admin-avatar')} aria-hidden="true">
            {admin ? iniciais(admin.name) : '—'}
          </div>
          <button
            type="button"
            className="admin-logout"
            onClick={() => void logout()}
            title="Sair do painel"
            aria-label="Sair do painel"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="admin-container">
        <nav className="admin-breadcrumb" aria-label="Você está aqui">{breadcrumb}</nav>
        {children}
      </div>
    </div>
  );
}
