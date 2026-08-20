import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Edit3, Trash2, Plus, FolderPlus, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/Button/Button';
import { Skeleton } from '@/shared/components/Skeleton/Skeleton';
import * as adminService from '@/services/adminService';
import type { AdminContent, AdminTopic } from '@/services/types';
import { ConfirmDeleteModal } from '@/features/admin/components/ConfirmDeleteModal';
import type { DeleteEntity } from '@/features/admin/components/ConfirmDeleteModal';
import { ConteudoTopicoModal } from './ConteudoTopicoModal';
import type { ConteudoTopicoModalMode } from './ConteudoTopicoModal';
import './ConteudosTopicosPage.css';
import '../admin-page.css';

type DeleteTarget = {
  entity: 'content' | 'topic';
  id: number;
  name: string;
};

function plural(n: number, singular: string, pluralWord: string) {
  return `${n} ${n === 1 ? singular : pluralWord}`;
}

/**
 * Conteúdos e Tópicos (Spec_Admin_Conteudos_Topicos): listagem em cards
 * aninhados, um por Conteúdo, sempre expandidos, com CRUD via modais.
 */
export function ConteudosTopicosPage() {
  const [contents, setContents] = useState<AdminContent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState<ConteudoTopicoModalMode | null>(null);
  const [deleting, setDeleting] = useState<DeleteTarget | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setContents(await adminService.getContents());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Link vindo da Visão Geral (?editar=content:ID | topic:ID) abre a edição direto.
  useEffect(() => {
    if (loading || !contents) return;

    const editar = searchParams.get('editar');
    if (editar) {
      const [kind, idRaw] = editar.split(':');
      const id = Number(idRaw);

      if (kind === 'content') {
        const content = contents.find((c) => c.id === id);
        if (content) setModal({ entity: 'content', action: 'edit', content });
      } else if (kind === 'topic') {
        const topic = contents.flatMap((c) => c.topics).find((t) => t.id === id);
        if (topic) setModal({ entity: 'topic', action: 'edit', topic });
      }
      setSearchParams({}, { replace: true });
    }
  }, [loading, contents, searchParams, setSearchParams]);

  const totalTopics = contents?.reduce((sum, content) => sum + content.topics_count, 0) ?? 0;

  return (
    <div>
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Conteúdos e tópicos</h1>
          <p className="admin-page-subtitle">
            {plural(contents?.length ?? 0, 'conteúdo', 'conteúdos')},{' '}
            {plural(totalTopics, 'tópico', 'tópicos')}.
          </p>
        </div>
        {contents && contents.length > 0 && (
          <Button size="sm" onClick={() => setModal({ entity: 'content', action: 'create' })}>
            <Plus size={16} aria-hidden="true" />
            Novo conteúdo
          </Button>
        )}
      </header>

      {loading && (
        <div className="ct-cards" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div className="ct-card" key={i}>
              <div className="ct-card-header">
                <Skeleton width={180} height={18} />
                <div className="ct-card-actions">
                  <Skeleton width={17} height={17} />
                  <Skeleton width={17} height={17} />
                </div>
              </div>
              <div className="ct-topic-row">
                <Skeleton width={140} height={14} />
                <Skeleton width={80} height={14} />
              </div>
              <div className="ct-topic-row">
                <Skeleton width={110} height={14} />
                <Skeleton width={80} height={14} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="admin-state">
          <AlertCircle size={28} aria-hidden="true" />
          <p>Não foi possível carregar os dados.</p>
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!loading && !error && contents && contents.length === 0 && (
        <div className="admin-state">
          <FolderPlus size={28} aria-hidden="true" />
          <p>Nenhum conteúdo cadastrado ainda.</p>
          <Button size="sm" onClick={() => setModal({ entity: 'content', action: 'create' })}>
            <Plus size={16} aria-hidden="true" />
            Novo conteúdo
          </Button>
        </div>
      )}

      {!loading && !error && contents && contents.length > 0 && (
        <div className="ct-cards">
          {contents.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              onEditContent={() => setModal({ entity: 'content', action: 'edit', content })}
              onDeleteContent={() =>
                setDeleting({ entity: 'content', id: content.id, name: content.name })
              }
              onNewTopic={() =>
                setModal({ entity: 'topic', action: 'create', lockedContentId: content.id })
              }
              onEditTopic={(topic) => setModal({ entity: 'topic', action: 'edit', topic })}
              onDeleteTopic={(topic) =>
                setDeleting({ entity: 'topic', id: topic.id, name: topic.name })
              }
            />
          ))}
        </div>
      )}

      {modal && contents && (
        <ConteudoTopicoModal
          isOpen
          mode={modal}
          contents={contents}
          onClose={() => setModal(null)}
          onSaved={() => void load()}
        />
      )}

      <ConfirmDeleteModal
        isOpen={deleting !== null}
        entity={(deleting?.entity ?? 'content') as DeleteEntity}
        entityName={deleting?.name ?? ''}
        check={() =>
          deleting?.entity === 'topic'
            ? adminService.canDeleteTopic(deleting.id)
            : adminService.canDeleteContent(deleting!.id)
        }
        onDelete={() =>
          deleting?.entity === 'topic'
            ? adminService.deleteTopic(deleting.id)
            : adminService.deleteContent(deleting!.id)
        }
        onClose={() => setDeleting(null)}
        onDeleted={() => void load()}
      />
    </div>
  );
}

type ContentCardProps = {
  content: AdminContent;
  onEditContent: () => void;
  onDeleteContent: () => void;
  onNewTopic: () => void;
  onEditTopic: (topic: AdminTopic) => void;
  onDeleteTopic: (topic: AdminTopic) => void;
};

function ContentCard({
  content,
  onEditContent,
  onDeleteContent,
  onNewTopic,
  onEditTopic,
  onDeleteTopic,
}: ContentCardProps) {
  return (
    <article className="ct-card">
      <header className="ct-card-header">
        <div className="ct-card-title">
          <h2 className="ct-card-name" title={content.name}>
            {content.name}
          </h2>
          <span className="ct-card-count">
            {plural(content.topics_count, 'tópico', 'tópicos')} ·{' '}
            {plural(content.questions_count, 'questão', 'questões')}
          </span>
        </div>
        <div className="ct-card-actions">
          <button
            type="button"
            className="ct-icon-btn"
            onClick={onEditContent}
            aria-label={`Editar conteúdo ${content.name}`}
          >
            <Edit3 size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="ct-icon-btn ct-icon-btn--danger"
            onClick={onDeleteContent}
            aria-label={`Excluir conteúdo ${content.name}`}
          >
            <Trash2 size={17} aria-hidden="true" />
          </button>
        </div>
      </header>

      {content.topics.length === 0 ? (
        <p className="ct-no-topics">Nenhum tópico ainda.</p>
      ) : (
        content.topics.map((topic) => (
          <div className="ct-topic-row" key={topic.id}>
            <span className="ct-topic-name" title={topic.name}>
              {topic.name}
            </span>
            <span className="ct-topic-meta">
              <span className="ct-topic-count">
                {plural(topic.questions_count, 'questão', 'questões')}
              </span>
              <button
                type="button"
                className="ct-icon-btn"
                onClick={() => onEditTopic(topic)}
                aria-label={`Editar tópico ${topic.name}`}
              >
                <Edit3 size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="ct-icon-btn ct-icon-btn--danger"
                onClick={() => onDeleteTopic(topic)}
                aria-label={`Excluir tópico ${topic.name}`}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </span>
          </div>
        ))
      )}

      <footer className={content.topics.length === 0 ? 'ct-card-footer ct-card-footer--empty' : 'ct-card-footer'}>
        <button type="button" className="ct-new-topic" onClick={onNewTopic}>
          <Plus size={14} aria-hidden="true" />
          Novo tópico
        </button>
      </footer>
    </article>
  );
}
