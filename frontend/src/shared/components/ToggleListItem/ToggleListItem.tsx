import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cx } from '../../utils/cx';
import './ToggleListItem.css';

type ToggleListItemProps = {
  selected: boolean;
  onToggle: () => void;
  children: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  variant?: 'green' | 'blue';
};

export function ToggleListItem({
  selected,
  onToggle,
  children,
  leading,
  trailing,
  variant = 'blue',
}: ToggleListItemProps) {
  return (
    <button
      type="button"
      className={cx('toggle-list-item', `toggle-list-item--${variant}`, selected && 'is-selected')}
      onClick={onToggle}
      aria-pressed={selected}
    >
      {leading ?? (
        <span className="toggle-list-item__box" aria-hidden="true">
          {selected && <Check size={14} />}
        </span>
      )}
      <span className="toggle-list-item__text">{children}</span>
      {trailing}
    </button>
  );
}
