import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check } from 'lucide-react';
import './FiltroQuestoesPage.css';

type Conteudo = { id: string; nome: string };
type Topico = { id: string; nome: string; content_id: string };
type TipoQuestao = 'multipla-escolha' | 'certo-errado' | 'dissertativa';

const TIPOS_QUESTAO: { id: TipoQuestao; label: string }[] = [
  { id: 'multipla-escolha', label: 'Múltipla escolha' },
  { id: 'certo-errado', label: 'Certo ou errado' },
  { id: 'dissertativa', label: 'Dissertativa' },
];

const DIFICULDADES = ['Qualquer', 'Fácil', 'Médio', 'Difícil', 'Progressão'] as const;

type FiltroQuestoesProps = {
  isVisitante?: boolean;
};

export const FiltroQuestoesPage: React.FC<FiltroQuestoesProps> = ({ isVisitante = false }) => {
  const navigate = useNavigate();

  const [conteudos] = useState<Conteudo[]>([]);
  const [topicos] = useState<Topico[]>([]);

  const [conteudoSelecionado, setConteudoSelecionado] = useState<string>('');
  const [topicoSelecionado, setTopicoSelecionado] = useState<string>('');
  const [dificuldade, setDificuldade] = useState<string>('Qualquer');
  const [quantidadeQuestoes, setQuantidadeQuestoes] = useState<string>('');
  const [tiposQuestao, setTiposQuestao] = useState<Set<TipoQuestao>>(new Set());

  const topicosFiltrados = useMemo(() => {
    if (!conteudoSelecionado) return [];
    return topicos.filter((t) => t.content_id === conteudoSelecionado);
  }, [topicos, conteudoSelecionado]);

  const topicoDesabilitado = !conteudoSelecionado;

  const progressaoAtiva = !isVisitante && dificuldade === 'Progressão';
  const quantidadeObrigatoria = progressaoAtiva;
  const continuarDesabilitado = quantidadeObrigatoria && !quantidadeQuestoes.trim();

  const toggleTipo = (tipo: TipoQuestao) => {
    setTiposQuestao((prev) => {
      const next = new Set(prev);
      if (next.has(tipo)) next.delete(tipo);
      else next.add(tipo);
      return next;
    });
  };

  const limparFiltro = () => {
    setConteudoSelecionado('');
    setTopicoSelecionado('');
    setDificuldade('Qualquer');
    setQuantidadeQuestoes('');
    setTiposQuestao(new Set());
  };

  const handleContinuar = () => {
    if (continuarDesabilitado) return;
    navigate('/questoes');
  };

  return (
    <div className="filtro-page">
      <div className="filtro-bg">
        <main className="filtro-card">
          <h1 className="filtro-title">Filtrar questões</h1>

          {/* Conteúdo */}
          <div className="filtro-field">
            <label className="filtro-label" htmlFor="filtro-conteudo">Conteúdo</label>
            <div className="filtro-select-wrapper">
              <select
                id="filtro-conteudo"
                className="filtro-select"
                value={conteudoSelecionado}
                onChange={(e) => {
                  setConteudoSelecionado(e.target.value);
                  setTopicoSelecionado('');
                }}
              >
                <option value="">Selecione um conteúdo</option>
                {conteudos.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              <ChevronDown size={18} className="filtro-select-icon" aria-hidden="true" />
            </div>
          </div>

          {/* Tópico */}
          <div className="filtro-field">
            <label className="filtro-label" htmlFor="filtro-topico">Tópico</label>
            <div className="filtro-select-wrapper">
              <select
                id="filtro-topico"
                className={`filtro-select ${topicoDesabilitado ? 'filtro-select--disabled' : ''}`}
                value={topicoSelecionado}
                disabled={topicoDesabilitado}
                onChange={(e) => setTopicoSelecionado(e.target.value)}
              >
                <option value="">
                  {topicoDesabilitado ? 'Escolha um conteúdo primeiro' : 'Selecione um tópico'}
                </option>
                {topicosFiltrados.map((t) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
              <ChevronDown size={18} className="filtro-select-icon" aria-hidden="true" />
            </div>
            {topicoDesabilitado && (
              <span className="filtro-hint">O tópico depende do conteúdo escolhido.</span>
            )}
          </div>

          {/* Dificuldade — somente para aluno logado */}
          {!isVisitante && (
            <div className="filtro-field">
              <label className="filtro-label" htmlFor="filtro-dificuldade">Dificuldade</label>
              <div className="filtro-select-wrapper">
                <select
                  id="filtro-dificuldade"
                  className="filtro-select"
                  value={dificuldade}
                  onChange={(e) => setDificuldade(e.target.value)}
                >
                  {DIFICULDADES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="filtro-select-icon" aria-hidden="true" />
              </div>
            </div>
          )}

          {/* Quantidade de questões — somente para aluno logado */}
          {!isVisitante && (
            <div className="filtro-field">
              <label className="filtro-label" htmlFor="filtro-quantidade">Quantidade de questões</label>
              <input
                id="filtro-quantidade"
                type="number"
                className={`filtro-input ${quantidadeObrigatoria && !quantidadeQuestoes.trim() ? 'filtro-input--error' : ''}`}
                placeholder="Ex.: 10 questões"
                min={1}
                value={quantidadeQuestoes}
                onChange={(e) => setQuantidadeQuestoes(e.target.value)}
                aria-invalid={quantidadeObrigatoria && !quantidadeQuestoes.trim()}
                aria-describedby={quantidadeObrigatoria && !quantidadeQuestoes.trim() ? 'filtro-quantidade-erro' : undefined}
              />
              {quantidadeObrigatoria && !quantidadeQuestoes.trim() && (
                <span id="filtro-quantidade-erro" className="filtro-error">
                  Informe a quantidade de questões para usar o modo Progressão.
                </span>
              )}
            </div>
          )}

          {/* Tipo de questão */}
          <div className="filtro-field">
            <span className="filtro-label">Tipo de questão</span>
            <div className="filtro-tipos" role="group" aria-label="Seleção de tipo de questão">
              {TIPOS_QUESTAO.map((tipo) => {
                const ativo = tiposQuestao.has(tipo.id);
                return (
                  <button
                    key={tipo.id}
                    type="button"
                    className={`filtro-tipo-btn ${ativo ? 'filtro-tipo-btn--selected' : ''}`}
                    onClick={() => toggleTipo(tipo.id)}
                    aria-pressed={ativo}
                  >
                    <span className="filtro-tipo-check" aria-hidden="true">
                      {ativo && (
                        <Check size={14} />
                      )}
                    </span>
                    {tipo.label}
                  </button>
                );
              })}
            </div>
            <span className="filtro-hint">
              Selecione um ou mais tipos. Deixe em branco para incluir todos.
            </span>
          </div>

          {/* Ações */}
          <div className="filtro-actions">
            <button
              type="button"
              className="filtro-btn-continuar"
              onClick={handleContinuar}
              disabled={continuarDesabilitado}
            >
              Continuar
            </button>
            <button
              type="button"
              className="filtro-btn-limpar"
              onClick={limparFiltro}
            >
              Limpar filtro
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
