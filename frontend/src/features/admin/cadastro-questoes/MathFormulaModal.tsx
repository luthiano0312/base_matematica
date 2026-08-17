import { useEffect, useRef } from 'react';
import 'mathlive';
import type { MathfieldElement } from 'mathlive';
import { Button } from '@/shared/components/Button/Button';
import './MathFormulaModal.css';

type MathFormulaModalProps = {
  /** LaTeX existente quando o modal abre para edição de uma fórmula. */
  initialLatex: string;
  onConfirm: (latex: string) => void;
  onCancel: () => void;
};

/**
 * RF17 — editor visual de fórmulas. O MathLive gera o LaTeX; quem insere o
 * node no Tiptap é o RichTextEditor (callback onConfirm).
 */
export function MathFormulaModal({ initialLatex, onConfirm, onCancel }: MathFormulaModalProps) {
  const fieldRef = useRef<MathfieldElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    if (initialLatex) {
      field.value = initialLatex;
    }

    // O custom element pode terminar de atualizar depois da montagem;
    // focar em dois tempos garante que o teclado caia no campo.
    field.focus();
    const timeout = window.setTimeout(() => field.focus(), 50);

    return () => window.clearTimeout(timeout);
  }, [initialLatex]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [onCancel]);

  const confirm = () => {
    onConfirm(fieldRef.current?.value ?? '');
  };

  return (
    <div className="math-modal-overlay" role="dialog" aria-modal="true" aria-label="Editor visual de fórmula" onClick={onCancel}>
      <div className="math-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="math-modal-title">Fórmula</h2>
        <p className="math-modal-hint">
          Componha a fórmula abaixo: digite LaTeX direto ou use os botões de símbolos.
        </p>

        <math-field ref={fieldRef} virtual-keyboard-mode="manual" className="math-modal-field" />

        <div className="math-modal-actions">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="green" onClick={confirm}>
            Inserir fórmula
          </Button>
        </div>
      </div>
    </div>
  );
}
