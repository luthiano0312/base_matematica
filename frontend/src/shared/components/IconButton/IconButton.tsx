import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import './IconButton.css';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

export function IconButton({ label, className, children, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      className={cx('icon-button', className)}
      aria-label={label}
      {...rest}
    >
      {children}
    </button>
  );
}
