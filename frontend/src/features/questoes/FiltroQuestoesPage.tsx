import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SelectField } from '@/shared/components/SelectField/SelectField';
import { TextField } from '@/shared/components/TextField/TextField';
import { ToggleListItem } from '@/shared/components/ToggleListItem/ToggleListItem';
import { TIPOS_QUESTAO, DIFICULDADES } from '@/shared/constants/questao';
import type { Conteudo, Topico, TipoQuestao } from '@/shared/types/questao';
import './FiltroQuestoesPage.css';

type FiltroQuestoesProps = {
  isVisitante?: boolean;
};

export function FiltroQuestoesPage({ isVisitante = false }: FiltroQuestoesProps) {
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
          <SelectField
            id="filtro-conteudo"
            label="Conteúdo"
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
          </SelectField>

          {/* Tópico */}
          <SelectField
            id="filtro-topico"
            label="Tópico"
            value={topicoSelecionado}
            disabled={topicoDesabilitado}
            onChange={(e) => setTopicoSelecionado(e.target.value)}
            hint="O tópico depende do conteúdo escolhido."
          >
            <option value="">
              {topicoDesabilitado ? 'Escolha um conteúdo primeiro' : 'Selecione um tópico'}
            </option>
            {topicosFiltrados.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </SelectField>

          {/* Dificuldade — somente para aluno logado */}
          {!isVisitante && (
            <SelectField
              id="filtro-dificuldade"
              label="Dificuldade"
              value={dificuldade}
              onChange={(e) => setDificuldade(e.target.value)}
            >
              {DIFICULDADES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </SelectField>
          )}

          {/* Quantidade de questões — somente para aluno logado */}
          {!isVisitante && (
            <TextField
              id="filtro-quantidade"
              label="Quantidade de questões"
              type="number"
              variant="dark"
              placeholder="Ex.: 10 questões"
              min={1}
              value={quantidadeQuestoes}
              onChange={(e) => setQuantidadeQuestoes(e.target.value)}
              error={quantidadeObrigatoria && !quantidadeQuestoes.trim() ? 'Informe a quantidade de questões para usar o modo Progressão.' : undefined}
            />
          )}

          {/* Tipo de questão */}
          <div className="filtro-field">
            <span className="filtro-label">Tipo de questão</span>
            <div className="filtro-tipos" role="group" aria-label="Seleção de tipo de questão">
              {TIPOS_QUESTAO.map((tipo) => (
                <ToggleListItem
                  key={tipo.id}
                  variant="blue"
                  selected={tiposQuestao.has(tipo.id)}
                  onToggle={() => toggleTipo(tipo.id)}
                >
                  {tipo.label}
                </ToggleListItem>
              ))}
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
}
