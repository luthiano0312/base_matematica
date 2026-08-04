import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { OnboardingProgress } from './components/OnboardingProgress';
import { ToggleListItem } from '@/shared/components/ToggleListItem/ToggleListItem';
import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner';
import { getContents } from '@/services/contentService';
import { saveOnboardingInterests } from '@/services/dashboardService';
import type { Content } from '@/services/types';
import { MENSAGEM_ERRO_GENERICA } from '@/services/http';
import './OnboardingChecklistPage.css';

const ITENS_POR_PAGINA = 6;

export function OnboardingChecklistPage() {
  const navigate = useNavigate();
  const [conteudos, setConteudos] = useState<Content[]>([]);
  const [visiveis, setVisiveis] = useState(ITENS_POR_PAGINA);
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [erroCatalog, setErroCatalog] = useState<string | null>(null);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(() => {
    setErroCatalog(null);
    getContents()
      .then((contents) => setConteudos(contents))
      .catch(() => setErroCatalog(MENSAGEM_ERRO_GENERICA));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const toggle = (id: number) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const concluir = async (contentIds: number[]) => {
    setSalvando(true);
    setErroSalvar(null);
    try {
      await saveOnboardingInterests(contentIds);
      navigate('/dashboard');
    } catch {
      setErroSalvar(MENSAGEM_ERRO_GENERICA);
    } finally {
      setSalvando(false);
    }
  };

  const itensVisiveis = conteudos.slice(0, visiveis);

  return (
    <div className="ob-background">
      <div className="ob-check">
        <main className="ob-check-card">
          <OnboardingProgress passo={2} />

          <section className="ob-check-intro">
            <h1 className="ob-check-title">
              Quais conteúdos gostaria de aprender?
            </h1>
            <p className="ob-check-subtitle">
              Isso nos ajuda a sugerir quais exercícios você deve fazer.
            </p>
          </section>

          {erroCatalog && <ErrorBanner message={erroCatalog} onRetry={carregar} />}
          {erroSalvar && <ErrorBanner message={erroSalvar} onRetry={() => concluir([...selecionados])} />}

          <ul className="ob-check-list" role="group" aria-label="Seleção de conteúdos de interesse">
            {itensVisiveis.map((c) => (
              <li key={c.id}>
                <ToggleListItem
                  variant="blue"
                  selected={selecionados.has(c.id)}
                  onToggle={() => toggle(c.id)}
                >
                  {c.name}
                </ToggleListItem>
              </li>
            ))}
          </ul>

          {visiveis < conteudos.length && (
            <button
              type="button"
              className="ob-check-mostrar-mais"
              onClick={() => setVisiveis((v) => v + ITENS_POR_PAGINA)}
            >
              mostrar mais
            </button>
          )}

          <div className="ob-check-actions">
            <button
              type="button"
              className="ob-check-cta"
              onClick={() => concluir([...selecionados])}
              disabled={salvando}
            >
              {salvando ? 'Salvando…' : 'continuar'} <ArrowRight size={18} />
            </button>
          </div>

          <div className="ob-check-secondary-actions">
            <button
              type="button"
              className="ob-check-back"
              onClick={() => navigate('/onboarding')}
              disabled={salvando}
            >
              <ArrowLeft size={16} /> Voltar
            </button>
            <button
              type="button"
              className="ob-check-skip"
              onClick={() => concluir([])}
              disabled={salvando}
            >
              pular por enquanto <ArrowRight size={14} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
