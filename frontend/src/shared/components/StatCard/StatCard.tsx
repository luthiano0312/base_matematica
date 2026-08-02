import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './StatCard.css';

type StatCardTone = 'blue' | 'green' | 'red';

type StatCardProps = {
  number: ReactNode;
  label: string;
  tone?: StatCardTone;
};

export function StatCard({ number, label, tone = 'blue' }: StatCardProps) {
  return (
    <div className={cx('stat-card', `stat-card--${tone}`)}>
      <span className="stat-card__number">{number}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}
