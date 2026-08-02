import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/Button/Button';
import './Hero.css';

export function Hero() {
  return (
    <section className="hero-section">
      {/* Símbolos matemáticos em segundo plano */}
      <span className="hero-symbol symbol-1" aria-hidden="true">∫</span>
      <span className="hero-symbol symbol-2" aria-hidden="true">∑</span>
      <span className="hero-symbol symbol-3" aria-hidden="true">√</span>

      <div className="hero-container">
        <div className="hero-badge">
          <Sparkles size={16} /> Plataforma 100% Gratuita
        </div>

        <h1 className="hero-title">
          Construa sua base em matemática{' '}
          <span className="hero-title-highlight">aprendendo na prática</span>
        </h1>

        <p className="hero-subtitle">
          Uma plataforma de ensino gamificado que ajuda alunos do ensino médio a dominarem a matemática resolvendo exercícios.
        </p>

        <div className="hero-actions">
          <Button to="/cadastro" size="lg">
            comece gratuitamente <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
}
