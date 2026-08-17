import { adminHttp, setAdminAuthToken } from './adminHttp';
import type { Admin, Question, QuestionPayload } from './types';

type AdminAuthResponse = {
  admin: Admin;
  token: string;
};

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
