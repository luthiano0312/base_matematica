import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { getContents, getTopics } from '@/services/contentService';
import {
  createStudyMaterial,
  getStudyMaterial,
  updateStudyMaterial,
} from '@/services/studyMaterialService';
import { getErrorMessage } from '@/services/http';
import type { Content, Topic } from '@/services/types';
import { RichTextEditor } from '@/features/admin/cadastro-questoes/RichTextEditor';
import { SelectField } from '@/shared/components/SelectField/SelectField';
import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner';
import { cx } from '@/shared/utils/cx';
import './CadastroMaterialPage.css';

type CampoErro = 'title' | 'content' | 'contents';

/** HTML "vazio" para validação: sem texto, sem imagem e sem fórmula. */
function htmlVazio(html: string) {
  const semMidia = html
    .replace(/<img[^>]*>/gi, '')
    .replace(/<span[^>]*data-latex[^>]*>[\s\S]*?<\/span>/gi, '');
  return semMidia.replace(/<[^>]+>/g, '').trim() === '';
}

/**
 * Cadastro/edição de material de estudo (mesma página, via parâmetro de
 * rota). O artigo é HTML rico lido pelo aluno via pipeline DOMPurify +
 * KaTeX (RN21/RN22); o upload de imagens é o mesmo do editor de questões,
 * intermediado pelo backend (RN23).
 */
export function CadastroMaterialPage() {
  const { id } = useParams<{ id: string }>();
  const editando = id !== undefined;

  const [contents, setContents] = useState<Content[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  // ---------- form ----------
  const [titulo, setTitulo] = useState('');
  const [conteudoId, setConteudoId] = useState('');
  const [topicoId, setTopicoId] = useState('');
  const [artigoHtml, setArtigoHtml] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const [erros, setErros] = useState<Partial<Record<CampoErro, string>>>({});
  const [salvando, setSalvando] = useState(false);
  const [erroSalvamento, setErroSalvamento] = useState<string | null>(null);
  const [salvoComSucesso, setSalvoComSucesso] = useState(false);

  const carregarCatalogo = () => {
    setCarregandoCatalogo(true);
    setErroCarga(null);
    Promise.all([getContents(), getTopics()])
      .then(([listaContents, listaTopics]) => {
        setContents(listaContents);
        setTopics(listaTopics);
      })
      .catch((err) => setErroCarga(getErrorMessage(err)))
      .finally(() => setCarregandoCatalogo(false));
  };

  useEffect(carregarCatalogo, []);

  // Carga do material em modo edição.
  const [carregandoMaterial, setCarregandoMaterial] = useState(editando);

  useEffect(() => {
    if (!editando) return;
    setCarregandoMaterial(true);
    getStudyMaterial(id)
      .then((m) => {
        setTitulo(m.title);
        setConteudoId(String(m.content_id));
        setTopicoId(m.topic_id ? String(m.topic_id) : '');
        setArtigoHtml(m.content ?? '');
        setVideoUrl(m.video_url ?? '');
      })
      .catch((err) => setErroCarga(getErrorMessage(err)))
      .finally(() => setCarregandoMaterial(false));
  }, [editando, id]);

  /** Tópicos do conteúdo selecionado — single-select dependente (RN16). */
  const topicosDisponiveis = useMemo(
    () => topics.filter((t) => t.content_id === Number(conteudoId)),
    [topics, conteudoId]
  );

  const selecionarConteudo = (valor: string) => {
    setConteudoId(valor);
    // RN16: tópico que deixou de pertencer ao novo conteúdo é desmarcado.
    setTopicoId('');
    setErros((prev) => ({ ...prev, contents: undefined }));
  };

  const validar = (): Partial<Record<CampoErro, string>> => {
    const resultado: Partial<Record<CampoErro, string>> = {};

    if (titulo.trim() === '') resultado.title = 'Informe o título do material.';
    if (!conteudoId) resultado.contents = 'Selecione o conteúdo do material.';
    // Pelo menos um meio: artigo ou vídeo — nunca os dois vazios.
    if (htmlVazio(artigoHtml) && videoUrl.trim() === '') {
      resultado.content = 'Preencha o artigo ou informe o link do vídeo.';
    }

    return resultado;
  };

  const sectionRefs = {
    title: useRef<HTMLElement>(null),
    content: useRef<HTMLElement>(null),
    contents: useRef<HTMLElement>(null),
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErroSalvamento(null);

    const proximosErros = validar();
    setErros(proximosErros);

    const ordem: CampoErro[] = ['title', 'content', 'contents'];
    const primeiroErro = ordem.find((campo) => proximosErros[campo]);
    if (primeiroErro) {
      sectionRefs[primeiroErro].current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        title: titulo.trim(),
        content: htmlVazio(artigoHtml) ? null : artigoHtml,
        video_url: videoUrl.trim() || null,
        content_id: Number(conteudoId),
        topic_id: topicoId ? Number(topicoId) : null,
      };
      if (editando) {
        await updateStudyMaterial(id, payload);
      } else {
        await createStudyMaterial(payload);
      }
      setSalvoComSucesso(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErroSalvamento(getErrorMessage(err));
    } finally {
      setSalvando(false);
    }
  };

  const cadastrarOutro = () => {
    setTitulo('');
    setConteudoId('');
    setTopicoId('');
    setArtigoHtml('');
    setVideoUrl('');
    setErros({});
    setSalvoComSucesso(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="cm-container">
      <nav className="admin-breadcrumb" aria-label="Você está aqui">
        Painel administrativo <span className="admin-breadcrumb-sep">→</span> Materiais de estudo{' '}
        <span className="admin-breadcrumb-sep">→</span>{' '}
        <strong>{editando ? 'Editar material' : 'Novo material'}</strong>
      </nav>
      <div className="cm-page-head">
        <div className="cm-decor" aria-hidden="true">
          ¶
        </div>
        <h1 className="cm-title">
          {editando ? 'Editar material de estudo' : 'Cadastrar material de estudo'}
        </h1>
        <p className="cm-subtitle">
          Escreva um artigo com texto, fórmulas e imagens para apoiar a teoria dos conteúdos.
        </p>
      </div>

      {salvoComSucesso ? (
        <div className="cm-success-banner" role="status">
          <span>✓ Material {editando ? 'atualizado' : 'cadastrado'} com sucesso.</span>
          {!editando && (
            <button type="button" className="cm-success-action" onClick={cadastrarOutro}>
              Cadastrar outro material
            </button>
          )}
          {editando && (
            <button type="button" className="cm-success-action" onClick={() => setSalvoComSucesso(false)}>
              Voltar a editar
            </button>
          )}
        </div>
      ) : (
        <form className="cm-card" onSubmit={handleSubmit} noValidate>
          {erroCarga && <ErrorBanner message={erroCarga} onRetry={carregarCatalogo} />}
          {erroSalvamento && <ErrorBanner message={erroSalvamento} />}

          {carregandoCatalogo || carregandoMaterial ? (
            <p className="cm-loading" role="status">
              Carregando…
            </p>
          ) : (
            <>
              {/* Título */}
              <section
                className={cx('cm-field', erros.title && 'cm-field--error')}
                ref={sectionRefs.title}
              >
                <label className="cm-label" htmlFor="cm-titulo">
                  Título <span className="cm-req">*</span>
                </label>
                <input
                  id="cm-titulo"
                  type="text"
                  placeholder="Ex.: Frações — o que são e como somar"
                  value={titulo}
                  onChange={(e) => {
                    setTitulo(e.target.value);
                    setErros((prev) => ({ ...prev, title: undefined }));
                  }}
                />
                {erros.title && (
                  <p className="cm-error" role="alert">
                    {erros.title}
                  </p>
                )}
              </section>

              {/* Conteúdo */}
              <section
                className={cx('cm-field', erros.contents && 'cm-field--error')}
                ref={sectionRefs.contents}
              >
                <SelectField
                  variant="light"
                  label="Conteúdo"
                  id="cm-conteudo"
                  value={conteudoId}
                  onChange={(e) => selecionarConteudo(e.target.value)}
                >
                  <option value="">Selecione…</option>
                  {contents.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </SelectField>
                {erros.contents && (
                  <p className="cm-error" role="alert">
                    {erros.contents}
                  </p>
                )}
              </section>

              {/* Tópico */}
              <SelectField
                variant="light"
                label="Tópico (opcional)"
                id="cm-topico"
                value={topicoId}
                disabled={!conteudoId}
                hint={
                  conteudoId
                    ? undefined
                    : 'Selecione um conteúdo acima para ver os tópicos disponíveis.'
                }
                onChange={(e) => setTopicoId(e.target.value)}
              >
                <option value="">Nenhum tópico</option>
                {topicosDisponiveis.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </SelectField>

              {/* Artigo */}
              <section ref={sectionRefs.content}>
                <RichTextEditor
                  label="Artigo"
                  required
                  value={artigoHtml}
                  onChange={(html) => {
                    setArtigoHtml(html);
                    if (!htmlVazio(html)) setErros((prev) => ({ ...prev, content: undefined }));
                  }}
                  placeholder="Escreva o artigo do material..."
                  hint="Editor de texto rico (Tiptap). Fórmulas inseridas pelo editor visual MathLive são renderizadas ao aluno via KaTeX (RN21/RN22). Imagens enviadas ficam no Supabase Storage, sempre via upload intermediado pelo backend (RN23)."
                  error={erros.content}
                />
              </section>

              {/* Vídeo */}
              <section className="cm-field">
                <label className="cm-label" htmlFor="cm-video-url">
                  Vídeo <span className="cm-opcional">(opcional)</span>
                </label>
                <input
                  id="cm-video-url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    if (e.target.value.trim() !== '') {
                      setErros((prev) => ({ ...prev, content: undefined }));
                    }
                  }}
                />
                <p className="cm-hint">
                  Cole a URL de um vídeo do YouTube. O material pode ter só o artigo, só o vídeo ou
                  os dois.
                </p>
              </section>

              <div className="cm-actions">
                <button type="submit" className="cm-btn-primary" disabled={salvando}>
                  {salvando ? 'Salvando…' : 'Salvar material'}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
}
