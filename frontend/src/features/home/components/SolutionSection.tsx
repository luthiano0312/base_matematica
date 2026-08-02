import { Check } from 'lucide-react';
import './SolutionSection.css';

export function SolutionSection() {
  return (
    <section id="solucao" className="solution-section">
      <div className="solution-grid-layout">
        {/* Conteúdo Textual */}
        <div className="solution-content">
          <span className="section-label">A SOLUÇÃO</span>
          <h2 className="solution-title">
            Aprender matemática fica mais simples quando existe um caminho.
          </h2>
          <p className="solution-text">
            Combinamos prática interativa com organização por conteúdos para você construir o conhecimento passo a passo, sem frustração.
          </p>

          <div className="solution-features">
            <div className="feature-item">
              <div className="check-badge">
                <Check size={18} />
              </div>
              <div className="feature-info">
                <h4>Aprenda por etapas</h4>
                <p>Progrida de forma estruturada dos tópicos fundamentais aos mais avançados.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="check-badge">
                <Check size={18} />
              </div>
              <div className="feature-info">
                <h4>Receba feedback imediato</h4>
                <p>Saiba na hora se acertou e entenda a explicação de cada alternativa.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="check-badge">
                <Check size={18} />
              </div>
              <div className="feature-info">
                <h4>Evolua no seu ritmo</h4>
                <p>Estude quando e onde quiser com desafios adequados ao seu nível.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Ilustrativo de Questão (Simulação de UI) */}
        <div className="question-mockup-card">
          <div className="question-mockup-header">
            <span className="tag-difficulty">Médio • Nível 2</span>
            <span className="tag-topic">Equação do 2º Grau</span>
          </div>

          <p className="question-statement">
            Dada a função quadrática abaixo, determine as raízes reais da equação:
          </p>

          <div className="math-formula">
            f(x) = x² - 5x + 6 = 0
          </div>

          <div className="options-list">
            <div className="mockup-option">
              <span className="option-letter">A</span>
              <span>x₁ = 1 e x₂ = 4</span>
            </div>
            <div className="mockup-option selected">
              <span className="option-letter">B</span>
              <span>x₁ = 2 e x₂ = 3</span>
            </div>
            <div className="mockup-option">
              <span className="option-letter">C</span>
              <span>x₁ = -2 e x₂ = -3</span>
            </div>
            <div className="mockup-option">
              <span className="option-letter">D</span>
              <span>x₁ = 0 e x₂ = 5</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
