import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MathInlineView } from './MathInlineView';

export type MathEditRequest = {
  latex: string;
  /** Atualiza o LaTeX do node que disparou a edição. */
  update: (latex: string) => void;
};

export type MathInlineOptions = {
  /** Abre o modal do MathLive para inserir/editar a fórmula deste node. */
  onEdit: (request: MathEditRequest) => void;
};

/**
 * Node inline de fórmula matemática (RN21).
 *
 * CONVENÇÃO DE SERIALIZAÇÃO (usada nos dois lados do sistema):
 * a fórmula é gravada no HTML como `<span data-latex="...">latex</span>`.
 * O `parseHTML`/`renderHTML` abaixo são simétricos nessa estrutura, e o
 * componente do aluno (`StatementRenderer`) procura essa MESMA convenção
 * para renderizar com KaTeX (RNF11). Se mudar aqui, mude lá também.
 */
export const MathInlineNode = Node.create<MathInlineOptions>({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  atom: true,
  draggable: true,

  addOptions() {
    return {
      onEdit: () => {},
    };
  },

  addAttributes() {
    return {
      latex: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-latex]',
        getAttrs: (element) => {
          const latex = (element as HTMLElement).getAttribute('data-latex');
          return latex === null ? false : { latex };
        },
      },
    ];
  },

  renderHTML({ node }) {
    return ['span', { 'data-latex': node.attrs.latex }, node.attrs.latex];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathInlineView);
  },
});
