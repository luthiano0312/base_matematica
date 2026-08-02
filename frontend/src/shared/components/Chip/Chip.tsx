import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './Chip.css';

type ChipProps = {
  children: ReactNode;
  icon?: ReactNode;
  tone?: 'green' | 'blue';
};

export function Chip({ children, icon, tone = 'green' }: ChipProps) {
  return (
    <span className={cx('chip', `chip--${tone}`)}>
      {icon && (
        <span className="chip__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
