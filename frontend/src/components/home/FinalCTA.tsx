import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './FinalCTA.css';

export const FinalCTA: React.FC = () => {
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
          <Link to="/cadastro" className="btn-primary" style={{ padding: '1.1rem 2.5rem', fontSize: '1.1rem' }}>
            Começar agora <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
};
