import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '../../utils/cx';
import './Button.css';

type ButtonVariant = 'primary' | 'green' | 'outline';
type ButtonSize = 'md' | 'lg' | 'xl';

type BaseButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = BaseButtonProps & {
  to?: undefined;
  type?: 'button' | 'submit';
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'className' | 'children'>;

type ButtonAsLink = BaseButtonProps & {
  to: string;
  onClick?: () => void;
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

function resolveClassName({ variant = 'primary', size = 'md', block = false, className = '' }: BaseButtonProps): string {
  return cx(
    'btn',
    `btn--${variant}`,
    size !== 'md' && `btn--${size}`,
    block && 'btn--block',
    className,
  );
}

export function Button(props: ButtonProps) {
  if (props.to !== undefined) {
    const { to, variant, size, block, className, children, onClick } = props;
    return (
      <Link to={to} className={resolveClassName({ variant, size, block, className, children })} onClick={onClick}>
        {children}
      </Link>
    );
  }

  const { variant, size, block, className, children, ...buttonProps } = props;
  return (
    <button type={props.type ?? 'button'} className={resolveClassName({ variant, size, block, className, children })} {...buttonProps}>
      {children}
    </button>
  );
}
