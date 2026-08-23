import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SelectField } from '@/shared/components/SelectField/SelectField';
import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner';
import type { Content, Topic } from '@/services/types';
import { getContents, getTopics } from '@/services/contentService';
import { useAuth } from '@/app/AuthContext';
import { MENSAGEM_ERRO_GENERICA } from '@/services/http';
import './MateriaisFiltroPage.css';

/** Só dígitos contam como filtro (o resto vira "ausente"). */
const soDigitos = (valor: string | null) => (valor && /^\d+$/.test(valor) ? valor : '');

/**
 * Entrada do fluxo de Materiais de Estudo — mesmo padrão visual da tela de
 * Filtro de Questões (fundo escuro + gradiente), mas só com Conteúdo/Tópico.
 * O "Continuar" não chama API: apenas navega para a listagem levando os
 * filtros na query string (fonte única de verdade do fluxo).
 */
export function MateriaisFiltroPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { status } = useAuth();

  // Vindo da Home/drawer o aluno é visitante; vindo do Dashboard, está logado.
  const voltaPara = status === 'authenticated' ? '/dashboard' : '/';

  const [conteudos, setConteudos] = useState<Content[]>([]);
  const [topicos, setTopicos] = useState<Topic[]>([]);
  const [erroCatalog, setErroCatalog] = useState<string | null>(null);

  const [conteudoSelecionado, setConteudoSelecionado] = useState(() =>
    soDigitos(searchParams.get('conteudo')),
  );
  const [topicoSelecionado, setTopicoSelecionado] = useState(() =>
    soDigitos(searchParams.get('topico')),
  );

  const carregarCatalog = useCallback(() => {
    setErroCatalog(null);
    Promise.all([getContents(), getTopics()])
      .then(([contents, topics]) => {
        setConteudos(contents);
        setTopicos(topics);
      })
      .catch(() => setErroCatalog(MENSAGEM_ERRO_GENERICA));
  }, []);

  useEffect(() => {
    carregarCatalog();
  }, [carregarCatalog]);

  // URL restaurada com um tópico que não pertence ao conteúdo → descarta.
  useEffect(() => {
    if (!conteudoSelecionado || !topicoSelecionado) return;
    const coerente = topicos.some(
      (t) => t.id === Number(topicoSelecionado) && t.content_id === Number(conteudoSelecionado),
    );
    if (!coerente) setTopicoSelecionado('');
  }, [topicos, conteudoSelecionado, topicoSelecionado]);

  const topicosFiltrados = useMemo(
    () => topicos.filter((t) => t.content_id === Number(conteudoSelecionado)),
    [topicos, conteudoSelecionado],
  );

  const handleContinuar = () => {
    const params = new URLSearchParams();
    if (conteudoSelecionado) params.set('conteudo', conteudoSelecionado);
    if (topicoSelecionado) params.set('topico', topicoSelecionado);
    const qs = params.toString();
    navigate(`/materiais-de-estudo/lista${qs ? `?${qs}` : ''}`);
  };

  const limparFiltro = () => {
    setConteudoSelecionado('');
    setTopicoSelecionado('');
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="mat-filtro-page">
      <div className="mat-filtro-bg">
        <div className="mat-filtro-topbar">
          <Link to={voltaPara} className="mat-filtro-back" aria-label="Voltar">
            <ArrowLeft size={20} /> voltar
          </Link>
        </div>

        <main className="mat-filtro-card">
          <h1 className="mat-filtro-title">Materiais de estudo</h1>
          <p className="mat-filtro-subtitle">
            Escolha um conteúdo para encontrar a teoria certa.
          </p>

          {erroCatalog && <ErrorBanner message={erroCatalog} onRetry={carregarCatalog} />}

          {/* Conteúdo — "Todos" é válido: dá para listar materiais sem filtro. */}
          <SelectField
            id="mat-filtro-conteudo"
            label="Conteúdo"
            value={conteudoSelecionado}
            onChange={(e) => {
              setConteudoSelecionado(e.target.value);
              setTopicoSelecionado('');
            }}
          >
            <option value="">Todos</option>
            {conteudos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>

          {/* Tópico */}
          <SelectField
            id="mat-filtro-topico"
            label="Tópico"
            value={topicoSelecionado}
            disabled={!conteudoSelecionado}
            onChange={(e) => setTopicoSelecionado(e.target.value)}
            hint="O tópico depende do conteúdo escolhido."
          >
            <option value="">
              {conteudoSelecionado ? 'Todos' : 'Escolha um conteúdo primeiro'}
            </option>
            {topicosFiltrados.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </SelectField>

          {/* Ações */}
          <div className="mat-filtro-actions">
            <button
              type="button"
              className="mat-filtro-btn-continuar"
              onClick={handleContinuar}
            >
              Continuar
            </button>
            <button type="button" className="mat-filtro-btn-limpar" onClick={limparFiltro}>
              Limpar filtro
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
