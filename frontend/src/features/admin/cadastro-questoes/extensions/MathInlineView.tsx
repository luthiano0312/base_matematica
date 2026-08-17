import { useEffect, useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import katex from 'katex';
import { cx } from '@/shared/utils/cx';

/**
 * NodeView do MathInlineNode: preview da fórmula renderizado com KaTeX
 * dentro do editor; clicar reabre o MathLive pré-preenchido (via options.onEdit).
 */
export function MathInlineView({ node, extension, updateAttributes, selected }: NodeViewProps) {
  const previewRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const target = previewRef.current;
    if (!target) return;

    try {
      katex.render(node.attrs.latex, target, { throwOnError: false });
    } catch {
      target.textContent = node.attrs.latex;
    }
  }, [node.attrs.latex]);

  return (
    <NodeViewWrapper
      as="span"
      className={cx('rte-math-chip', selected && 'rte-math-chip--selected')}
      data-latex={node.attrs.latex}
      title="Clique para editar a fórmula"
      onClick={() =>
        extension.options.onEdit({
          latex: node.attrs.latex,
          update: (latex: string) => updateAttributes({ latex }),
        })
      }
    >
      <span ref={previewRef} />
    </NodeViewWrapper>
  );
}
