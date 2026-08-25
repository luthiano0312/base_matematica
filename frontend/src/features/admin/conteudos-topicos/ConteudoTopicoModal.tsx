import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { Modal } from '@/shared/components/Modal/Modal';
import { Button } from '@/shared/components/Button/Button';
import {
  createContent,
  createTopic,
  getErrorMessage,
  updateContent,
  updateTopic,
} from '@/services/adminService';
import type { AdminContent, AdminTopic } from '@/services/types';
import './ConteudoTopicoModal.css';

export type ConteudoTopicoModalMode =
  | { entity: 'content'; action: 'create' }
  | { entity: 'content'; action: 'edit'; content: AdminContent }
  /** Criar tópico a partir do card: Conteúdo pai pré-definido e travado. */
  | { entity: 'topic'; action: 'create'; lockedContentId: number }
  /** Editar tópico: Conteúdo pai preenchido e editável (RN16 validada no backend). */
  | { entity: 'topic'; action: 'edit'; topic: AdminTopic };

const NOME_MAX = 100;

type ConteudoTopicoModalProps = {
  isOpen: boolean;
  mode: ConteudoTopicoModalMode;
  /** Catálogo de conteúdos para o select do modo Tópico. */
  contents: AdminContent[];
  onClose: () => void;
  /** Chamado após salvar com sucesso (a listagem atualiza sem reload). */
  onSaved: () => void;
};

/**
 * Modal único de criar/editar Conteúdo ou Tópico (Spec_Modal_Conteudo_Topico):
 * difere apenas nos campos do corpo — Tópico ganha o select de Conteúdo pai.
 */
export function ConteudoTopicoModal({ isOpen, mode, contents, onClose, onSaved }: ConteudoTopicoModalProps) {
  const isTopic = mode.entity === 'topic';
  const isEdit = mode.action === 'edit';
  const isLockedContent = mode.entity === 'topic' && mode.action === 'create';

  const [name, setName] = useState('');
  const [contentId, setContentId] = useState<number | ''>('');
  const [nameFocused, setNameFocused] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const titleId = useId();

  const modeRef = useRef(mode);
  modeRef.current = mode;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;
  const savingRef = useRef(saving);
  savingRef.current = saving;

  // Fechamento com identidade estável: cada tecla re-renderiza este componente
  // e um onClose inline recriado resetaria o efeito de foco do Modal.
  const handleClose = useCallback(() => {
    if (!savingRef.current) onCloseRef.current();
  }, []);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Reseta o formulário com os dados do modo atual a cada abertura.
  useEffect(() => {
    if (!isOpen) return;

    const current = modeRef.current;
    if (current.entity === 'content') {
      setName(current.action === 'edit' ? current.content.name : '');
      setContentId('');
    } else {
      setName(current.action === 'edit' ? current.topic.name : '');
      setContentId(
        current.action === 'edit' ? current.topic.content_id : current.lockedContentId,
      );
    }
    setNameError(null);
    setSaveError(null);
    setSaving(false);
  }, [isOpen]);

  const title = isEdit
    ? isTopic
      ? 'Editar tópico'
      : 'Editar conteúdo'
    : isTopic
      ? 'Novo tópico'
      : 'Novo conteúdo';

  const submitLabel = isEdit ? 'Salvar alterações' : isTopic ? 'Criar tópico' : 'Criar conteúdo';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Digite um nome.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      if (mode.entity === 'content') {
        if (mode.action === 'edit') {
          await updateContent(mode.content.id, { name: trimmed });
        } else {
          await createContent({ name: trimmed });
        }
      } else {
        const payload = { name: trimmed, content_id: Number(contentId) };
        if (mode.action === 'edit') {
          await updateTopic(mode.topic.id, payload);
        } else {
          await createTopic(payload);
        }
      }
      onSavedRef.current();
      onCloseRef.current();
    } catch (err) {
      // 422 de RN16 (troca de conteúdo com questões vinculadas) traz mensagem própria.
      setSaveError(getErrorMessage(err, 'Não foi possível salvar. Tente novamente.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      initialFocusRef={nameInputRef}
      labelledBy={titleId}
      label={title}
      width={480}
    >
      <button
        type="button"
        className="modal-close-x"
        onClick={handleClose}
        disabled={saving}
        aria-label="Fechar"
      >
        <X size={16} aria-hidden="true" />
      </button>

      <h2 id={titleId} className="modal-title">
        {title}
      </h2>

      <form onSubmit={(event) => void handleSubmit(event)} noValidate>
        <div className="ct-field">
          <label htmlFor="ct-nome" className="ct-label">
            {isTopic ? 'Nome do tópico' : 'Nome do conteúdo'}
          </label>
          <input
            id="ct-nome"
            ref={nameInputRef}
            type="text"
            className={nameError ? 'ct-input ct-input--error' : 'ct-input'}
            placeholder={isTopic ? 'Ex.: Fórmula de Bhaskara' : 'Ex.: Equações do 2º grau'}
            value={name}
            maxLength={NOME_MAX}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(null);
            }}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            disabled={saving}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? 'ct-nome-erro' : undefined}
          />
          {(nameFocused || name.length > 80) && (
            <span className="ct-counter">
              {name.length}/{NOME_MAX}
            </span>
          )}
          {nameError && (
            <span id="ct-nome-erro" className="ct-error" role="alert">
              {nameError}
            </span>
          )}
        </div>

        {isTopic && (
          <div className="ct-field">
            <label htmlFor="ct-conteudo" className="ct-label">
              Conteúdo
            </label>
            <select
              id="ct-conteudo"
              className={isLockedContent ? 'ct-select ct-select--locked' : 'ct-select'}
              value={contentId}
              onChange={(e) => setContentId(Number(e.target.value))}
              disabled={isLockedContent || saving}
            >
              {contents.map((content) => (
                <option key={content.id} value={content.id}>
                  {content.name}
                </option>
              ))}
            </select>
            {isLockedContent && (
              <span className="ct-hint">
                Definido pelo conteúdo em que você abriu esse formulário.
              </span>
            )}
          </div>
        )}

        {saveError && (
          <p className="ct-save-error" role="alert">
            {saveError}
          </p>
        )}

        <div className="modal-footer">
          <Button variant="secondary" size="sm" disabled={saving} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" loading={saving}>
            {saving ? 'Salvando…' : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
