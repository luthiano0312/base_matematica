import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { getContents, getTopics } from '@/services/contentService';
import { listStudyMaterials } from '@/services/studyMaterialService';
import { getErrorMessage } from '@/services/http';
import type { Content, StudyMaterial, Topic } from '@/services/types';
import { Button } from '@/shared/components/Button/Button';
import { SelectField } from '@/shared/components/SelectField/SelectField';
import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner';
import { Skeleton } from '@/shared/components/Skeleton/Skeleton';
import './materiais-base.css';
import './MateriaisListaPage.css';

/** Preview do card: ~120 primeiros caracteres do texto plano do artigo;
 * sem artigo, sinaliza a vídeo aula. */
function previewMaterial(m: StudyMaterial): string {
  const texto = (m.content_plain ?? '').trim();
  if (texto) return texto.length > 120 ? `${texto.slice(0, 120)}…` : texto;
  return 'Vídeo aula disponível';
}

/**
 * Listagem pública de materiais de estudo (RN01/RF02) — Spec_Materiais_de_
 * Estudo#Tela 1: fundo lavanda, filtro Conteúdo→Tópico e grid de cards com
 * badges. Os selects são hidratados dos query params (?conteudo=&topico=),
 * que também chegam aqui pela página de filtro.
 */
export function MateriaisListaPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // ---------- filtro (fonte de verdade = URL) ----------
  const rawConteudo = searchParams.get('conteudo') ?? '';
  const rawTopico = searchParams.get('topico') ?? '';
  const conteudoId = /^\d+$/.test(rawConteudo) ? Number(rawConteudo) : null;
  const topicoId = /^\d+$/.test(rawTopico) ? Number(rawTopico) : null;

  // ---------- catálogo (tolerante a falha: só alimenta nomes/selects) ----------
  const [contents, setContents] = useState<Content[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // ---------- lista ----------
  const [materials, setMaterials] = useState<StudyMaterial[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getContents(), getTopics()])
      .then(([listaContents, listaTopics]) => {
        setContents(listaContents);
        setTopics(listaTopics);
      })
      .catch(() => {
        // Sem catálogo a listagem funciona; apenas tags/selects ficam pobres.
      });
  }, []);

  const load = useCallback(() => {
    setErro(null);
    setMaterials(null);
    listStudyMaterials({
      content_id: conteudoId ?? undefined,
      topic_id: topicoId ?? undefined,
    })
      .then(setMaterials)
      .catch((err) => setErro(getErrorMessage(err)));
  }, [conteudoId, topicoId]);

  useEffect(load, [load]);

  // Tópico na URL que não pertence ao conteúdo (link antigo/editado) → descarta.
  useEffect(() => {
    if (!conteudoId || !topicoId) return;
    const coerente = topics.some((t) => t.id === topicoId && t.content_id === conteudoId);
    if (!coerente && topics.length > 0) {
      const params = new URLSearchParams(searchParams);
      params.delete('topico');
      setSearchParams(params, { replace: true });
    }
  }, [topics, conteudoId, topicoId, searchParams, setSearchParams]);

  const atualizarParam = (chave: 'conteudo' | 'topico', valor: string) => {
    const params = new URLSearchParams(searchParams);
    if (valor) params.set(chave, valor);
    else params.delete(chave);
    // Trocar o conteúdo invalida o tópico escolhido (dependência).
    if (chave === 'conteudo') params.delete('topico');
    setSearchParams(params);
  };

  const limparFiltro = () => setSearchParams({});

  const filtrosAtivos = conteudoId !== null || topicoId !== null;

  const nomeConteudo = useMemo(() => new Map(contents.map((c) => [c.id, c.name])), [contents]);
  const nomeTopico = useMemo(() => new Map(topics.map((t) => [t.id, t.name])), [topics]);

  return (
    <div className="mat-base">
      <div className="mat-container">
        {/* Mesmo elemento da tela de filtro (mat-filtro-back); volta pra ela. */}
        <Link to="/materiais-de-estudo" className="mat-filtro-back" aria-label="Voltar">
          <ArrowLeft size={20} /> voltar
        </Link>

        <nav className="mat-breadcrumb" aria-label="Você está aqui">
          Início <span className="mat-breadcrumb-sep">→</span>{' '}
          <strong>Materiais de estudo</strong>
        </nav>

        <header className="mat-lista-head">
          <h1 className="mat-lista-titulo">Materiais de estudo</h1>
          <p className="mat-lista-subtitulo">
            Leia a teoria com textos, fórmulas e vídeos para apoiar a prática das questões.
          </p>
        </header>

        {/* Filtro Conteúdo/Tópico — hidratado da URL (chegou do filtro ou do link) */}
        <section className="mat-filtros-bar" aria-label="Filtrar materiais">
          <SelectField
            variant="light"
            id="mat-lista-conteudo"
            label="Conteúdo"
            value={rawConteudo}
            onChange={(e) => atualizarParam('conteudo', e.target.value)}
          >
            <option value="">Todos</option>
            {contents.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>

          <SelectField
            variant="light"
            id="mat-lista-topico"
            label="Tópico"
            value={rawTopico}
            disabled={!conteudoId}
            hint="O tópico depende do conteúdo escolhido."
            onChange={(e) => atualizarParam('topico', e.target.value)}
          >
            <option value="">
              {conteudoId ? 'Todos' : 'Escolha um conteúdo primeiro'}
            </option>
            {topics
              .filter((t) => t.content_id === conteudoId)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </SelectField>
        </section>

        {erro && <ErrorBanner message={erro} onRetry={load} />}

        <main>
          {/* Carregando */}
          {materials === null && !erro && (
            <ul className="mat-grid" aria-hidden="true">
              {Array.from({ length: 4 }, (_, i) => (
                <li key={i} className="mat-skeleton-card">
                  <Skeleton width="60%" height={22} radius={10} />
                  <Skeleton height={14} />
                  <Skeleton width="80%" height={14} />
                </li>
              ))}
            </ul>
          )}

          {/* Vazio */}
          {materials !== null && materials.length === 0 &&
            (filtrosAtivos ? (
              <ul className="mat-grid">
                <li className="mat-empty mat-empty--dashed">
                  <p>Nenhum material encontrado para esse filtro.</p>
                  <Button variant="outline" onClick={limparFiltro}>
                    Limpar filtro
                  </Button>
                </li>
              </ul>
            ) : (
              <div className="mat-empty" role="status">
                <BookOpen size={28} aria-hidden="true" />
                <p>Ainda não há materiais publicados. Volte em breve!</p>
              </div>
            ))}

          {/* Cards — cada um é um Link real (focável, Enter ativa). */}
          {materials !== null && materials.length > 0 && (
            <ul className="mat-grid">
              {materials.map((m) => (
                <li key={m.id}>
                  <Link
                    className="mat-card-link"
                    to={`/materiais-de-estudo/${m.id}${location.search}`}
                  >
                    <h2 className="mat-card-titulo">{m.title}</h2>
                    <p className="mat-preview">{previewMaterial(m)}</p>
                    <div className="mat-badges">
                      {(m.content ?? '').trim() !== '' && (
                        <span className="mat-badge mat-badge--artigo">Artigo</span>
                      )}
                      {m.video_url && (
                        <span className="mat-badge mat-badge--video">Vídeo aula</span>
                      )}
                    </div>
                    <div className="mat-tags mat-card-tags">
                      {nomeConteudo.get(m.content_id) && (
                        <span className="mat-tag">{nomeConteudo.get(m.content_id)}</span>
                      )}
                      {m.topic_id !== null && nomeTopico.get(m.topic_id) && (
                        <span className="mat-tag">{nomeTopico.get(m.topic_id)}</span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}
