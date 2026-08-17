import axios from 'axios';
import type { AxiosError } from 'axios';

// RN20 — token de admin isolado do token do aluno (`bm_token`).
const ADMIN_TOKEN_KEY = 'bm_admin_token';

export const adminHttp = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
});

adminHttp.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminHttp.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Token inválido/expirado: limpa a sessão local (a página decide para onde ir).
    if (error.response?.status === 401 && localStorage.getItem(ADMIN_TOKEN_KEY)) {
      setAdminAuthToken(null);
    }
    return Promise.reject(error);
  }
);

export function setAdminAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

export function hasAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY) !== null;
}
