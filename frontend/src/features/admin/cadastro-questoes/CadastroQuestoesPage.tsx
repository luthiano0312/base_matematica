import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { RichTextEditor } from './RichTextEditor';
import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner';
import * as adminService from '@/services/adminService';
import { getContents, getTopics } from '@/services/contentService';
import { getErrorMessage } from '@/services/http';
import type {
  Content,
  QuestionDifficulty,
  QuestionOptionPayload,
  QuestionPayload,
  QuestionType,
  Topic,
} from '@/services/types';
import { cx } from '@/shared/utils/cx';
import './CadastroQuestoesPage.css';

const TIPOS: { value: QuestionType; label: string }[] = [
  { value: 'multiple_choice', label: 'Múltipla escolha' },
  { value: 'true_false', label: 'Certo ou errado' },
  { value: 'essay', label: 'Dissertativa' },
];

const DIFICULDADES: { value: QuestionDifficulty; label: string }[] = [
  { value: 'easy', label: 'Fácil · 10 pts' },
  { value: 'medium', label: 'Médio · 15 pts' },
  { value: 'hard', label: 'Difícil · 20 pts' },
];

const MAX_ALTERNATIVAS = 6;

type CampoErro =
  | 'difficulty'
  | 'statement'
  | 'options'
  | 'correctAnswer'
  | 'textResolution'
  | 'contents';

type Erros = Partial<Record<CampoErro, string>>;

type Alternativa = { text: string; is_correct: boolean };

/** HTML "vazio" para validação: sem texto, sem imagem e sem fórmula. */
function htmlVazio(html: string) {
  const semMidia = html
    .replace(/<img[^>]*>/gi, '')
    .replace(/<span[^>]*data-latex[^>]*>[\s\S]*?<\/span>/gi, '');
  return semMidia.replace(/<[^>]+>/g, '').trim() === '';
}

function quatroAlternativas(): Alternativa[] {
  return Array.from({ length: 4 }, () => ({ text: '', is_correct: false }));
}

export function CadastroQuestoesPage() {
  const { id } = useParams<{ id: string }>();
  const editando = id !== undefined;

  // ---------- catálogo ----------
  const [contents, setContents] = useState<Content[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  // ---------- form ----------
  const [tipo, setTipo] = useState<QuestionType>('multiple_choice');
  const [dificuldade, setDificuldade] = useState<QuestionDifficulty | null>(null);
  const [enunciadoHtml, setEnunciadoHtml] = useState('');
  const [alternativas, setAlternativas] = useState<Alternativa[]>(quatroAlternativas());
  const [respostaVF, setRespostaVF] = useState<'certo' | 'errado' | null>(null);
  const [conteudosSelecionados, setConteudosSelecionados] = useState<number[]>([]);
  const [topicosSelecionados, setTopicosSelecionados] = useState<number[]>([]);
  const [resolucaoHtml, setResolucaoHtml] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);
  const [erroSalvamento, setErroSalvamento] = useState<string | null>(null);
  const [salvoComSucesso, setSalvoComSucesso] = useState(false);
  const [rascunhoSalvo, setRascunhoSalvo] = useState(false);

  const carregarCatalogo = () => {
    setCarregando(true);
    setErroCarga(null);
    Promise.all([getContents(), getTopics()])
      .then(([listaContents, listaTopics]) => {
        setContents(listaContents);
        setTopics(listaTopics);
      })
      .catch((err) => setErroCarga(getErrorMessage(err)))
      .finally(() => setCarregando(false));
  };

  useEffect(carregarCatalogo, []);

  // Carga da questão em modo edição.
  useEffect(() => {
    if (!editando) return;
    setCarregando(true);
    adminService
      .getQuestion(id)
      .then((q) => {
        setTipo(q.type);
        setDificuldade(q.difficulty as QuestionDifficulty);
        setEnunciadoHtml(q.statement);
        setAlternativas(
          q.options?.map((o) => ({ text: o.text, is_correct: o.is_correct })) ?? quatroAlternativas()
        );
        setRespostaVF(q.correct_answer === 'certo' || q.correct_answer === 'errado' ? q.correct_answer : null);
        setConteudosSelecionados(q.contents?.map((c) => c.id) ?? []);
        setTopicosSelecionados(q.topics?.map((t) => t.id) ?? []);
        setResolucaoHtml(q.text_resolution ?? '');
        setVideoUrl(q.video_resolution_url ?? '');
      })
      .catch((err) => setErroCarga(getErrorMessage(err)))
      .finally(() => setCarregando(false));
  }, [editando, id]);

  /** Tópicos dos conteúdos selecionados (RN16). */
  const topicosDisponiveis = useMemo(
    () => topics.filter((t) => conteudosSelecionados.includes(t.content_id)),
    [topics, conteudosSelecionados]
  );

  const alternarConteudo = (contentId: number) => {
    setConteudosSelecionados((prev) => {
      const proximos = prev.includes(contentId)
        ? prev.filter((c) => c !== contentId)
        : [...prev, contentId];

      // RN16: tópicos que deixaram de pertencer a um conteúdo selecionado são desmarcados.
      setTopicosSelecionados((topicosAtuais) =>
        topicosAtuais.filter((tid) => topics.some((t) => t.id === tid && t.content_id !== undefined && proximos.includes(t.content_id)))
      );

      return proximos;
    });
    setErros((prev) => ({ ...prev, contents: undefined }));
  };

  const alternarTopico = (topicId: number) => {
    setTopicosSelecionados((prev) =>
      prev.includes(topicId) ? prev.filter((t) => t !== topicId) : [...prev, topicId]
    );
  };

  // ---------- validação (Spec: estados + mensagens) ----------
  const validar = (): Erros => {
    const resultado: Erros = {};

    if (!dificuldade) resultado.difficulty = 'Selecione um nível de dificuldade.';
    if (htmlVazio(enunciadoHtml)) resultado.statement = 'O enunciado não pode ficar em branco.';

    if (tipo === 'multiple_choice') {
      const preenchidas = alternativas.filter((a) => a.text.trim() !== '');
      const marcadas = alternativas.filter((a) => a.is_correct);
      if (preenchidas.length < 2 || marcadas.length !== 1) {
        resultado.options = 'Preencha ao menos 2 alternativas e marque a correta.';
      }
    }

    if (tipo === 'true_false' && !respostaVF) {
      resultado.correctAnswer = 'Selecione se a afirmação é verdadeira ou falsa.';
    }

    if (tipo === 'essay' && htmlVazio(resolucaoHtml)) {
      resultado.textResolution = 'A resolução em texto é obrigatória para questões dissertativas.';
    }

    if (conteudosSelecionados.length === 0) {
      resultado.contents = 'Selecione ao menos um conteúdo.';
    }

    return resultado;
  };

  const sectionRefs = {
    difficulty: useRef<HTMLElement>(null),
    statement: useRef<HTMLElement>(null),
    options: useRef<HTMLElement>(null),
    correctAnswer: useRef<HTMLElement>(null),
    textResolution: useRef<HTMLElement>(null),
    contents: useRef<HTMLElement>(null),
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErroSalvamento(null);

    const proximosErros = validar();
    setErros(proximosErros);

    const ordem: CampoErro[] = [
      'difficulty',
      'statement',
      'options',
      'correctAnswer',
      'textResolution',
      'contents',
    ];
    const primeiroErro = ordem.find((campo) => proximosErros[campo]);
    if (primeiroErro) {
      sectionRefs[primeiroErro].current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const options: QuestionOptionPayload[] | undefined =
      tipo === 'multiple_choice'
        ? alternativas
            .filter((a) => a.text.trim() !== '')
            .map((a) => ({ text: a.text.trim(), is_correct: a.is_correct }))
        : undefined;

    const payload: QuestionPayload = {
      statement: enunciadoHtml,
      type: tipo,
      difficulty: dificuldade as QuestionDifficulty,
      correct_answer: tipo === 'true_false' ? respostaVF : null,
      text_resolution: resolucaoHtml || null,
      video_resolution_url: videoUrl.trim() || null,
      options,
      content_ids: conteudosSelecionados,
      topic_ids: topicosSelecionados,
    };

    setSalvando(true);
    try {
      if (editando) {
        await adminService.updateQuestion(id, payload);
      } else {
        await adminService.createQuestion(payload);
      }
      setSalvoComSucesso(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErroSalvamento(getErrorMessage(err));
    } finally {
      setSalvando(false);
    }
  };

  const handleRascunho = () => {
    // Comportamento de placeholder da spec (pendência 7): feedback visual sem persistência.
    setRascunhoSalvo(true);
    window.setTimeout(() => setRascunhoSalvo(false), 1800);
  };

  const cadastrarOutra = () => {
    setTipo('multiple_choice');
    setDificuldade(null);
    setEnunciadoHtml('');
    setAlternativas(quatroAlternativas());
    setRespostaVF(null);
    setConteudosSelecionados([]);
    setTopicosSelecionados([]);
    setResolucaoHtml('');
    setVideoUrl('');
    setErros({});
    setSalvoComSucesso(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const marcarCorreta = (index: number) => {
    setAlternativas((prev) => prev.map((a, i) => ({ ...a, is_correct: i === index })));
    setErros((prev) => ({ ...prev, options: undefined }));
  };

  const atualizarAlternativa = (index: number, text: string) => {
    setAlternativas((prev) => prev.map((a, i) => (i === index ? { ...a, text } : a)));
  };

  const removerAlternativa = (index: number) => {
    setAlternativas((prev) => prev.filter((_, i) => i !== index));
  };

  const breadcrumb = (
    <>
      Painel administrativo <span className="admin-breadcrumb-sep">→</span> Questões{' '}
      <span className="admin-breadcrumb-sep">→</span>{' '}
      <strong>{editando ? 'Editar questão' : 'Nova questão'}</strong>
    </>
  );

  return (
    <div className="cq-container">
      {/* Breadcrumb como cabeçalho interno da área de conteúdo (Etapa 5 —
          a página passou a viver dentro do AdminPanelLayout). */}
      <nav className="admin-breadcrumb" aria-label="Você está aqui">
        {breadcrumb}
      </nav>
      <div className="cq-page-head">
        <div className="cq-decor" aria-hidden="true">∑</div>
        <h1 className="cq-title">{editando ? 'Editar questão' : 'Cadastrar nova questão'}</h1>
        <p className="cq-subtitle">
          Preencha os campos abaixo para {editando ? 'atualizar a' : 'adicionar uma'} questão ao banco
          de conteúdo. Campos com <span className="cq-req">*</span> são obrigatórios.
        </p>
      </div>

      {salvoComSucesso ? (
        <div className="cq-success-banner" role="status">
          <span>✓ Questão {editando ? 'atualizada' : 'cadastrada'} com sucesso.</span>
          {!editando && (
            <button type="button" className="cq-success-action" onClick={cadastrarOutra}>
              Cadastrar outra questão
            </button>
          )}
          {editando && (
            <button type="button" className="cq-success-action" onClick={() => setSalvoComSucesso(false)}>
              Voltar a editar
            </button>
          )}
        </div>
      ) : (
        <form className="cq-card" onSubmit={handleSubmit} noValidate>
          {erroCarga && <ErrorBanner message={erroCarga} />}
          {erroSalvamento && <ErrorBanner message={erroSalvamento} />}

          {carregando ? (
            <p className="cq-loading" role="status">Carregando…</p>
          ) : (
            <>
              {/* Tipo de questão */}
              <section className="cq-field">
                <span className="cq-label">
                  Tipo de questão <span className="cq-req">*</span>
                </span>
                <div className="cq-segmented" role="radiogroup" aria-label="Tipo de questão">
                  {TIPOS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      role="radio"
                      aria-checked={tipo === t.value}
                      className={cx('cq-seg-btn', tipo === t.value && 'cq-seg-btn--active')}
                      onClick={() => setTipo(t.value)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <p className="cq-hint">
                  Define o template de correção (RF14). Múltipla escolha e certo/errado são corrigidas
                  automaticamente (RF04); dissertativa é autoavaliada pelo próprio aluno (RF05).
                </p>
              </section>

              {/* Dificuldade */}
              <section className={cx('cq-field', erros.difficulty && 'cq-field--error')} ref={sectionRefs.difficulty}>
                <span className="cq-label">
                  Dificuldade <span className="cq-req">*</span>
                </span>
                <div className="cq-segmented" role="radiogroup" aria-label="Dificuldade">
                  {DIFICULDADES.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      role="radio"
                      aria-checked={dificuldade === d.value}
                      className={cx('cq-seg-btn', dificuldade === d.value && 'cq-seg-btn--active')}
                      onClick={() => {
                        setDificuldade(d.value);
                        setErros((prev) => ({ ...prev, difficulty: undefined }));
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <p className="cq-hint">
                  Atribuição manual, sem critério técnico automático no MVP (RN05). Pontuação fixa por
                  nível (RN07).
                </p>
                {erros.difficulty && <p className="cq-error" role="alert">{erros.difficulty}</p>}
              </section>

              {/* Enunciado */}
              <section ref={sectionRefs.statement}>
                <RichTextEditor
                  label="Enunciado"
                  required
                  value={enunciadoHtml}
                  onChange={(html) => {
                    setEnunciadoHtml(html);
                    if (!htmlVazio(html)) setErros((prev) => ({ ...prev, statement: undefined }));
                  }}
                  placeholder="Digite o enunciado da questão..."
                  hint="Editor de texto rico (Tiptap). Fórmulas inseridas pelo editor visual MathLive são renderizadas aqui via KaTeX (RN21). Imagens enviadas ficam no Supabase Storage, sempre via upload intermediado pelo backend (RN23)."
                  error={erros.statement}
                />
              </section>

              {/* Alternativas (múltipla escolha) */}
              {tipo === 'multiple_choice' && (
                <section
                  className={cx('cq-field', erros.options && 'cq-field--error')}
                  ref={sectionRefs.options}
                >
                  <span className="cq-label">
                    Alternativas <span className="cq-req">*</span>
                  </span>

                  <div className="cq-alt-list">
                    {alternativas.map((alt, index) => (
                      <div className="cq-alt-row" key={index}>
                        <button
                          type="button"
                          className={cx('cq-alt-check', alt.is_correct && 'cq-alt-check--correct')}
                          title="Marcar como correta"
                          aria-label={`Marcar a alternativa ${index + 1} como correta`}
                          aria-pressed={alt.is_correct}
                          onClick={() => marcarCorreta(index)}
                        >
                          ✓
                        </button>
                        <input
                          type="text"
                          placeholder={`Texto da alternativa ${String.fromCharCode(97 + index)}`}
                          value={alt.text}
                          onChange={(e) => atualizarAlternativa(index, e.target.value)}
                        />
                        <button
                          type="button"
                          className="cq-alt-remove"
                          title="Remover"
                          aria-label={`Remover alternativa ${index + 1}`}
                          disabled={alternativas.length <= 2}
                          onClick={() => removerAlternativa(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {alternativas.length < MAX_ALTERNATIVAS && (
                    <button
                      type="button"
                      className="cq-ghost-btn"
                      onClick={() => setAlternativas((prev) => [...prev, { text: '', is_correct: false }])}
                    >
                      + Adicionar alternativa
                    </button>
                  )}

                  <p className="cq-hint">Clique no círculo para marcar a alternativa correta.</p>
                  {erros.options && <p className="cq-error" role="alert">{erros.options}</p>}
                </section>
              )}

              {/* Certo ou errado */}
              {tipo === 'true_false' && (
                <section
                  className={cx('cq-field', erros.correctAnswer && 'cq-field--error')}
                  ref={sectionRefs.correctAnswer}
                >
                  <span className="cq-label">
                    Resposta correta <span className="cq-req">*</span>
                  </span>
                  <div className="cq-tf-buttons" role="radiogroup" aria-label="Resposta correta">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={respostaVF === 'certo'}
                      className={cx('cq-tf-btn', respostaVF === 'certo' && 'cq-tf-btn--selected')}
                      onClick={() => {
                        setRespostaVF('certo');
                        setErros((prev) => ({ ...prev, correctAnswer: undefined }));
                      }}
                    >
                      Verdadeiro
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={respostaVF === 'errado'}
                      className={cx('cq-tf-btn', respostaVF === 'errado' && 'cq-tf-btn--selected')}
                      onClick={() => {
                        setRespostaVF('errado');
                        setErros((prev) => ({ ...prev, correctAnswer: undefined }));
                      }}
                    >
                      Falso
                    </button>
                  </div>
                  {erros.correctAnswer && <p className="cq-error" role="alert">{erros.correctAnswer}</p>}
                </section>
              )}

              {/* Dissertativa */}
              {tipo === 'essay' && (
                <section className="cq-field">
                  <div className="cq-info-box">
                    Questões dissertativas não têm alternativa cadastrada: o aluno escreve a resposta
                    livremente, consulta a <strong>Resolução em texto</strong> (abaixo) e se autoavalia
                    como "Acertei"/"Errei" (RF05). Por isso, o campo Resolução em texto é obrigatório
                    para este tipo.
                  </div>
                </section>
              )}

              {/* Conteúdo */}
              <section
                className={cx('cq-field', erros.contents && 'cq-field--error')}
                ref={sectionRefs.contents}
              >
                <span className="cq-label">
                  Conteúdo <span className="cq-req">*</span>
                </span>
                <p className="cq-hint">Selecione um ou mais conteúdos vinculados a esta questão (RN06).</p>
                <div className="cq-chips">
                  {contents.map((content) => (
                    <button
                      key={content.id}
                      type="button"
                      className={cx('cq-chip', conteudosSelecionados.includes(content.id) && 'cq-chip--selected')}
                      aria-pressed={conteudosSelecionados.includes(content.id)}
                      onClick={() => alternarConteudo(content.id)}
                    >
                      {content.name}
                    </button>
                  ))}
                </div>
                {erros.contents && <p className="cq-error" role="alert">{erros.contents}</p>}
              </section>

              {/* Tópico */}
              <section className="cq-field">
                <span className="cq-label">
                  Tópico <span className="cq-optional">(opcional)</span>
                </span>
                <p className="cq-hint">
                  {conteudosSelecionados.length === 0
                    ? 'Selecione ao menos um conteúdo acima para ver os tópicos disponíveis.'
                    : 'O tópico selecionado deve pertencer a um dos conteúdos marcados acima (RN16).'}
                </p>
                <div className="cq-chips">
                  {topicosDisponiveis.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      className={cx('cq-chip', topicosSelecionados.includes(topic.id) && 'cq-chip--selected')}
                      aria-pressed={topicosSelecionados.includes(topic.id)}
                      onClick={() => alternarTopico(topic.id)}
                    >
                      {topic.name}
                    </button>
                  ))}
                </div>
              </section>

              {/* Resolução em texto */}
              <section ref={sectionRefs.textResolution}>
                <RichTextEditor
                  label="Resolução em texto"
                  labelSuffix={tipo === 'essay' ? '(obrigatório)' : '(opcional)'}
                  required={tipo === 'essay'}
                  value={resolucaoHtml}
                  onChange={(html) => {
                    setResolucaoHtml(html);
                    if (!htmlVazio(html)) setErros((prev) => ({ ...prev, textResolution: undefined }));
                  }}
                  placeholder="Explique o passo a passo da resolução..."
                  hint="Exibida ao aluno após ele responder a questão."
                  error={erros.textResolution}
                />
              </section>

              {/* Resolução em vídeo */}
              <section className="cq-field">
                <label className="cq-label" htmlFor="cq-video-url">
                  Resolução em vídeo <span className="cq-optional">(opcional)</span>
                </label>
                <input
                  id="cq-video-url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
                <p className="cq-hint">
                  Cole a URL de um vídeo do YouTube; o sistema armazena apenas o link (RNF07).
                </p>
              </section>

              <div className="cq-actions">
                <button type="submit" className="cq-btn-primary" disabled={salvando}>
                  {salvando ? 'Salvando…' : 'Salvar questão'}
                </button>
                <button type="button" className="cq-btn-secondary" onClick={handleRascunho}>
                  {rascunhoSalvo ? 'Rascunho salvo ✓' : 'Salvar como rascunho'}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
}
