import type { ChangeEvent, FocusEvent, InputHTMLAttributes, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { cx } from '../../utils/cx';
import './TextField.css';

export type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'onBlur' | 'value'
> & {
  label: string;
  variant?: 'light' | 'dark';
  error?: string;
  trailing?: ReactNode;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
};

export function TextField({
  label,
  variant = 'light',
  error,
  trailing,
  id,
  className,
  ...rest
}: TextFieldProps) {
  const errorId = error ? `${id}-erro` : undefined;

  return (
    <div className={cx('text-field', `text-field--${variant}`, className)}>
      <label htmlFor={id} className="text-field__label">
        {label}
      </label>

      <div className={trailing ? 'text-field__control' : undefined}>
        <input
          id={id}
          className={cx(
            'text-field__input',
            trailing && 'text-field__input--with-action',
            error && 'text-field__input--error',
          )}
          aria-invalid={!!error}
          aria-describedby={errorId}
          {...rest}
        />
        {trailing}
      </div>

      {error && (
        <span id={errorId} className="text-field__error">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
}
