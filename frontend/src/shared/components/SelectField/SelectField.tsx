import type { ChangeEvent, ReactNode, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from '../../utils/cx';
import './SelectField.css';

export type SelectFieldProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'onChange' | 'value'
> & {
  label: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function SelectField({
  label,
  value,
  onChange,
  error,
  hint,
  id,
  disabled,
  className,
  children,
  ...rest
}: SelectFieldProps) {
  return (
    <div className={cx('select-field', className)}>
      <label htmlFor={id} className="select-field__label">
        {label}
      </label>

      <div className="select-field__control">
        <select
          id={id}
          className={cx(
            'select-field__select',
            disabled && 'select-field__select--disabled',
            error && 'select-field__select--error',
          )}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={!!error}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown size={18} className="select-field__icon" aria-hidden="true" />
      </div>

      {hint && <span className="select-field__hint">{hint}</span>}
      {error && <span className="select-field__error">{error}</span>}
    </div>
  );
}
