import { GraduationCap, BookMarked, Sparkles, UserCheck } from 'lucide-react';
import './TargetAudience.css';

export function TargetAudience() {
  return (
    <section id="publico-alvo" className="audience-section">
      <div className="audience-card-container">
        {/* Conteúdo Textual */}
        <div className="audience-content">
          <span className="section-label">PÚBLICO-ALVO</span>
          <h2 className="audience-title">Feito para o aluno do ensino médio.</h2>
          <p className="audience-text">
            Seja você um estudante do 1º ano buscando fixar as bases, ou do 3º ano se preparando
            para o Enem e vestibulares, o Base Matemática adapta-se à sua rotina para garantir seu aprendizado.
          </p>

          <div className="audience-tags">
            <div className="audience-pill">
              <GraduationCap size={18} /> 1º, 2º e 3º ano
            </div>
            <div className="audience-pill">
              <BookMarked size={18} /> Preparatório Enem
            </div>
            <div className="audience-pill">
              <Sparkles size={18} /> Reforço escolar
            </div>
          </div>
        </div>

        {/* Elemento Gráfico Decorativo */}
        <div className="audience-graphic">
          <div className="graphic-circle-bg"></div>
          <div className="graphic-center-card">
            <div className="graphic-icon-avatar">
              <UserCheck size={32} />
            </div>
            <div>
              <span className="graphic-badge-Enem">Foco no Estudante</span>
              <h4 className="graphic-card-title">Estudo Acessível</h4>
              <p className="graphic-card-text">Direto ao ponto, sem termos complicados.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
