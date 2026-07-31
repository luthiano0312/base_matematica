import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import './QuestaoPage.css';

type Alternativa = {
  letra: string;
  texto: string;
};

type QuestaoDados = {
  id: number;
  posicao: number;
  total: number;
  streak: number;
  respondidas: number;
  acertos: number;
  erros: number;
  enunciado: string;
  alternativas: Alternativa[];
};

const MOCK_QUESTAO: QuestaoDados = {
  id: 1,
  posicao: 1,
  total: 6,
  streak: 3,
  respondidas: 5,
  acertos: 4,
  erros: 1,
  enunciado:
    'Um professor escreveu uma progressão aritmética crescente de 8 termos começando pelo número 3 e composta apenas de números naturais. Ele notou que o segundo, o quarto e o oitavo termos formavam, nessa ordem, uma progressão geométrica. A soma dos termos dessa progressão geométrica era igual a',
  alternativas: [
    { letra: 'A', texto: '42' },
    { letra: 'B', texto: '36' },
    { letra: 'C', texto: '18' },
    { letra: 'D', texto: '9' },
  ],
};

export const QuestaoPage: React.FC = () => {
  const [alternativaSelecionada, setAlternativaSelecionada] = useState<string | null>(null);

  const q = MOCK_QUESTAO;
  const progressoPercent = (q.posicao / q.total) * 100;
  const podeResponder = alternativaSelecionada !== null;

  return (
    <div className="questao-page">
      {/* ─── Bloco 1: Topbar ─── */}
      <header className="q-topbar">
        <div className="q-topbar-row">
          <span className="q-topbar-title">
            Questão {q.posicao} de {q.total}
          </span>
          <span className="q-streak-chip">
            <Flame size={14} className="q-streak-icon" aria-hidden="true" />
            {q.streak} dias
          </span>
        </div>

        {/* Barra de progresso */}
        <div className="q-progress-track" role="progressbar" aria-valuenow={q.posicao} aria-valuemin={1} aria-valuemax={q.total}>
          <div className="q-progress-fill" style={{ width: `${progressoPercent}%` }} />
        </div>

        {/* Cards de estatísticas */}
        <div className="q-stats">
          <div className="q-stat q-stat--respondidas">
            <span className="q-stat-number">{q.respondidas}</span>
            <span className="q-stat-label">respondidas</span>
          </div>
          <div className="q-stat q-stat--acertos">
            <span className="q-stat-number">{q.acertos}</span>
            <span className="q-stat-label">acertos</span>
          </div>
          <div className="q-stat q-stat--erros">
            <span className="q-stat-number">{q.erros}</span>
            <span className="q-stat-label">erros</span>
          </div>
        </div>
      </header>

      {/* ─── Bloco 2: Enunciado ─── */}
      <section className="q-enunciado-block">
        <div className="q-enunciado-decor" aria-hidden="true">∑</div>
        <p className="q-enunciado-texto">{q.enunciado}</p>
      </section>

      {/* ─── Bloco 3: Alternativas + Botão ─── */}
      <section className="q-alternativas-block">
        <div className="q-alternativas-lista">
          {q.alternativas.map((alt) => {
            const selecionada = alternativaSelecionada === alt.letra;
            return (
              <button
                key={alt.letra}
                type="button"
                className={`q-alt-card ${selecionada ? 'q-alt-card--selected' : ''}`}
                onClick={() => setAlternativaSelecionada(alt.letra)}
                aria-pressed={selecionada}
              >
                <span className={`q-alt-selo ${selecionada ? 'q-alt-selo--selected' : ''}`}>
                  {alt.letra}
                </span>
                <span className="q-alt-texto">{alt.texto}</span>
                <span className={`q-alt-indicator ${selecionada ? 'q-alt-indicator--selected' : ''}`}>
                  {selecionada && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={`q-responder-btn ${!podeResponder ? 'q-responder-btn--disabled' : ''}`}
          disabled={!podeResponder}
          onClick={() => {/* lógica de envio */}}
        >
          Responder
        </button>
      </section>
    </div>
  );
};
