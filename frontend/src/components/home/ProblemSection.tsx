import React from 'react';
import { AlertCircle, Layers, Unlock } from 'lucide-react';
import './ProblemSection.css';

export const ProblemSection: React.FC = () => {
  const problems = [
    {
      icon: <AlertCircle size={26} />,
      title: 'Medo da disciplina',
      desc: 'Muitos estudantes desenvolvem bloqueios com matemática devido a métodos ultrapassados e falta de feedback prático.',
    },
    {
      icon: <Layers size={26} />,
      title: 'Defasagem acumulada',
      desc: 'Dificuldades em conteúdos básicos dos anos anteriores se acumulam, tornando o aprendizado no ensino médio desafiador.',
    },
    {
      icon: <Unlock size={26} />,
      title: 'Falta de acesso',
      desc: 'Plataformas de estudo completas muitas vezes exigem assinaturas caras, deixando milhares de alunos sem apoio pedagógico.',
    },
  ];

  return (
    <section id="problema" className="problem-wrapper">
      <div className="problem-container">
        <div className="problem-header">
          <span className="section-label section-label-light">O PROBLEMA</span>
          <h2 className="problem-title">Por que criamos este projeto?</h2>
          <p className="problem-text">
            Identificamos as principais barreiras enfrentadas por estudantes de escolas públicas e do ensino médio ao encarar a matemática.
          </p>
        </div>

        <div className="problem-grid">
          {problems.map((problem, idx) => (
            <div key={idx} className="problem-card">
              <div className="problem-icon-wrapper">{problem.icon}</div>
              <h3 className="problem-card-title">{problem.title}</h3>
              <p className="problem-card-desc">{problem.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
