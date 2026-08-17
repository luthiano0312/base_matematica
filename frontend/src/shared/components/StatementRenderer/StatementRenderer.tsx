import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cx } from '../../utils/cx';
import './StatementRenderer.css';

/**
 * RN21/RN22/RNF11 — renderiza o HTML produzido pelo editor do painel admin:
 * sanitiza com DOMPurify (whitelist) e depois renderiza as fórmulas com KaTeX.
 *
 * Convenção de fórmula (mesma do MathNode do editor admin): a fórmula viaja
 * como `<span data-latex="...">latex</span>` dentro do HTML do campo.
 */

// Tags/atributos que o Tiptap do admin pode produzir (StarterKit + Image +
// MathNode). Qualquer coisa fora da lista é removida antes de ir para o DOM.
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del',
  'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'blockquote', 'hr', 'pre', 'code',
  'img', 'span', 'a',
];

const ALLOWED_ATTR = ['src', 'alt', 'title', 'href', 'target', 'rel', 'start', 'data-latex'];

type StatementRendererProps = {
  html: string | null | undefined;
  className?: string;
};

export function StatementRenderer({ html, className }: StatementRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const clean = DOMPurify.sanitize(html ?? '', {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
    });

    container.innerHTML = clean;

    container.querySelectorAll<HTMLElement>('span[data-latex]').forEach((span) => {
      const latex = span.getAttribute('data-latex') ?? '';
      try {
        katex.render(latex, span, { throwOnError: false, displayMode: false });
      } catch {
        // LaTeX inválido: mostra o código cru em vez de quebrar a tela.
        span.textContent = latex;
      }
    });
  }, [html]);

  return <div ref={containerRef} className={cx('statement-renderer', className)} />;
}
