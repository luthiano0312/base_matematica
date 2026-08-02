import { ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/Button/Button';
import './FinalCTA.css';

export function FinalCTA() {
  return (
    <section className="cta-section">
      <div className="cta-box">
        {/* Símbolos Decorativos de Fundo */}
        <span className="cta-bg-symbol cta-sym-1" aria-hidden="true">π</span>
        <span className="cta-bg-symbol cta-sym-2" aria-hidden="true">∞</span>

        <div className="cta-container">
          <h2 className="cta-title">Sua base começa hoje.</h2>
          <p className="cta-text">
            Junte-se à comunidade de alunos que estão redescobrindo a matemática, um exercício de cada vez.
          </p>
          <Button to="/cadastro" size="xl">
            Começar agora <ArrowRight size={20} />
          </Button>
        </div>
      </div>
    </section>
  );
}
