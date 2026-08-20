import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '../../utils/cx';
import './Button.css';

type ButtonVariant = 'primary' | 'green' | 'outline' | 'secondary' | 'danger';
type ButtonSize = 'md' | 'lg' | 'xl' | 'sm';

type BaseButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  /** Exibe spinner e desabilita o botão (prevenção de dupla submissão). */
  loading?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = BaseButtonProps & {
  to?: undefined;
  type?: 'button' | 'submit';
  ref?: Ref<HTMLButtonElement>;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'className' | 'children'>;

type ButtonAsLink = BaseButtonProps & {
  to: string;
  onClick?: () => void;
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

function resolveClassName({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  className = '',
}: BaseButtonProps): string {
  return cx(
    'btn',
    `btn--${variant}`,
    size !== 'md' && `btn--${size}`,
    block && 'btn--block',
    loading && 'btn--loading',
    className,
  );
}

export function Button(props: ButtonProps) {
  if (props.to !== undefined) {
    const { to, variant, size, block, loading, className, children, onClick } = props;
    return (
      <Link
        to={to}
        className={resolveClassName({ variant, size, block, loading, className, children })}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  const { variant, size, block, loading, className, children, disabled, ref, ...buttonProps } =
    props;
  return (
    <button
      ref={ref}
      type={props.type ?? 'button'}
      className={resolveClassName({ variant, size, block, loading, className, children })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...buttonProps}
    >
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
