import { http } from './http';
import { adminHttp } from './adminHttp';
import type { StudyMaterial, StudyMaterialPayload } from './types';

export type StudyMaterialFilters = {
  content_id?: number;
  topic_id?: number;
};

/** Leitura pública (RN01/RF02) — funciona logado ou como visitante. */
export function listStudyMaterials(filters?: StudyMaterialFilters) {
  return http
    .get<{ data: StudyMaterial[] }>('/study-materials', {
      params: {
        content_id: filters?.content_id,
        topic_id: filters?.topic_id,
      },
    })
    .then((res) => res.data.data);
}

/** Detalhe público de um material (RN01/RF02) — tela do aluno. Nome distinto
 * do `getStudyMaterial` admin de propósito: deixa explícita a instância axios. */
export function getPublicStudyMaterial(id: string | number) {
  return http
    .get<{ data: StudyMaterial }>(`/study-materials/${id}`)
    .then((res) => res.data.data);
}

/** Escrita exclusiva do painel admin (guard `admin`). */
export function createStudyMaterial(payload: StudyMaterialPayload) {
  return adminHttp
    .post<{ data: StudyMaterial }>('/admin/study-materials', payload)
    .then((res) => res.data.data);
}

export function getStudyMaterial(id: string | number) {
  return adminHttp
    .get<{ data: StudyMaterial }>(`/admin/study-materials/${id}`)
    .then((res) => res.data.data);
}

export function updateStudyMaterial(id: string | number, payload: StudyMaterialPayload) {
  return adminHttp
    .put<{ data: StudyMaterial }>(`/admin/study-materials/${id}`, payload)
    .then((res) => res.data.data);
}

export function deleteStudyMaterial(id: string | number) {
  return adminHttp.delete(`/admin/study-materials/${id}`).then((res) => res.data);
}
