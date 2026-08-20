import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Edit3, Plus, Search, SearchX, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/Button/Button';
import { Badge } from '@/shared/components/Badge/Badge';
import type { Difficulty } from '@/shared/components/Badge/Badge';
import { Skeleton } from '@/shared/components/Skeleton/Skeleton';
import * as adminService from '@/services/adminService';
import type {
  AdminContent,
  AdminQuestion,
  AdminTopic,
  Paginated,
  QuestionType,
} from '@/services/types';
import { ConfirmDeleteModal } from '@/features/admin/components/ConfirmDeleteModal';
import './QuestoesListagemPage.css';
import '../admin-page.css';

const TYPE_LABEL: Record<QuestionType, string> = {
  multiple_choice: 'Múltipla escolha',
  true_false: 'Certo ou errado',
  essay: 'Dissertativa',
};

const DEBOUNCE_MS = 300;

function pluralQuestoes(n: number) {
  return `${n} ${n === 1 ? 'questão cadastrada' : 'questões cadastradas'}.`;
}

/** Resumo curto para o título do modal de exclusão. */
function resumoQuestao(q: AdminQuestion) {
  const texto = q.statement_plain?.trim();
  if (!texto) return `Questão #${q.id}`;
  return texto.length > 40 ? `${texto.slice(0, 40)}…` : texto;
}

/** Conteúdo(s) da questão: primeiro nome + "+N" quando há mais de um. */
function rotuloConteudos(q: AdminQuestion) {
  const contents = q.contents ?? [];
  if (contents.length === 0) return '—';
  const extra = contents.length - 1;
  return extra > 0 ? `${contents[0].name} +${extra}` : contents[0].name;
}

/**
 * Questões — Listagem (Spec_Admin_Questoes_Listagem): filtros em cascata
 * (Conteúdo→Tópico), busca com debounce, tabela paginada server-side (20/pág)
 * e exclusão via ConfirmDeleteModal.
 */
export function QuestoesListagemPage() {
  const navigate = useNavigate();

  // ---------- filtros ----------
  const [contentId, setContentId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [type, setType] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // ---------- dados ----------
  const [contents, setContents] = useState<AdminContent[]>([]);
  const [topics, setTopics] = useState<AdminTopic[]>([]);
  const [result, setResult] = useState<Paginated<AdminQuestion> | null>(null);
  const [totalGeral, setTotalGeral] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [deleting, setDeleting] = useState<AdminQuestion | null>(null);

  const filtrosAtivos = contentId !== '' || topicId !== '' || difficulty !== '' || type !== '' || search !== '';

  // Debounce da busca (300ms) antes de disparar a requisição.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // Catálogo de conteúdos (select da linha 1 de filtros).
  useEffect(() => {
    adminService
      .getContents()
      .then(setContents)
      .catch(() => setContents([]));
  }, []);

  // Cascata: trocar o Conteúdo reseta o Tópico e recarrega as opções.
  useEffect(() => {
    setTopicId('');
    if (contentId === '') {
      setTopics([]);
      return;
    }
    adminService
      .getTopics(Number(contentId))
      .then(setTopics)
      .catch(() => setTopics([]));
  }, [contentId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await adminService.listQuestions({
        content_id: contentId ? Number(contentId) : undefined,
        topic_id: topicId ? Number(topicId) : undefined,
        difficulty: difficulty || undefined,
        type: type || undefined,
        search: search || undefined,
        page,
      });
      setResult(data);
      // O subtítulo mostra a contagem SEM filtro (spec), não a filtrada.
      if (!filtrosAtivos) setTotalGeral(data.meta.total);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setInitialLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId, topicId, difficulty, type, search, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const limparFiltros = () => {
    setContentId('');
    setTopicId('');
    setDifficulty('');
    setType('');
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const questions = result?.data ?? [];
  const meta = result?.meta;

  return (
    <div>
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Questões</h1>
          <p className="admin-page-subtitle">{pluralQuestoes(totalGeral)}</p>
        </div>
        <Button size="sm" to="/admin/questoes/nova">
          <Plus size={16} aria-hidden="true" />
          Nova questão
        </Button>
      </header>

      {/* Bloco de filtros */}
      <div className="ql-filters">
        <div className="ql-filters-row">
          <select
            className="ql-select"
            aria-label="Filtrar por conteúdo"
            value={contentId}
            disabled={!initialLoaded}
            onChange={(e) => {
              setContentId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Conteúdo: todos</option>
            {contents.map((content) => (
              <option key={content.id} value={content.id}>
                {content.name}
              </option>
            ))}
          </select>

          <select
            className="ql-select"
            aria-label="Filtrar por tópico"
            value={topicId}
            disabled={!initialLoaded || contentId === ''}
            onChange={(e) => {
              setTopicId(e.target.value);
              setPage(1);
            }}
          >
            {contentId === '' ? (
              <option value="">Escolha um conteúdo primeiro</option>
            ) : (
              <>
                <option value="">Tópico: todos</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </>
            )}
          </select>

          <select
            className="ql-select"
            aria-label="Filtrar por dificuldade"
            value={difficulty}
            disabled={!initialLoaded}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Dificuldade: todas</option>
            <option value="easy">Fácil</option>
            <option value="medium">Média</option>
            <option value="hard">Difícil</option>
          </select>

          <select
            className="ql-select"
            aria-label="Filtrar por tipo"
            value={type}
            disabled={!initialLoaded}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tipo: todos</option>
            <option value="multiple_choice">Múltipla escolha</option>
            <option value="true_false">Certo ou errado</option>
            <option value="essay">Dissertativa</option>
          </select>
        </div>

        <div className="ql-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar por enunciado"
            aria-label="Buscar por enunciado"
            value={searchInput}
            disabled={!initialLoaded}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="ql-table-card">
        {error && !loading && (
          <div className="admin-state">
            <AlertCircle size={28} aria-hidden="true" />
            <p>Não foi possível carregar os dados.</p>
            <Button variant="secondary" size="sm" onClick={() => void load()}>
              Tentar novamente
            </Button>
          </div>
        )}

        {loading && (
          <div aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <div className="ql-skeleton-row" key={i}>
                <Skeleton width="70%" height={14} />
                <Skeleton width={90} height={14} />
                <Skeleton width={56} height={22} radius={20} />
                <Skeleton width={100} height={14} />
                <Skeleton width={52} height={17} />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && questions.length === 0 && (
          <div className="admin-state">
            {filtrosAtivos ? (
              <>
                <SearchX size={28} aria-hidden="true" />
                <p>Nenhuma questão encontrada para esse filtro.</p>
                <Button variant="secondary" size="sm" onClick={limparFiltros}>
                  Limpar filtros
                </Button>
              </>
            ) : (
              <>
                <SearchX size={28} aria-hidden="true" />
                <p>Nenhuma questão cadastrada ainda.</p>
                <Button size="sm" to="/admin/questoes/nova">
                  <Plus size={16} aria-hidden="true" />
                  Nova questão
                </Button>
              </>
            )}
          </div>
        )}

        {!loading && !error && questions.length > 0 && meta && (
          <>
            <table className="ql-table">
              <colgroup>
                <col style={{ width: '34%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '19%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Enunciado</th>
                  <th>Tipo</th>
                  <th>Dificuldade</th>
                  <th>Conteúdo</th>
                  <th className="ql-th-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question.id}>
                    <td className="ql-cell-statement" title={question.statement_plain ?? undefined}>
                      {question.statement_plain?.trim() ? (
                        question.statement_plain
                      ) : (
                        <span className="ql-sem-texto">(sem texto no enunciado)</span>
                      )}
                    </td>
                    <td className="ql-cell-muted">{TYPE_LABEL[question.type]}</td>
                    <td>
                      <Badge difficulty={question.difficulty as Difficulty} />
                    </td>
                    <td className="ql-cell-muted ql-cell-truncate" title={rotuloConteudos(question)}>
                      {rotuloConteudos(question)}
                    </td>
                    <td className="ql-cell-actions">
                      <button
                        type="button"
                        className="ql-icon-btn"
                        aria-label={`Editar ${resumoQuestao(question)}`}
                        onClick={() => navigate(`/admin/questoes/${question.id}/editar`)}
                      >
                        <Edit3 size={17} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="ql-icon-btn ql-icon-btn--danger"
                        aria-label={`Excluir ${resumoQuestao(question)}`}
                        onClick={() => setDeleting(question)}
                      >
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="ql-pagination">
              <span>
                Página {meta.current_page} de {meta.last_page}
              </span>
              <div className="ql-pagination-buttons">
                <button
                  type="button"
                  className="ql-page-btn"
                  disabled={meta.current_page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  className="ql-page-btn"
                  disabled={meta.current_page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próxima
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={deleting !== null}
        entity="question"
        entityName={deleting ? resumoQuestao(deleting) : ''}
        check={() => adminService.canDeleteQuestion(deleting!.id)}
        onDelete={() => adminService.deleteQuestion(deleting!.id)}
        onClose={() => setDeleting(null)}
        onDeleted={() => void load()}
      />
    </div>
  );
}
