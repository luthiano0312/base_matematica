import type { MathfieldElement } from 'mathlive';
import type { DetailedHTMLProps, HTMLAttributes, Ref } from 'react';

/**
 * O pacote mathlive não declara o custom element `<math-field>` para JSX;
 * esta declaração cobre o uso no MathFormulaModal.
 */
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': DetailedHTMLProps<HTMLAttributes<MathfieldElement>, MathfieldElement> & {
        ref?: Ref<MathfieldElement>;
        value?: string;
        'virtual-keyboard-mode'?: 'auto' | 'manual' | 'off';
        'math-mode-space-bar'?: boolean;
        placeholder?: string;
      };
    }
  }
}
