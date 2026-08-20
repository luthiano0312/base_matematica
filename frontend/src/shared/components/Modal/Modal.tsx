import { useEffect, useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import { cx } from '../../utils/cx';
import './Modal.css';

type ModalProps = {
  /** Controla a renderização do overlay + container. */
  isOpen: boolean;
  /** Chamado no Esc, clique no overlay ou por quem hospedar o modal. */
  onClose: () => void;
  /** `alertdialog` para confirmações destrutivas; `dialog` para o restante. */
  role?: 'dialog' | 'alertdialog';
  /** id do elemento de título (aria-labelledby). Se omitido, usa `label`. */
  labelledBy?: string;
  /** Descrição curta para leitores de tela (fallback do aria-labelledby). */
  label: string;
  /** Largura do container em px (420 exclusão / 480 formulário, conforme specs). */
  width?: number;
  /** Elemento que recebe o foco ao abrir; padrão: primeiro focável do modal. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal base (Spec_Modal_Confirmacao_Exclusao / Spec_Modal_Conteudo_Topico):
 * overlay azul-escuro translúcido, container branco radius 16px, fechamento por
 * Esc/clique-fora, trap de foco e restauração do foco de origem.
 */
export function Modal({
  isOpen,
  onClose,
  role = 'dialog',
  labelledBy,
  label,
  width = 420,
  initialFocusRef,
  children,
  className,
}: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusTarget =
      initialFocusRef?.current ??
      container?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ??
      container;
    focusTarget?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !container) return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose, initialFocusRef]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        role={role}
        aria-modal="true"
        {...(labelledBy ? { 'aria-labelledby': labelledBy } : { 'aria-label': label })}
        tabIndex={-1}
        className={cx('modal-container', className)}
        style={{ width: `min(${width}px, calc(100vw - 32px))` }}
      >
        {children}
      </div>
    </div>
  );
}
