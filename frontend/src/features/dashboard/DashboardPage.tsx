import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Star,
  ChevronRight,
  HelpCircle,
  FileText,
  Menu,
  User,
  LogOut,
} from 'lucide-react';
import logoDark from '@/assets/logos/logo_dark.svg';
import { IconButton } from '@/shared/components/IconButton/IconButton';
import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner';
import { getDashboard } from '@/services/dashboardService';
import { useAuth } from '@/app/AuthContext';
import { MENSAGEM_ERRO_GENERICA } from '@/services/http';
import type { Dashboard } from '@/services/types';
import './DashboardPage.css';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);

  const carregar = useCallback(() => {
    setErro(null);
    setDashboard(null);
    getDashboard()
      .then(setDashboard)
      .catch(() => setErro(MENSAGEM_ERRO_GENERICA));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleLogout = async () => {
    setSaindo(true);
    await logout();
    navigate('/');
  };

  const nome = user?.name ?? 'aluno';
  const pontos = dashboard?.points ?? 0;
  const streak = dashboard?.streak ?? 0;
  const respondidas = dashboard?.total_answered ?? 0;
  const acertos = dashboard?.correct ?? 0;
  const erros = dashboard?.incorrect ?? 0;

  const percentual =
    respondidas > 0 ? Math.round((acertos / respondidas) * 100) : null;

  const temDados = respondidas > 0;
  const topTopic = dashboard?.best_topic ?? null;

  return (
    <div className="dash">
      <header className="dash-header">
        <div className="dash-header-inner">
          <img src={logoDark} alt="Base Matemática" className="dash-logo" />
          <div className="dash-header-actions">
            <IconButton label="Abrir perfil">
              <User size={18} />
            </IconButton>
            <div className="dash-menu">
              <IconButton
                label="Abrir menu"
                onClick={() => setMenuAberto((v) => !v)}
                aria-expanded={menuAberto}
              >
                <Menu size={18} />
              </IconButton>
              {menuAberto && (
                <div className="dash-menu-dropdown">
                  <button
                    type="button"
                    className="dash-menu-item"
                    onClick={handleLogout}
                    disabled={saindo}
                  >
                    <LogOut size={16} />
                    {saindo ? 'Saindo…' : 'Sair da conta'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="dash-main">
        {erro && <ErrorBanner message={erro} onRetry={carregar} />}

        <section className="dash-greeting">
          <h1 className="dash-greeting-title">olá, {nome}!</h1>
          <p className="dash-greeting-sub">
            Bom te ver de novo. Continue construindo sua base.
          </p>
        </section>

        <section className="dash-streak" aria-label="Sequência de dias consecutivos">
          <div className="dash-streak-left">
            <div className="dash-streak-top">
              <div className="dash-streak-icon" aria-hidden="true">
                <Flame size={37} />
              </div>
              <span className="dash-streak-label">Dias consecutivos</span>
            </div>
            <p className="dash-streak-hint">
              Continue amanhã para não perder o seu streak
            </p>
          </div>
          <div className="dash-streak-number" aria-label={`${streak} dias consecutivos de estudo`}>
            {streak}
          </div>
        </section>

        <section className="dash-points" aria-label="Pontos acumulados">
          <div className="dash-points-top">
            <div className="dash-points-icon" aria-hidden="true">
              <Star size={37} />
            </div>
            <span className="dash-points-label">Pontos acumulados</span>
          </div>
          <div className="dash-points-bottom">
            <span className="dash-points-number" aria-label={`${pontos} pontos acumulados`}>
              {pontos}
            </span>
            <p className="dash-points-hint">
              Responda questões para ganhar mais pontos.
            </p>
          </div>
        </section>

        <section className="dash-section">
          <span className="dash-section-title">Estudos</span>
          <div className="dash-shortcuts">
            <button
              type="button"
              className="dash-shortcut"
              onClick={() => navigate('/filtro')}
            >
              <div className="dash-shortcut-icon dash-shortcut-icon--blue">
                <HelpCircle size={20} />
              </div>
              <div className="dash-shortcut-text">
                <span className="dash-shortcut-title">Questões</span>
                <span className="dash-shortcut-sub">Pratique com exercícios</span>
              </div>
              <ChevronRight size={18} className="dash-shortcut-arrow" />
            </button>

            <button
              type="button"
              className="dash-shortcut"
              onClick={() => {/* materiais — tela ainda não definida */}}
            >
              <div className="dash-shortcut-icon dash-shortcut-icon--green">
                <FileText size={20} />
              </div>
              <div className="dash-shortcut-text">
                <span className="dash-shortcut-title">Materiais de estudo</span>
                <span className="dash-shortcut-sub">Leia a teoria e revise conceitos</span>
              </div>
              <ChevronRight size={18} className="dash-shortcut-arrow" />
            </button>
          </div>
        </section>

        <section className="dash-perf">
          <h2 className="dash-perf-title">Desempenho</h2>
          <div className='dash-perf-card'>
            {temDados ? (
              <>
                {/* Anel de progresso (donut) */}
                <div className="dash-donut-wrapper">
                  <div className="dash-donut">
                    <svg
                      className="dash-donut-svg"
                      viewBox="0 0 180 180"
                      role="img"
                      aria-label={`${percentual}% de acerto: ${acertos} acertos e ${erros} erros de ${respondidas} questões respondidas`}
                    >
                      {/* Trilho */}
                      <circle
                        cx="90"
                        cy="90"
                        r="70"
                        fill="none"
                        stroke="rgba(6,29,68,0.08)"
                        strokeWidth="16"
                      />
                      {/* Arco de acertos (verde) */}
                      <circle
                        cx="90"
                        cy="90"
                        r="70"
                        fill="none"
                        stroke="#26E874"
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 70 * (acertos / respondidas)} ${2 * Math.PI * 70}`}
                        strokeDashoffset="0"
                      />
                      {/* Arco de erros (vermelho) */}
                      <circle
                        cx="90"
                        cy="90"
                        r="70"
                        fill="none"
                        stroke="#F44336"
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 70 * (erros / respondidas)} ${2 * Math.PI * 70}`}
                        strokeDashoffset={`${-(2 * Math.PI * 70 * (acertos / respondidas))}`}
                      />
                    </svg>
                    <div className="dash-donut-text">
                      <span className="dash-donut-percent">{percentual}%</span>
                      <span className="dash-donut-label">DE ACERTO</span>
                    </div>
                  </div>
                </div>

                {/* Grid de estatísticas */}
                <div className="dash-perf-stats">
                  <div className="dash-perf-stat">
                    <span className="dash-perf-stat-number dash-perf-stat-number--navy">
                      {respondidas}
                    </span>
                    <span className="dash-perf-stat-label">RESPONDIDAS</span>
                  </div>
                  <div className="dash-perf-stat dash-perf-stat--middle">
                    <span className="dash-perf-stat-number dash-perf-stat-number--green">
                      {acertos}
                    </span>
                    <span className="dash-perf-stat-label">ACERTOS</span>
                  </div>
                  <div className="dash-perf-stat">
                    <span className="dash-perf-stat-number dash-perf-stat-number--red">
                      {erros}
                    </span>
                    <span className="dash-perf-stat-label">ERROS</span>
                  </div>
                </div>

                {/* Tópico com mais acertos */}
                <div className="dash-perf-topic">
                  <span className="dash-perf-topic-label">Tópico com mais acertos</span>
                  {topTopic ? (
                    <div className="dash-perf-topic-pill">
                      <span className="dash-perf-topic-name">{topTopic.name}</span>
                      <span className="dash-perf-topic-count">{topTopic.correct_count} acertos</span>
                    </div>
                  ) : (
                    <span className="dash-perf-empty">Sem dados ainda</span>
                  )}
                </div>
              </>
            ) : (
              <div className="dash-perf-empty">Sem dados ainda</div>
            )}
          </div>

        </section>
      </main>
    </div>
  );
}
