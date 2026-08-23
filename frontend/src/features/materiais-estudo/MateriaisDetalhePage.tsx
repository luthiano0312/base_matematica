import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { Play } from 'lucide-react';
import { getContents, getTopics } from '@/services/contentService';
import { getPublicStudyMaterial } from '@/services/studyMaterialService';
import { MENSAGEM_ERRO_GENERICA } from '@/services/http';
import type { Content, StudyMaterial, Topic } from '@/services/types';
import { Button } from '@/shared/components/Button/Button';
import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner';
import { StatementRenderer } from '@/shared/components/StatementRenderer/StatementRenderer';
import { extrairYoutubeId } from '@/shared/utils/youtube';
import './materiais-base.css';
import './MateriaisDetalhePage.css';

/** Tem artigo? Cobre também artigo só-com-imagens (HTML sem texto plano). */
const temArtigo = (m: StudyMaterial) => (m.content ?? '').trim() !== '';

/**
 * Player do vídeo do material. O iframe é montado como JSX com o ID extraído
 * da URL — nunca injetado no HTML sanitizado (o DOMPurify removeria). URL não
 * reconhecida como YouTube → link simples, nunca "vídeo quebrado".
 */
function MaterialVideo({ url, title }: { url: string; title: string }) {
  const videoId = extrairYoutubeId(url);

  if (!videoId) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="mat-video-link">
        <Play size={16} aria-hidden="true" /> Assistir no YouTube ↗
      </a>
    );
  }

  return (
    <div className="mat-video-frame">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={`Vídeo aula: ${title}`}
        loading="lazy"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}

/**
 * Detalhe público de um material de estudo (RN01/RF02) — Spec_Materiais_de_
 * Estudo#Tela 2: breadcrumb de volta à listagem (preservando os filtros),
 * tags de Conteúdo/Tópico, artigo em card branco (StatementRenderer,
 * RN21/RN22) e vídeo aula embutido.
 */
export function MateriaisDetalhePage() {
  const { id } = useParams();
  const location = useLocation();

  // Preserva os filtros no caminho de volta (breadcrumb e botão final).
  const voltarHref = `/materiais-de-estudo/lista${location.search}`;

  // ---------- catálogo (tolerante a falha: só alimenta as tags) ----------
  const [contents, setContents] = useState<Content[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // ---------- material ----------
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getContents(), getTopics()])
      .then(([listaContents, listaTopics]) => {
        setContents(listaContents);
        setTopics(listaTopics);
      })
      .catch(() => {
        // Sem catálogo o detalhe funciona; só as tags de nome somem.
      });
  }, []);

  const load = useCallback(() => {
    // Id ausente ou não numérico na URL → tela de não-encontrado, sem API.
    if (!id || !/^\d+$/.test(id)) {
      setNaoEncontrado(true);
      setCarregando(false);
      return;
    }

    setErro(null);
    setNaoEncontrado(false);
    setCarregando(true);
    getPublicStudyMaterial(id)
      .then(setMaterial)
      .catch((err) => {
        // 404 merece tela própria — getErrorMessage ecoaria o texto inglês
        // "No query results for model..." do Laravel.
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setNaoEncontrado(true);
        } else {
          setErro(MENSAGEM_ERRO_GENERICA);
        }
      })
      .finally(() => setCarregando(false));
  }, [id]);

  useEffect(load, [load]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [id]);

  const nomeConteudo = useMemo(() => new Map(contents.map((c) => [c.id, c.name])), [contents]);
  const nomeTopico = useMemo(() => new Map(topics.map((t) => [t.id, t.name])), [topics]);

  return (
    <div className="mat-base">
      <div className="mat-container mat-container--detalhe">
        <nav className="mat-breadcrumb" aria-label="Você está aqui">
          <Link to={voltarHref}>Materiais de estudo</Link>
          {material && (
            <>
              <span className="mat-breadcrumb-sep">→</span>
              <strong>{material.title}</strong>
            </>
          )}
        </nav>

        {carregando && <p role="status">Carregando…</p>}

        {erro && <ErrorBanner message={erro} onRetry={load} />}

        {!erro && naoEncontrado && (
          <div className="mat-nao-encontrado">
            <h1 className="mat-titulo">Material não encontrado</h1>
            <p>O material pode ter sido removido ou o endereço está incorreto.</p>
            <Button variant="outline" to="/materiais-de-estudo/lista">
              Voltar para materiais de estudo
            </Button>
          </div>
        )}

        {material && (
          <article>
            {/* Tags acima do título (mesmas cores dos cards da listagem). */}
            {(nomeConteudo.get(material.content_id) || material.topic_id !== null) && (
              <div className="mat-tags mat-detalhe-tags">
                {nomeConteudo.get(material.content_id) && (
                  <span className="mat-tag">{nomeConteudo.get(material.content_id)}</span>
                )}
                {material.topic_id !== null && nomeTopico.get(material.topic_id) && (
                  <span className="mat-tag">{nomeTopico.get(material.topic_id)}</span>
                )}
              </div>
            )}

            <h1 className="mat-titulo">{material.title}</h1>

            {/* Só-artigo: seção de vídeo omitida por inteiro.
                Só-vídeo: card de artigo omitido — vídeo sobe logo abaixo. */}
            {temArtigo(material) && (
              <section className="mat-artigo-card">
                <StatementRenderer html={material.content} />
              </section>
            )}

            {material.video_url && (
              <section className="mat-video-section">
                <h2>Vídeo aula</h2>
                <MaterialVideo url={material.video_url} title={material.title} />
              </section>
            )}

            {!temArtigo(material) && !material.video_url && (
              <p className="mat-vazio-artigo">
                Este material ainda não possui conteúdo publicado.
              </p>
            )}

            <div className="mat-voltar">
              <Button variant="outline" to={voltarHref}>
                Voltar para materiais de estudo
              </Button>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
