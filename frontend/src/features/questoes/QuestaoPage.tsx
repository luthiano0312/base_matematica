import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Flame, Check, X, Play } from 'lucide-react';
import { Chip } from '@/shared/components/Chip/Chip';
import { ProgressBar } from '@/shared/components/ProgressBar/ProgressBar';
import { StatCard } from '@/shared/components/StatCard/StatCard';
import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner';
import { useQuestionSession } from './QuestionSessionContext';
import { useAuth } from '@/app/AuthContext';
import {
  answerEssay,
  answerMultipleChoice,
  answerTrueFalse,
} from '@/services/questionService';
import { getDashboard } from '@/services/dashboardService';
import type { AnswerResult, Question } from '@/services/types';
import { MENSAGEM_ERRO_GENERICA } from '@/services/http';
import './QuestaoPage.css';

const LETRAS = ['A', 'B', 'C', 'D', 'E'];

function pontosLocais(difficulty: string, isCorrect: boolean): number {
  if (!isCorrect) return 0;
  if (difficulty === 'easy') return 10;
  if (difficulty === 'medium') return 15;
  return 20;
}

export function QuestaoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { questions, isVisitor, stats, registerAnswer, clearSession } = useQuestionSession();
  const { status } = useAuth();

  const [respostaMCQ, setRespostaMCQ] = useState<number | null>(null);
  const [respostaTF, setRespostaTF] = useState<'certo' | 'errado' | null>(null);
  const [respostaDissertativa, setRespostaDissertativa] = useState('');
  const [feedback, setFeedback] = useState<AnswerResult | null>(null);
  const [verResolucao, setVerResolucao] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [streak, setStreak] = useState<number | null>(null);

  const posicaoAtual = useMemo(
    () => questions.findIndex((q) => String(q.id) === String(id)),
    [questions, id],
  );

  const question: Question | undefined = posicaoAtual >= 0 ? questions[posicaoAtual] : undefined;
  const total = questions.length;
  const posicao = posicaoAtual + 1;
  const ehUltima = posicao === total && total > 0;
  const logado = status === 'authenticated';

  const opcoesOrdenadas = useMemo(() => {
    if (!question?.options) return [];
    return [...question.options].sort((a, b) => a.order - b.order);
  }, [question]);

  useEffect(() => {
    setRespostaMCQ(null);
    setRespostaTF(null);
    setRespostaDissertativa('');
    setFeedback(null);
    setVerResolucao(false);
    setErroGeral(null);
  }, [id]);

  useEffect(() => {
    if (logado && streak === null) {
      getDashboard()
        .then((d) => setStreak(d.streak))
        .catch(() => setStreak(0));
    }
  }, [logado, streak]);

  const registrarFeedback = (result: AnswerResult) => {
    setFeedback(result);
    registerAnswer(result.is_correct, result.points_earned);
  };

  const responderMCQ = async () => {
    if (!question || respostaMCQ === null || enviando) return;
    setEnviando(true);
    setErroGeral(null);
    try {
      if (isVisitor) {
        const opt = question.options?.find((o) => o.id === respostaMCQ);
        const isCorrect = opt?.is_correct ?? false;
        registrarFeedback({
          is_correct: isCorrect,
          points_earned: pontosLocais(question.difficulty, isCorrect),
          correct_answer: question.correct_answer,
          text_resolution: question.text_resolution,
        });
      } else {
        const result = await answerMultipleChoice(question.id, respostaMCQ);
        registrarFeedback(result);
      }
    } catch {
      setErroGeral(MENSAGEM_ERRO_GENERICA);
    } finally {
      setEnviando(false);
    }
  };

  const responderTF = async (resposta: 'certo' | 'errado') => {
    if (!question || enviando) return;
    setEnviando(true);
    setErroGeral(null);
    try {
      if (isVisitor) {
        const isCorrect = resposta === question.correct_answer;
        registrarFeedback({
          is_correct: isCorrect,
          points_earned: pontosLocais(question.difficulty, isCorrect),
          correct_answer: question.correct_answer,
          text_resolution: question.text_resolution,
        });
      } else {
        const result = await answerTrueFalse(question.id, resposta);
        registrarFeedback(result);
      }
    } catch {
      setErroGeral(MENSAGEM_ERRO_GENERICA);
    } finally {
      setEnviando(false);
    }
  };

  const autoavaliar = async (selfCorrected: boolean) => {
    if (!question || enviando) return;
    setEnviando(true);
    setErroGeral(null);
    try {
      if (isVisitor) {
        registrarFeedback({
          is_correct: selfCorrected,
          points_earned: pontosLocais(question.difficulty, selfCorrected),
          correct_answer: null,
          text_resolution: question.text_resolution,
        });
      } else {
        const result = await answerEssay(question.id, respostaDissertativa, selfCorrected);
        registrarFeedback(result);
      }
    } catch {
      setErroGeral(MENSAGEM_ERRO_GENERICA);
    } finally {
      setEnviando(false);
    }
  };

  const irParaProxima = () => {
    if (ehUltima) return;
    const proxima = questions[posicaoAtual + 1];
    navigate(`/questao/${proxima.id}`);
  };

  const fecharModal = () => {
    clearSession();
    if (isVisitor) navigate('/cadastro');
    else navigate('/dashboard');
  };

  // Sem sessão ativa (acesso direto à URL): volta para o filtro correspondente.
  if (total === 0) {
    return <Navigate to={isVisitor ? '/questoes' : '/filtro'} replace />;
  }

  if (!question) {
    return <Navigate to={isVisitor ? '/questoes' : '/filtro'} replace />;
  }

  const podeResponder =
    (question.type === 'multiple_choice' && respostaMCQ !== null) ||
    (question.type === 'true_false' && respostaTF !== null);

  return (
    <div className="questao-page">
      {/* ─── Bloco 1: Topbar ─── */}
      <header className="q-topbar">
        <div className="q-topbar-row">
          <span className="q-topbar-title">
            Questão {posicao} de {total}
          </span>
          {logado && streak !== null && (
            <Chip icon={<Flame size={14} />}>
              {streak} dias
            </Chip>
          )}
        </div>

        {/* Barra de progresso */}
        <ProgressBar now={posicao} min={1} max={total} />

        {/* Cards de estatísticas — sessão atual */}
        <span className="q-stats-label">sessão atual</span>
        <div className="q-stats">
          <StatCard tone="blue" number={stats.respondidas} label="respondidas" />
          <StatCard tone="green" number={stats.acertos} label="acertos" />
          <StatCard tone="red" number={stats.erros} label="erros" />
        </div>
      </header>

      {erroGeral && <ErrorBanner message={erroGeral} />}

      {/* ─── Bloco 2: Enunciado ─── */}
      <section className="q-enunciado-block">
        <div className="q-enunciado-decor" aria-hidden="true">∑</div>
        <p className="q-enunciado-texto">{question.statement}</p>
      </section>

      {/* ─── Bloco 3: Área de resposta ─── */}
      <section className="q-alternativas-block">
        {question.type === 'multiple_choice' && (
          <div className="q-alternativas-lista">
            {opcoesOrdenadas.map((opt, index) => {
              const letra = LETRAS[index] ?? `${index + 1}`;
              const selecionada = respostaMCQ === opt.id;
              const correta = feedback ? opt.is_correct : false;
              const erradaSelecionada = feedback && selecionada && !opt.is_correct;

              return (
                <button
                  key={opt.id}
                  type="button"
                  className={[
                    'q-alt-card',
                    selecionada && 'q-alt-card--selected',
                    feedback && correta && 'q-alt-card--correct',
                    erradaSelecionada && 'q-alt-card--wrong',
                  ].filter(Boolean).join(' ')}
                  onClick={() => {
                    if (!feedback) setRespostaMCQ(opt.id);
                  }}
                  disabled={Boolean(feedback)}
                  aria-pressed={selecionada}
                >
                  <span
                    className={[
                      'q-alt-selo',
                      selecionada && 'q-alt-selo--selected',
                      feedback && correta && 'q-alt-selo--correct',
                      erradaSelecionada && 'q-alt-selo--wrong',
                    ].filter(Boolean).join(' ')}
                  >
                    {letra}
                  </span>
                  <span className="q-alt-texto">{opt.text}</span>
                  <span
                    className={[
                      'q-alt-indicator',
                      selecionada && 'q-alt-indicator--selected',
                      feedback && correta && 'q-alt-indicator--correct',
                      erradaSelecionada && 'q-alt-indicator--wrong',
                    ].filter(Boolean).join(' ')}
                  >
                    {feedback && correta && <Check size={12} />}
                    {erradaSelecionada && <X size={12} />}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {question.type === 'true_false' && (
          <div className="q-tf-lista">
            <button
              type="button"
              className={[
                'q-tf-btn',
                'q-tf-btn--certo',
                feedback &&
                  (question.correct_answer === 'certo'
                    ? 'q-tf-btn--correct'
                    : respostaTF === 'certo' && 'q-tf-btn--wrong'),
              ].filter(Boolean).join(' ')}
              onClick={() => {
                if (!feedback) setRespostaTF('certo');
              }}
              disabled={Boolean(feedback) || enviando}
            >
              <span className="q-tf-icone"><Check size={22} /></span>
              Certo
            </button>
            <button
              type="button"
              className={[
                'q-tf-btn',
                'q-tf-btn--errado',
                feedback &&
                  (question.correct_answer === 'errado'
                    ? 'q-tf-btn--correct'
                    : respostaTF === 'errado' && 'q-tf-btn--wrong'),
              ].filter(Boolean).join(' ')}
              onClick={() => {
                if (!feedback) setRespostaTF('errado');
              }}
              disabled={Boolean(feedback) || enviando}
            >
              <span className="q-tf-icone"><X size={22} /></span>
              Errado
            </button>
          </div>
        )}

        {question.type === 'essay' && (
          <div className="q-essay">
            <textarea
              className="q-essay-textarea"
              placeholder="Escreva sua resposta aqui…"
              value={respostaDissertativa}
              onChange={(e) => setRespostaDissertativa(e.target.value)}
              disabled={Boolean(feedback) || enviando}
              rows={6}
            />
          </div>
        )}

        {/* Ações pré-resposta */}
        {!feedback && question.type !== 'essay' && (
          <button
            type="button"
            className={`q-responder-btn ${!podeResponder || enviando ? 'q-responder-btn--disabled' : ''}`}
            disabled={!podeResponder || enviando}
            onClick={() => {
              if (question.type === 'multiple_choice') responderMCQ();
              else if (question.type === 'true_false' && respostaTF) responderTF(respostaTF);
            }}
          >
            {enviando ? 'Enviando…' : 'Responder'}
          </button>
        )}

        {/* Dissertativa: ver resolução antes de se autoavaliar */}
        {!feedback && question.type === 'essay' && (
          <button
            type="button"
            className={[
              'q-responder-btn',
              !respostaDissertativa.trim() || enviando ? 'q-responder-btn--disabled' : '',
            ].filter(Boolean).join(' ')}
            disabled={!respostaDissertativa.trim() || enviando}
            onClick={() => setVerResolucao(true)}
          >
            Ver resolução
          </button>
        )}

        {!feedback && verResolucao && question.type === 'essay' && (
          <div className="q-resolucao">
            <h3 className="q-resolucao-title">Resolução</h3>
            <p className="q-resolucao-texto">
              {question.text_resolution || 'Sem resolução cadastrada para esta questão.'}
            </p>
            <div className="q-essay-autoavaliacao">
              <button
                type="button"
                className="q-avaliar-btn q-avaliar-btn--acertei"
                disabled={enviando}
                onClick={() => autoavaliar(true)}
              >
                Acertei
              </button>
              <button
                type="button"
                className="q-avaliar-btn q-avaliar-btn--errei"
                disabled={enviando}
                onClick={() => autoavaliar(false)}
              >
                Errei
              </button>
            </div>
          </div>
        )}

        {/* Estado de feedback pós-resposta */}
        {feedback && !ehUltima && (
          <div className="q-feedback">
            <div
              className={`q-feedback-banner ${feedback.is_correct ? 'q-feedback-banner--acerto' : 'q-feedback-banner--erro'}`}
            >
              {feedback.is_correct ? (
                <>
                  <Check size={20} />
                  Acertou! {feedback.points_earned > 0 && `+${feedback.points_earned} pontos`}
                </>
              ) : (
                <>
                  <X size={20} />
                  {feedback.points_earned > 0 ? `+${feedback.points_earned} pontos` : 'Não foi dessa vez'}
                </>
              )}
            </div>

            <button type="button" className="q-responder-btn" onClick={irParaProxima}>
              Próxima questão
            </button>
            <button
              type="button"
              className="q-resolucao-btn"
              onClick={() => setVerResolucao((v) => !v)}
            >
              Ver resolução
            </button>

            {verResolucao && (
              <div className="q-resolucao">
                {!isVisitor && (
                  <div className="q-resolucao-video">
                    {question.video_resolution_url ? (
                      <a
                        href={question.video_resolution_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="q-resolucao-video-link"
                      >
                        <Play size={18} />
                        Assistir vídeo de resolução
                      </a>
                    ) : (
                      <span className="q-resolucao-video-indisponivel">Vídeo indisponível</span>
                    )}
                  </div>
                )}
                <h3 className="q-resolucao-title">Resolução</h3>
                <p className="q-resolucao-texto">
                  {feedback.text_resolution || question.text_resolution || 'Sem resolução cadastrada para esta questão.'}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ─── Modal de encerramento ─── */}
      {feedback && ehUltima && (
        <div className="q-modal-backdrop" role="dialog" aria-modal="true" aria-label="Fim do conjunto de questões">
          <div className="q-modal">
            <h2 className="q-modal-title">Conjunto concluído!</h2>
            <p className="q-modal-subtitle">Resumo da sua sessão:</p>

            <div className="q-modal-stats">
              <div className="q-modal-stat">
                <span className="q-modal-stat-number">{stats.respondidas}</span>
                <span className="q-modal-stat-label">respondidas</span>
              </div>
              <div className="q-modal-stat">
                <span className="q-modal-stat-number q-modal-stat-number--green">{stats.acertos}</span>
                <span className="q-modal-stat-label">acertos</span>
              </div>
              <div className="q-modal-stat">
                <span className="q-modal-stat-number q-modal-stat-number--red">{stats.erros}</span>
                <span className="q-modal-stat-label">erros</span>
              </div>
              <div className="q-modal-stat">
                <span className="q-modal-stat-number q-modal-stat-number--blue">{stats.pontos}</span>
                <span className="q-modal-stat-label">pontos</span>
              </div>
            </div>

            <button type="button" className="q-modal-btn" onClick={fecharModal}>
              {isVisitor ? 'Criar conta' : 'Concluir'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
