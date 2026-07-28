import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { OnboardingProgress } from '../components/onboarding/OnboardingProgress';
import './OnboardingChecklistPage.css';

type Conteudo = {
  id: string;
  nome: string;
};

const CONTEUDOS: Conteudo[] = [
  { id: 'fracoes', nome: 'Frações' },
  { id: 'porcentagem', nome: 'Porcentagem' },
  { id: 'equacoes-1-grau', nome: 'Equações de 1º grau' },
  { id: 'equacoes-2-grau', nome: 'Equações de 2º grau' },
  { id: 'funcoes', nome: 'Funções' },
  { id: 'geometria-plana', nome: 'Geometria plana' },
  { id: 'trigonometria', nome: 'Trigonometria' },
  { id: 'estatistica', nome: 'Estatística' },
  { id: 'probabilidade', nome: 'Probabilidade' },
  { id: 'razao-proporcao', nome: 'Razão e proporção' },
];

export const OnboardingChecklistPage: React.FC = () => {
  const navigate = useNavigate();
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const concluir = () => {
    navigate('/dashboard');
  };

  return (
    <div className='ob-background'>
      <div className="ob-check">
        <main className="ob-check-card">
          <OnboardingProgress passo={2} />

          <section className="ob-check-intro">
            <h1 className="ob-check-title">
              Quais conteúdos gostaria de aprender?
            </h1>
            <p className="ob-check-subtitle">
              Isso nos ajuda a sugerir quais exercícios você deve fazer.
            </p>
          </section>

          <ul className="ob-check-list" role="group" aria-label="Seleção de conteúdos de interesse">
            {CONTEUDOS.map((c) => {
              const ativo = selecionados.has(c.id);
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`ob-check-item ${ativo ? 'is-selected' : ''}`}
                    onClick={() => toggle(c.id)}
                    aria-pressed={ativo}
                  >
                    <span className="ob-check-item-checkbox" aria-hidden="true">
                      {ativo && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span className="ob-check-item-nome">{c.nome}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="ob-check-actions">
            <button
              type="button"
              className="ob-check-cta"
              onClick={concluir}
            >
              continuar <ArrowRight size={18} />
            </button>
          </div>

          <div className="ob-check-secondary-actions">
            <button
              type="button"
              className="ob-check-back"
              onClick={() => navigate('/onboarding')}
            >
              <ArrowLeft size={16} /> Voltar
            </button>
            <button
              type="button"
              className="ob-check-skip"
              onClick={concluir}
            >
              pular por enquanto <ArrowRight size={14} />
            </button>
          </div>
        </main>
      </div>
    </div>
    
  );
};
