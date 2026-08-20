import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, FileText, Folder, TriangleAlert, Waypoints } from 'lucide-react';
import { Button } from '@/shared/components/Button/Button';
import { Skeleton } from '@/shared/components/Skeleton/Skeleton';
import * as adminService from '@/services/adminService';
import type { Overview, OverviewRecentItem } from '@/services/types';
import './AdminVisaoGeralPage.css';
import '../admin-page.css';

/** Timestamp relativo curto ("há 2h", "ontem") da lista de atividade recente. */
function tempoRelativo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutos = Math.floor(diffMs / 60000);
  if (minutos < 1) return 'agora mesmo';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas}h`;
  if (horas < 48) return 'ontem';
  return `há ${Math.floor(horas / 24)} dias`;
}

/** Destino do clique na linha de atividade recente (edição da entidade). */
function destinoItem(item: OverviewRecentItem) {
  if (item.type === 'question') return `/admin/questoes/${item.id}/editar`;
  return `/admin/conteudos?editar=${item.type}:${item.id}`;
}

/**
 * Visão Geral (Spec_Admin_Visao_Geral): cards de métrica, banner condicional
 * de tópicos sem questão e prévia dos cadastros recentes (união das 3 entidades).
 */
export function AdminVisaoGeralPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setOverview(await adminService.getOverview());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <header className="admin-page-header admin-page-header--vg">
        <div>
          <h1 className="admin-page-title">Visão geral</h1>
          <p className="admin-page-subtitle">Resumo do conteúdo cadastrado na plataforma.</p>
        </div>
      </header>

      {loading && (
        <div aria-hidden="true">
          <div className="vg-cards">
            {[0, 1, 2].map((i) => (
              <div className="vg-card vg-card--skeleton" key={i}>
                <Skeleton width={40} height={40} radius={10} />
                <Skeleton width={80} height={36} />
                <Skeleton width={140} height={13} />
              </div>
            ))}
          </div>
          <Skeleton width={180} height={15} className="vg-recent-title-skeleton" />
          <div className="vg-recent">
            {[0, 1, 2].map((i) => (
              <div className="vg-recent-row" key={i}>
                <div className="vg-recent-texts">
                  <Skeleton width="60%" height={13} />
                  <Skeleton width="40%" height={12} />
                </div>
                <Skeleton width={48} height={12} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="admin-state">
          <AlertCircle size={28} aria-hidden="true" />
          <p>Não foi possível carregar os dados.</p>
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!loading && !error && overview && (
        <>
          <div className="vg-cards">
            <div className="vg-card vg-card--blue">
              <div className="vg-card-icon">
                <FileText size={20} aria-hidden="true" />
              </div>
              <p className="vg-card-number">{overview.counts.questions}</p>
              <p className="vg-card-label">Questões cadastradas</p>
            </div>
            <div className="vg-card vg-card--green">
              <div className="vg-card-icon">
                <Waypoints size={20} aria-hidden="true" />
              </div>
              <p className="vg-card-number">{overview.counts.topics}</p>
              <p className="vg-card-label">Tópicos cadastrados</p>
            </div>
            <div className="vg-card vg-card--magenta">
              <div className="vg-card-icon">
                <Folder size={20} aria-hidden="true" />
              </div>
              <p className="vg-card-number">{overview.counts.contents}</p>
              <p className="vg-card-label">Conteúdos cadastrados</p>
            </div>
          </div>

          {overview.topics_without_questions > 0 && (
            <div className="vg-banner">
              <div className="vg-banner-icon">
                <TriangleAlert size={18} aria-hidden="true" />
              </div>
              <Link to="/admin/conteudos" className="vg-banner-link">
                <p className="vg-banner-title">
                  {overview.topics_without_questions}{' '}
                  {overview.topics_without_questions === 1
                    ? 'tópico ainda sem nenhuma questão vinculada'
                    : 'tópicos ainda sem nenhuma questão vinculada'}
                </p>
                <p className="vg-banner-subtitle">Confira em Conteúdos e tópicos.</p>
              </Link>
            </div>
          )}

          <h2 className="vg-recent-title">Cadastrado recentemente</h2>
          <div className="vg-recent">
            {overview.recent.length === 0 ? (
              <p className="vg-recent-empty">Nenhuma atividade ainda.</p>
            ) : (
              overview.recent.slice(0, 5).map((item) => (
                <Link
                  to={destinoItem(item)}
                  className="vg-recent-row vg-recent-row--link"
                  key={`${item.type}-${item.id}`}
                >
                  <div className="vg-recent-texts">
                    <p className="vg-recent-item-title">{item.title}</p>
                    <p className="vg-recent-item-subtitle">{item.subtitle}</p>
                  </div>
                  <span className="vg-recent-time">{tempoRelativo(item.created_at)}</span>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
