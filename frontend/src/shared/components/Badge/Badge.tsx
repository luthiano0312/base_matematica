import { cx } from '../../utils/cx';
import './Badge.css';

export type Difficulty = 'easy' | 'medium' | 'hard';

const LABELS: Record<Difficulty, string> = {
  easy: 'Fácil',
  medium: 'Média',
  hard: 'Difícil',
};

/**
 * Pill colorido de dificuldade — cores semânticas da
 * Spec_Admin_Design_Tokens_e_Sidebar#2.3.
 */
export function Badge({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  return (
    <span className={cx('badge', `badge--${difficulty}`, className)}>
      {LABELS[difficulty]}
    </span>
  );
}
