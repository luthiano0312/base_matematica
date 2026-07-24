import React from 'react';
import { HelpCircle, FileText, Video, Award } from 'lucide-react';
import './HowItWorks.css';

export const HowItWorks: React.FC = () => {
  const features = [
    {
      icon: <HelpCircle size={26} />,
      title: 'Questões variadas',
      desc: 'Exercícios práticos nos formatos múltipla escolha, certo/errado e dissertativas com correção.',
    },
    {
      icon: <FileText size={26} />,
      title: 'Resumos e artigos',
      desc: 'Material teórico objetivo para você revisar o conteúdo antes ou depois de resolver as questões.',
    },
    {
      icon: <Video size={26} />,
      title: 'Resolução em vídeo',
      desc: 'Explicações detalhadas em vídeo para você entender a lógica de resolução passo a passo.',
    },
    {
      icon: <Award size={26} />,
      title: 'Pontuação justa',
      desc: 'Ganhe pontos ao acertar questões e mantenha sua sequência diária de estudos ativa.',
    },
  ];

  return (
    <section id="como-funciona" className="how-it-works-section">
      <div className="how-header">
        <span className="section-label">COMO FUNCIONA</span>
        <h2 className="how-title">Tudo que você precisa para estudar melhor.</h2>
        <p className="how-text">
          Uma experiência completa de aprendizagem desenvolvida para impulsionar seu desempenho escolar e no Enem.
        </p>
      </div>

      <div className="how-grid">
        {features.map((item, index) => (
          <div key={index} className="how-card">
            <div className="how-icon-box">{item.icon}</div>
            <h3 className="how-card-title">{item.title}</h3>
            <p className="how-card-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
