import { Gamepad2, FolderKanban, TrendingUp, Smartphone } from 'lucide-react';
import './ProjectObjective.css';

const cards = [
  {
    icon: <Gamepad2 size={24} />,
    title: 'Questões gamificadas',
    desc: 'Aprenda resolvendo desafios e conquiste sua evolução a cada exercício.',
  },
  {
    icon: <FolderKanban size={24} />,
    title: 'Conteúdos organizados',
    desc: 'Estude por assunto e tópico alinhados ao currículo do ensino médio.',
  },
  {
    icon: <TrendingUp size={24} />,
    title: 'Acompanhe seu progresso',
    desc: 'Pontuação e evolução contínua para você saber exatamente onde melhorar.',
  },
  {
    icon: <Smartphone size={24} />,
    title: 'Totalmente acessível',
    desc: 'Feito sob medida para funcionar perfeitamente no celular e computador.',
  },
];

export function ProjectObjective() {
  return (
    <section id="objetivo" className="objective-section">
      <div className="objective-header">
        <span className="section-label">OBJETIVO DO PROJETO</span>
        <h2 className="objective-title">Tornar a matemática mais acessível para todo mundo.</h2>
        <p className="objective-text">
          O Base Matemática nasceu com o propósito social de aproximar o estudante da matemática,
          transformando dificuldades em pequenas vitórias por meio de uma plataforma leve, gratuita e engajante.
        </p>
      </div>

      <div className="objective-grid">
        {cards.map((card) => (
          <div key={card.title} className="objective-card">
            <div className="card-icon-wrapper">{card.icon}</div>
            <h3 className="card-title">{card.title}</h3>
            <p className="card-desc">{card.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
