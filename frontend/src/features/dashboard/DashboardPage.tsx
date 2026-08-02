import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Star,
  ChevronRight,
  HelpCircle,
  FileText,
  Menu,
  User,
} from 'lucide-react';
import logoDark from '@/assets/logos/logo_dark.svg';
import { IconButton } from '@/shared/components/IconButton/IconButton';
import './DashboardPage.css';

// Mock data — será substituído por dados reais da API
const MOCK_USER = {
  nome: 'user',
  streak: 7,
  pontos: 1240,
  questoesRespondidas: 48,
  acertos: 36,
  erros: 12,
  topTopic: 'Frações',
  topTopicAcertos: 14,
};

export function DashboardPage() {
  const navigate = useNavigate();

  const percentual =
    MOCK_USER.questoesRespondidas > 0
      ? Math.round((MOCK_USER.acertos / MOCK_USER.questoesRespondidas) * 100)
      : null;

  const temDados = MOCK_USER.questoesRespondidas > 0;

  return (
    <div className="dash">
      <header className="dash-header">
        <div className="dash-header-inner">
          <img src={logoDark} alt="Base Matemática" className="dash-logo" />
          <div className="dash-header-actions">
            <IconButton label="Abrir perfil">
              <User size={18} />
            </IconButton>
            <IconButton label="Abrir menu">
              <Menu size={18} />
            </IconButton>
          </div>
        </div>
      </header>

      <main className="dash-main">
        <section className="dash-greeting">
          <h1 className="dash-greeting-title">olá, {MOCK_USER.nome}!</h1>
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
          <div className="dash-streak-number" aria-label={`${MOCK_USER.streak} dias consecutivos de estudo`}>
            {MOCK_USER.streak}
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
            <span className="dash-points-number" aria-label={`${MOCK_USER.pontos} pontos acumulados`}>
              {MOCK_USER.pontos}
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
                      aria-label={`${percentual}% de acerto: ${MOCK_USER.acertos} acertos e ${MOCK_USER.erros} erros de ${MOCK_USER.questoesRespondidas} questões respondidas`}
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
                        strokeDasharray={`${2 * Math.PI * 70 * (MOCK_USER.acertos / MOCK_USER.questoesRespondidas)} ${2 * Math.PI * 70}`}
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
                        strokeDasharray={`${2 * Math.PI * 70 * (MOCK_USER.erros / MOCK_USER.questoesRespondidas)} ${2 * Math.PI * 70}`}
                        strokeDashoffset={`${-(2 * Math.PI * 70 * (MOCK_USER.acertos / MOCK_USER.questoesRespondidas))}`}
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
                      {MOCK_USER.questoesRespondidas}
                    </span>
                    <span className="dash-perf-stat-label">RESPONDIDAS</span>
                  </div>
                  <div className="dash-perf-stat dash-perf-stat--middle">
                    <span className="dash-perf-stat-number dash-perf-stat-number--green">
                      {MOCK_USER.acertos}
                    </span>
                    <span className="dash-perf-stat-label">ACERTOS</span>
                  </div>
                  <div className="dash-perf-stat">
                    <span className="dash-perf-stat-number dash-perf-stat-number--red">
                      {MOCK_USER.erros}
                    </span>
                    <span className="dash-perf-stat-label">ERROS</span>
                  </div>
                </div>

                {/* Tópico com mais acertos */}
                <div className="dash-perf-topic">
                  <span className="dash-perf-topic-label">Tópico com mais acertos</span>
                  {MOCK_USER.acertos > 0 ? (
                    <div className="dash-perf-topic-pill">
                      <span className="dash-perf-topic-name">{MOCK_USER.topTopic}</span>
                      <span className="dash-perf-topic-count">{MOCK_USER.topTopicAcertos} acertos</span>
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
