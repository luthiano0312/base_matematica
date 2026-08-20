import { adminHttp, setAdminAuthToken } from './adminHttp';
import { getErrorMessage } from './http';
import type {
  Admin,
  AdminContent,
  AdminQuestion,
  AdminTopic,
  CanDeleteResponse,
  Content,
  Overview,
  Paginated,
  Question,
  QuestionPayload,
  Topic,
} from './types';

type AdminAuthResponse = {
  admin: Admin;
  token: string;
};

export { getErrorMessage };

export function login(data: { email: string; password: string }) {
  return adminHttp.post<AdminAuthResponse>('/admin/login', data).then((res) => {
    setAdminAuthToken(res.data.token);
    return res.data;
  });
}

export function logout() {
  return adminHttp.post('/admin/logout').finally(() => setAdminAuthToken(null));
}

export function getMe() {
  return adminHttp.get<{ admin: Admin }>('/admin/me').then((res) => res.data.admin);
}

/**
 * RN23 — upload sempre intermediado pelo backend; o browser nunca fala
 * diretamente com o Supabase Storage.
 */
export function uploadImage(file: File) {
  const form = new FormData();
  form.append('file', file);

  return adminHttp
    .post<{ url: string }>('/admin/upload-image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data.url);
}

export function getQuestion(id: number | string) {
  // QuestionResource envolve a resposta em { data: {...} }.
  return adminHttp.get<{ data: Question }>(`/admin/questions/${id}`).then((res) => res.data.data);
}

export function createQuestion(payload: QuestionPayload) {
  return adminHttp
    .post<{ data: Question }>('/admin/questions', payload)
    .then((res) => res.data.data);
}

export function updateQuestion(id: number | string, payload: QuestionPayload) {
  return adminHttp
    .put<{ data: Question }>(`/admin/questions/${id}`, payload)
    .then((res) => res.data.data);
}

/* ————— Conteúdos e Tópicos (Etapa 2) ————— */

export function getContents() {
  return adminHttp.get<AdminContent[]>('/admin/contents').then((res) => res.data);
}

export function createContent(payload: { name: string }) {
  return adminHttp.post<Content>('/admin/contents', payload).then((res) => res.data);
}

export function updateContent(id: number, payload: { name: string }) {
  return adminHttp.put<Content>(`/admin/contents/${id}`, payload).then((res) => res.data);
}

export function canDeleteContent(id: number) {
  return adminHttp
    .get<CanDeleteResponse>(`/admin/contents/${id}/can-delete`)
    .then((res) => res.data);
}

export function deleteContent(id: number) {
  return adminHttp.delete(`/admin/contents/${id}`).then((res) => res.data);
}

export function getTopics(contentId?: number) {
  return adminHttp
    .get<AdminTopic[]>('/admin/topics', {
      params: contentId ? { content_id: contentId } : {},
    })
    .then((res) => res.data);
}

export function createTopic(payload: { name: string; content_id: number }) {
  return adminHttp.post<Topic>('/admin/topics', payload).then((res) => res.data);
}

export function updateTopic(id: number, payload: { name: string; content_id: number }) {
  return adminHttp.put<Topic>(`/admin/topics/${id}`, payload).then((res) => res.data);
}

export function canDeleteTopic(id: number) {
  return adminHttp
    .get<CanDeleteResponse>(`/admin/topics/${id}/can-delete`)
    .then((res) => res.data);
}

export function deleteTopic(id: number) {
  return adminHttp.delete(`/admin/topics/${id}`).then((res) => res.data);
}

/* ————— Questões — listagem (Etapa 3) ————— */

export type QuestionFilters = {
  content_id?: number;
  topic_id?: number;
  difficulty?: string;
  type?: string;
  search?: string;
  page?: number;
};

export function listQuestions(filters: QuestionFilters) {
  return adminHttp
    .get<Paginated<AdminQuestion>>('/admin/questions', { params: filters })
    .then((res) => res.data);
}

export function canDeleteQuestion(id: number) {
  return adminHttp
    .get<CanDeleteResponse>(`/admin/questions/${id}/can-delete`)
    .then((res) => res.data);
}

export function deleteQuestion(id: number) {
  return adminHttp.delete(`/admin/questions/${id}`).then((res) => res.data);
}

/* ————— Visão Geral (Etapa 4) ————— */

export function getOverview() {
  return adminHttp.get<Overview>('/admin/overview').then((res) => res.data);
}
