import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { TextFieldProps } from '../TextField/TextField';
import { TextField } from '../TextField/TextField';
import './PasswordInput.css';

export type PasswordInputProps = Omit<TextFieldProps, 'type' | 'trailing'>;

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  );
}
