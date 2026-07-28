import React from 'react';
import './OnboardingProgress.css';

type Props = {
  passo: 1 | 2;
  total?: number;
  progresso?: number;
};

export const OnboardingProgress: React.FC<Props> = ({ passo, total = 2, progresso }) => {
  const valor = typeof progresso === 'number' ? progresso : (passo / total) * 100;

  return (
    <div
      className="ob-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(valor)}
      aria-label="Progresso do onboarding"
    >
      <div className='ob-progress-page'>
        <p className="ob-progress-count" aria-hidden="true">
          <span className="ob-progress-count-current">{passo}</span>
          <span className="ob-progress-count-sep">/</span>
          <span className="ob-progress-count-total">{total}</span>
        </p>
      </div>
      <div className="ob-progress-track">
        <div
          className="ob-progress-fill"
          style={{ width: `${Math.max(0, Math.min(100, valor))}%` }}
        />
      </div>
    </div>
  );
};
