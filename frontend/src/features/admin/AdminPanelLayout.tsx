import type { ReactNode } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, Folder, LogOut } from 'lucide-react';
import { useAdminAuth } from '@/app/AdminAuthContext';
import logoLight from '@/assets/logos/logo_light.svg';
import { cx } from '@/shared/utils/cx';
import './AdminPanelLayout.css';

type NavItem = {
  to: string;
  label: string;
  icon: ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { to: '/admin/visao-geral', label: 'Visão geral', icon: <LayoutDashboard size={18} aria-hidden="true" /> },
  { to: '/admin/questoes', label: 'Questões', icon: <FileText size={18} aria-hidden="true" /> },
  { to: '/admin/conteudos', label: 'Conteúdos e tópicos', icon: <Folder size={18} aria-hidden="true" /> },
];

function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Casca do painel administrativo (Spec_Admin_Design_Tokens_e_Sidebar#5):
 * sidebar fixa 220px sobre azul escuro + área de conteúdo lavanda.
 * RN20 — o bloco de usuário deixa explícita a sessão de admin.
 */
export function AdminPanelLayout() {
  const { admin, logout } = useAdminAuth();

  return (
    <div className="admin-panel">
      <aside className="admin-panel-sidebar">
        <Link to="/admin/visao-geral" className="admin-panel-logo" aria-label="Painel administrativo">
          <img src={logoLight} alt="" className="admin-panel-logo-img" />
          {/* Ícone exibido apenas na sidebar colapsada (tablet, 72px). */}
          <svg className="admin-panel-logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="admin-panel-pyr" x1="0" y1="40" x2="40" y2="0">
                <stop offset="0" stopColor="#26E874" />
                <stop offset="0.5" stopColor="#258BFC" />
                <stop offset="1" stopColor="#DE4EE1" />
              </linearGradient>
            </defs>
            <path d="M20 4 L36 34 H4 Z" fill="url(#admin-panel-pyr)" />
          </svg>
        </Link>

        <nav className="admin-panel-nav" aria-label="Navegação do painel administrativo">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) => cx('admin-panel-nav-item', isActive && 'is-active')}
            >
              {item.icon}
              <span className="admin-panel-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-panel-user">
          <div className="admin-panel-user-meta">
            <div className="admin-panel-avatar" aria-hidden="true">
              {admin ? iniciais(admin.name) : '—'}
            </div>
            <span className="admin-panel-user-name">{admin?.name ?? '—'}</span>
            <button
              type="button"
              className="admin-panel-logout"
              onClick={() => void logout()}
            >
              <LogOut size={13} aria-hidden="true" />
              <span className="admin-panel-nav-label">Sair</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-panel-content">
        <Outlet />
      </main>
    </div>
  );
}
