import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, BookOpen, Edit3, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/Button/Button';
import { Skeleton } from '@/shared/components/Skeleton/Skeleton';
import * as adminService from '@/services/adminService';
import {
  deleteStudyMaterial,
  listStudyMaterials,
} from '@/services/studyMaterialService';
import type { AdminContent, StudyMaterial } from '@/services/types';
import { ConfirmDeleteModal } from '@/features/admin/components/ConfirmDeleteModal';
import './MateriaisListagemPage.css';
import '../admin-page.css';

function pluralMateriais(n: number) {
  return `${n} ${n === 1 ? 'material cadastrado' : 'materiais cadastrados'}.`;
}

/** Resumo curto para o título do modal de exclusão. */
function resumoMaterial(m: StudyMaterial) {
  const texto = m.title.trim();
  if (!texto) return `Material #${m.id}`;
  return texto.length > 40 ? `${texto.slice(0, 40)}…` : texto;
}

/**
 * Materiais de estudo — Listagem admin. Delete direto via ConfirmDeleteModal
 * sem `check` (nenhuma FK aponta para study_materials — não há dependências
 * a verificar).
 */
export function MateriaisListagemPage() {
  const navigate = useNavigate();

  // ---------- dados ----------
  const [contents, setContents] = useState<AdminContent[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleting, setDeleting] = useState<StudyMaterial | null>(null);

  // Catálogo para resolver o nome do conteúdo de cada material no cliente
  // (o backend expõe apenas os ids). Falha do catálogo não quebra a tabela.
  useEffect(() => {
    adminService
      .getContents()
      .then(setContents)
      .catch(() => setContents([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setMaterials(await listStudyMaterials());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const nomeConteudo = new Map(contents.map((c) => [c.id, c.name]));

  const materials_ = materials ?? [];

  return (
    <div>
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Materiais de estudo</h1>
          <p className="admin-page-subtitle">
            {pluralMateriais(materials !== null && !error ? materials_.length : 0)}
          </p>
        </div>
        <Button size="sm" to="/admin/materiais/novo">
          <Plus size={16} aria-hidden="true" />
          Novo material
        </Button>
      </header>

      {/* Tabela */}
      <div className="ml-table-card">
        {error && !loading && (
          <div className="admin-state">
            <AlertCircle size={28} aria-hidden="true" />
            <p>Não foi possível carregar os dados.</p>
            <Button variant="secondary" size="sm" onClick={() => void load()}>
              Tentar novamente
            </Button>
          </div>
        )}

        {loading && (
          <div aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <div className="ml-skeleton-row" key={i}>
                <Skeleton width="60%" height={14} />
                <Skeleton width={110} height={14} />
                <Skeleton width={40} height={14} />
                <Skeleton width={52} height={17} />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && materials !== null && materials_.length === 0 && (
          <div className="admin-state">
            <BookOpen size={28} aria-hidden="true" />
            <p>Nenhum material cadastrado ainda.</p>
            <Button size="sm" to="/admin/materiais/novo">
              <Plus size={16} aria-hidden="true" />
              Novo material
            </Button>
          </div>
        )}

        {!loading && !error && materials !== null && materials_.length > 0 && (
          <table className="ml-table">
            <colgroup>
              <col style={{ width: '42%' }} />
              <col style={{ width: '24%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '22%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Título</th>
                <th>Conteúdo</th>
                <th>Vídeo</th>
                <th className="ml-th-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {materials_.map((material) => (
                <tr key={material.id}>
                  <td className="ml-cell-titulo" title={material.content_plain ?? undefined}>
                    {material.title}
                    {material.content_plain?.trim() && (
                      <span className="ml-subtitulo">{material.content_plain}</span>
                    )}
                  </td>
                  <td className="ml-cell-muted ml-cell-truncate" title={nomeConteudo.get(material.content_id)}>
                    {nomeConteudo.get(material.content_id) ?? '—'}
                  </td>
                  <td className="ml-cell-muted">{material.video_url ? 'Sim' : 'Não'}</td>
                  <td className="ml-cell-actions">
                    <button
                      type="button"
                      className="ml-icon-btn"
                      aria-label={`Editar ${resumoMaterial(material)}`}
                      onClick={() => navigate(`/admin/materiais/${material.id}/editar`)}
                    >
                      <Edit3 size={17} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="ml-icon-btn ml-icon-btn--danger"
                      aria-label={`Excluir ${resumoMaterial(material)}`}
                      onClick={() => setDeleting(material)}
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={deleting !== null}
        entity="material"
        entityName={deleting ? resumoMaterial(deleting) : ''}
        onDelete={() => deleteStudyMaterial(deleting!.id)}
        onClose={() => setDeleting(null)}
        onDeleted={() => void load()}
      />
    </div>
  );
}
