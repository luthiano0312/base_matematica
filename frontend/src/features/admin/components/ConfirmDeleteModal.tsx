import { useEffect, useId, useRef, useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Modal } from '@/shared/components/Modal/Modal';
import { Button } from '@/shared/components/Button/Button';
import { useToast } from '@/shared/components/Toast/Toast';
import type { CanDeleteResponse } from '@/services/types';
import './ConfirmDeleteModal.css';

export type DeleteEntity = 'question' | 'content' | 'topic';

const ENTITY_LABEL: Record<DeleteEntity, string> = {
  question: 'Questão',
  content: 'Conteúdo',
  topic: 'Tópico',
};

/** Concordância do toast de sucesso: "Questão excluída." vs "Conteúdo excluído." */
const ENTITY_PARTICIPLE: Record<DeleteEntity, string> = {
  question: 'excluída',
  content: 'excluído',
  topic: 'excluído',
};

type CheckState =
  | { status: 'checking' }
  | { status: 'allowed' }
  | { status: 'blocked'; reason: string };

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  entity: DeleteEntity;
  /** Nome (ou resumo) da entidade para o título do modal. */
  entityName: string;
  /** Verificação síncrona de dependências (GET /admin/{entidade}/{id}/can-delete). */
  check: () => Promise<CanDeleteResponse>;
  /** Executa o DELETE de fato. */
  onDelete: () => Promise<unknown>;
  onClose: () => void;
  /** Chamado após exclusão bem-sucedida (lista atualiza sem reload). */
  onDeleted: () => void;
};

/**
 * Modal único com dois estados (Spec_Modal_Confirmacao_Exclusao): o clique no
 * ícone de excluir dispara a verificação síncrona e só então o modal resolve
 * para "permitido" ou "bloqueado" — nunca assume um estado padrão.
 */
export function ConfirmDeleteModal({
  isOpen,
  entity,
  entityName,
  check,
  onDelete,
  onClose,
  onDeleted,
}: ConfirmDeleteModalProps) {
  const toast = useToast();
  const [checkState, setCheckState] = useState<CheckState>({ status: 'checking' });
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const bodyId = useId();

  // Callbacks em ref: o efeito de verificação depende só de `isOpen`.
  const callbacksRef = useRef({ check, onDelete, onClose });
  callbacksRef.current = { check, onDelete, onClose };

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setCheckState({ status: 'checking' });
    setDeleteError(null);

    callbacksRef.current
      .check()
      .then((result) => {
        if (cancelled) return;
        setCheckState(
          result.can_delete
            ? { status: 'allowed' }
            : { status: 'blocked', reason: result.reason ?? '' },
        );
      })
      .catch(() => {
        // Fail-safe: sem verificação confiável, nem permite nem bloqueia.
        if (cancelled) return;
        toast.error('Não foi possível verificar se é seguro excluir. Tente novamente.');
        callbacksRef.current.onClose();
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Foco cai no botão seguro (Cancelar/Entendi), nunca no destrutivo.
  useEffect(() => {
    if (isOpen && checkState.status !== 'checking') {
      cancelButtonRef.current?.focus();
    }
  }, [isOpen, checkState.status]);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await callbacksRef.current.onDelete();
      toast.success(`${ENTITY_LABEL[entity]} ${ENTITY_PARTICIPLE[entity]}.`);
      onDeleted();
      callbacksRef.current.onClose();
    } catch {
      setDeleteError('Não foi possível excluir. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  const isBlocked = checkState.status === 'blocked';

  return (
    <Modal
      isOpen={isOpen}
      onClose={deleting ? () => {} : onClose}
      role="alertdialog"
      labelledBy={titleId}
      label={`Confirmar exclusão de ${ENTITY_LABEL[entity].toLowerCase()}`}
      width={420}
    >
      <div className="confirm-delete-header">
        {isBlocked ? (
          <div className="confirm-delete-icon confirm-delete-icon--blocked">
            <AlertTriangle size={22} aria-hidden="true" />
          </div>
        ) : (
          <div className="confirm-delete-icon confirm-delete-icon--danger">
            <Trash2 size={22} aria-hidden="true" />
          </div>
        )}
        <h2 id={titleId} className="modal-title">
          {isBlocked
            ? `Não é possível excluir "${entityName}"`
            : `Excluir "${entityName}"?`}
        </h2>
      </div>

      <div id={bodyId} className="modal-body">
        {checkState.status === 'checking' && (
          <div className="confirm-delete-loading" role="status">
            <span className="confirm-delete-spinner" aria-hidden="true" />
            Verificando dependências…
          </div>
        )}

        {checkState.status === 'allowed' && <p>Essa ação não pode ser desfeita.</p>}

        {isBlocked && <p>{checkState.reason}</p>}

        {deleteError && (
          <p className="confirm-delete-error" role="alert">
            {deleteError}
          </p>
        )}
      </div>

      <div className="modal-footer">
        {isBlocked ? (
          <Button ref={cancelButtonRef} variant="secondary" size="sm" onClick={onClose}>
            Entendi
          </Button>
        ) : (
          <>
            <Button
              ref={cancelButtonRef}
              variant="secondary"
              size="sm"
              disabled={checkState.status === 'checking' || deleting}
              onClick={onClose}
            >
              Cancelar
            </Button>
            {checkState.status === 'allowed' && (
              <Button variant="danger" size="sm" loading={deleting} onClick={() => void handleDelete()}>
                {deleting ? 'Excluindo…' : 'Excluir'}
              </Button>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
