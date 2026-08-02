import { useNavigate } from 'react-router-dom';
import { ArrowRight, PenLine, TrendingUp } from 'lucide-react';

import { OnboardingProgress } from './components/OnboardingProgress';
import './OnboardingWelcomePage.css';

const exemplos: { rotulo: string; simbolo: string }[] = [
  { rotulo: 'Frações', simbolo: '½' },
  { rotulo: 'Porcentagem', simbolo: '%' },
  { rotulo: 'Probabilidade', simbolo: 'P' },
  { rotulo: 'Trigonometria', simbolo: 'sin' },
];

export function OnboardingWelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="ob-background">
      <div className="ob-welcome">
        <main className="ob-welcome-card">
          <OnboardingProgress passo={1} />
          <section className="ob-welcome-intro">
            <h1 className="ob-welcome-title">
              Bem-vindo ao <span className="ob-welcome-title-math">Base&nbsp;Matemática</span>!
            </h1>
            <p className="ob-welcome-lead">
              Aqui você aprende resolvendo. Cada exercício vem com correção imediata e
              explicação passo a passo, e seu progresso vira um caminho que você pode
              acompanhar do primeiro problema, até o conteúdo que ainda está por vir.
            </p>
          </section>

          <div className="ob-welcome-features">
            <article className="ob-feature">
              <span className="ob-feature-icon" aria-hidden="true">
                <PenLine size={22} strokeWidth={2.2} />
              </span>
              <div className="ob-feature-body">
                <h2 className="ob-feature-title">Exercícios</h2>
                <p className="ob-feature-desc">
                  Prática guiada com correção imediata e explicações.
                </p>
              </div>
            </article>

            <article className="ob-feature">
              <span className="ob-feature-icon" aria-hidden="true">
                <TrendingUp size={22} strokeWidth={2.2} />
              </span>
              <div className="ob-feature-body">
                <h2 className="ob-feature-title">Progresso</h2>
                <p className="ob-feature-desc">
                  Veja o quanto você avançou e o que vem pela frente.
                </p>
              </div>
            </article>
          </div>

          <ul className="ob-welcome-exemplos" aria-label="Exemplos de conteúdos">
            {exemplos.map((e) => (
              <li key={e.rotulo} className="ob-welcome-exemplo">
                <span className="ob-welcome-exemplo-simbolo" aria-hidden="true">{e.simbolo}</span>
                <span className="ob-welcome-exemplo-rotulo">{e.rotulo}</span>
              </li>
            ))}
          </ul>

          <div className="ob-welcome-actions">
            <button
              type="button"
              className="ob-welcome-cta"
              onClick={() => navigate('/onboarding/checklist')}
            >
              continuar <ArrowRight size={18} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
